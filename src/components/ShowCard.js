import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

export default function ShowCard({ show, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.posterWrapper}>
        <Image
          source={show.posterUrl || show.image}
          style={styles.poster}
          resizeMode="cover"
        />
        {/* Gradient overlay for modern look */}
        <LinearGradient
          colors={[ 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)' ]}
          style={styles.gradient}
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>{show.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginBottom: 18,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.CARD,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
  },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2/3, // 2:3 vertical poster
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 4,
    textAlign: 'center',
  },
});
