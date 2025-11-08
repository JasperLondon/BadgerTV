import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ShowDetailScreen({ route }) {
  const { show } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Banner Image */}
      <Image source={show.backgroundUrl || show.posterUrl} style={styles.banner} />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{show.title}</Text>
        {/* Short Description */}
        {show.description && (
          <Text style={styles.shortDesc}>{show.description}</Text>
        )}
        {/* Tags and Metadata */}
        <View style={styles.metaRow}>
          {show.rating && (
            <View style={styles.metaBadge}><Text style={styles.metaText}>{show.rating}</Text></View>
          )}
          {show.releaseYear && (
            <View style={styles.metaBadge}><Text style={styles.metaText}>{show.releaseYear}</Text></View>
          )}
          {show.tags && show.tags.map((tag, i) => (
            <View key={i} style={styles.metaBadge}><Text style={styles.metaText}>{tag}</Text></View>
          ))}
        </View>
        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            // Find first episode or trailer, fallback to null
            let videoUrl = '';
            if (show.seasons && show.seasons[0]?.episodes?.[0]?.videoUrl) {
              videoUrl = show.seasons[0].episodes[0].videoUrl;
            } else if (show.trailerUrl) {
              videoUrl = show.trailerUrl;
            }
            if (videoUrl) {
              navigation.navigate('VideoPlayer', { video: { videoUrl, title: show.title } });
            }
          }}
        >
          <Ionicons name="play" size={24} color={COLORS.BLACK} />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
        {/* Long Description (if available) */}
        {show.longDescription && (
          <Text style={styles.longDesc}>{show.longDescription}</Text>
        )}
        {/* Placeholder for Episode List */}
        <View style={styles.episodesPlaceholder}>
          <Text style={styles.episodesTitle}>Episodes</Text>
          <Text style={styles.episodesComingSoon}>Coming soon...</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  banner: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shortDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  metaText: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ORANGE,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  playButtonText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  longDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  episodesPlaceholder: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    alignItems: 'center',
  },
  episodesTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  episodesComingSoon: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
});
