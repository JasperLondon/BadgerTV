import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import VideoCard from './VideoCard';

export default function SectionRow({ title, data }) {
  const navigation = useNavigation();
  const [active, setActive] = React.useState(0);
  const cardWidth = 180 + 14; // approximate VideoCard width + margin
  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActive(index);
  };
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(i, idx) => `${i.title}-${idx}`}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={cardWidth}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <VideoCard
            item={item}
            onPress={() => navigation.navigate('ShowDetailScreen', { show: item })}
          />
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
  wrap: { marginTop: 18 },
  heading: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    paddingHorizontal: 16
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
