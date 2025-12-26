import React, { useState, useEffect, useRef } from 'react';
import { Modal, Pressable } from 'react-native';
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setSavedItem, isSaved } from '../helpers/library';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../constants/colors';
import { getEvents } from '../services/api';
import { getCountdownParts } from '../helpers/time';
import PiPPlayer from '../components/PiPPlayer';
import { usePiP } from '../context/PiPContext';
import LiveChat from '../components/LiveChat';
import EmojiReactions from '../components/EmojiReactions';


// Helper to check if event is upcoming (not live, startTime in future)
function isUpcoming(event) {
	return !event.isLive && event.startTime && new Date(event.startTime) > new Date();
}

export default function LiveTVScreen({ navigation }) {
	const [selectedLive, setSelectedLive] = useState(null);
	const [actionSheetVisible, setActionSheetVisible] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { showPiP, pipStream, visible } = usePiP();

	const [events, setEvents] = useState([]);
	const [categories, setCategories] = useState(['All']);
	useEffect(() => {
		async function fetchEvents() {
			const data = await getEvents();
			setEvents(data);
			const cats = data.map(e => e.category).filter(Boolean);
			setCategories(['All', ...Array.from(new Set(cats))]);
		}
		fetchEvents();
	}, []);
	// Persist last selected category in state
	const [selectedCategory, setSelectedCategory] = useState('All');

	// Split events into live and upcoming, filtered by category
	const filteredLiveEvents = events.filter(e => e.is_live && (selectedCategory === 'All' || e.category === selectedCategory));
	const filteredUpcomingEvents = events.filter(ev => isUpcoming(ev) && (selectedCategory === 'All' || ev.category === selectedCategory));

	// Saved state for live events
	const [savedMap, setSavedMap] = useState({});
	useEffect(() => {
		// Load saved state for visible events (only once on mount)
		let mounted = true;
		const loadSaved = async () => {
			const map = {};
			for (const ev of filteredLiveEvents) {
				map[ev.id] = await isSaved(ev.id);
			}
			if (mounted) setSavedMap(map);
		};
		loadSaved();
		return () => { mounted = false; };
	}, []); // Only run once on mount

	// Toggle save/unsave (only update the clicked event)
	const handleToggleSave = async (event) => {
		const newState = !savedMap[event.id];
		setSavedMap(prev => ({ ...prev, [event.id]: newState })); // Immediate UI feedback
		await setSavedItem(event.id, newState);
	};

	// Countdown state for upcoming events
	const [countdowns, setCountdowns] = useState(() => {
		const obj = {};
		filteredUpcomingEvents.forEach(ev => {
			obj[ev.id] = getCountdownParts(ev.startTime);
		});
		return obj;
	});
	// Ref to store interval
	const intervalRef = useRef();

	// Update countdowns every second
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setCountdowns(prev => {
				const updated = { ...prev };
				filteredUpcomingEvents.forEach(ev => {
					updated[ev.id] = getCountdownParts(ev.startTime);
				});
				return updated;
			});
		}, 1000);
		return () => clearInterval(intervalRef.current);
	}, [filteredUpcomingEvents.length, selectedCategory]);

	// Auto-refresh every 30s
	useEffect(() => {
		const interval = setInterval(() => {
			// Simulate refresh by updating countdowns and forcing re-render
			setCountdowns(prev => {
				const updated = { ...prev };
				filteredUpcomingEvents.forEach(ev => {
					updated[ev.id] = getCountdownParts(ev.startTime);
				});
				return updated;
			});
		}, 30000);
		return () => clearInterval(interval);
	}, [filteredUpcomingEvents.length, selectedCategory]);

	// Pull-to-refresh handler
	const handleRefresh = () => {
		setRefreshing(true);
		// Simulate data refresh (could fetch from API)
		setTimeout(() => {
			setCountdowns(prev => {
				const updated = { ...prev };
				filteredUpcomingEvents.forEach(ev => {
					updated[ev.id] = getCountdownParts(ev.startTime);
				});
				return updated;
			});
			setRefreshing(false);
		}, 1200);
	};

	// Handle Watch Now: show ActionSheet/modal
	const handleWatchPress = (event) => {
		setSelectedLive(event);
		setActionSheetVisible(true);
	};

	// Handle ActionSheet selection
	const handleActionSheetSelect = (option) => {
		setActionSheetVisible(false);
		if (!selectedLive) return;
		let startAt = null;
		if (option === 'live') {
			startAt = null; // Play from live edge
		} else if (option === 'beginning') {
			startAt = selectedLive.startTime;
		}
		navigation.navigate('VideoPlayer', { video: selectedLive, startAt });
		setSelectedLive(null);
	};

	// Handle Remind Me (schedules notification 10 min before start)
	const handleRemindMe = async (event) => {
		const start = new Date(event.startTime);
		const notifyAt = new Date(start.getTime() - 10 * 60 * 1000);
		// Request permission
		const { status } = await Notifications.requestPermissionsAsync();
		if (status !== 'granted') return;
		await Notifications.scheduleNotificationAsync({
			content: {
				title: `Reminder: ${event.title}`,
				body: `Starts in 10 minutes!`,
			},
			trigger: notifyAt,
		});
	};

	// Render filter chips (horizontal scroll)
	const renderChips = () => (
		<FlatList
			data={categories}
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.chipScroll}
			contentContainerStyle={styles.chipContainer}
			keyExtractor={cat => cat}
			renderItem={({ item: cat }) => (
				<TouchableOpacity
					key={cat}
					style={[styles.chip, selectedCategory === cat && styles.chipActive]}
					onPress={() => setSelectedCategory(cat)}
					accessibilityRole="tab"
					accessibilityState={{ selected: selectedCategory === cat }}
				>
					<Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
				</TouchableOpacity>
			)}
		/>
	);

	// Define a default currentUser object
	const currentUser = { id: 'guest', username: 'Guest' };

	// Compose data for FlatList: section headers and event cards
	const flatListData = [];
	flatListData.push({ type: 'header' });
	flatListData.push({ type: 'chips' });
	flatListData.push({ type: 'section', title: 'Live Now' });
	if (filteredLiveEvents.length > 0) {
		filteredLiveEvents.forEach(item => flatListData.push({ type: 'live', item }));
	} else {
		flatListData.push({ type: 'empty', message: 'No live events right now.' });
	}
	if (filteredUpcomingEvents.length > 0) {
		flatListData.push({ type: 'section', title: 'Upcoming' });
		filteredUpcomingEvents.forEach(item => flatListData.push({ type: 'upcoming', item }));
	}

	const renderFlatListItem = ({ item }) => {
		if (item.type === 'header') {
			return (
				<>
					<StatusBar barStyle="light-content" />
					<Text style={styles.headerTitle}>Live TV</Text>
					<View style={styles.pipHintBox}>
						<Text style={styles.pipHintText}>You can use Mini PiP to keep watching while browsing. Tap the PiP icon on a video!</Text>
					</View>
					<PiPPlayer navigation={navigation} />
				</>
			);
		}
		if (item.type === 'chips') {
			return renderChips();
		}
		if (item.type === 'section') {
			return <Text style={styles.sectionHeader}>{item.title}</Text>;
		}
		if (item.type === 'live') {
			const { item: liveItem } = item;
			let progress = 0;
			if (liveItem.startTime && liveItem.duration) {
				const start = new Date(liveItem.startTime).getTime();
				const now = Date.now();
				const end = start + liveItem.duration * 1000;
				progress = Math.max(0, Math.min(1, (now - start) / (end - start)));
			}
			const isSavedEvent = savedMap[liveItem.id];
			return (
				<View style={styles.liveCard} key={liveItem.id}>
					<Image source={liveItem.thumbnailUrl} style={styles.liveImage} />
					<View style={styles.liveInfo}>
						<View style={styles.heroHeaderRow}>
							<Text style={styles.liveTitle}>{liveItem.title}</Text>
							<TouchableOpacity onPress={() => handleToggleSave(liveItem)} style={styles.bookmarkBtn} accessibilityLabel={isSavedEvent ? 'Remove from Library' : 'Save to Library'}>
								<Ionicons name={isSavedEvent ? 'bookmark' : 'bookmark-outline'} size={28} color={isSavedEvent ? COLORS.ORANGE : COLORS.WHITE} />
							</TouchableOpacity>
						</View>
						<Text style={styles.liveDesc}>{liveItem.description}</Text>
						<View style={styles.liveMeta}>
							<Text style={styles.liveBadge}>{liveItem.badge || 'LIVE'}</Text>
							<Text style={styles.liveViewers}>{liveItem.viewers} watching</Text>
						</View>
						{liveItem.startTime && liveItem.duration && (
							<View style={styles.heroProgressBarBg}>
								<View style={[styles.heroProgressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
							</View>
						)}
						<TouchableOpacity style={styles.heroWatchBtn} onPress={() => navigation.navigate('VideoPlayer', { video: liveItem })}>
							<Text style={styles.heroWatchBtnText}>Watch Now</Text>
						</TouchableOpacity>
						{/* Trending/Popular badges */}
						{liveItem.isTrending && (
							<View style={styles.trendingBadge}>
								<Ionicons name="flame" size={18} color={COLORS.ORANGE} style={{ marginRight: 6 }} />
								<Text style={styles.trendingText}>Trending</Text>
							</View>
						)}
						{liveItem.isPopular && (
							<View style={styles.trendingBadge}>
								<Ionicons name="star" size={18} color={COLORS.YELLOW || '#FFD700'} style={{ marginRight: 6 }} />
								<Text style={styles.trendingText}>Popular</Text>
							</View>
						)}
					</View>
					<EmojiReactions eventId={liveItem.id} user={currentUser} />
					<LiveChat eventId={liveItem.id} user={currentUser} />
				</View>
			);
		}
		if (item.type === 'upcoming') {
			const { item: upItem } = item;
			const { hours, minutes, seconds } = countdowns[upItem.id] || {};
			return (
				<View style={styles.liveCard} key={upItem.id}>
					<Image source={upItem.thumbnailUrl} style={styles.liveImage} />
					<View style={styles.liveInfo}>
						<Text style={styles.liveTitle}>{upItem.title}</Text>
						<Text style={styles.liveDesc}>{upItem.description}</Text>
						<View style={styles.liveMeta}>
							<Text style={styles.liveBadge}>UPCOMING</Text>
							<Text style={styles.liveViewers}>Starts in {hours?.toString().padStart(2, '0')}:{minutes?.toString().padStart(2, '0')}:{seconds?.toString().padStart(2, '0')}</Text>
						</View>
						<TouchableOpacity style={styles.remindBtn} onPress={() => handleRemindMe(upItem)}>
							<Text style={styles.remindBtnText}>Remind Me</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}
		if (item.type === 'empty') {
			return <Text style={styles.emptyText}>{item.message}</Text>;
		}
		return null;
	};

	return (
		<FlatList
			data={flatListData}
			renderItem={renderFlatListItem}
			keyExtractor={(_, idx) => String(idx)}
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 32 }}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.ORANGE} />
			}
		/>
	);
}


