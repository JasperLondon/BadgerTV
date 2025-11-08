
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function VideoCard({ item, width = 220, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { width }]}> 
  <Image source={item.thumbnail || item.posterImage || item.posterUrl || item.thumb || item.image} style={[styles.thumb, { width }]} />
      {!!item.badge && (<View style={styles.badge}><Text style={styles.badgeTxt}>{item.badge}</Text></View>)}
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      {!!item.subtitle && <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: 14 },
  thumb: {
    height: 124, borderRadius: 14, marginBottom: 8
  },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.ORANGE, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3
  },
  badgeTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 11 },
  title: { color: COLORS.WHITE, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }
});
