import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 24; // 2 columns

export default function ShowsGrid({ sectionTitle = 'Shows', data = [] }) {
  const navigation = useNavigation();
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sectionTitle}</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ShowDetailScreen', { show: item })}>
            <Image source={item.posterImage || item.posterUrl || item.image} style={styles.image} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 30
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
  },
  cardTitle: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});
