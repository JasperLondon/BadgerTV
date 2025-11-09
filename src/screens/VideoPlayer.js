import { isSaved, setSavedItem } from '../helpers/library';
  // Save to Library (bookmark) state
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (video && video.id) {
      isSaved(video.id).then(setSaved);
    }
  }, [video && video.id]);
  // Toggle bookmark
  const toggleSave = async () => {
    if (!video || !video.id) return;
    await setSavedItem(video.id, !saved);
    setSaved(!saved);
  };
import React, { useState, useEffect, useRef, useContext } from 'react';
import { usePiP } from '../context/PiPContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-video';
import { useQualitySelector, QualityButton } from '../components/QualitySelector';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getVideoUrl, updateWatchProgress, getVideoById } from '../services/api';

const { width, height } = Dimensions.get('window');

const VideoPlayer = ({ route, navigation }) => {
  const { videoId, videoUrl, title, s3Key, video, startAt } = route.params || {};
  // video: full stream object if passed (for PiP)
  const { showPiP, hidePiP } = usePiP();
  
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [playbackUrl, setPlaybackUrl] = useState(videoUrl || null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(null);
  // Quality selector state
  const { quality, showQualitySheet } = useQualitySelector('Auto');
  
  const hideControlsTimeout = useRef(null);

  useEffect(() => {
    loadVideo();
    
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      // Save progress on unmount
      if (status.positionMillis && status.durationMillis) {
        saveProgress(status.positionMillis / 1000, status.durationMillis / 1000);
      }
    };
  }, []);

  const loadVideo = async () => {
    try {
      setLoading(true);
      
      // If we have s3Key, get signed URL
      if (s3Key && !playbackUrl) {
        const url = await getVideoUrl(s3Key);
        setPlaybackUrl(url);
      }
      
      // Fetch video metadata if we have videoId
      if (videoId) {
        const info = await getVideoById(videoId);
        setVideoInfo(info);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
      setLoading(false);
      Alert.alert('Error', 'Unable to load video. Please try again.');
    }
  };

  const saveProgress = async (position, duration) => {
    if (videoId && position > 0) {
      try {
        await updateWatchProgress(videoId, position, duration);
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }
  };

  const handlePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
    resetHideControlsTimer();
  };

  const handleSeek = async (direction) => {
    if (status.positionMillis !== undefined && status.durationMillis) {
      const seekAmount = direction === 'forward' ? 10000 : -10000;
      const newPosition = Math.max(0, Math.min(status.positionMillis + seekAmount, status.durationMillis));
      await videoRef.current?.setPositionAsync(newPosition);
    }
    resetHideControlsTimer();
  };

  // When closing, offer to show PiP
  const handleClose = () => {
    // Only show PiP if video/stream object is available and not already in PiP
    if (video) {
      showPiP(video);
    }
    navigation.goBack();
  };

  const resetHideControlsTimer = () => {
    setShowControls(true);
    
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    hideControlsTimeout.current = setTimeout(() => {
      if (status.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const onPlaybackStatusUpdate = (playbackStatus) => {
    setStatus(playbackStatus);
    
    // Auto-save progress every 30 seconds
    if (playbackStatus.positionMillis && playbackStatus.positionMillis % 30000 < 1000) {
      saveProgress(
        playbackStatus.positionMillis / 1000,
        playbackStatus.durationMillis / 1000
      );
    }
    
    // Handle video end
    if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
      saveProgress(
        playbackStatus.durationMillis / 1000,
        playbackStatus.durationMillis / 1000
      );
      setShowControls(true);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.ORANGE} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVideo}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !playbackUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.ORANGE} />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* Main video area */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={resetHideControlsTimer}
      >
        {/* Video component: wire quality to player props (simulate variant selection) */}
        <Video
          ref={videoRef}
          source={{ uri: playbackUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={(err) => {
            console.error('Video playback error:', err);
            setError('Playback error occurred');
          }}
          // Simulate variant selection: pass quality as a prop (no backend)
          quality={quality}
        />

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              {/* Close: triggers PiP if video object exists */}
              <TouchableOpacity onPress={handleClose} style={styles.closeIconButton}>
                <Ionicons name="close" size={32} color={COLORS.WHITE} />
              </TouchableOpacity>
              {(title || videoInfo?.title) && (
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {title || videoInfo?.title}
                </Text>
              )}
              {/* Quality selector button */}
              <QualityButton onPress={showQualitySheet} quality={quality} />
              {/* Save to Library (bookmark) icon */}
              {video && video.id && (
                <TouchableOpacity
                  onPress={toggleSave}
                  style={styles.bookmarkBtn}
                  accessibilityLabel={saved ? 'Remove from Library' : 'Save to Library'}
                >
                  <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={COLORS.ORANGE} />
                </TouchableOpacity>
              )}
            </View>
            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => handleSeek('backward')} style={styles.controlButton}>
                <Ionicons name="play-back" size={48} color={COLORS.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                <Ionicons 
                  name={status.isPlaying ? 'pause' : 'play'} 
                  size={64} 
                  color={COLORS.WHITE} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSeek('forward')} style={styles.controlButton}>
                <Ionicons name="play-forward" size={48} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
            {/* Bottom Bar - Progress */}
            <View style={styles.bottomBar}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis || 0)}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(status.positionMillis / status.durationMillis) * 100 || 0}%` 
                        }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.timeText}>
                  {formatTime(status.durationMillis || 0)}
                </Text>
              </View>
            </View>
          </View>
        )}
// Style for Save to Library (bookmark) button
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  bookmarkBtn: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.WHITE,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: COLORS.WHITE,
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  closeIconButton: {
    padding: 8,
  },
  videoTitle: {
    flex: 1,
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  controlButton: {
    padding: 16,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    minWidth: 45,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.ORANGE,
  },
});

export default VideoPlayer;
