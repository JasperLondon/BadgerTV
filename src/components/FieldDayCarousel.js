import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

export default function FieldDayCarousel({ videos, onVideoPress }) {
  const width = Dimensions.get('window').width;
  const horizontalPadding = 20; // match grid section padding
  const gridGap = 14;
  // Grid card width: 48% of (screen - 2*padding)
  const gridContainerWidth = width - horizontalPadding * 2;
  const gridCardWidth = gridContainerWidth * 0.48;
  const cardWidth = gridCardWidth * 2 + gridGap;
  const cardHeight = Math.round(cardWidth * 0.56); // 16:9 aspect ratio
  const [active, setActive] = useState(0);
  const flatListRef = useRef(null);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActive(index);
  };

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.sectionTitle}>Field Day Invitational</Text>
      <View style={{ width: cardWidth, alignSelf: 'center' }}>
        <FlatList
          ref={flatListRef}
          data={videos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={{}}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { width: cardWidth, height: cardHeight + 38 }]} onPress={() => onVideoPress?.(item)}>
              <Image source={item.thumbnail} style={[styles.thumb, { width: cardWidth, height: cardHeight }]} resizeMode="cover" />
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )}
          getItemLayout={(_, index) => ({ length: cardWidth, offset: cardWidth * index, index })}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          pagingEnabled
        />
      </View>
      {/* Indicator dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: videos.length }).map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minHeight: 210,
  },
  thumb: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: COLORS.BACKDROP || '#222',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    letterSpacing: 0.1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    minHeight: 38,
    marginTop: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: COLORS.WHITE,
    width: 16,
    borderRadius: 8,
  },
});
