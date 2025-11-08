// src/screens/EventDetailScreen.js
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import FieldDayCarousel from '../components/FieldDayCarousel';
import { FontAwesome } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const startDate = new Date(event.startTime);
  const now = new Date();
  const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
  let ctaLabel = '';
  let ctaAction = null;
  if (event.status === 'live') {
    ctaLabel = 'Watch Live';
    ctaAction = () => navigation.navigate('VideoPlayerScreen', { url: event.streamUrl });
  } else if (event.status === 'upcoming') {
    ctaLabel = 'Set Reminder';
    ctaAction = () => {};
  } else if (event.status === 'replay') {
    ctaLabel = 'Watch Replay';
    ctaAction = () => navigation.navigate('VideoPlayerScreen', { url: event.replayUrl });
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <Image source={event.bannerImage} style={styles.banner} />
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{startDate.toLocaleString()} • {event.location}</Text>
        <View style={styles.sportTagPill}>
          <Text style={styles.sportTagText}>{event.sportTag}</Text>
        </View>
        {event.status === 'upcoming' && (
          <Text style={styles.countdown}>Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</Text>
        )}

        <Text style={styles.description}>{event.description}</Text>


        {/* Field Day Invitational Carousel */}
        {event.fieldDayVideos && event.fieldDayVideos.length > 0 && (
          <FieldDayCarousel videos={event.fieldDayVideos} onVideoPress={(video) => { /* TODO: handle video play */ }} />
        )}

        {/* Highlights & Recap Grid */}
        {event.highlightsAndRecap && event.highlightsAndRecap.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights & Recap</Text>
            <View style={styles.highlightsGrid}>
              {event.highlightsAndRecap.map((highlight, idx) => (
                <TouchableOpacity
                  key={highlight.id}
                  style={styles.highlightCard}
                  onPress={() => navigation.navigate('VideoPlayerScreen', { url: highlight.videoUrl })}
                  activeOpacity={0.8}
                >
                  <Image source={highlight.thumbnail} style={styles.highlightImage} />
                  <Text style={styles.highlightTitle} numberOfLines={2}>{highlight.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Guest Athletes */}
        {event.guestAthletes && event.guestAthletes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Athletes</Text>
            <View style={styles.badgeRow}>
              {event.guestAthletes.map((athlete, idx) => (
                <View key={idx} style={styles.athleteBadge}>
                  <Text style={styles.athleteText}>{athlete}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sponsors */}
        {event.sponsors && event.sponsors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sponsors</Text>
            <View style={styles.badgeRow}>
              {event.sponsors.map((sponsor, idx) => (
                <View key={idx} style={styles.sponsorBadge}>
                  <Text style={styles.sponsorText}>{sponsor}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prize Pool */}
        {event.prizePool && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prize Pool</Text>
            <Text style={styles.prizeText}>{event.prizePool}</Text>
          </View>
        )}

        {/* Hashtags */}
        {event.hashtags && event.hashtags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hashtags</Text>
            <View style={styles.badgeRow}>
              {event.hashtags.map((tag, idx) => (
                <Text key={idx} style={styles.hashtag}>{tag}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Social Links */}
        {event.socialLinks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow</Text>
            <View style={styles.badgeRow}>
              {event.socialLinks.twitter && (
                <TouchableOpacity style={styles.socialLink} onPress={() => {}}>
                  <Svg width={22} height={22} viewBox="0 0 120 120">
                    <Path d="M93.5 18H111L72.5 62.2L118 120H82.2L53.6 84.2L21.8 120H4L45.2 72.2L1 18H37.8L63.2 50.2L93.5 18ZM87.2 109.2H97.2L32.2 28.2H21.2L87.2 109.2Z" fill={COLORS.ORANGE}/>
                  </Svg>
                </TouchableOpacity>
              )}
              {event.socialLinks.instagram && (
                <TouchableOpacity style={styles.socialLink} onPress={() => {}}>
                  <FontAwesome name="instagram" size={22} color={COLORS.ORANGE} />
                </TouchableOpacity>
              )}
              {event.socialLinks.facebook && (
                <TouchableOpacity style={styles.socialLink} onPress={() => {}}>
                  <FontAwesome name="facebook-square" size={22} color={COLORS.ORANGE} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.cta} onPress={ctaAction} disabled={!ctaAction}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.SURFACE },
  banner: {
    width: '100%', height: 440, resizeMode: 'cover', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  content: { padding: 20 },
  title: { color: COLORS.WHITE, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  meta: { color: COLORS.GRAY, fontSize: 15, marginBottom: 6 },
  sportTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.ORANGE,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
    marginTop: 2,
  },
  sportTagText: {
    color: COLORS.BLACK,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countdown: { color: COLORS.ORANGE, fontWeight: '700', fontSize: 16, marginBottom: 10 },
  description: { color: COLORS.WHITE, fontSize: 16, marginBottom: 24, lineHeight: 22 },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  highlightCard: {
    width: '48%',
    aspectRatio: 1.1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  highlightImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.7,
    resizeMode: 'cover',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  highlightTitle: {
    color: COLORS.WHITE,
    fontWeight: '700',
    fontSize: 15,
    padding: 10,
    textAlign: 'center',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 2,
  },
  athleteBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  athleteText: {
    color: COLORS.ORANGE,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  sponsorBadge: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  sponsorText: {
    color: COLORS.ORANGE,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  prizeText: {
    color: COLORS.ORANGE,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  hashtag: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    color: COLORS.ORANGE,
    fontSize: 15,
    marginRight: 10,
    fontWeight: '600',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  socialLink: {
    color: COLORS.ORANGE,
    fontSize: 15,
    textDecorationLine: 'underline',
    marginRight: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
    letterSpacing: 0.2,
  },
  cta: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    opacity: 1,
  },
  ctaText: { color: COLORS.WHITE, fontWeight: '700', fontSize: 18 },
});
