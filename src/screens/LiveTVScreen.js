import React, { useState, useEffect, useRef } from 'react';
import { getCountdownParts } from '../helpers/countdown'; // [feature] Import countdown util
import { View, Text, SectionList, StyleSheet, StatusBar, RefreshControl, Image, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';

const localThumb1 = require('../../assets/theweyherline.jpg');
const localThumb2 = require('../../assets/quixotictarget.jpg');


export default function LiveTVScreen() {
	const [streams, setStreams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [sortOption, setSortOption] = useState('soon');

	const DEMO_STREAMS = [
		{
			id: '1',
			title: 'Live Football Match',
			description: 'Watch the big game live!',
			isLive: true,
			category: 'Sports',
			startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
			endTime: new Date(Date.now() + 1000 * 60 * 50).toISOString(),
			thumbnailUrl: localThumb1,
		},
		{
			id: '2',
			title: 'Upcoming Music Festival',
			description: 'Don’t miss the live music event!',
			isLive: false,
			category: 'Music',
			startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
			endTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
			thumbnailUrl: localThumb2,
		},
	];

	const loadStreams = () => {
		setLoading(true);
		setTimeout(() => {
			setStreams(DEMO_STREAMS);
			setLoading(false);
			setRefreshing(false);
		}, 1000);
	};

	useEffect(() => {
		loadStreams();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		loadStreams();
	};

	// Get unique categories from streams
	const categories = ['All', ...Array.from(new Set(DEMO_STREAMS.map(s => s.category)))];

	// Sort options
	const SORT_OPTIONS = [
		{ label: 'Soon', value: 'soon' },
		{ label: 'Newest', value: 'newest' },
		{ label: 'Popular', value: 'popular' },
	];

	const now = new Date();
	// Filter by selected category
	const filteredStreams = selectedCategory === 'All'
		? streams
		: streams.filter(s => s.category === selectedCategory);
	let sortedStreams = [...filteredStreams];
	if (sortOption === 'popular') {
		sortedStreams.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
	} else if (sortOption === 'newest') {
		sortedStreams.sort((a, b) => {
			const aTime = new Date(a.startTime || a.createdAt || 0).getTime();
			const bTime = new Date(b.startTime || b.createdAt || 0).getTime();
			return bTime - aTime;
		});
	} else if (sortOption === 'soon') {
		sortedStreams.sort((a, b) => {
			const aTime = new Date(a.startTime || Infinity).getTime();
			const bTime = new Date(b.startTime || Infinity).getTime();
			return aTime - bTime;
		});
	}


	const liveNow = sortedStreams.filter(s => s.isLive || (s.startTime && new Date(s.startTime) <= now));
	const upcoming = sortedStreams.filter(s => !s.isLive && s.startTime && new Date(s.startTime) > now);




	const sections = [
		{ title: 'Live Now', data: liveNow },
		{ title: 'Upcoming', data: upcoming },
	];

			// Pulse animation for live badge
			const pulseAnim = useRef(new Animated.Value(1)).current;
			useEffect(() => {
				Animated.loop(
					Animated.sequence([
						Animated.timing(pulseAnim, {
							toValue: 1.5,
							duration: 600,
							useNativeDriver: true,
						}),
						Animated.timing(pulseAnim, {
							toValue: 1,
							duration: 600,
							useNativeDriver: true,
						}),
					])
				).start();
			}, [pulseAnim]);

			// [feature] Countdown state for upcoming events
			const [nowTick, setNowTick] = useState(Date.now());
			useEffect(() => {
				// Only tick if there are upcoming events
				if (upcoming.length === 0) return;
				const interval = setInterval(() => setNowTick(Date.now()), 1000);
				return () => clearInterval(interval);
			}, [upcoming.length]);

			// [feature] Remind Me handler stub (to be replaced with notification logic)
			const handleRemindMe = (item) => {
				Alert.alert('Remind Me', 'A reminder would be set for this event (demo).');
			};

		return (
		<View style={styles.container} accessible accessibilityLabel="Live TV screen" accessibilityHint="Browse live and upcoming events. Use filter and sort controls above the list." >
			<StatusBar barStyle="light-content" />
			<View style={styles.header} accessible accessibilityLabel="Live TV header" accessibilityHint="Screen title and subtitle." >
				<Text style={styles.headerTitle}>Live TV</Text>
				<Text style={styles.headerSubtitle}>Watch live and upcoming events</Text>
			</View>
			{/* Sort selector */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={[styles.chipScroll, { marginBottom: 0 }]}
						style={{ marginBottom: 0 }}
						accessibilityRole="radiogroup"
						accessible
						accessibilityLabel="Sort options"
						accessibilityHint="Sort streams by soon, newest, or popular."
					>
				{SORT_OPTIONS.map(opt => (
								<TouchableOpacity
									key={opt.value}
									style={[styles.chip, sortOption === opt.value && styles.chipActive]}
									onPress={() => setSortOption(opt.value)}
									accessibilityRole="radio"
									accessibilityState={{ selected: sortOption === opt.value }}
									accessibilityLabel={opt.label + (sortOption === opt.value ? ', selected' : '')}
									accessibilityHint={`Sort streams by ${opt.label}`}
								>
									<Text style={[styles.chipText, sortOption === opt.value && styles.chipTextActive]}>{opt.label}</Text>
								</TouchableOpacity>
				))}
			</ScrollView>
			{/* Category filter chips */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.chipScroll}
						style={{ marginBottom: 8 }}
						accessibilityRole="tablist"
						accessible
						accessibilityLabel="Category filters"
						accessibilityHint="Filter streams by category."
					>
				{categories.map((cat) => (
								<TouchableOpacity
									key={cat}
									style={[styles.chip, selectedCategory === cat && styles.chipActive]}
									onPress={() => setSelectedCategory(cat)}
									accessibilityRole="tab"
									accessibilityState={{ selected: selectedCategory === cat }}
									accessibilityLabel={cat + (selectedCategory === cat ? ', selected' : '')}
									accessibilityHint={`Filter streams by ${cat} category`}
								>
									<Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
								</TouchableOpacity>
				))}
			</ScrollView>
					{loading ? (
						<View style={styles.centered}><Text style={styles.loadingText}>Loading…</Text></View>
					) : sections.every(section => section.data.length === 0) ? (
						<View style={styles.emptyState} accessible accessibilityLabel="No streams available" accessibilityHint="Try changing filters or check back later.">
							<Text style={styles.emptyIcon}>📺</Text>
							<Text style={styles.emptyTitle}>No Streams Found</Text>
							<Text style={styles.emptyText}>Try changing filters or check back later for new live events.</Text>
						</View>
					) : (
						<SectionList
							sections={sections}
							keyExtractor={item => item.id}
							renderSectionHeader={({ section: { title } }) => (
								<Text style={styles.sectionHeader}>{title}</Text>
							)}
							renderItem={({ item }) => (
								<View style={styles.card} accessible accessibilityLabel={`Stream card: ${item.title}`} accessibilityHint={item.isLive ? 'Live event' : 'Upcoming event'}>
									{item.thumbnailUrl ? (
										<View style={styles.imageWrapper}>
											<Image
												source={item.thumbnailUrl}
												style={styles.cardImage}
												resizeMode="cover"
											/>
										</View>
									) : (
										<View style={[styles.imageWrapper, styles.imageFallback]} />
									)}
									<View style={styles.cardHeaderRow}>
										<Text style={styles.cardTitle} accessibilityLabel={`Event title: ${item.title}`}>{item.title}</Text>
														{item.isLive && (
															<View style={styles.liveBadge}>
																<Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
																<Text style={styles.liveBadgeText}>LIVE</Text>
															</View>
														)}
									</View>
									<Text style={styles.cardDesc} accessibilityLabel={`Event description: ${item.description}`}>{item.description}</Text>
													<Text style={styles.cardMeta} accessibilityLabel={`Event status: ${item.isLive ? 'Now Streaming' : 'Upcoming'}, Category: ${item.category}`}>{item.isLive ? 'Now Streaming' : 'Upcoming'} • {item.category}</Text>
													{/* [feature] Show countdown and Remind Me for upcoming */}
													{!item.isLive && (
														<>
															{/* Countdown UI */}
															<Countdown startTime={item.startTime} />
															<TouchableOpacity
																style={styles.remindMeBtn}
																onPress={() => handleRemindMe(item)}
																accessibilityRole="button"
																accessibilityLabel={`Remind me about ${item.title}`}
																accessibilityHint={`Set a reminder for ${item.title}`}
															>
																<Text style={styles.remindMeBtnText}>Remind Me</Text>
															</TouchableOpacity>
														</>
													)}
								</View>
							)}
							contentContainerStyle={styles.listContent}
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6A00" />
							}
						/>
					)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#181818' },
	header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#181818' },
	headerTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
	headerSubtitle: { color: '#bbb', fontSize: 16, marginTop: 4 },
	sectionHeader: { color: '#FF6A00', fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 8, marginLeft: 16 },
	card: { backgroundColor: '#232323', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12 },
	imageWrapper: { width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', marginBottom: 12, backgroundColor: '#222' },
	cardImage: { width: '100%', height: '100%' },
	imageFallback: { backgroundColor: '#333' },
	cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
	cardDesc: { color: '#ccc', fontSize: 14, marginTop: 4 },
	cardMeta: { color: '#FF6A00', fontSize: 12, marginTop: 8 },
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	loadingText: { color: '#fff', fontSize: 22 },
		emptyText: { color: '#bbb', fontSize: 18, textAlign: 'center', marginTop: 8 },
		emptyState: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: 32,
			paddingTop: 60,
		},
		emptyIcon: {
			fontSize: 64,
			marginBottom: 12,
			color: '#FF6A00',
			textAlign: 'center',
		},
		emptyTitle: {
			color: '#fff',
			fontSize: 26,
			fontWeight: 'bold',
			marginBottom: 8,
			textAlign: 'center',
		},
	listContent: { paddingBottom: 40 },
	cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6A00', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
		liveDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: '#fff',
			marginRight: 5,
			shadowColor: '#FF6A00',
			shadowOffset: { width: 0, height: 0 },
			shadowOpacity: 0.7,
			shadowRadius: 6,
		},
	liveBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
	cardTime: { color: '#bbb', fontSize: 13, marginTop: 4 },
	chipScroll: {
		paddingHorizontal: 12,
		paddingBottom: 4,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	chip: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 8,
		marginRight: 8,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
	},
	chipActive: {
		backgroundColor: '#FF6A00',
		borderColor: '#FF6A00',
	},
	chipText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 14,
		letterSpacing: 0.5,
	},
	chipTextActive: {
		color: '#222',
	},
	remindMeBtn: {
		marginTop: 10,
		backgroundColor: '#FF6A00',
		borderRadius: 8,
		paddingVertical: 10,
		alignItems: 'center',
	},
	remindMeBtnText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 15,
		letterSpacing: 0.5,
	},

});

// [feature] Countdown component for upcoming events
function Countdown({ startTime }) {
	const { hours, minutes, seconds } = getCountdownParts(startTime);
	// Format as hh:mm:ss
	const pad = (n) => n.toString().padStart(2, '0');
	return (
		<Text style={styles.cardTime} accessibilityLabel={`Starts in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}>
			Starts in {pad(hours)}:{pad(minutes)}:{pad(seconds)}
		</Text>
	);
}
