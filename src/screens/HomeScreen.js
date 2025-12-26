import { useEffect, useState, useRef } from 'react';
import { getVideos } from '../services/api';
import { ActivityIndicator } from 'react-native';
// Removed sampleShows import; only Supabase videos will be used
import { StyleSheet, Dimensions, FlatList, Image, Text, TouchableOpacity, ScrollView, View } from 'react-native';
import { getLiveStreams } from '../services/api';
import { getEvents } from '../services/api';



import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

import StreamingSlider from '../components/StreamingSlider';

import UpcomingEventsSlider from '../components/UpcomingEventsSlider';

import SectionRow from '../components/SectionRow';

export default function HomeScreen() {
  const navigation = useNavigation();
  const width = Dimensions.get('window').width;
  const [active, setActive] = useState(0);
  const heroListRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      getVideos(),
      getEvents('upcoming'),
      getLiveStreams()
    ])
      .then(([videosData, eventsData, liveStreamsData]) => {
        if (isMounted) {
          setVideos(Array.isArray(videosData) ? videosData : []);
          setUpcomingEvents(Array.isArray(eventsData) ? eventsData : []);
          setLiveStreams(Array.isArray(liveStreamsData) ? liveStreamsData : []);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to load videos, events, or live streams');
          setVideos([]);
          setUpcomingEvents([]);
          setLiveStreams([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // FlatList-based hero carousel
  const renderHero = ({ item }) => (
    <View style={styles.heroContainer}>
      <Image source={item.bannerImage || item.backgroundUrl || item.image || require('../../assets/hero1.jpg')} style={styles.heroImage} />
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{item.title}</Text>
        {item.description && <Text style={styles.heroDesc} numberOfLines={2}>{item.description}</Text>}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ShowDetailScreen', { show: item })}
        >
          <Text style={styles.ctaButtonText}>Watch Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Use only Supabase videos for hero and grid
  const heroData = videos;
  const gridData = videos;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 40 }}>
          <ActivityIndicator size="large" color={COLORS.WHITE} />
          <Text style={{ color: COLORS.WHITE, marginTop: 12 }}>Loading videos...</Text>
        </View>
      )}
      {error && !loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 40 }}>
          <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
          <Text style={{ color: COLORS.WHITE }}>Showing sample data.</Text>
        </View>
      )}
      {/* HERO CAROUSEL */}
      <FlatList
        ref={heroListRef}
        data={heroData}
        renderItem={renderHero}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActive(index);
        }}
        style={{ maxHeight: 560 }}
      />
      {/* dots */}
      <View style={styles.dots}>
        {heroData.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>

      {/* Live TV section */}
      <StreamingSlider sectionTitle="Streaming 24/7" data={liveStreams} onCardPress={(item) => navigation.navigate('VideoPlayer', { video: item })} />

      {/* Upcoming Events */}
      <UpcomingEventsSlider sectionTitle="Upcoming Live Events" data={upcomingEvents} />

      {/* Shows grid */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.gridTitle}>All Shows</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {gridData.map((item) => {
            const cardWidth = (width / 2) - 24;
            return (
              <View key={item.id} style={{ width: cardWidth, marginBottom: 16 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ShowDetailScreen', { show: item })}>
                  <View style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 6, overflow: 'hidden' }}>
                    <Image source={item.posterImage || item.posterUrl || require('../../assets/hero1.jpg')} style={{ width: '100%', height: '100%' }} />
                  </View>
                  <Text style={{ color: COLORS.WHITE, fontSize: 14, fontWeight: '600' }}>{item.title}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Browse by category */}
      <SectionRow title="Browse by category" data={gridData.slice(2)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.SURFACE },
  heroContainer: {
    width: Dimensions.get('window').width,
  height: 560, // Further increased height for an even taller hero card
    marginBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%', height: '100%', position: 'absolute', top: 0, left: 0,
  resizeMode: 'cover',
  // no explicit resizeMode, use default
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20
  },
  heroTitle: {
    color: COLORS.WHITE, fontSize: 28, fontWeight: '800', marginBottom: 10
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 10
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  gridTitle: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 10,
    paddingLeft: 2
  },
  dot: {
    width: 6, height: 6, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  dotActive: { backgroundColor: COLORS.WHITE, width: 14, borderRadius: 7 },
  ctaButton: {
    marginTop: 16,
    backgroundColor: COLORS.PRIMARY ? COLORS.PRIMARY : '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1
  }
});

