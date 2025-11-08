import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import VideoCard from './VideoCard';

export default function SectionRow({ title, data }) {
  const navigation = useNavigation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(i, idx) => `${i.title}-${idx}`}
        renderItem={({ item }) => (
          <VideoCard
            item={item}
            onPress={() => navigation.navigate('ShowDetailScreen', { show: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18 },
  heading: {
    color: COLORS.WHITE, fontSize: 20, fontWeight: '800',
    marginBottom: 12, paddingHorizontal: 16
  }
});
