import React from 'react';
import { useApp } from '../context/AppContext';

export const LibraryTab: React.FC = () => {
  const { songs, t, playSong, removeSong } = useApp();

  const mostPlayed = [...songs]
    .filter(s => (s.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 10);

  const favorites = songs.filter(s => s.isFavorite);

  const recentlyAdded = [...songs]
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 5);

  const artistStats = songs.reduce((acc, song) => {
    const pCount = song.playCount || 0;
    if (pCount > 0) {
      if (!acc[song.artist]) {
        acc[song.artist] = { minutes: 0, playCount: 0 };
      }
      acc[song.artist].minutes += ((song.duration || 180) / 60) * pCount;
      acc[song.artist].playCount += pCount;
    }
    return acc;
  }, {} as Record<string, { minutes: number; playCount: number }>);

  const topArtists = Object.entries(artistStats)
    .sort(([, a], [, b]) => b.minutes - a.minutes)
    .slice(0, 5);

  const totalMinutes = Math.round(
    songs.reduce((acc, song) => acc + ((song.duration || 180) / 60) * (song.playCount || 0), 0)
  );

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
      <div className="py-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-4">{t('library')}</h1>

        {/* Total Listening Stats Card */}
        <div className="glass-panel border border-white/10 rounded-[20px] p-5 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--accent)] text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[var(--accent)]/20">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <p className="text-[#a7a7a7] text-xs font-semibold uppercase tracking-wider">{t('totalListened')}</p>
              <p className="text-3xl font-extrabold text-white tracking-tight mt-0.5">{totalMinutes}</p>
              <p className="text-[var(--accent)] text-xs font-bold mt-0.5">{t('minutes')}</p>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)] fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {t('favorites')}
            </h2>
            <div className="space-y-2">
              {favorites.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, favorites)}
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
          </div>
        )}

        {/* Most Played Songs Section */}
        {mostPlayed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t('mostPlayed')}
            </h2>
            <div className="space-y-2">
              {mostPlayed.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, mostPlayed)}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl active:bg-white/10 cursor-pointer border border-white/[0.04]"
                >
                  <span className="w-6 text-center text-[var(--accent)] font-extrabold text-sm">{index + 1}</span>
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
                  <div className="text-right pl-2 pr-1">
                    <p className="text-[var(--accent)] text-xs font-extrabold">{song.playCount}x</p>
                    <p className="text-[#a7a7a7] text-[11px] mt-0.5">{formatDuration(song.duration)}</p>
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
          </div>
        )}

        {/* Top Artists Section */}
        {topArtists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('topArtists')}
            </h2>
            <div className="space-y-3">
              {topArtists.map(([artist, stats]) => (
                <div
                  key={artist}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl border border-white/[0.04]"
                >
                  <div className="w-12 h-12 bg-[var(--accent)] text-black rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-md">
                    {artist.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{artist}</p>
                    <p className="text-[#a7a7a7] text-xs mt-0.5">{stats.playCount} reproducciones</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--accent)] font-extrabold text-sm">{Math.round(stats.minutes)}</p>
                    <p className="text-[#a7a7a7] text-[11px]">{t('minutes')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Added Section */}
        {recentlyAdded.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('recentlyAdded')}
            </h2>
            <div className="space-y-2">
              {recentlyAdded.map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, recentlyAdded)}
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
          </div>
        )}

        {/* Empty State */}
        {songs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-[#a7a7a7] gap-3">
            <svg className="w-16 h-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
            <p className="text-sm font-medium">{t('noSongs')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
