// src/components/StreamingSlider.js

import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

export default function StreamingSlider({ sectionTitle = 'Streaming 24/7', data = [], onCardPress }) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sectionTitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingRight: 20 }}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => {
              if (onCardPress) onCardPress(item);
              else navigation.navigate('VideoPlayer', { video: item });
            }}
          >
            <Image source={item.posterImage || item.posterUrl || item.thumbnailUrl || item.image} style={styles.image} />

            {/* badge */}
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: 20,
    marginBottom: 30
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10
  },
  card: {
    width: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.CARD
  },
  image: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  cardTitle: {
    color: COLORS.WHITE,
    fontSize: 14,
    marginVertical: 8,
    marginLeft: 6
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 6,
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  }
});

