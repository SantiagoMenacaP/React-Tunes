import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Playlist, Song } from '../types';

const AddSongsModal: React.FC<{
  playlist: Playlist;
  songs: Song[];
  onClose: () => void;
  onToggleSong: (songId: string, isAdding: boolean) => void;
  t: (key: string) => string;
}> = ({ playlist, songs, onClose, onToggleSong, t }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set(playlist.songs));

  const filteredSongs = songs.filter(song => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return song.title.toLowerCase().includes(query) || 
           song.artist.toLowerCase().includes(query);
  });

  const handleToggle = (songId: string) => {
    const isCurrentlySelected = selectedSongs.has(songId);
    const newSelected = new Set(selectedSongs);
    
    if (isCurrentlySelected) {
      newSelected.delete(songId);
      onToggleSong(songId, false);
    } else {
      newSelected.add(songId);
      onToggleSong(songId, true);
    }
    
    setSelectedSongs(newSelected);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col pt-safe-top pb-safe-bottom safe-area-inset">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onClose} className="p-2 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-white">{t('addToPlaylist')}</h3>
        <div className="w-10" />
      </div>

      <div className="p-4">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export const PlaylistsTab: React.FC = () => {
  const { playlists, songs, t, createPlaylist, deletePlaylist, playSong, removeSongFromPlaylist, addSongToPlaylist, addSong } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCover, setNewCover] = useState<string | undefined>();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const songInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedPlaylist) {
      const updated = playlists.find(p => p.id === selectedPlaylist.id);
      if (updated) {
        setSelectedPlaylist(updated);
      }
    }
  }, [playlists, selectedPlaylist?.id]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCover(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim(), newCover);
      setNewName('');
      setNewCover(undefined);
      setShowCreate(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedPlaylist) {
      if (e.target) e.target.value = '';
      return;
    }
    
    const playlistId = selectedPlaylist.id;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && (file.type.includes('audio') || file.name.endsWith('.mp3'))) {
        const newSong = await addSong(file);
        if (newSong) {
          addSongToPlaylist(playlistId, newSong.id);
        }
      }
    }
    if (e.target) e.target.value = '';
  };

  const getPlaylistSongs = (playlist: Playlist): Song[] => {
    return playlist.songs
      .map(id => songs.find(s => s.id === id))
      .filter((s): s is Song => s !== undefined);
  };

  const handleToggleSong = (songId: string, isAdding: boolean) => {
    if (selectedPlaylist) {
      if (isAdding) {
        addSongToPlaylist(selectedPlaylist.id, songId);
      } else {
        removeSongFromPlaylist(selectedPlaylist.id, songId);
      }
    }
  };

  // Detailed Playlist / Album View (Matching Image 1)
  if (selectedPlaylist) {
    const playlistSongs = getPlaylistSongs(selectedPlaylist);
    return (
      <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
        {/* Back Arrow */}
        <div className="py-3">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="p-2 -ml-2 text-white/90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Big Centered Square Album Cover (Image 1) */}
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

        {/* Title, Category & Artist (Image 1) */}
        <div className="mt-4 mb-2">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-extrabold text-white tracking-tight truncate pr-2">{selectedPlaylist.name}</h1>
            <span className="text-xs font-semibold text-[#a7a7a7] whitespace-nowrap">Album · 2023</span>
          </div>
          <p className="text-[#a7a7a7] text-sm font-medium mt-1">
            {playlistSongs.length > 0 ? playlistSongs[0].artist : 'Varios artistas'}
          </p>
        </div>

        {/* Action Buttons Row (Image 1) */}
        <div className="flex items-center justify-between my-4">
          {/* Left Actions */}
          <div className="flex items-center gap-3">
            {/* Small Cover Thumb */}
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

            {/* Check Saved Button */}
            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[var(--accent)] bg-[var(--accent-soft)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>

            {/* Download Button */}
            <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Three Dots Button */}
            <button className="p-1 text-zinc-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          {/* Right Actions: Shuffle & Big Green Play Button */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            <button
              onClick={() => {
                if (playlistSongs.length > 0) {
                  playSong(playlistSongs[0], playlistSongs);
                }
              }}
              className="w-14 h-14 bg-[var(--accent)] text-black rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 active:scale-95 transition-transform"
            >
              <svg className="w-7 h-7 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Buttons for Adding Songs or Uploading MP3 */}
        <div className="flex gap-2 my-2">
          <button
            onClick={() => setShowAddSongs(true)}
            className="flex-1 py-2.5 px-4 bg-white/[0.06] hover:bg-white/10 text-white font-semibold text-xs rounded-full border border-white/10 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addSongs')}
          </button>

          <button
            onClick={() => songInputRef.current?.click()}
            className="py-2.5 px-4 bg-white/[0.06] hover:bg-white/10 text-[var(--accent)] font-semibold text-xs rounded-full border border-white/10 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Subir MP3
          </button>
          <input
            ref={songInputRef}
            type="file"
            accept="audio/*,.mp3"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Clean Tracklist (Image 1) */}
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

        {/* Add Songs Modal */}
        {showAddSongs && (
          <AddSongsModal
            playlist={selectedPlaylist}
            songs={songs}
            onClose={() => setShowAddSongs(false)}
            onToggleSong={handleToggleSong}
            t={t}
          />
        )}
      </div>
    );
  }

  // Playlists List View
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
      <div className="py-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('playlists')}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[var(--accent)] text-black font-bold text-xs rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('createPlaylist')}
        </button>
      </div>

      {/* Grid of Playlists */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#a7a7a7] gap-3">
          <svg className="w-16 h-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm font-medium">{t('noPlaylists')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className="cursor-pointer group"
            >
              <div className="aspect-square bg-zinc-900 rounded-[14px] overflow-hidden border border-white/[0.08] shadow-lg relative">
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
              <h3 className="mt-2.5 text-white font-bold text-sm truncate">{playlist.name}</h3>
              <p className="text-[#a7a7a7] text-xs mt-0.5">{playlist.songs.length} {t('songs').toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowCreate(false)}>
          <div className="w-full glass-panel rounded-t-[32px] p-6 pb-10 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5 text-center">{t('createPlaylist')}</h3>
            
            {/* Custom Cover Upload */}
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

            {/* Input Name */}
            <input
              type="text"
              placeholder={t('playlistName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/[0.06] text-white placeholder-zinc-500 rounded-full py-3.5 px-5 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
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
    </div>
  );
};
