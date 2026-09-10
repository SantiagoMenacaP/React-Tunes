import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, Playlist, AppSettings, PlayerState, TabType } from '../types';
import { saveAudioFile, getAudioURL, deleteAudioFile, getAllAudioIds } from '../utils/db';

interface AppContextType {
  songs: Song[];
  playlists: Playlist[];
  settings: AppSettings;
  playerState: PlayerState;
  currentTab: TabType;
  showPlayer: boolean;
  showLyrics: boolean;
  setCurrentTab: (tab: TabType) => void;
  setShowPlayer: (show: boolean) => void;
  setShowLyrics: (show: boolean) => void;
  addSong: (file: File) => Promise<Song | null>;
  removeSong: (id: string) => void;
  toggleFavorite: (id: string) => void;
  createPlaylist: (name: string, cover?: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  t: (key: string) => string;
  setAudioElement: (audio: HTMLAudioElement) => void;
}

const translations: Record<string, Record<string, string>> = {
  es: {
    songs: 'Inicio',
    playlists: 'Playlists',
    library: 'Biblioteca',
    settings: 'Ajustes',
    search: 'Buscar',
    searchPlaceholder: '¿Qué quieres escuchar?',
    noSongs: 'No hay canciones cargadas',
    addSongs: 'Agregar canciones',
    createPlaylist: 'Crear Playlist',
    playlistName: 'Nombre de la playlist',
    selectCover: 'Seleccionar portada',
    create: 'Crear',
    cancel: 'Cancelar',
    mostPlayed: 'Más escuchadas',
    topArtists: 'Artistas más escuchados',
    minutes: 'minutos',
    language: 'Idioma',
    theme: 'Tema',
    equalizer: 'Ecualizador',
    crossfade: 'Crossfade',
    autoPlay: 'Reproducción automática',
    dark: 'Oscuro (Streaming Glass)',
    spanish: 'Español',
    english: 'Inglés',
    favorites: 'Favoritas',
    recentlyAdded: 'Agregadas recientemente',
    noPlaylists: 'No hay playlists creadas',
    addToPlaylist: 'Agregar a playlist',
    lyrics: 'Letra',
    noLyrics: 'No se encontró la letra de esta canción',
    delete: 'Eliminar',
    unknownArtist: 'Artista desconocido',
    totalListened: 'Total escuchado',
    about: 'Acerca de',
    version: 'Versión',
    storage: 'Almacenamiento',
    clearData: 'Borrar datos',
    done: 'Listo',
    uploadSongs: 'Subir canciones',
    addSongsToPlaylist: 'Agregar a playlist',
    jumpBackIn: 'Jump back in',
    albumsForYou: 'Álbumes y canciones para ti',
    recentAccess: 'Accesos recientes',
    discoverNew: 'Discover something new',
    browseAll: 'Browse all',
    all: 'All',
    music: 'Music',
    podcasts: 'Podcasts',
    nowPlaying: 'REPRODUCIENDO',
  },
  en: {
    songs: 'Home',
    playlists: 'Playlists',
    library: 'Library',
    settings: 'Settings',
    search: 'Search',
    searchPlaceholder: 'What do you want to listen to?',
    noSongs: 'No songs loaded',
    addSongs: 'Add songs',
    createPlaylist: 'Create Playlist',
    playlistName: 'Playlist name',
    selectCover: 'Select cover',
    create: 'Create',
    cancel: 'Cancel',
    mostPlayed: 'Most played',
    topArtists: 'Top artists',
    minutes: 'minutes',
    language: 'Language',
    theme: 'Theme',
    equalizer: 'Equalizer',
    crossfade: 'Crossfade',
    autoPlay: 'Auto play',
    dark: 'Dark (Streaming Glass)',
    spanish: 'Spanish',
    english: 'English',
    favorites: 'Favorites',
    recentlyAdded: 'Recently added',
    noPlaylists: 'No playlists created',
    addToPlaylist: 'Add to playlist',
    lyrics: 'Lyrics',
    noLyrics: 'Lyrics not found for this song',
    delete: 'Delete',
    unknownArtist: 'Unknown artist',
    totalListened: 'Total listened',
    about: 'About',
    version: 'Version',
    storage: 'Storage',
    clearData: 'Clear data',
    done: 'Done',
    uploadSongs: 'Upload songs',
    addSongsToPlaylist: 'Add to playlist',
    jumpBackIn: 'Jump back in',
    albumsForYou: 'Albums featuring songs you like',
    recentAccess: 'Recent access',
    discoverNew: 'Discover something new',
    browseAll: 'Browse all',
    all: 'All',
    music: 'Music',
    podcasts: 'Podcasts',
    nowPlaying: 'NOW PLAYING',
  },
};

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const urlCacheRef = useRef<Map<string, string>>(new Map());

  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('reacttunes_songs');
      if (!saved) return [];
      const parsed: Song[] = JSON.parse(saved);
      // Limpiar URLs blob expiradas de la sesión anterior
      return parsed.map(song => ({
        ...song,
        url: song.url && song.url.startsWith('blob:') ? '' : song.url,
      }));
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('reacttunes_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('reacttunes_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          language: parsed.language || 'es',
          theme: 'dark', // estrictamente oscuro verde
          equalizer: !!parsed.equalizer,
          crossfade: !!parsed.crossfade,
          autoPlay: parsed.autoPlay !== undefined ? parsed.autoPlay : true,
        };
      }
      return {
        language: 'es',
        theme: 'dark',
        equalizer: false,
        crossfade: false,
        autoPlay: true,
      };
    } catch {
      return {
        language: 'es',
        theme: 'dark',
        equalizer: false,
        crossfade: false,
        autoPlay: true,
      };
    }
  });

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    shuffle: false,
    repeat: 'none',
    queue: [],
    queueIndex: 0,
  });

  const [currentTab, setCurrentTab] = useState<TabType>('songs');
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    try {
      // No guardar URLs blob expiradas en localStorage
      const cleanSongs = songs.map(s => ({
        ...s,
        url: s.url && s.url.startsWith('blob:') ? '' : s.url,
      }));
      localStorage.setItem('reacttunes_songs', JSON.stringify(cleanSongs));
    } catch (e) {
      console.error('Error saving songs:', e);
    }
  }, [songs]);

  useEffect(() => {
    try {
      localStorage.setItem('reacttunes_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('reacttunes_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [settings]);

  // Actualizar MediaSession para iOS y Control Center
  const updateMediaSession = useCallback((song: Song) => {
    if ('mediaSession' in navigator) {
      const defaultArtwork = 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <rect width="512" height="512" fill="#0a0a0a"/>
          <circle cx="256" cy="256" r="200" fill="#121212"/>
          <circle cx="256" cy="256" r="80" fill="#0a0a0a"/>
          <circle cx="256" cy="256" r="30" fill="#1ed760"/>
        </svg>
      `);
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || 'React Tunes',
        artwork: [
          { src: song.cover || defaultArtwork, sizes: '512x512', type: 'image/png' },
        ]
      });
      
      navigator.mediaSession.playbackState = 'playing';
    }
  }, []);

  const nextSongRef = useRef<() => Promise<void> | void>(() => {});
  const prevSongRef = useRef<() => Promise<void> | void>(() => {});

  // REQUISITO 8: Reemplazar los botones de "retroceder 15s" y "adelantar 15s" en la pantalla de bloqueo por "pista anterior" y "pista siguiente"
  const setupMediaSessionHandlers = useCallback(() => {
    if ('mediaSession' in navigator) {
      // Eliminar handlers de salto de tiempo si existen
      try {
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch (e) {
        // Ignorar si el navegador no permite desasociar
      }

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play().catch(console.error);
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      });
      
      // Registrar pista anterior y siguiente explícitamente
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevSongRef.current();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSongRef.current();
      });
      
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setPlayerState(prev => ({ ...prev, currentTime: details.seekTime! }));
        }
      });
    }
  }, []);

  useEffect(() => {
    setupMediaSessionHandlers();
  }, [setupMediaSessionHandlers]);

  // Al inicio: verificar canciones almacenadas en IndexedDB y precargar sus URLs en memoria
  useEffect(() => {
    const restoreAudioUrls = async () => {
      const storedIds = await getAllAudioIds().catch(() => [] as string[]);
      if (storedIds.length > 0) {
        const storedIdSet = new Set(storedIds);
        setSongs(prev => prev.filter(song => storedIdSet.has(song.id)));

        // Precargar URLs vivas desde IndexedDB a urlCacheRef para evitar delays y bloqueos de autoplay
        for (const id of storedIds) {
          if (!urlCacheRef.current.has(id)) {
            const freshUrl = await getAudioURL(id).catch(() => null);
            if (freshUrl) {
              urlCacheRef.current.set(id, freshUrl);
            }
          }
        }
      }
    };

    restoreAudioUrls();
  }, []);

  const getPlayableUrl = useCallback(async (song: Song): Promise<string | null> => {
    const cachedUrl = urlCacheRef.current.get(song.id);
    if (cachedUrl) {
      return cachedUrl;
    }
    if (song.url && (song.url.startsWith('http://') || song.url.startsWith('https://'))) {
      return song.url;
    }
    const url = await getAudioURL(song.id);
    if (url) {
      urlCacheRef.current.set(song.id, url);
    }
    return url;
  }, []);

  const incrementPlayCount = (songId: string) => {
    setSongs(prev => prev.map(s => 
      s.id === songId ? { ...s, playCount: (s.playCount || 0) + 1 } : s
    ));
  };

  const t = (key: string): string => {
    return translations[settings.language]?.[key] || key;
  };

  // Web Audio Equalizer Management
  const updateEqualizerNode = useCallback(() => {
    if (!audioRef.current) return;
    
    if (settings.equalizer) {
      try {
        if (!audioCtxRef.current) {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;

            const source = ctx.createMediaElementSource(audioRef.current);
            sourceNodeRef.current = source;

            // Filtros de ecualizador (Bajos, Medios, Agudos)
            const bass = ctx.createBiquadFilter();
            bass.type = 'lowshelf';
            bass.frequency.value = 150;
            bass.gain.value = 6; // Bass boost

            const mid = ctx.createBiquadFilter();
            mid.type = 'peaking';
            mid.frequency.value = 1000;
            mid.Q.value = 1.0;
            mid.gain.value = 2;

            const treble = ctx.createBiquadFilter();
            treble.type = 'highshelf';
            treble.frequency.value = 4000;
            treble.gain.value = 4;

            source.connect(bass);
            bass.connect(mid);
            mid.connect(treble);
            treble.connect(ctx.destination);

            bassFilterRef.current = bass;
            midFilterRef.current = mid;
            trebleFilterRef.current = treble;
          }
        }
        
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        if (bassFilterRef.current && midFilterRef.current && trebleFilterRef.current) {
          bassFilterRef.current.gain.value = 6;
          midFilterRef.current.gain.value = 2;
          trebleFilterRef.current.gain.value = 4;
        }
      } catch (e) {
        console.warn('Equalizer setup notice:', e);
      }
    } else {
      if (bassFilterRef.current && midFilterRef.current && trebleFilterRef.current) {
        bassFilterRef.current.gain.value = 0;
        midFilterRef.current.gain.value = 0;
        trebleFilterRef.current.gain.value = 0;
      }
    }
  }, [settings.equalizer]);

  useEffect(() => {
    updateEqualizerNode();
  }, [settings.equalizer, updateEqualizerNode]);

  const addSong = async (file: File): Promise<Song | null> => {
    return new Promise((resolve) => {
      const tempUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      let settled = false;

      const createAndSaveSong = async (duration: number) => {
        if (settled) return;
        settled = true;
        try {
          await saveAudioFile(id, file);
        } catch (e) {
          console.error('Error saving to IndexedDB:', e);
        }
        
        urlCacheRef.current.set(id, tempUrl);

        const newSong: Song = {
          id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Artista desconocido',
          duration: duration || 180,
          url: tempUrl,
          isFavorite: false,
          playCount: 0,
          addedAt: Date.now(),
        };

        setSongs(prev => [...prev, newSong]);
        resolve(newSong);
      };

      const audio = new Audio();
      const timeoutId = setTimeout(() => {
        createAndSaveSong(180);
      }, 1200);

      audio.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        createAndSaveSong(audio.duration || 180);
      };

      audio.onerror = () => {
        clearTimeout(timeoutId);
        createAndSaveSong(180);
      };

      audio.src = tempUrl;
    });
  };

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setPlaylists(prev => prev.map(p => ({
      ...p,
      songs: p.songs.filter(sid => sid !== id),
    })));
    deleteAudioFile(id).catch(console.error);
  };

  const toggleFavorite = (id: string) => {
    setSongs(prev => prev.map(s => 
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const createPlaylist = (name: string, cover?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      cover,
      songs: [],
      createdAt: Date.now(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addSongToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId && !p.songs.includes(songId)
        ? { ...p, songs: [...p.songs, songId] }
        : p
    ));
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId
        ? { ...p, songs: p.songs.filter(id => id !== songId) }
        : p
    ));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings, theme: 'dark' }));
  };

  const playSong = async (song: Song, queue?: Song[]) => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      // Reanudar inmediatamente el contexto Web Audio dentro de la interacción directa del usuario
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      let url: string | null = urlCacheRef.current.get(song.id) ?? null;
      if (!url) {
        url = await getPlayableUrl(song);
      }
      
      if (!url) {
        console.error('No audio URL found for song:', song.title);
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        return;
      }
      
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            incrementPlayCount(song.id);
            updateMediaSession(song);
          })
          .catch((error) => {
            console.error('Error al reproducir:', error);
            setPlayerState(prev => ({ ...prev, isPlaying: false }));
          });
      }
      
      const songQueue = queue || songs;
      const queueIndex = songQueue.findIndex(s => s.id === song.id);
      
      setPlayerState(prev => ({
        ...prev,
        currentSong: song,
        isPlaying: true,
        queue: songQueue,
        queueIndex: queueIndex >= 0 ? queueIndex : 0,
      }));
      setShowPlayer(true);
    }
  };

  const pauseSong = () => {
    audioRef.current?.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumeSong = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    audioRef.current?.play()
      .then(() => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      })
      .catch((err) => {
        console.error('Error al reanudar:', err);
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      });
  };

  const nextSong = async () => {
    const state = playerState;
    const audio = audioRef.current;
    
    if (!audio) return;

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    if (!settings.autoPlay && !state.isPlaying) return;
    
    if (state.repeat === 'one') {
      audio.currentTime = 0;
      audio.play().catch(console.error);
      return;
    }
    
    let nextIndex = state.queueIndex + 1;
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    }
    
    if (nextIndex >= state.queue.length) {
      if (state.repeat === 'all') {
        nextIndex = 0;
      } else {
        audio.pause();
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        return;
      }
    }
    
    const nextSongItem = state.queue[nextIndex];
    if (nextSongItem) {
      const url = await getPlayableUrl(nextSongItem);
      if (!url) return;
      
      audio.pause();
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.volume = 1;
      audio.load();
      
      audio.play()
        .then(() => {
          incrementPlayCount(nextSongItem.id);
          updateMediaSession(nextSongItem);
        })
        .catch((err) => {
          console.error('Error al cambiar a siguiente canción:', err);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });
      
      setPlayerState(prev => ({
        ...prev,
        currentSong: nextSongItem,
        queueIndex: nextIndex,
        isPlaying: true,
      }));
    }
  };

  const prevSong = async () => {
    const state = playerState;
    const audio = audioRef.current;
    
    if (!audio) return;

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    
    let prevIndex = state.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
    }
    
    const prevSongItem = state.queue[prevIndex];
    if (prevSongItem) {
      const url = await getPlayableUrl(prevSongItem);
      if (!url) return;
      
      audio.pause();
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.volume = 1;
      audio.load();
      
      audio.play()
        .then(() => {
          incrementPlayCount(prevSongItem.id);
          updateMediaSession(prevSongItem);
        })
        .catch((err) => {
          console.error('Error al cambiar a canción anterior:', err);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });
      
      setPlayerState(prev => ({
        ...prev,
        currentSong: prevSongItem,
        queueIndex: prevIndex,
        isPlaying: true,
      }));
    }
  };

  useEffect(() => {
    nextSongRef.current = nextSong;
    prevSongRef.current = prevSong;
  });

  const seekTo = (time: number) => {
    if (audioRef.current) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const toggleShuffle = () => {
    setPlayerState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const toggleRepeat = () => {
    setPlayerState(prev => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'all' : prev.repeat === 'all' ? 'one' : 'none',
    }));
  };

  const setAudioElement = useCallback((audio: HTMLAudioElement) => {
    if (audioRef.current !== audio) {
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.preload = 'auto';
      
      audio.addEventListener('timeupdate', () => {
        const curTime = audio.currentTime || 0;
        const dur = audio.duration || 0;

        setPlayerState(prev => ({
          ...prev,
          currentTime: curTime,
        }));

        // Manejo de Crossfade (si faltan menos de 3 segundos para terminar)
        if (settings.crossfade && dur > 5 && dur - curTime <= 3 && dur - curTime > 0.5) {
          const fadeProgress = (dur - curTime) / 3;
          audio.volume = Math.max(0, Math.min(1, fadeProgress));
        }

        if ('mediaSession' in navigator) {
          try {
            navigator.mediaSession.setPositionState({
              duration: dur,
              playbackRate: audio.playbackRate || 1,
              position: curTime,
            });
          } catch (e) {
            // Ignorar errores
          }
        }
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setPlayerState(prev => ({
          ...prev,
          duration: audio.duration || 0,
        }));
      });
      
      audio.addEventListener('ended', () => {
        if (settings.autoPlay) {
          nextSongRef.current();
        } else {
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        }
      });
      
      audio.addEventListener('play', () => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      });
      
      audio.addEventListener('pause', () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Error en el elemento de audio:', e);
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audioRef.current = audio;
      setupMediaSessionHandlers();
      updateEqualizerNode();
    }
  }, [setupMediaSessionHandlers, settings.crossfade, settings.autoPlay, updateEqualizerNode]);

  return (
    <AppContext.Provider value={{
      songs,
      playlists,
      settings,
      playerState,
      currentTab,
      showPlayer,
      showLyrics,
      setCurrentTab,
      setShowPlayer,
      setShowLyrics,
      addSong,
      removeSong,
      toggleFavorite,
      createPlaylist,
      deletePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      updateSettings,
      playSong,
      pauseSong,
      resumeSong,
      nextSong,
      prevSong,
      seekTo,
      toggleShuffle,
      toggleRepeat,
      t,
      setAudioElement,
    }}>
      {children}
    </AppContext.Provider>
  );
};
