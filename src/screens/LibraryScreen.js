import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { TouchableOpacity, Image, TextInput } from 'react-native';
import { getFavorites, getWatchHistory, removeFavorite } from '../services/api';

// Placeholder Library screen: lists saved events from local storage
export default function LibraryScreen() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function fetchLibrary() {
      const favs = await getFavorites();
      setItems(favs);
      const hist = await getWatchHistory();
      setHistory(hist);
    }
    fetchLibrary();
  }, []);

  // Items from Supabase already have full info
  const savedEvents = items;

  // Search and sort
  const filtered = savedEvents.length > 0 ? savedEvents
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'date') return 0;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    }) : items;

  // Remove/unsave
  async function handleUnsave(id) {
    await removeFavorite(id);
    setItems(items.filter(i => i.id !== id));
  }

  // History now comes from Supabase getWatchHistory; no AsyncStorage or streamingData needed

  // List header for recently watched
  const renderListHeader = () => (
    <>
      <Text style={styles.header}>Library</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search saved events..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSort(sort === 'date' ? 'title' : 'date')}>
          <Ionicons name="swap-vertical" size={22} color={COLORS.ORANGE} />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Recently Watched</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No history yet</Text>
        ) : (
          history.map(item => (
            <TouchableOpacity style={styles.itemRow} key={item.id}>
              <Image source={item.thumbnailUrl} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>{item.category} • {item.badge}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={COLORS.ORANGE} />
          <Text style={styles.emptyText}>No saved events yet</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          renderItem={({ item }) => (
            savedEvents.length > 0 ? (
              <TouchableOpacity style={styles.itemRow}>
                <Image source={item.thumbnailUrl} style={styles.thumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{item.category} • {item.badge}</Text>
                </View>
                <TouchableOpacity onPress={() => handleUnsave(item.id)} style={styles.unsaveBtn}>
                  <Ionicons name="trash" size={20} color={COLORS.ORANGE} />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <View style={styles.itemRow}>
                <Ionicons name="bookmark" size={20} color={COLORS.ORANGE} style={{ marginRight: 12 }} />
                <Text style={styles.itemText}>{item.id}</Text>
              </View>
            )
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  sortBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 8,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  itemTitle: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  unsaveBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 10,
  },
});
