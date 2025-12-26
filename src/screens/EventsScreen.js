import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { getEvents } from '../services/api';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
export default function EventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setEvents([]);
    }
    setLoading(false);
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { width: SCREEN_WIDTH - 32, alignSelf: 'center' }]}
      onPress={() => navigation.navigate('EventDetail', { event: item })}
    >
      <Image
        source={
          item.thumbnailImage
            ? item.thumbnailImage
            : item.bannerImage
            ? item.bannerImage
            : item.image
            ? item.image
            : require('../../assets/hero1.jpg')
        }
        style={[styles.eventImage, { width: SCREEN_WIDTH - 32, height: Math.round((SCREEN_WIDTH - 32) * 0.65) }]}
      />

      {/* Status Badge */}
      {item.status && (
        <View style={[styles.statusBadge, item.status === 'live' && styles.liveBadge]}>
          {item.status === 'live' && <View style={styles.liveDot} />}
          <Text style={styles.statusText}>
            {item.status === 'live' ? 'LIVE NOW' : item.status.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>

        <View style={styles.eventMeta}>
          <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.eventDate}>
            {item.startTime ? new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          </Text>
        </View>

        {item.time && (
          <View style={styles.eventMeta}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.eventTime}>{item.time}</Text>
          </View>
        )}

        {item.location && (
          <View style={styles.eventMeta}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.eventLocation}>{item.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Text style={styles.headerSubtitle}>Live streams & competitions</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.SURFACE,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: '#ff4444',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.WHITE,
    marginRight: 6,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
  },
  eventTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
  },
});
