import { get, post, del } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';

/**
 * BadgerTV API Service
 * 
 * This service provides methods to interact with the AWS backend:
 * - DynamoDB via API Gateway or AppSync
 * - S3 for video assets with signed URLs
 * - User-specific data (watch history, favorites)
 */

const API_NAME = 'BadgerTVAPI'; // Must match aws-config.js

// Helper function to make GET requests
const apiGet = async (path) => {
  const restOperation = get({ apiName: API_NAME, path });
  const { body } = await restOperation.response;
  return await body.json();
};

// Helper function to make POST requests
const apiPost = async (path, data) => {
  const restOperation = post({
    apiName: API_NAME,
    path,
    options: { body: data }
  });
  const { body } = await restOperation.response;
  return await body.json();
};

// Helper function to make DELETE requests
const apiDelete = async (path) => {
  const restOperation = del({ apiName: API_NAME, path });
  await restOperation.response;
};

// ============================================
// VIDEO ENDPOINTS
// ============================================

export const getVideos = async (category = null) => {
  try {
    const path = category ? `/videos?category=${category}` : '/videos';
    return await apiGet(path);
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

export const getVideoById = async (videoId) => {
  try {
    return await apiGet(`/videos/${videoId}`);
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

export const getVideoUrl = async (s3Key, expires = 3600) => {
  try {
    const result = await getUrl({
      key: s3Key,
      options: {
        expiresIn: expires,
        accessLevel: 'guest'
      }
    });
    return result.url.toString();
  } catch (error) {
    console.error('Error getting video URL:', error);
    throw error;
  }
};

export const searchVideos = async (query) => {
  try {
    return await apiGet(`/videos/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

// ============================================
// EVENTS ENDPOINTS
// ============================================

export const getEvents = async (status = null) => {
  try {
    const path = status ? `/events?status=${status}` : '/events';
    return await apiGet(path);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    return await apiGet(`/events/${eventId}`);
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// ============================================
// SHOWS ENDPOINTS
// ============================================

export const getShows = async () => {
  try {
    return await apiGet('/shows');
  } catch (error) {
    console.error('Error fetching shows:', error);
    throw error;
  }
};

export const getShowEpisodes = async (showId) => {
  try {
    return await apiGet(`/shows/${showId}/episodes`);
  } catch (error) {
    console.error('Error fetching show episodes:', error);
    throw error;
  }
};

// ============================================
// LIVE TV ENDPOINTS
// ============================================

export const getLiveStreams = async () => {
  try {
    return await apiGet('/live');
  } catch (error) {
    console.error('Error fetching live streams:', error);
    throw error;
  }
};

// ============================================
// USER DATA ENDPOINTS
// ============================================

export const getWatchHistory = async () => {
  try {
    const user = await getCurrentUser();
    return await apiGet(`/users/${user.username}/history`);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    throw error;
  }
};

export const updateWatchProgress = async (videoId, progress, duration) => {
  try {
    const user = await getCurrentUser();
    await apiPost(`/users/${user.username}/history`, {
      videoId,
      progress,
      duration,
      lastWatchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const user = await getCurrentUser();
    return await apiGet(`/users/${user.username}/favorites`);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addFavorite = async (videoId) => {
  try {
    const user = await getCurrentUser();
    await apiPost(`/users/${user.username}/favorites`, { videoId });
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (videoId) => {
  try {
    const user = await getCurrentUser();
    await apiDelete(`/users/${user.username}/favorites/${videoId}`);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// ============================================
// FEATURED CONTENT
// ============================================

export const getFeaturedContent = async () => {
  try {
    return await apiGet('/featured');
  } catch (error) {
    console.error('Error fetching featured content:', error);
    throw error;
  }
};

// ============================================
// FALLBACK: Local data if API unavailable
// ============================================

export const isAPIConfigured = async () => {
  try {
    await apiGet('/health');
    return true;
  } catch (error) {
    console.warn('API not configured or unavailable, using local data');
    return false;
  }
};
