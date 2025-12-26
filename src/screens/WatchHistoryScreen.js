import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { streamingData } from '../data/streamingData';

export default function WatchHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory();
  }, []);

  async function getHistory() {
    let ids = await AsyncStorage.getItem('recentlyWatched');
    ids = ids ? JSON.parse(ids) : [];
    const events = ids.map(id => streamingData.find(e => e.id === id)).filter(Boolean);
    setHistory(events);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Watch History</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>You have no watch history.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('VideoPlayer', { video: item })}>
              <Image source={item.thumbnailUrl} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>{item.category} • {item.badge}</Text>
              </View>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.GRAY,
    fontSize: 16,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
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
});
