import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import EventCard from './EventCard';

export default function UpcomingEventsSlider({ sectionTitle = 'Upcoming Events', data = [] }) {
  const navigation = useNavigation();
  const width = Dimensions.get('window').width;
  const [active, setActive] = React.useState(0);

  const renderEvent = ({ item }) => (
    <View style={{ width: width - 40, paddingRight: 0 }}>
      <EventCard
        event={item}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sectionTitle}</Text>
      <FlatList
        data={data}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        snapToInterval={width - 40}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
          setActive(index);
        }}
        style={{ maxHeight: 130 }}
        contentContainerStyle={{ paddingRight: 0 }}
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
    marginBottom: 32
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  dot: {
    width: 6, height: 6, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  dotActive: { backgroundColor: COLORS.WHITE, width: 14, borderRadius: 7 },
});
