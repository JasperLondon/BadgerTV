import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function UpcomingEventsSlider({ sectionTitle = 'Upcoming Events', data = [] }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sectionTitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingRight: 20 }}
      >
        {data.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={item.thumbnailUrl || item.image} style={styles.image} />

            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  card: {
    width: 240,
    borderRadius: 10,
    backgroundColor: COLORS.SURFACE,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.ORANGE,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: '500'
  },
  info: {
    padding: 8,
  },
  cardTitle: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '700'
  },
  date: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginTop: 2
  }
});
