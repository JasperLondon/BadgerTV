// Standardized content data models for BadgerTV

/**
 * Show (series with seasons and episodes)
 */
export const exampleShow = {
  id: 'show-001',
  title: 'Skyfall Stories',
  description: 'Wingsuit, BASE and speedriding lines from MWD’s Badger Team.',
  genres: ['Action', 'Sports'],
  releaseYear: 2024,
  rating: 'TV-14',
  posterUrl: require('../../assets/show_skyfallstories.jpg'),
  backgroundUrl: require('../../assets/hero2.jpg'),
  seasons: [
    {
      seasonNumber: 1,
      episodes: [/* Array of Episode objects */]
    }
  ],
  cast: ['Jane Doe', 'John Smith'],
  tags: ['HD', 'CC'],
  featured: true,
  trailerUrl: '',
};

/**
 * Episode (part of a Show season)
 */
export const exampleEpisode = {
  id: 'ep-001',
  showId: 'show-001',
  seasonNumber: 1,
  episodeNumber: 1,
  title: 'The Beginning',
  description: 'The team prepares for the big jump.',
  duration: 42 * 60,
  videoUrl: '',
  thumbnailUrl: require('../../assets/hero1.jpg'),
  airDate: '2024-01-01',
  isFree: false,
  guestStars: ['Alex Pro'],
};

/**
 * Film (one-off movie)
 */
export const exampleFilm = {
  id: 'film-001',
  title: 'The Weyher Line',
  description: 'A breathtaking journey down the world’s most dangerous slopes.',
  genres: ['Documentary', 'Adventure'],
  releaseYear: 2023,
  rating: 'PG',
  duration: 95 * 60,
  videoUrl: '',
  posterUrl: require('../../assets/theweyherline.jpg'),
  backgroundUrl: require('../../assets/hero1.jpg'),
  cast: ['Jane Doe'],
  director: 'Sam Lee',
  tags: ['HD', 'Award Winner'],
  trailerUrl: '',
};

/**
 * LiveEvent (live or upcoming event/stream)
 */
export const exampleLiveEvent = {
  id: 'live-001',
  title: 'Skyfall World Cup Finals',
  description: 'Watch the finals live from Val d’Isère.',
  startTime: '2025-12-01T18:00:00Z',
  endTime: '2025-12-01T20:00:00Z',
  isLive: true,
  streamUrl: '',
  thumbnailUrl: require('../../assets/skyfall-event.jpg'),
  location: 'Val d’Isère, France',
  tags: ['LIVE', 'Competition'],
  viewers: 1200,
  replayAvailable: false,
};

/**
 * Athlete profile
 */
export const exampleAthlete = {
  id: 'athlete-001',
  name: 'Jane Doe',
  bio: 'World champion wingsuit pilot.',
  photoUrl: require('../../assets/athlete1.jpg'),
  nationality: 'USA',
  birthDate: '1990-05-12',
  sports: ['Wingsuit', 'BASE Jumping'],
  achievements: [
    '2024 Skyfall World Cup Winner',
    '3x National Champion'
  ],
  social: {
    instagram: 'https://instagram.com/janedoe',
    twitter: 'https://twitter.com/janedoe'
  },
  featuredVideos: ['film-001', 'ep-001'],
  sponsors: ['Red Bull', 'GoPro'],
};
