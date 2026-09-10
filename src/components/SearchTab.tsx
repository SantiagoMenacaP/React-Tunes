import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Playlist, Song, Category, PodcastShow, PodcastEpisode } from '../types';

// Modal para agregar canciones a una playlist o categoría
const AddSongsModal: React.FC<{
  title: string;
  songs: Song[];
  assignedSongIds: string[];
  onClose: () => void;
  onToggleSong: (songId: string, isAdding: boolean) => void;
  onUploadMP3?: (file: File) => void;
  t: (key: string) => string;
}> = ({ title, songs, assignedSongIds, onClose, onToggleSong, onUploadMP3, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set(assignedSongIds));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSongs = songs.filter(song => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
  });

  const handleToggle = (songId: string) => {
    const isSelected = selectedSongs.has(songId);
    const newSelected = new Set(selectedSongs);
    if (isSelected) {
      newSelected.delete(songId);
      onToggleSong(songId, false);
    } else {
      newSelected.add(songId);
      onToggleSong(songId, true);
    }
    setSelectedSongs(newSelected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && onUploadMP3) {
      onUploadMP3(files[0]);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col pt-safe-top pb-safe-bottom safe-area-inset">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onClose} className="p-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-3">
        {onUploadMP3 && (
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[var(--accent)] text-black font-bold text-xs py-3 px-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Subir nuevo MP3 a esta categoría
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3 pl-11 pr-4 text-sm border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <p>{t('noSongs')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSongs.map((song) => {
              const isSelected = selectedSongs.has(song.id);
              return (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    isSelected ? 'bg-[var(--accent-soft)] border border-[var(--accent-ring)]' : 'bg-white/[0.04]'
                  }`}
                  onClick={() => handleToggle(song.id)}
                >
                  <div className="w-11 h-11 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {song.cover ? (
                      <img src={song.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{song.title}</p>
                    <p className="text-[#a7a7a7] text-xs truncate mt-0.5">{song.artist}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-zinc-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 pb-8 glass-panel border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[var(--accent)] rounded-full text-black font-bold text-sm shadow-md"
        >
          {t('done')}
        </button>
      </div>
    </div>
  );
};

// Modal para crear un Podcast
const CreatePodcastModal: React.FC<{
  onClose: () => void;
  onCreate: (title: string, author: string, cover?: string) => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState<string | undefined>();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCover(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate(title.trim(), author.trim() || 'Podcast Host', cover);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div className="w-full glass-panel rounded-t-[32px] p-6 pb-10 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-5 text-center">Crear Podcast</h3>

        <div className="flex justify-center mb-5">
          <button
            onClick={() => coverInputRef.current?.click()}
            className="w-32 h-32 bg-white/[0.06] rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden hover:bg-white/10 transition-colors"
          >
            {cover ? (
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <svg className="w-8 h-8 text-zinc-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-zinc-400 text-xs font-medium">Portada del Podcast</span>
              </>
            )}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>

        <input
          type="text"
          placeholder="Nombre del Podcast"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3.5 px-5 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-3"
        />

        <input
          type="text"
          placeholder="Autor / Anfitrión"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3.5 px-5 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-6"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 text-white font-semibold text-sm rounded-full">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-[var(--accent)] text-black font-bold text-sm rounded-full shadow-md">
            Crear Podcast
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para Crear Categoría
const CreateCategoryModal: React.FC<{
  onClose: () => void;
  onCreate: (title: string, color: string, isPodcast: boolean) => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-pink-600');
  const [isPodcast, setIsPodcast] = useState(false);

  const colors = [
    { label: 'Rosa', value: 'bg-pink-600' },
    { label: 'Verde', value: 'bg-emerald-600' },
    { label: 'Púrpura', value: 'bg-purple-700' },
    { label: 'Índigo', value: 'bg-indigo-400' },
    { label: 'Azul', value: 'bg-blue-600' },
    { label: 'Ámbar', value: 'bg-amber-600' },
    { label: 'Rojo', value: 'bg-rose-700' },
    { label: 'Cian', value: 'bg-cyan-600' },
    { label: 'Naranja', value: 'bg-orange-600' },
    { label: 'Gris', value: 'bg-zinc-700' },
  ];

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate(title.trim(), selectedColor, isPodcast);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div className="w-full glass-panel rounded-t-[32px] p-6 pb-10 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-5 text-center">Crear Nueva Categoría</h3>

        <input
          type="text"
          placeholder="Nombre de la Categoría (Ej. Reggaeton, Salsa...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3.5 px-5 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-5"
        />

        <div className="mb-5">
          <label className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider block mb-3">Color de la tarjeta</label>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={`w-9 h-9 rounded-full ${c.value} transition-transform flex items-center justify-center shadow-md ${
                  selectedColor === c.value ? 'ring-4 ring-white scale-110' : 'hover:scale-105'
                }`}
                title={c.label}
              >
                {selectedColor === c.value && (
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.06]">
          <input
            type="checkbox"
            id="isPodCheckbox"
            checked={isPodcast}
            onChange={(e) => setIsPodcast(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)] rounded cursor-pointer"
          />
          <label htmlFor="isPodCheckbox" className="text-xs font-bold text-white cursor-pointer select-none">
            ¿Es una categoría de Podcast?
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/10 text-white font-semibold text-sm rounded-full">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-[var(--accent)] text-black font-bold text-sm rounded-full shadow-md">
            Crear Categoría
          </button>
        </div>
      </div>
    </div>
  );
};

export const SearchTab: React.FC = () => {
  const { songs, playlists, playSong, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, addSong, removeSong, t } = useApp();
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  
  // Categorías interactivas guardadas en localStorage
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('reacttunes_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'cat-pop', title: 'Pop', color: 'bg-pink-600', songs: [] },
      { id: 'cat-hiphop', title: 'Hip-Hop', color: 'bg-emerald-600', songs: [] },
      { id: 'cat-trap', title: 'Trap', color: 'bg-purple-700', songs: [] },
      { id: 'cat-rock', title: 'Rock', color: 'bg-indigo-400', songs: [] },
      { id: 'cat-electronic', title: 'Electronic', color: 'bg-blue-600', songs: [] },
      { id: 'cat-indie', title: 'Indie', color: 'bg-amber-600', songs: [] },
      { id: 'cat-rnb', title: 'R&B', color: 'bg-rose-700', songs: [] },
      { id: 'cat-podcast', title: 'Podcast', color: 'bg-teal-700', isPodcast: true, songs: [] },
    ];
  });

  // Podcasts guardados en localStorage
  const [podcasts, setPodcasts] = useState<PodcastShow[]>(() => {
    try {
      const saved = localStorage.getItem('reacttunes_podcasts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCatAddSongsModal, setShowCatAddSongsModal] = useState(false);
  const [showCreatePodcastModal, setShowCreatePodcastModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const episodeFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPodcastIdForEpisode, setSelectedPodcastIdForEpisode] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newCover, setNewCover] = useState<string | undefined>();
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('reacttunes_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('reacttunes_podcasts', JSON.stringify(podcasts));
    } catch (e) {
      console.error('Error saving podcasts:', e);
    }
  }, [podcasts]);

  useEffect(() => {
    if (selectedPlaylist) {
      const updated = playlists.find(p => p.id === selectedPlaylist.id);
      if (updated) setSelectedPlaylist(updated);
    }
  }, [playlists, selectedPlaylist?.id]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewCover(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim(), newCover);
      setNewName('');
      setNewCover(undefined);
      setShowCreateModal(false);
    }
  };

  // Crear nueva categoría
  const handleCreateCategory = (title: string, color: string, isPodcast: boolean) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      title,
      color,
      isPodcast,
      songs: [],
    };
    setCategories(prev => [...prev, newCategory]);
    setShowCreateCategoryModal(false);
  };

  // Acciones sobre Categorías
  const handleToggleCategorySong = (songId: string, isAdding: boolean) => {
    if (!selectedCategory) return;
    setCategories(prev => prev.map(c => {
      if (c.id === selectedCategory.id) {
        const setIds = new Set(c.songs);
        if (isAdding) setIds.add(songId);
        else setIds.delete(songId);
        const updated = { ...c, songs: Array.from(setIds) };
        setSelectedCategory(updated);
        return updated;
      }
      return c;
    }));
  };

  const handleUploadSongToCategory = async (file: File) => {
    if (!selectedCategory) return;
    const newSong = await addSong(file);
    if (newSong) {
      handleToggleCategorySong(newSong.id, true);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      setSelectedCategory(null);
    }
  };

  // Acciones sobre Podcasts
  const handleCreatePodcast = (title: string, author: string, cover?: string) => {
    const newPodcast: PodcastShow = {
      id: `pod-${Date.now()}`,
      title,
      author,
      cover,
      episodes: [],
    };
    setPodcasts(prev => [...prev, newPodcast]);
    setShowCreatePodcastModal(false);
  };

  const handleUploadEpisode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0] || !selectedPodcastIdForEpisode) {
      if (e.target) e.target.value = '';
      return;
    }
    const file = files[0];
    const newSong = await addSong(file);
    if (newSong) {
      const episode: PodcastEpisode = {
        id: `ep-${Date.now()}`,
        podcastId: selectedPodcastIdForEpisode,
        title: newSong.title,
        duration: newSong.duration,
        url: newSong.url,
        addedAt: Date.now(),
      };
      setPodcasts(prev => prev.map(p => 
        p.id === selectedPodcastIdForEpisode
          ? { ...p, episodes: [...p.episodes, episode] }
          : p
      ));
    }
    if (e.target) e.target.value = '';
    setSelectedPodcastIdForEpisode(null);
  };

  const getPlaylistSongs = (playlist: Playlist): Song[] => {
    return playlist.songs
      .map(id => songs.find(s => s.id === id))
      .filter((s): s is Song => s !== undefined);
  };

  const getCategorySongs = (cat: Category): Song[] => {
    return cat.songs
      .map(id => songs.find(s => s.id === id))
      .filter((s): s is Song => s !== undefined);
  };

  const searchResults = query.trim()
    ? songs.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // VISTA DETALLE DE PLAYLIST
  if (selectedPlaylist) {
    const playlistSongs = getPlaylistSongs(selectedPlaylist);
    return (
      <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
        <div className="py-3">
          <button onClick={() => setSelectedPlaylist(null)} className="p-2 -ml-2 text-white/90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center my-3">
          <div className="w-64 h-64 sm:w-72 sm:h-72 bg-zinc-900 rounded-[16px] shadow-2xl shadow-black/80 overflow-hidden border border-white/[0.08]">
            {selectedPlaylist.cover ? (
              <img src={selectedPlaylist.cover} alt={selectedPlaylist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <svg className="w-24 h-24 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 mb-2">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-extrabold text-white tracking-tight truncate pr-2">{selectedPlaylist.name}</h1>
            <span className="text-xs font-semibold text-[#a7a7a7] whitespace-nowrap">Album · 2023</span>
          </div>
          <p className="text-[#a7a7a7] text-sm font-medium mt-1">
            {playlistSongs.length > 0 ? playlistSongs[0].artist : 'Varios artistas'}
          </p>
        </div>

        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
              {selectedPlaylist.cover ? (
                <img src={selectedPlaylist.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>

            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[var(--accent)] bg-[var(--accent-soft)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (playlistSongs.length > 0) playSong(playlistSongs[0], playlistSongs);
              }}
              className="w-14 h-14 bg-[var(--accent)] text-black rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 active:scale-95 transition-transform"
            >
              <svg className="w-7 h-7 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-2 my-2">
          <button
            onClick={() => setShowAddSongsModal(true)}
            className="flex-1 py-2.5 px-4 bg-white/[0.06] hover:bg-white/10 text-white font-semibold text-xs rounded-full border border-white/10 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addSongs')}
          </button>
        </div>

        <div className="mt-3 space-y-1">
          {playlistSongs.length === 0 ? (
            <div className="py-12 text-center text-[#a7a7a7]">
              <p className="text-sm">{t('noSongs')}</p>
            </div>
          ) : (
            playlistSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, playlistSongs)}
                className="flex items-center justify-between py-3 px-1 rounded-xl active:bg-white/[0.06] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-white font-bold text-base tracking-wide truncate">{song.title}</p>
                  <p className="text-[#a7a7a7] text-xs font-normal truncate mt-0.5">{song.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSongFromPlaylist(selectedPlaylist.id, song.id);
                  }}
                  className="p-2 text-zinc-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {showAddSongsModal && (
          <AddSongsModal
            title={t('addToPlaylist')}
            songs={songs}
            assignedSongIds={selectedPlaylist.songs}
            onClose={() => setShowAddSongsModal(false)}
            onToggleSong={(songId, isAdding) => {
              if (isAdding) addSongToPlaylist(selectedPlaylist.id, songId);
              else removeSongFromPlaylist(selectedPlaylist.id, songId);
            }}
            t={t}
          />
        )}
      </div>
    );
  }

  // VISTA DETALLE DE CATEGORÍA INTERACTIVA (Música o Podcast)
  if (selectedCategory) {
    const isPod = selectedCategory.isPodcast;
    const catSongs = getCategorySongs(selectedCategory);

    return (
      <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
        <div className="py-3 flex items-center justify-between">
          <button onClick={() => setSelectedCategory(null)} className="p-2 -ml-2 text-white/90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-bold text-[#a7a7a7] uppercase tracking-widest">Categoría</span>
          <div className="w-8" />
        </div>

        {/* Banner de Categoría */}
        <div className={`${selectedCategory.color} p-6 rounded-[24px] shadow-xl text-white my-3 flex flex-col justify-between h-36 border border-white/10 relative`}>
          <h1 className="text-3xl font-extrabold tracking-tight">{selectedCategory.title}</h1>
          <p className="text-xs font-medium text-white/80">
            {isPod ? `${podcasts.length} Podcasts disponibles` : `${catSongs.length} canciones asignadas`}
          </p>
        </div>

        {/* Botones de Acción según el tipo de categoría */}
        <div className="space-y-2.5 my-4">
          {isPod ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreatePodcastModal(true)}
                  className="flex-1 py-3 px-4 bg-[var(--accent)] text-black font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Podcast
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowCatAddSongsModal(true)}
              className="w-full py-3 px-4 bg-[var(--accent)] text-black font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Añadir canciones a {selectedCategory.title}
            </button>
          )}

          {/* Botón para Eliminar Categoría */}
          <button
            onClick={() => handleDeleteCategory(selectedCategory.id)}
            className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-full border border-red-500/20 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar categoría
          </button>
        </div>

        {/* Input oculto para subir capítulos a un podcast */}
        <input
          ref={episodeFileInputRef}
          type="file"
          accept="audio/*,.mp3"
          onChange={handleUploadEpisode}
          className="hidden"
        />

        {/* Lista de Contenido de la Categoría */}
        {isPod ? (
          <div className="mt-4 space-y-6">
            <h2 className="text-base font-extrabold text-white">Podcasts y Capítulos</h2>
            {podcasts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.04] text-center border border-white/[0.06]">
                <p className="text-sm text-[#a7a7a7]">No hay podcasts creados aún</p>
                <button
                  onClick={() => setShowCreatePodcastModal(true)}
                  className="mt-3 px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs rounded-full"
                >
                  Crear el primer Podcast
                </button>
              </div>
            ) : (
              podcasts.map((pod) => (
                <div key={pod.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                        {pod.cover ? (
                          <img src={pod.cover} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-teal-800 flex items-center justify-center text-white font-bold">
                            🎙
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base">{pod.title}</h3>
                        <p className="text-[#a7a7a7] text-xs mt-0.5">{pod.author}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPodcastIdForEpisode(pod.id);
                        episodeFileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-full border border-white/10"
                    >
                      + Añadir capítulo
                    </button>
                  </div>

                  {/* Capítulos */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider">Capítulos ({pod.episodes.length})</p>
                    {pod.episodes.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-2">No hay capítulos agregados aún</p>
                    ) : (
                      pod.episodes.map((ep) => (
                        <div
                          key={ep.id}
                          onClick={() => {
                            const tempSong: Song = {
                              id: ep.id,
                              title: ep.title,
                              artist: pod.title,
                              duration: ep.duration,
                              url: ep.url,
                              isFavorite: false,
                              playCount: 1,
                              addedAt: ep.addedAt,
                            };
                            playSong(tempSong);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] active:bg-white/10 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <span className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                              ▶
                            </span>
                            <span className="text-white text-xs font-semibold truncate">{ep.title}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <h2 className="text-base font-extrabold text-white mb-3">Canciones ({catSongs.length})</h2>
            {catSongs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.04] text-center border border-white/[0.06]">
                <p className="text-sm text-[#a7a7a7]">No hay canciones añadidas a esta categoría</p>
                <button
                  onClick={() => setShowCatAddSongsModal(true)}
                  className="mt-3 px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs rounded-full"
                >
                  Añadir canciones ahora
                </button>
              </div>
            ) : (
              catSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, catSongs)}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl active:bg-white/10 cursor-pointer border border-white/[0.04]"
                >
                  <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {song.cover ? (
                      <img src={song.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{song.title}</p>
                    <p className="text-[#a7a7a7] text-xs truncate mt-0.5">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategorySong(song.id, false);
                    }}
                    className="p-2 text-zinc-500 hover:text-red-400"
                    title="Quitar de categoría"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal para añadir canciones a la categoría */}
        {showCatAddSongsModal && (
          <AddSongsModal
            title={`Añadir a ${selectedCategory.title}`}
            songs={songs}
            assignedSongIds={selectedCategory.songs}
            onClose={() => setShowCatAddSongsModal(false)}
            onToggleSong={handleToggleCategorySong}
            onUploadMP3={handleUploadSongToCategory}
            t={t}
          />
        )}

        {/* Modal para crear Podcast */}
        {showCreatePodcastModal && (
          <CreatePodcastModal
            onClose={() => setShowCreatePodcastModal(false)}
            onCreate={handleCreatePodcast}
          />
        )}
      </div>
    );
  }

  // VISTA PRINCIPAL PESTAÑA BUSCAR
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
      {/* Header (Image 4) */}
      <div className="flex items-center justify-between py-4">
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('search')}</h1>

        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Pill Search Input Bar */}
      <div className="relative my-2">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/[0.08] text-white placeholder-zinc-400 rounded-full py-3.5 pl-12 pr-4 text-sm font-medium border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
        />
      </div>

      {/* Search Results */}
      {query.trim() ? (
        <div className="mt-4">
          <h2 className="text-sm font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">Resultados de búsqueda</h2>
          {searchResults.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No se encontraron resultados para "{query}"</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, searchResults)}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl active:bg-white/10 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {song.cover ? (
                      <img src={song.cover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{song.title}</p>
                    <p className="text-[#a7a7a7] text-xs truncate mt-0.5">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Deseas eliminar "${song.title}"?`)) {
                        removeSong(song.id);
                      }
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Eliminar canción"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Sección de Playlists con botón para Crear */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-white tracking-tight">{t('playlists')}</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-1.5 bg-[var(--accent)] text-black font-bold text-xs rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {t('createPlaylist')}
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="p-6 rounded-[20px] bg-white/[0.04] text-center border border-white/[0.06]">
                <p className="text-sm text-[#a7a7a7]">{t('noPlaylists')}</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-full"
                >
                  {t('createPlaylist')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-square bg-zinc-900 rounded-[16px] overflow-hidden border border-white/[0.08] shadow-lg relative">
                      {playlist.cover ? (
                        <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full opacity-80 active:opacity-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="mt-2 text-white font-bold text-sm truncate">{playlist.name}</h3>
                    <p className="text-[#a7a7a7] text-xs mt-0.5">{playlist.songs.length} {t('songs').toLowerCase()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección: Browse all (Categorías Interactivas) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-white tracking-tight">{t('browseAll')}</h2>
              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-full border border-white/10 active:scale-95 transition-transform flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Crear Categoría
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${cat.color} h-28 rounded-[20px] p-4 flex flex-col justify-between shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform border border-white/10`}
                >
                  <span className="text-lg font-extrabold text-white tracking-wide">{cat.title}</span>
                  <span className="text-[11px] font-semibold text-white/80">
                    {cat.isPodcast ? `${podcasts.length} Podcasts` : `${cat.songs.length} canciones`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal para Crear Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowCreateModal(false)}>
          <div className="w-full glass-panel rounded-t-[32px] p-6 pb-10 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5 text-center">{t('createPlaylist')}</h3>
            
            <div className="flex justify-center mb-5">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-32 h-32 bg-white/[0.06] rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden hover:bg-white/10 transition-colors"
              >
                {newCover ? (
                  <img src={newCover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-zinc-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-zinc-400 text-xs font-medium">{t('selectCover')}</span>
                  </>
                )}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </div>

            <input
              type="text"
              placeholder={t('playlistName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3.5 px-5 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-white/10 text-white font-semibold text-sm rounded-full"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3 bg-[var(--accent)] text-black font-bold text-sm rounded-full shadow-md"
              >
                {t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Categoría */}
      {showCreateCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategoryModal(false)}
          onCreate={handleCreateCategory}
        />
      )}
    </div>
  );
};
