import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, Image, TouchableOpacity, StatusBar, Button, Platform, ScrollView, ActionSheetIOS, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import mergeStreams from '../helpers/mergeStreams';
import { useVideos } from '../context/VideoContext';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getCountdownParts } from '../helpers/time';
import { isSaved, setSavedItem } from '../helpers/library';

export default function LiveTVScreen({ navigation }) {
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

  // Filter streams by selected category
  const filteredStreams = selectedCategory === 'All'
    ? streams
    : streams.filter(s => s.category === selectedCategory);

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

  // Show ActionSheet for live streams: Watch Live or Watch from Beginning
  const handleLiveStreamPress = (stream) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Watch Live', 'Watch from Beginning'],
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
      // Simple fallback for Android: show both options
      // (Replace with a better ActionSheet if desired)
      navigation.navigate('VideoPlayer', { video: stream, startAt: 'live' });
    }
  };

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
    alert('Reminder set! You will be notified 10 minutes before this event.');
  };

  // Renders a live stream card with Save to Library (bookmark), semantic badges, and trending indicator
  const renderLiveStream = ({ item }) => {
    // Calculate live progress (0..1) if startTime and endTime exist
    let progress = null;
    if (item.startTime && item.endTime) {
      const start = new Date(item.startTime).getTime();
      const end = new Date(item.endTime).getTime();
      const total = end - start;
      const current = Math.max(0, Math.min(now.getTime() - start, total));
      progress = total > 0 ? current / total : null;
    }
    const saved = !!savedMap[item.id];
    // Semantic badges: Finals, Exclusive, Breaking, etc.
    const tagBadges = Array.isArray(item.tags)
      ? item.tags.filter(tag => ['Finals', 'Exclusive', 'Breaking'].includes(tag))
      : [];
    // Trending indicator: e.g., '+5k in last 10m'
    const viewerDelta = item.viewerDelta;
    return (
      <TouchableOpacity
        style={styles.streamCard}
        onPress={() => handleLiveStreamPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={item.thumbnailUrl || item.image}
          style={styles.streamImage}
        />
        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        {/* Semantic badges (Finals, Exclusive, Breaking, etc.) */}
        {tagBadges.length > 0 && (
          <View style={styles.badgeRow}>
            {tagBadges.map((tag, idx) => (
              <View key={tag + idx} style={styles.semanticBadge}>
                <Text style={styles.semanticBadgeText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Bookmark icon (Save to Library) */}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={e => { e.stopPropagation(); toggleSave(item.id); }}
          accessibilityLabel={saved ? 'Remove from Library' : 'Save to Library'}
        >
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={COLORS.ORANGE} />
        </TouchableOpacity>
        {/* Viewer Count (if available) */}
        {item.viewers ? (
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={12} color={COLORS.WHITE} />
            <Text style={styles.viewersText}>{item.viewers}</Text>
          </View>
        ) : null}
        {/* Trending indicator (viewerDelta) */}
        {viewerDelta ? (
          <View style={styles.trendingBadge}>
            <Ionicons name="trending-up" size={13} color={COLORS.ORANGE} style={{ marginRight: 3 }} />
            <Text style={styles.trendingText}>{viewerDelta}</Text>
          </View>
        ) : null}
        {/* Live progress bar */}
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
  };
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
        keyExtractor={(item) => item.id}
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
            <Ionicons name="tv-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No live or upcoming streams</Text>
          </View>
        )}
        renderSectionFooter={({ section }) => (
          !loading && section.data.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name={section.emptyIcon} size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>{section.emptyText}</Text>
              {section.emptySubtext ? (
                <Text style={styles.emptySubtext}>{section.emptySubtext}</Text>
              ) : null}
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.WHITE,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
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
});
