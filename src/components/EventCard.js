// src/components/EventCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function EventCard({ event, onPress }) {
  const startDate = new Date(event.startTime);
  const now = new Date();
  const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
  let statusLabel = '';
  let statusColor = COLORS.GRAY;
  let statusIcon = null;
  if (event.status === 'live') {
    statusLabel = 'LIVE';
    statusColor = COLORS.ORANGE;
    statusIcon = <Text style={{ fontSize: 18, marginRight: 6 }}>🔴</Text>;
  } else if (event.status === 'upcoming') {
    statusLabel = `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    statusColor = COLORS.PRIMARY;
    statusIcon = <Ionicons name="time-outline" size={18} color={COLORS.ORANGE} style={{ marginRight: 6 }} />;
  } else if (event.status === 'replay') {
    statusLabel = 'Replay';
    statusColor = COLORS.GRAY;
    statusIcon = <Text style={{ fontSize: 18, marginRight: 6 }}>⏪</Text>;
  }
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={event.thumbnailImage} style={styles.thumb} />
      <View style={styles.infoBg}>
        <View style={styles.info}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            {statusIcon}
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          </View>
          <Text style={styles.meta}>{startDate.toLocaleDateString()} • {event.location}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}> 
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    marginBottom: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: COLORS.BACKDROP,
  },
  infoBg: {
    flex: 1,
    backgroundColor: 'rgba(40,40,40,0.32)',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    color: COLORS.GRAY,
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  statusText: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
});
