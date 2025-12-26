// ============================================
// LIVE STREAMS ENDPOINTS (Supabase)
// ============================================

export const getLiveStreams = async () => {
  const { data, error } = await supabase.from('live_streams').select('*').eq('is_active', true);
  if (error) throw error;
  return data || [];
};
import { supabase } from '../lib/supabase';

/**
 * BadgerTV API Service
 * 
 * This service provides methods to interact with the AWS backend:
 * - DynamoDB via API Gateway or AppSync
 * - S3 for video assets with signed URLs
 * - User-specific data (watch history, favorites)
 */




// ============================================
// VIDEO ENDPOINTS (Supabase)
// ============================================

export const getVideos = async (category = null) => {
  let query = supabase.from('videos').select('*');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getVideoById = async (videoId) => {
  const { data, error } = await supabase.from('videos').select('*').eq('id', videoId).single();
  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .ilike('title', `%${query}%`);
  if (error) throw error;
  return data || [];
};

// ============================================
// EVENTS ENDPOINTS
// ============================================

export const getEvents = async (status = null) => {
  let query = supabase.from('events').select('*');
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getEventById = async (eventId) => {
  const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (error) throw error;
  return data;
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

// Removed old getLiveStreams; now using Supabase version below

// ============================================

// USER DATA ENDPOINTS (Supabase)
// ============================================
import { useAuth } from '../context/AuthContext';

export const getWatchHistory = async () => {
  const { user } = useAuth();
  if (!user?.id) throw new Error('No Supabase user ID');
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateWatchProgress = async (videoId, progress, duration) => {
  const { user } = useAuth();
  if (!user?.id) throw new Error('No Supabase user ID');
  const { error } = await supabase
    .from('history')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      progress,
      duration,
      watched_at: new Date().toISOString(),
    });
  if (error) throw error;
};

export const getFavorites = async () => {
  const { user } = useAuth();
  if (!user?.id) throw new Error('No Supabase user ID');
  const { data, error } = await supabase
    .from('favorites')
    .select('video_id, videos(*)')
    .eq('user_id', user.id);
  if (error) throw error;
  // Flatten to video objects
  return (data || []).map(fav => fav.videos);
};

export const addFavorite = async (videoId) => {
  const { user } = useAuth();
  if (!user?.id) throw new Error('No Supabase user ID');
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, video_id: videoId });
  if (error) throw error;
};

export const removeFavorite = async (videoId) => {
  const { user } = useAuth();
  if (!user?.id) throw new Error('No Supabase user ID');
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('video_id', videoId);
  if (error) throw error;
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
