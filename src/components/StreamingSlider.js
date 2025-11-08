// src/components/StreamingSlider.js

import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

export default function StreamingSlider({ sectionTitle = 'Streaming 24/7', data = [], onCardPress }) {
  const navigation = useNavigation();
  const [active, setActive] = React.useState(0);
  const width = Dimensions.get('window').width;

  const cardWidth = 180 + 14; // card + gap
  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActive(index);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sectionTitle}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, gap: 14 }}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={cardWidth}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity
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
            {item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
      />
      {/* dots */}
      <View style={styles.dots}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
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
    marginBottom: 4
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
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4
  },
  dotActive: {
    backgroundColor: COLORS.WHITE,
    width: 14,
    borderRadius: 7,
    marginHorizontal: 4
  }
});

