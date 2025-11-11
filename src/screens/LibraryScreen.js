import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { getSavedItems } from '../helpers/library';

// Placeholder Library screen: lists saved events from local storage
export default function LibraryScreen() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    getSavedItems().then(setItems);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Library</Text>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={COLORS.ORANGE} />
          <Text style={styles.emptyText}>No saved events yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Ionicons name="bookmark" size={20} color={COLORS.ORANGE} style={{ marginRight: 12 }} />
              <Text style={styles.itemText}>{item.id}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.WHITE,
    fontSize: 18,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  itemText: {
    color: COLORS.WHITE,
    fontSize: 16,
    flex: 1,
  },
  dateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginLeft: 8,
  },
});
