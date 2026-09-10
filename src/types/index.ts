export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  cover?: string;
  isFavorite: boolean;
  playCount: number;
  addedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  cover?: string;
  songs: string[];
  createdAt: number;
}

export interface Category {
  id: string;
  title: string;
  color: string;
  isPodcast?: boolean;
  songs: string[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  podcastId: string;
  duration: number;
  url: string;
  addedAt: number;
}

export interface PodcastShow {
  id: string;
  title: string;
  author: string;
  cover?: string;
  episodes: PodcastEpisode[];
}

export interface AppSettings {
  language: 'es' | 'en';
  theme: 'dark';
  equalizer: boolean;
  crossfade: boolean;
  autoPlay: boolean;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  queue: Song[];
  queueIndex: number;
}

export type TabType = 'songs' | 'playlists' | 'library' | 'settings' | 'search';
