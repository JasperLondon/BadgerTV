  // Analytics: handle reaction events
  const handleReaction = (emoji, streamId) => {
    Analytics.logEvent('reaction_sent', {
      stream_id: streamId,
      emoji,
    });
  };
import { Ionicons } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';
import { useFocusEffect } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import { ActionSheetIOS, Image, Platform, RefreshControl, ScrollView, SectionList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { useVideos } from '../context/VideoContext';
import { isSaved, setSavedItem } from '../helpers/library';
import mergeStreams from '../helpers/mergeStreams';
import { getCountdownParts } from '../helpers/time';
// --- Supabase config ---
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co'; // TODO: Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // TODO: Replace with your Supabase anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LiveTVScreen({ navigation, route }) {
  // --- Analytics: track screen view on mount ---
  useEffect(() => {
    Analytics.logEvent('screen_view', { screen: 'LiveTVScreen' });
  }, []);
  // --- Live Chat State (per stream) ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeChatStreamId, setActiveChatStreamId] = useState(null);
  const chatListRef = useRef();

  // When a live stream is selected, set it as the active chat stream
  const handleLiveStreamPress = (stream) => {
    setActiveChatStreamId(stream.id);
    Analytics.logEvent('stream_card_click', {
      stream_id: stream.id,
      title: stream.title,
    });
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Watch Live', 'Watch from Beginning', 'Open Chat'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate('VideoPlayer', { video: stream, startAt: 'live' });
          } else if (buttonIndex === 2) {
            navigation.navigate('VideoPlayer', { video: stream, startAt: 'beginning' });
          }
        }
      );
    } else {
      navigation.navigate('VideoPlayer', { video: stream, startAt: 'live' });
    }
  };

  // Deep linking: select stream if streamId param is present
  useEffect(() => {
    const streamId = route?.params?.streamId;
    if (streamId && liveNow.length > 0) {
      // If the streamId exists in liveNow, set it as active
      const found = liveNow.find(s => s.id === streamId);
      if (found && activeChatStreamId !== streamId) {
        setActiveChatStreamId(streamId);
      }
    } else if (!activeChatStreamId && liveNow.length > 0) {
      // Default to first live stream if no streamId
      setActiveChatStreamId(liveNow[0].id);
    }
    // If no live streams, clear activeChatStreamId
    if (activeChatStreamId && liveNow.length === 0) {
      setActiveChatStreamId(null);
    }
  }, [liveNow, activeChatStreamId, route?.params]);

  // Fetch chat messages for the active stream
  useEffect(() => {
    if (!activeChatStreamId) return;
    let mounted = true;
    const channel = `livetv-${activeChatStreamId}`;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: true });
      if (!error && mounted) setChatMessages(data || []);
    };
    fetchMessages();
    // Subscribe to new messages for this stream
    const subscription = supabase
      .channel(`public:chat_messages:${channel}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel=eq.${channel}` }, payload => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, [activeChatStreamId]);

  // Send chat message for the active stream
  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || !activeChatStreamId) return;
    setChatInput('');
    await supabase.from('chat_messages').insert([
      {
        channel: `livetv-${activeChatStreamId}`,
        content: text,
        username: 'Guest', // TODO: Replace with real user if available
      },
    ]);
    Analytics.logEvent('chat_message_sent', {
      stream_id: activeChatStreamId,
      content_length: text.length,
    });
  };
  const { getLiveStreams } = useVideos();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalId = useRef(null);
  // Add a ticking 'now' state to update countdowns every second
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef();
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  // Save to Library state: map of id -> boolean
  const [savedMap, setSavedMap] = useState({});

  // Load saved state for all streams
  useEffect(() => {
    if (streams.length === 0) return;
    let mounted = true;
    Promise.all(streams.map(s => isSaved(s.id))).then(results => {
      if (!mounted) return;
      const map = {};
      streams.forEach((s, i) => { map[s.id] = results[i]; });
      setSavedMap(map);
    });
    return () => { mounted = false; };
  }, [streams]);

  // Toggle bookmark for a stream
  const toggleSave = async (id) => {
    const newVal = !savedMap[id];
    await setSavedItem(id, newVal);
    setSavedMap(prev => ({ ...prev, [id]: newVal }));
  };

  // Manual refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStreams(true);
    setRefreshing(false);
  }, []);

  // Auto-refresh with focus/blur handling
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      // Initial load
      loadStreams();
      // Start ticking every second
      intervalRef.current = setInterval(() => setNow(new Date()), 1000);
      // Start auto-refresh every 30s
      intervalId.current = setInterval(() => {
        if (isActive) loadStreams(false);
      }, 30000);
      return () => {
        isActive = false;
        clearInterval(intervalRef.current);
        clearInterval(intervalId.current);
      };
    }, [])
  );

  // loadStreams: if manual, show spinner; if background, no spinner
  const loadStreams = async (manual = false) => {
    if (manual) setLoading(true);
    const data = await getLiveStreams();
    setStreams(prev => mergeStreams(prev, data));
    if (manual) setLoading(false);
  };


  // Use static placeholder categories for now
  const categories = ['All', 'Sports', 'Festivals', 'Podcasts', 'Competitions', 'Music'];

  // Sort options
  const SORT_OPTIONS = [
    { label: 'Most Popular', value: 'popular' },
    { label: 'Newest', value: 'newest' },
    { label: 'Starting Soon', value: 'soon' },
  ];
  const [sortOption, setSortOption] = useState('popular');


  // Filter streams by selected category
  let filteredStreams = selectedCategory === 'All'
    ? streams
    : streams.filter(s => s.category === selectedCategory);

  // Sort streams based on sortOption
  filteredStreams = [...filteredStreams];
  if (sortOption === 'popular') {
    filteredStreams.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  } else if (sortOption === 'newest') {
    filteredStreams.sort((a, b) => {
      const aTime = new Date(a.startTime || a.createdAt || 0).getTime();
      const bTime = new Date(b.startTime || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  } else if (sortOption === 'soon') {
    filteredStreams.sort((a, b) => {
      const aTime = new Date(a.startTime || Infinity).getTime();
      const bTime = new Date(b.startTime || Infinity).getTime();
      return aTime - bTime;
    });
  }

  // Split filtered streams into Live Now and Upcoming
  const liveNow = filteredStreams.filter(
    (s) => s.isLive || (s.startTime && new Date(s.startTime) <= now)
  );
  const upcoming = filteredStreams.filter(
    (s) => !s.isLive && s.startTime && new Date(s.startTime) > now
  );

  // Prepare sections for SectionList
  const sections = [
    {
      title: 'Live Now',
      data: liveNow,
      emptyIcon: 'tv-outline',
      emptyText: 'No live streams right now',
      emptySubtext: 'Check back later for live events',
    },
    {
      title: 'Upcoming',
      data: upcoming,
      emptyIcon: 'calendar-outline',
      emptyText: 'No upcoming streams',
      emptySubtext: '',
    },
  ];

  // ...existing code...

  // Schedules a local notification 10 minutes before startTime
  const handleRemindMe = async (item) => {
    // Request notification permissions if needed
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: askStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = askStatus;
    }
    if (finalStatus !== 'granted') {
      alert('Enable notifications to get reminders!');
      return;
    }
    const start = new Date(item.startTime);
    const trigger = new Date(start.getTime() - 10 * 60 * 1000); // 10 min before
    if (trigger <= now) {
      alert('This event is starting soon!');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Live Event Reminder',
        body: `${item.title} starts in 10 minutes!`,
        sound: true,
      },
      trigger,
    });
    Analytics.logEvent('remind_me_click', {
      stream_id: item.id,
      title: item.title,
      start_time: item.startTime,
    });
    alert('Reminder set! You will be notified 10 minutes before this event.');
  };

  // Memoized LiveStreamCard for performance
  const LiveStreamCard = React.memo(({ item, now, saved, onPress, onToggleSave }) => {
    let progress = null;
    if (item.startTime && item.endTime) {
      const start = new Date(item.startTime).getTime();
      const end = new Date(item.endTime).getTime();
      const total = end - start;
      const current = Math.max(0, Math.min(now.getTime() - start, total));
      progress = total > 0 ? current / total : null;
    }
    const tagBadges = Array.isArray(item.tags)
      ? item.tags.filter(tag => ['Finals', 'Exclusive', 'Breaking'].includes(tag))
      : [];
    const viewerDelta = item.viewerDelta;
    return (
      <TouchableOpacity
        style={styles.streamCard}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={item.thumbnailUrl || item.image}
          style={styles.streamImage}
        />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        {tagBadges.length > 0 && (
          <View style={styles.badgeRow}>
            {tagBadges.map((tag, idx) => (
              <View key={tag + idx} style={styles.semanticBadge}>
                <Text style={styles.semanticBadgeText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={e => { e.stopPropagation(); onToggleSave(item.id); }}
          accessibilityLabel={saved ? 'Remove from Library' : 'Save to Library'}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={COLORS.ORANGE} />
        </TouchableOpacity>
        {item.viewers ? (
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={12} color={COLORS.WHITE} />
            <Text style={styles.viewersText}>{item.viewers}</Text>
          </View>
        ) : null}
        {viewerDelta ? (
          <View style={styles.trendingBadge}>
            <Ionicons name="trending-up" size={13} color={COLORS.ORANGE} style={{ marginRight: 3 }} />
            <Text style={styles.trendingText}>{viewerDelta}</Text>
          </View>
        ) : null}
        {progress !== null && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        )}
        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.streamDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.category ? (
            <Text style={styles.streamCategory}>{item.category}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  });

  const renderLiveStream = useCallback(
    ({ item }) => (
      <LiveStreamCard
        item={item}
        now={now}
        saved={!!savedMap[item.id]}
        onPress={handleLiveStreamPress}
        onToggleSave={toggleSave}
      />
    ),
    [now, savedMap, handleLiveStreamPress, toggleSave]
  );
  // Add style for bookmark button
  // ...existing code...
  // Add to styles at the end:
  // bookmarkBtn: {
  //   position: 'absolute',
  //   top: 12,
  //   right: 12,
  //   zIndex: 10,
  //   backgroundColor: 'rgba(0,0,0,0.25)',
  //   borderRadius: 16,
  //   padding: 6,
  // },

  // Renders an upcoming stream card with countdown and Remind Me
  const renderUpcomingStream = ({ item }) => {
    const { hours, minutes, seconds } = getCountdownParts(item.startTime);
    return (
      <View style={styles.streamCard}>
        <Image
          source={item.thumbnailUrl || item.image}
          style={styles.streamImage}
        />
        {/* Countdown badge */}
        <View style={[styles.liveBadge, { backgroundColor: COLORS.ORANGE }]}> 
          <Ionicons name="time-outline" size={14} color={COLORS.WHITE} style={{ marginRight: 6 }} />
          <Text style={styles.liveText}>
            Starts in {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.streamDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.category ? (
            <Text style={styles.streamCategory}>{item.category}</Text>
          ) : null}
          <TouchableOpacity
            style={{ marginTop: 10, backgroundColor: COLORS.PRIMARY, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 18, alignSelf: 'flex-start' }}
            onPress={() => handleRemindMe(item)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Remind Me</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live TV</Text>
        <Text style={styles.headerSubtitle}>
          {liveNow.length} {liveNow.length === 1 ? 'stream' : 'streams'} live now
        </Text>
        {/* Subtle PiP available hint */}
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontStyle: 'italic' }} accessibilityLabel="Picture-in-Picture available">
          PiP available
        </Text>
      </View>
      {/* Sort selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipScroll, { marginBottom: 0 }]}
        style={{ marginBottom: 0 }}
        accessibilityRole="radiogroup"
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, sortOption === opt.value && styles.chipActive]}
            onPress={() => setSortOption(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: sortOption === opt.value }}
            accessibilityLabel={opt.label + (sortOption === opt.value ? ', selected' : '')}
          >
            <Text style={[styles.chipText, sortOption === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        accessibilityRole="tablist"
        style={{ marginBottom: 8 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedCategory === cat }}
            accessibilityLabel={cat + (selectedCategory === cat ? ', selected' : '')}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Unified SectionList for Live Now and Upcoming */}
      <SectionList
        sections={sections}
        keyExtractor={useCallback(item => item.id, [])}
        getItemLayout={useCallback((data, index) => (
          { length: 240, offset: 240 * index, index }
        ), [])}
        renderItem={({ item, section }) =>
          section.title === 'Live Now'
            ? renderLiveStream({ item })
            : renderUpcomingStream({ item })
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.headerSubtitle, {
            marginLeft: 16,
            marginBottom: 8,
            marginTop: title === 'Live Now' ? 8 : 16,
            fontWeight: 'bold',
            color: COLORS.ORANGE,
          }]}>{title}</Text>
        )}
        ListEmptyComponent={loading ? null : (
          <View style={styles.emptyState}>
            <Ionicons name="tv-off-outline" size={72} color="rgba(255,255,255,0.18)" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Nothing to watch right now</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or check back later for new live events and streams.</Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={onRefresh}
              accessibilityLabel="Refresh streams"
            >
              <Ionicons name="refresh" size={18} color={COLORS.ORANGE} style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
        renderSectionFooter={({ section }) => (
          !loading && section.data.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name={section.emptyIcon || 'tv-outline'} size={56} color="rgba(255,255,255,0.18)" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>{section.emptyText || 'No streams found'}</Text>
              {section.emptySubtext ? (
                <Text style={styles.emptySubtext}>{section.emptySubtext}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={onRefresh}
                accessibilityLabel="Refresh section"
              >
                <Ionicons name="refresh" size={16} color={COLORS.ORANGE} style={{ marginRight: 5 }} />
                <Text style={styles.emptyActionText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.ORANGE} />
        }
      />
      {/* Live Chat / Reactions (per stream) */}
      {activeChatStreamId && (
        <View style={styles.chatContainer}>
          <View style={styles.reactionsRow}>
            <TouchableOpacity onPress={() => handleReaction('👍', activeChatStreamId)}><Text style={styles.reactionIcon} accessible accessibilityLabel="Like">👍</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleReaction('❤️', activeChatStreamId)}><Text style={styles.reactionIcon} accessible accessibilityLabel="Love">❤️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleReaction('🔥', activeChatStreamId)}><Text style={styles.reactionIcon} accessible accessibilityLabel="Fire">🔥</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleReaction('👏', activeChatStreamId)}><Text style={styles.reactionIcon} accessible accessibilityLabel="Clap">👏</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleReaction('😂', activeChatStreamId)}><Text style={styles.reactionIcon} accessible accessibilityLabel="Laugh">😂</Text></TouchableOpacity>
          </View>
          <View style={styles.chatList} ref={chatListRef}>
            {chatMessages.length === 0 ? (
              <Text style={styles.chatEmptyText}>No messages yet. Start the conversation!</Text>
            ) : (
              chatMessages.map((msg, idx) => (
                <View key={msg.id || idx} style={styles.chatMsgRow}>
                  <Text style={styles.chatMsgUser}>{msg.username || 'Guest'}:</Text>
                  <Text style={styles.chatMsgText}>{msg.content}</Text>
                </View>
              ))
            )}
          </View>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              onSubmitEditing={sendChatMessage}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={sendChatMessage} style={styles.sendBtn} accessibilityLabel="Send message">
              <Ionicons name="send" size={20} color={COLORS.ORANGE} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Semantic badge row (horizontal badges)
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 80,
    flexDirection: 'row',
    zIndex: 9,
    gap: 6,
  },
  semanticBadge: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  semanticBadgeText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trendingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  trendingText: {
    color: COLORS.ORANGE,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 1,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.ORANGE,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  chipScroll: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: COLORS.ORANGE,
    borderColor: COLORS.ORANGE,
  },
  chipText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: '#222',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.SURFACE,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  listContainer: {
    padding: 16,
  },
  streamCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  streamImage: {
    width: '100%',
    height: 200,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.WHITE,
    marginRight: 6,
  },
  liveText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  viewersBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewersText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  streamInfo: {
    padding: 16,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 6,
  },
  streamDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  streamCategory: {
    fontSize: 12,
    color: COLORS.ORANGE,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.WHITE,
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 8,
  },
  emptyActionText: {
    color: COLORS.ORANGE,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 2,
  },
  // Save to Library (bookmark) button
  bookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 6,
  },
  // Live chat/reactions styles
  chatContainer: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  chatList: {
    maxHeight: 160,
    minHeight: 60,
    marginBottom: 8,
    paddingVertical: 4,
  },
  chatMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  chatMsgUser: {
    color: COLORS.ORANGE,
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 14,
  },
  chatMsgText: {
    color: COLORS.WHITE,
    fontSize: 14,
    flexShrink: 1,
  },
  chatEmptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: COLORS.WHITE,
    fontSize: 15,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  reactionIcon: {
    fontSize: 22,
    marginHorizontal: 4,
    textAlign: 'center',
  },
  chatInputRow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chatInputText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontStyle: 'italic',
  },
});
