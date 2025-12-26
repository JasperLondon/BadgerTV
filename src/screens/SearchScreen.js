import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Analytics from 'expo-firebase-analytics';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing, FlatList,
    Image, Animated as RNAnimated, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { searchVideos } from '../services/api';

// Simple shimmer effect for skeleton loader
const Shimmer = ({ style }) => {
	const shimmerAnim = useRef(new RNAnimated.Value(0)).current;
	useEffect(() => {
		RNAnimated.loop(
			RNAnimated.timing(shimmerAnim, {
				toValue: 1,
				duration: 1200,
				useNativeDriver: true,
			})
		).start();
	}, []);
	const translateX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 200] });
	return (
		<View style={[style, { overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.13)' }]}> 
			<RNAnimated.View
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					width: 60,
					backgroundColor: 'rgba(255,255,255,0.25)',
					opacity: 0.7,
					transform: [{ translateX }],
				}}
			/>
		</View>
	);
};

export default function SearchScreen({ navigation }) {
		const fadeAnim = useRef(new Animated.Value(0)).current;
		const [query, setQuery] = useState('');
		const [results, setResults] = useState([]);
		const [loading, setLoading] = useState(false);
		const [hasSearched, setHasSearched] = useState(false);
		const [recentSearches, setRecentSearches] = useState([]);
		const [suggestions, setSuggestions] = useState([]);
		const [showSuggestions, setShowSuggestions] = useState(false);
		const [typeFilter, setTypeFilter] = useState('All');
		const [sortOption, setSortOption] = useState('relevance');
		const [error, setError] = useState(null);
		// Removed useVideos; now using Supabase API only

		useEffect(() => {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}).start();
		}, []);

		useEffect(() => {
			loadRecentSearches();
		}, []);

		useEffect(() => {
			setSuggestions([]);
		}, [query]);

		async function loadRecentSearches() {
			try {
				const stored = await AsyncStorage.getItem('recentSearches');
				setRecentSearches(stored ? JSON.parse(stored) : []);
			} catch {}
		}
		async function addRecentSearch(text) {
			try {
				let arr = [text, ...recentSearches.filter(q => q !== text)].slice(0, 8);
				setRecentSearches(arr);
				await AsyncStorage.setItem('recentSearches', JSON.stringify(arr));
			} catch {}
		}
		async function clearRecentSearches() {
			setRecentSearches([]);
			await AsyncStorage.removeItem('recentSearches');
		}



		const handleSearch = async (text, fromRecent = false, fromSuggestion = false) => {
			setLoading(true);
			setHasSearched(true);
			setShowSuggestions(false);
			setError(null);
			try {
				if (!fromRecent && !fromSuggestion) {
					Analytics.logEvent('search_query', {
						query: text,
						type_filter: typeFilter,
						sort_option: sortOption,
					});
				}
				let data = await searchVideos(text);
				if (typeFilter !== 'All') {
					data = data.filter(item => (item.type || '').toLowerCase() === typeFilter.toLowerCase());
				}
				if (sortOption === 'newest') {
					data = [...data].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
				} else if (sortOption === 'popular') {
					data = [...data].sort((a, b) => (b.popularity || b.views || 0) - (a.popularity || a.views || 0));
				}
				setResults(data);
				if (!fromRecent && !fromSuggestion) await addRecentSearch(text);
			} catch (err) {
				setError('Something went wrong. Please try again.');
				setResults([]);
			} finally {
				setLoading(false);
			}
		};

		const handleResultPress = (item) => {
			Analytics.logEvent('search_result_click', {
				video_id: item.id,
				title: item.title,
				query,
				type_filter: typeFilter,
				sort_option: sortOption,
			});
			navigation.navigate('VideoPlayer', { video: item });
		};

		const highlightText = (text, query, style, highlightStyle) => {
			if (!query || !text) return <Text style={style}>{text}</Text>;
			const q = query.trim();
			if (!q) return <Text style={style}>{text}</Text>;
			const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
			const parts = String(text).split(regex);
			return (
				<Text style={style} numberOfLines={2}>
					{parts.map((part, i) =>
						regex.test(part) ? (
							<Text key={i} style={highlightStyle}>{part}</Text>
						) : (
							<Text key={i}>{part}</Text>
						)
					)}
				</Text>
			);
		};

			// Fade-in animation for each result card
			const renderResult = ({ item, index }) => {
				const cardAnim = useRef(new Animated.Value(0)).current;
				useEffect(() => {
					Animated.timing(cardAnim, {
						toValue: 1,
						duration: 350,
						delay: index * 60,
						useNativeDriver: true,
						easing: Easing.out(Easing.ease),
					}).start();
				}, []);
				return (
					<Animated.View style={{
						opacity: cardAnim,
						transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
					}}>
						<TouchableOpacity 
							style={styles.resultCard}
							onPress={() => handleResultPress(item)}
							activeOpacity={0.85}
						>
							<Image source={item.image} style={styles.resultImage} />
							<View style={styles.resultInfo}>
								{highlightText(item.title, query, styles.resultTitle, styles.highlight)}
								{item.description && highlightText(item.description, query, styles.resultDescription, styles.highlight)}
								<View style={styles.resultMeta}>
									{item.category && highlightText(item.category, query, styles.resultCategory, styles.highlight)}
									{item.duration && (
										<Text style={styles.resultDuration}>{item.duration}</Text>
									)}
								</View>
							</View>
						</TouchableOpacity>
					</Animated.View>
				);
			};

		// Debounce search input
		const debounceTimeout = useRef();
		const handleDebouncedSearch = (text) => {
			setQuery(text);
			setShowSuggestions(true);
			if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
			debounceTimeout.current = setTimeout(() => {
				handleSearch(text);
			}, 350);
		};

		// Voice search state
		const [isListening, setIsListening] = useState(false);

		const handleVoiceSearch = async () => {
			// If using expo-speech-to-text or similar package
			try {
				setIsListening(true);
				// This is a placeholder. Replace with actual speech-to-text integration for your stack.
				// const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
				// if (status !== 'granted') throw new Error('Microphone permission not granted');
				// const result = await SpeechToText.startAsync();
				// setQuery(result.transcript);
				// setShowSuggestions(true);
				// handleSearch(result.transcript);
				// For now, just simulate with a prompt
				const transcript = prompt('Simulated voice input: Enter your search query');
				if (transcript) {
					setQuery(transcript);
					setShowSuggestions(true);
					handleSearch(transcript);
				}
			} catch (e) {
				alert('Voice search failed: ' + e.message);
			} finally {
				setIsListening(false);
			}
		};

		return (
			<Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
				<StatusBar barStyle="light-content" />
				<View style={styles.header} accessible accessibilityRole="header">
					<Text style={styles.headerTitle} accessibilityRole="header" accessibilityLabel="Search heading">Search</Text>
					<View style={styles.searchContainer} accessible accessibilityLabel="Search input container">
						<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
							<TextInput
								style={[styles.searchInput, { flex: 1 }]}
								placeholder="Search videos, shows, events..."
								placeholderTextColor="#B0B0B0"
								value={query}
								onChangeText={handleDebouncedSearch}
								onFocus={() => setShowSuggestions(true)}
								autoCapitalize="none"
								autoCorrect={false}
								returnKeyType="search"
								onSubmitEditing={() => handleSearch(query)}
								accessibilityLabel="Search input"
								accessibilityHint="Enter keywords to search for videos, shows, or events"
							/>
							<TouchableOpacity
								style={{ marginLeft: 8 }}
								onPress={handleVoiceSearch}
								accessibilityRole="button"
								accessibilityLabel="Voice search"
								disabled={isListening}
							>
								<Ionicons name={isListening ? 'mic' : 'mic-outline'} size={24} color={isListening ? COLORS.ORANGE : '#B0B0B0'} />
							</TouchableOpacity>
						</View>
						{/* Suggestions dropdown */}
						{showSuggestions && suggestions.length > 0 && (
							<View style={styles.suggestionsContainer} accessible accessibilityLabel="Search suggestions">
								{suggestions.map((s, i) => (
									<TouchableOpacity
										key={s + i}
										style={styles.suggestionItem}
										onPress={() => handleSearch(s, false, true)}
										accessibilityRole="button"
										accessibilityLabel={`Suggestion: ${s}`}
									>
										<Text style={styles.suggestionText}>{s}</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>
					{/* Recent Searches */}
					{recentSearches.length > 0 && !hasSearched && (
						<View style={styles.recentContainer} accessible accessibilityLabel="Recent searches">
							<View style={styles.recentHeader}>
								<Text style={styles.recentTitle}>Recent Searches</Text>
								<TouchableOpacity onPress={clearRecentSearches} accessibilityRole="button" accessibilityLabel="Clear recent searches">
									<Text style={{ color: COLORS.ORANGE }}>Clear</Text>
								</TouchableOpacity>
							</View>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll} accessible accessibilityLabel="Recent search list">
								{recentSearches.map((q, i) => (
									<TouchableOpacity key={q + i} style={styles.recentChip} onPress={() => handleSearch(q, true)} accessibilityRole="button" accessibilityLabel={`Recent search: ${q}`}>
										<Text style={styles.recentChipText}>{q}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					)}
				</View>
				{/* Results */}
						{loading ? (
							<View style={styles.skeletonContainer} accessible accessibilityLabel="Loading search results">
								{[...Array(4)].map((_, i) => (
									<View key={i} style={styles.skeletonCard}>
										<Shimmer style={styles.skeletonImage} />
										<View style={styles.skeletonInfo}>
											<Shimmer style={styles.skeletonLine} />
											<Shimmer style={[styles.skeletonLine, { width: '60%' }]} />
											<Shimmer style={[styles.skeletonLine, { width: '40%' }]} />
										</View>
									</View>
								))}
							</View>
				) : error ? (
					<View style={styles.centerContainer} accessible accessibilityLabel="Search error message">
						<Text style={styles.emptyText}>Error</Text>
						<Text style={styles.emptySubtext}>{error}</Text>
						<TouchableOpacity style={styles.retryBtn} onPress={() => handleSearch(query)} accessibilityRole="button" accessibilityLabel="Retry search">
							<Text style={styles.retryText}>Retry</Text>
						</TouchableOpacity>
					</View>
				) : hasSearched && results.length === 0 ? (
					<View style={styles.centerContainer} accessible accessibilityLabel="No search results">
						<Text style={styles.emptyText}>No results found</Text>
						<Text style={styles.emptySubtext}>Try different keywords</Text>
					</View>
				) : !hasSearched ? (
					<View style={styles.centerContainer} accessible accessibilityLabel="Prompt to search">
						<Text style={styles.emptyText}>Search for content</Text>
						<Text style={styles.emptySubtext}>Find videos, shows, and live events</Text>
					</View>
				) : (
					<>
						<View style={styles.resultsHeader} accessible accessibilityLabel="Search results header">
							<Text style={styles.resultsCount}>{results.length} {results.length === 1 ? 'result' : 'results'}</Text>
						</View>
						<FlatList
							data={results}
							renderItem={renderResult}
							keyExtractor={(item) => item.id}
							contentContainerStyle={styles.listContainer}
							showsVerticalScrollIndicator={false}
							initialNumToRender={8}
							maxToRenderPerBatch={10}
							windowSize={7}
							removeClippedSubviews={true}
							accessible
							accessibilityLabel="Search results list"
						/>
					</>
				)}
			</Animated.View>
		);
}

const styles = StyleSheet.create({
	skeletonContainer: {
		padding: 16,
	},
		skeletonCard: {
			flexDirection: 'row',
			marginBottom: 20,
			borderRadius: 16,
			backgroundColor: 'rgba(255,255,255,0.07)',
			overflow: 'hidden',
			minHeight: 90,
			alignItems: 'center',
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.08,
			shadowRadius: 8,
			elevation: 2,
		},
	skeletonImage: {
		width: 120,
		height: 90,
		backgroundColor: 'rgba(255,255,255,0.13)',
		borderRadius: 8,
		marginRight: 12,
	},
	skeletonInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	skeletonLine: {
		height: 14,
		backgroundColor: 'rgba(255,255,255,0.13)',
		borderRadius: 6,
		marginBottom: 10,
		width: '80%',
	},
	retryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: 'rgba(255,255,255,0.09)',
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 8,
		marginTop: 12,
	},
	retryText: {
		color: COLORS.ORANGE,
		fontWeight: 'bold',
		fontSize: 15,
		marginLeft: 2,
	},
	highlight: {
		backgroundColor: 'rgba(255, 165, 0, 0.25)',
		color: COLORS.ORANGE,
		fontWeight: 'bold',
	},
	suggestionsContainer: {
		position: 'absolute',
		top: 60,
		left: 0,
		right: 0,
		backgroundColor: 'rgba(30,30,30,0.98)',
		borderRadius: 10,
		zIndex: 20,
		paddingVertical: 4,
		marginHorizontal: 0,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 6,
		elevation: 6,
	},
	suggestionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255,255,255,0.07)',
	},
	suggestionText: {
		color: COLORS.WHITE,
		fontSize: 15,
	},
	recentContainer: {
		marginTop: 10,
		marginBottom: 2,
		paddingLeft: 2,
	},
	recentHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 4,
		paddingRight: 12,
	},
	recentTitle: {
		color: 'rgba(255,255,255,0.7)',
		fontWeight: 'bold',
		fontSize: 13,
		marginLeft: 2,
		letterSpacing: 0.2,
	},
	recentScroll: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingBottom: 2,
		paddingRight: 8,
	},
	recentChip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.09)',
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginRight: 8,
	},
	recentChipText: {
		color: COLORS.ORANGE,
		fontWeight: 'bold',
		fontSize: 13,
	},
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
		marginBottom: 16,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 12,
		paddingHorizontal: 16,
		height: 50,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		color: COLORS.WHITE,
		fontSize: 16,
	},
	resultsHeader: {
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	resultsCount: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.6)',
		fontWeight: '600',
	},
	listContainer: {
		padding: 16,
	},
		resultCard: {
			flexDirection: 'row',
			marginBottom: 20,
			borderRadius: 16,
			backgroundColor: 'rgba(255,255,255,0.09)',
			overflow: 'hidden',
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.10,
			shadowRadius: 10,
			elevation: 3,
			borderWidth: 1,
			borderColor: 'rgba(255,255,255,0.04)',
		},
	resultImage: {
		width: 120,
		height: 90,
	},
	resultInfo: {
		flex: 1,
		padding: 12,
		justifyContent: 'center',
	},
		resultTitle: {
			fontSize: 18,
			fontWeight: '700',
			color: COLORS.WHITE,
			marginBottom: 6,
			letterSpacing: 0.1,
		},
		resultDescription: {
			fontSize: 14,
			color: 'rgba(255,255,255,0.7)',
			marginBottom: 8,
			lineHeight: 19,
		},
	resultMeta: {
		flexDirection: 'row',
		alignItems: 'center',
	},
		resultCategory: {
			fontSize: 12,
			color: COLORS.ORANGE,
			textTransform: 'uppercase',
			fontWeight: '700',
			marginRight: 12,
			letterSpacing: 0.5,
		},
		resultDuration: {
			fontSize: 12,
			color: 'rgba(255,255,255,0.6)',
			fontWeight: '500',
		},
		centerContainer: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			padding: 40,
			opacity: 0.95,
		},
		emptyText: {
			fontSize: 20,
			fontWeight: '700',
			color: COLORS.WHITE,
			marginTop: 16,
			marginBottom: 8,
			letterSpacing: 0.2,
		},
		emptySubtext: {
			fontSize: 15,
			color: 'rgba(255,255,255,0.6)',
			textAlign: 'center',
			marginTop: 2,
		},
});


