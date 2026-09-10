import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const SongsTab: React.FC = () => {
  const { songs, t, addSong, removeSong, toggleFavorite, playSong } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'music' | 'podcasts'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const audioFiles = Array.from(files).filter(
        file => file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i))
      );
      
      // Subir múltiples canciones de forma concurrente
      await Promise.all(audioFiles.map(file => addSong(file)));
    } catch (error) {
      console.error('Error al subir canciones:', error);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const recentSongs = songs.slice(0, 6);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
      {/* Top Header & Filter Pills (Image 2) */}
      <div className="flex items-center gap-3 py-4">
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'all'
                ? 'bg-[var(--accent)] text-black'
                : 'bg-white/[0.08] text-white hover:bg-white/15'
            }`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setActiveFilter('music')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'music'
                ? 'bg-[var(--accent)] text-black'
                : 'bg-white/[0.08] text-white hover:bg-white/15'
            }`}
          >
            {t('music')}
          </button>
          <button
            onClick={() => setActiveFilter('podcasts')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'podcasts'
                ? 'bg-[var(--accent)] text-black'
                : 'bg-white/[0.08] text-white hover:bg-white/15'
            }`}
          >
            {t('podcasts')}
          </button>
        </div>
      </div>

      {/* MP3 Upload Button (Múltiples archivos sin límite) */}
      <div className="my-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full bg-[var(--accent)] text-black font-bold text-xs py-3.5 px-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Subiendo canciones...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Subir canciones MP3</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.flac"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Accesos Recientes */}
      <div className="mt-4">
        <h2 className="text-sm font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">Accesos recientes</h2>
        <div className="grid grid-cols-2 gap-3">
          {recentSongs.length === 0 ? (
            <div className="col-span-2 p-6 rounded-2xl bg-white/[0.04] text-center text-[#a7a7a7]">
              <p className="text-sm">{t('noSongs')}</p>
            </div>
          ) : (
            recentSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="flex items-center gap-3 p-2 bg-white/[0.05] rounded-xl active:bg-white/10 cursor-pointer overflow-hidden border border-white/[0.05]"
              >
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {song.cover ? (
                    <img src={song.cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-white font-bold text-xs truncate">{song.title}</p>
                  <p className="text-[#a7a7a7] text-[11px] truncate mt-0.5">{song.artist}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Horizontal Carousel: Jump back in */}
      {songs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-extrabold text-white mb-4 tracking-tight">{t('jumpBackIn')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-snap-x">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="w-36 flex-shrink-0 cursor-pointer scroll-snap-item group"
              >
                <div className="w-36 h-36 bg-zinc-900 rounded-[16px] overflow-hidden border border-white/10 shadow-lg relative">
                  {song.cover ? (
                    <img src={song.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="mt-2.5 text-white font-bold text-sm truncate">{song.title}</h3>
                <p className="text-[#a7a7a7] text-xs mt-0.5 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista Completa de Canciones (TODAS las canciones sin límite, con Botón de Eliminar) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Todas las Canciones ({songs.length})
          </h2>
        </div>

        {songs.length === 0 ? (
          <div className="p-8 text-center text-[#a7a7a7] bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <p className="text-sm">No has subido canciones aún.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs rounded-full"
            >
              Subir tu primera canción MP3
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="flex items-center gap-3 p-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl active:bg-white/10 cursor-pointer border border-white/[0.04] transition-colors"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                
                <span className="text-[#a7a7a7] text-xs font-medium px-2">
                  {formatDuration(song.duration)}
                </span>

                {/* Botón me gusta */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song.id);
                  }}
                  className="p-2 text-zinc-400 hover:text-[var(--accent)]"
                  title="Favorito"
                >
                  <svg
                    className={`w-5 h-5 ${song.isFavorite ? 'text-[var(--accent)] fill-current' : ''}`}
                    fill={song.isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* BOTÓN ELIMINAR CANCIÓN (Trash Icon) */}
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

      {/* Pagination Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-8 mb-4">
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
        <span className="w-2 h-2 rounded-full bg-white/30" />
      </div>
    </div>
  );
};
