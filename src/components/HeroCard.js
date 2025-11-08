import { ImageBackground, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function HeroCard({ item, onPress }) {
  const fallback = require('../../assets/hero1.jpg');
  return (
    <ImageBackground
      source={item.bannerImage || item.backgroundUrl || item.image || fallback}
      style={styles.bg}
      imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.badges}>
          {item.tags?.map((b, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
        {item.description && (
          <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
        )}
        {item.cast && (
          <Text style={styles.cast} numberOfLines={1}>Starring: {item.cast.join(', ')}</Text>
        )}
        <TouchableOpacity onPress={onPress} style={styles.cta}>
          <Text style={styles.ctaText}>Go to show</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { height: 420, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  content: { padding: 20 },
  title: {
    color: COLORS.WHITE,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10
  },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4
  },
  badgeText: { color: COLORS.WHITE, fontWeight: '700', fontSize: 12 },
  desc: { color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  cast: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  cta: {
    marginTop: 14,
    backgroundColor: COLORS.WHITE,
    alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24
  },
  ctaText: { fontWeight: '700', color: COLORS.BLACK }
});
