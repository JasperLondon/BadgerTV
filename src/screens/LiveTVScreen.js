import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useVideos } from '../context/VideoContext';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function LiveTVScreen({ navigation }) {
  const { getLiveStreams } = useVideos();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    setLoading(true);
    const data = await getLiveStreams();
    setStreams(data);
    setLoading(false);
  };

  const handleStreamPress = (stream) => {
    navigation.navigate('VideoPlayer', { video: stream });
  };

  const renderStream = ({ item }) => (
    <TouchableOpacity 
      style={styles.streamCard}
      onPress={() => handleStreamPress(item)}
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

      {/* Viewer Count (if available) */}
      {item.viewers ? (
        <View style={styles.viewersBadge}>
          <Ionicons name="eye" size={12} color={COLORS.WHITE} />
          <Text style={styles.viewersText}>{item.viewers}</Text>
        </View>
      ) : null}

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live TV</Text>
        <Text style={styles.headerSubtitle}>
          {streams.length} {streams.length === 1 ? 'stream' : 'streams'} live now
        </Text>
      </View>

      {streams.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="tv-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>No live streams right now</Text>
          <Text style={styles.emptySubtext}>Check back later for live events</Text>
        </View>
      ) : (
        <FlatList
          data={streams}
          renderItem={renderStream}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