const styles = StyleSheet.create({
	// ...existing styles...
	heroHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	bookmarkBtn: {
		marginLeft: 12,
		padding: 4,
	},
	sheetOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.32)',
		justifyContent: 'flex-end',
	},
	sheetContainer: {
		backgroundColor: COLORS.SURFACE,
		padding: 24,
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
		alignItems: 'center',
	},
	sheetTitle: {
		fontSize: 19,
		fontWeight: 'bold',
		color: COLORS.WHITE,
		marginBottom: 18,
	},
	sheetBtn: {
		backgroundColor: COLORS.ORANGE,
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 32,
		marginBottom: 12,
		width: '100%',
		alignItems: 'center',
	},
	sheetBtnText: {
		color: COLORS.WHITE,
		fontWeight: 'bold',
		fontSize: 16,
	},
	sheetCancel: {
		marginTop: 8,
		padding: 10,
	},
	sheetCancelText: {
		color: COLORS.GRAY,
		fontSize: 15,
	},
	chipScroll: {
		marginBottom: 14,
		marginTop: 6,
		paddingHorizontal: 8,
		minHeight: 54,
	},
	chipContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	chip: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 20,
		paddingHorizontal: 24,
		paddingVertical: 12,
		marginRight: 10,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		minHeight: 40,
	},
	chipActive: {
		backgroundColor: COLORS.ORANGE,
		borderColor: COLORS.ORANGE,
	},
	chipText: {
		color: COLORS.WHITE,
		fontWeight: '600',
		fontSize: 17,
	},
	chipTextActive: {
		color: COLORS.BLACK,
	},
	container: {
		flex: 1,
		backgroundColor: COLORS.SURFACE,
		paddingTop: 60,
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: 'bold',
		color: COLORS.WHITE,
		marginBottom: 16,
		paddingHorizontal: 20,
	},
	sectionHeader: {
		fontSize: 22,
		fontWeight: 'bold',
		color: COLORS.WHITE,
		marginBottom: 8,
		marginTop: 18,
		paddingHorizontal: 20,
	},
	listContainer: {
		padding: 16,
	},
	heroCard: {
		backgroundColor: 'rgba(255,255,255,0.09)',
		borderRadius: 20,
		marginBottom: 40,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.16,
		shadowRadius: 28,
		elevation: 6,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.04)',
	},
	heroImage: {
		width: '100%',
		height: 220,
		resizeMode: 'contain',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: 'rgba(0,0,0,0.2)', // letterbox effect
	},
	heroInfo: {
		padding: 32,
		justifyContent: 'center',
	},
	heroTitle: {
		fontSize: 26,
		fontWeight: '700',
		color: COLORS.WHITE,
		marginBottom: 10,
	},
	heroDesc: {
		fontSize: 16,
		color: 'rgba(255,255,255,0.8)',
		marginBottom: 14,
		lineHeight: 22,
	},
	heroMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 14,
	},
	heroBadge: {
		backgroundColor: '#ff4444',
		color: COLORS.WHITE,
		fontWeight: 'bold',
		fontSize: 14,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginRight: 16,
	},
	heroViewers: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 14,
	},
	heroProgressBarBg: {
		height: 10,
		backgroundColor: 'rgba(255,255,255,0.18)',
		borderRadius: 6,
		marginBottom: 16,
		marginTop: 6,
		overflow: 'hidden',
	},
	heroProgressBarFill: {
		height: 10,
		backgroundColor: COLORS.ORANGE,
		borderRadius: 6,
	},
	heroWatchBtn: {
		backgroundColor: COLORS.ORANGE,
		borderRadius: 12,
		paddingVertical: 18,
		paddingHorizontal: 32,
		alignSelf: 'center',
		marginTop: 10,
	},
	heroWatchBtnText: {
		color: COLORS.WHITE,
		fontWeight: 'bold',
		fontSize: 20,
	},
	remindBtn: {
		backgroundColor: COLORS.GRAY,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 18,
		alignSelf: 'flex-start',
		marginTop: 4,
	},
	remindBtnText: {
		color: COLORS.WHITE,
		fontWeight: 'bold',
		fontSize: 15,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: '700',
		color: COLORS.WHITE,
		marginTop: 32,
		textAlign: 'center',
	},
	pipHintBox: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 12,
		marginHorizontal: 20,
		marginBottom: 12,
		padding: 14,
		alignItems: 'center',
	},
	pipHintText: {
		color: COLORS.WHITE,
		fontSize: 15,
		textAlign: 'center',
	},
	liveCard: {
		backgroundColor: 'rgba(255,255,255,0.09)',
		borderRadius: 20,
		marginBottom: 40,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.16,
		shadowRadius: 28,
		elevation: 6,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.04)',
		minHeight: 580, // Increase height further
	},
	liveImage: {
		width: '100%',
		height: 380, // Increase image height
		resizeMode: 'cover',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: 'rgba(0,0,0,0.2)',
	},
	liveInfo: {
		padding: 56, // More space for info
		justifyContent: 'flex-start',
	},
	liveTitle: {
		fontSize: 26,
		fontWeight: '700',
		color: COLORS.WHITE,
		marginBottom: 10,
	},
	liveDesc: {
		fontSize: 16,
		color: 'rgba(255,255,255,0.8)',
		marginBottom: 14,
		lineHeight: 22,
	},
	liveMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 14,
	},
	liveBadge: {
		backgroundColor: '#ff4444',
		color: COLORS.WHITE,
		fontWeight: 'bold',
		fontSize: 14,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginRight: 16,
	},
	liveViewers: {
		color: 'rgba(255,255,255,0.7)',
		fontSize: 14,
	},
	trendingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.14)',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginTop: 8,
		alignSelf: 'flex-start',
	},
	trendingText: {
		color: COLORS.ORANGE,
		fontWeight: 'bold',
		fontSize: 15,
	},
});



