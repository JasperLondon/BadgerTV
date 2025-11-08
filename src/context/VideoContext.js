import React, { createContext, useState, useEffect, useContext } from 'react';
import * as API from '../services/api';
import { showsData } from '../data/showsData';
import { streamingData } from '../data/streamingData';
import { upcomingEventsData } from '../data/upcomingEventsData';

const VideoContext = createContext({});

export const VideoProvider = ({ children }) => {
  const [useLocalData, setUseLocalData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({
    videos: null,
    events: null,
    shows: null,
    liveStreams: null,
    featured: null,
  });

  useEffect(() => {
    checkAPIAvailability();
  }, []);

  const checkAPIAvailability = async () => {
    try {
      const isConfigured = await API.isAPIConfigured();
      setUseLocalData(!isConfigured);
    } catch (err) {
      console.log('Using local data - API not configured');
      setUseLocalData(true);
    }
  };

  // Videos
  const getVideos = async (category = null) => {
    if (useLocalData) {
      // Return local streaming data
      return category 
        ? streamingData.filter(v => v.category === category)
        : streamingData;
    }

    try {
      if (cache.videos && !category) {
        return cache.videos;
      }
      const data = await API.getVideos(category);
      if (!category) {
        setCache(prev => ({ ...prev, videos: data }));
      }
      return data;
    } catch (err) {
      console.error('Error fetching videos, falling back to local:', err);
      return streamingData;
    }
  };

  const getVideoById = async (videoId) => {
    if (useLocalData) {
      return streamingData.find(v => v.id === videoId);
    }

    try {
      return await API.getVideoById(videoId);
    } catch (err) {
      console.error('Error fetching video:', err);
      return streamingData.find(v => v.id === videoId);
    }
  };

  const searchVideos = async (query) => {
    if (useLocalData) {
      const q = query.toLowerCase();
      return [...streamingData, ...showsData].filter(
        item => item.title?.toLowerCase().includes(q) || 
                item.description?.toLowerCase().includes(q)
      );
    }

    try {
      return await API.searchVideos(query);
    } catch (err) {
      console.error('Error searching videos:', err);
      const q = query.toLowerCase();
      return [...streamingData, ...showsData].filter(
        item => item.title?.toLowerCase().includes(q)
      );
    }
  };

  // Events
  const getEvents = async (status = null) => {
    if (useLocalData) {
      return status
        ? upcomingEventsData.filter(e => e.status === status)
        : upcomingEventsData;
    }

    try {
      if (cache.events && !status) {
        return cache.events;
      }
      const data = await API.getEvents(status);
      if (!status) {
        setCache(prev => ({ ...prev, events: data }));
      }
      return data;
    } catch (err) {
      console.error('Error fetching events:', err);
      return upcomingEventsData;
    }
  };

  // Shows
  const getShows = async () => {
    if (useLocalData) {
      return showsData;
    }

    try {
      if (cache.shows) {
        return cache.shows;
      }
      const data = await API.getShows();
      setCache(prev => ({ ...prev, shows: data }));
      return data;
    } catch (err) {
      console.error('Error fetching shows:', err);
      return showsData;
    }
  };

  const getShowEpisodes = async (showId) => {
    if (useLocalData) {
      // Return empty or mock episodes
      return [];
    }

    try {
      return await API.getShowEpisodes(showId);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      return [];
    }
  };

  // Live TV
  const getLiveStreams = async () => {
    if (useLocalData) {
      return streamingData.filter(s => s.isLive);
    }

    try {
      if (cache.liveStreams) {
        return cache.liveStreams;
      }
      const data = await API.getLiveStreams();
      setCache(prev => ({ ...prev, liveStreams: data }));
      return data;
    } catch (err) {
      console.error('Error fetching live streams:', err);
      return streamingData.filter(s => s.isLive);
    }
  };

  // Featured content
  const getFeaturedContent = async () => {
    if (useLocalData) {
      return streamingData.slice(0, 5); // Return first 5 as featured
    }

    try {
      if (cache.featured) {
        return cache.featured;
      }
      const data = await API.getFeaturedContent();
      setCache(prev => ({ ...prev, featured: data }));
      return data;
    } catch (err) {
      console.error('Error fetching featured content:', err);
      return streamingData.slice(0, 5);
    }
  };

  // User data
  const getWatchHistory = async () => {
    if (useLocalData) {
      return [];
    }
    
    try {
      return await API.getWatchHistory();
    } catch (err) {
      console.error('Error fetching watch history:', err);
      return [];
    }
  };

  const getFavorites = async () => {
    if (useLocalData) {
      return [];
    }
    
    try {
      return await API.getFavorites();
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return [];
    }
  };

  const addFavorite = async (videoId) => {
    if (useLocalData) {
      return { success: false, error: 'Favorites require backend integration' };
    }
    
    try {
      await API.addFavorite(videoId);
      return { success: true };
    } catch (err) {
      console.error('Error adding favorite:', err);
      return { success: false, error: err.message };
    }
  };

  const removeFavorite = async (videoId) => {
    if (useLocalData) {
      return { success: false, error: 'Favorites require backend integration' };
    }
    
    try {
      await API.removeFavorite(videoId);
      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    useLocalData,
    loading,
    getVideos,
    getVideoById,
    searchVideos,
    getEvents,
    getShows,
    getShowEpisodes,
    getLiveStreams,
    getFeaturedContent,
    getWatchHistory,
    getFavorites,
    addFavorite,
    removeFavorite,
    refreshCache: checkAPIAvailability,
  };

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
};

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};

export default VideoContext;
