import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ShowDetails({ route }) {
  const { show } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{show?.title || 'Show Details'}</Text>
      {/* Add more show info here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.SURFACE, justifyContent: 'center', alignItems: 'center' },
  title: { color: COLORS.WHITE, fontSize: 24, fontWeight: 'bold' }
});
