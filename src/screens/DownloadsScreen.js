import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function DownloadsScreen() {
  // Placeholder: No downloads implemented yet
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Downloads</Text>
      <Text style={styles.emptyText}>You have no downloads yet.</Text>
      <Text style={styles.infoText}>Download support coming soon!</Text>
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
  infoText: {
    color: COLORS.GRAY,
    fontSize: 15,
    marginTop: 10,
  },
});
