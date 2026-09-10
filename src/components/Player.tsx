import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

interface LyricLine {
  time: number;
  text: string;
}

export const Player: React.FC = () => {
  const {
    playerState,
    showPlayer,
    showLyrics,
    setShowPlayer,
    setShowLyrics,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    t,
  } = useApp();

  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string>('');
  const [isSynced, setIsSynced] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  // Controla la vista de letras a pantalla completa (Imagen 3).
  // `showLyrics` (del contexto) solo controla el panel compacto debajo del reproductor.
  const [lyricsFullscreen, setLyricsFullscreen] = useState(false);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const compactLyricsContainerRef = useRef<HTMLDivElement>(null);
  const compactLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const { currentSong, isPlaying, currentTime, duration, shuffle, repeat } = playerState;

  // Parse LRC formatted lyrics
  const parseLRC = useCallback((lrcText: string): LyricLine[] => {
    const lines: LyricLine[] = [];
    const lrcLines = lrcText.split('\n');
    
    for (const line of lrcLines) {
      const timeMatch = line.match(/\[(\d{2}):(\d{2})[\.:]+(\d{2,3})\]/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1], 10);
        const seconds = parseInt(timeMatch[2], 10);
        const milliseconds = parseInt(timeMatch[3], 10);
        const time = minutes * 60 + seconds + milliseconds / (timeMatch[3].length === 3 ? 1000 : 100);
        
        const text = line.replace(/\[\d{2}:\d{2}[\.:]+\d{2,3}\]/g, '').trim();
        if (text) {
          lines.push({ time, text });
        }
      }
    }
    
    return lines.sort((a, b) => a.time - b.time);
  }, []);

  // Fetch lyrics when song changes or lyrics tab opens
  useEffect(() => {
    if (currentSong && showLyrics) {
      fetchLyrics(currentSong.artist, currentSong.title);
    }
  }, [currentSong?.id, showLyrics]);

  // Sync lyrics line with player current time
  useEffect(() => {
    if (!isSynced || syncedLyrics.length === 0) return;

    let newIndex = -1;
    for (let i = syncedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLyrics[i].time - 0.3) {
        newIndex = i;
        break;
      }
    }
    
    if (newIndex !== currentLineIndex) {
      setCurrentLineIndex(newIndex);
    }
  }, [currentTime, syncedLyrics, isSynced, currentLineIndex]);

  // Auto-scroll lyrics to active line (vista de pantalla completa)
  useEffect(() => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex] && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const currentLine = lineRefs.current[currentLineIndex];
      
      if (currentLine) {
        const containerHeight = container.clientHeight;
        const lineTop = currentLine.offsetTop;
        const lineHeight = currentLine.clientHeight;
        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        container.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLineIndex, lyricsFullscreen]);

  // Auto-scroll de la línea activa dentro del panel compacto
  useEffect(() => {
    if (currentLineIndex >= 0 && compactLineRefs.current[currentLineIndex] && compactLyricsContainerRef.current) {
      const container = compactLyricsContainerRef.current;
      const currentLine = compactLineRefs.current[currentLineIndex];

      if (currentLine) {
        const containerHeight = container.clientHeight;
        const lineTop = currentLine.offsetTop;
        const lineHeight = currentLine.clientHeight;
        const scrollTo = lineTop - (containerHeight / 2) + (lineHeight / 2);

        container.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLineIndex]);

  // Si se desactivan las letras desde el botón superior, cierra también la vista de pantalla completa
  useEffect(() => {
    if (!showLyrics && lyricsFullscreen) {
      setLyricsFullscreen(false);
    }
  }, [showLyrics, lyricsFullscreen]);

  const fetchLyrics = async (artist: string, title: string) => {
    setLoadingLyrics(true);
    setSyncedLyrics([]);
    setPlainLyrics('');
    setIsSynced(false);
    setLyricsError(null);
    setCurrentLineIndex(-1);
    lineRefs.current = [];
    compactLineRefs.current = [];
    
    const cleanTitle = title
      .replace(/\.(mp3|wav|ogg|flac|m4a)$/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();
    
    const cleanArtist = artist === 'Artista desconocido' || artist === 'Unknown artist' 
      ? '' 
      : artist;
    
    try {
      const lrclibResponse = await fetch(
        `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}${cleanArtist ? `&artist_name=${encodeURIComponent(cleanArtist)}` : ''}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (lrclibResponse.ok) {
        const lrclibData = await lrclibResponse.json();
        if (lrclibData && lrclibData.length > 0) {
          const firstResult = lrclibData[0];
          if (firstResult.syncedLyrics) {
            const parsed = parseLRC(firstResult.syncedLyrics);
            if (parsed.length > 0) {
              setSyncedLyrics(parsed);
              setIsSynced(true);
              lineRefs.current = new Array(parsed.length).fill(null);
              compactLineRefs.current = new Array(parsed.length).fill(null);
              setLoadingLyrics(false);
              return;
            }
          }
          if (firstResult.plainLyrics) {
            setPlainLyrics(firstResult.plainLyrics);
            setIsSynced(false);
            setLoadingLyrics(false);
            return;
          }
        }
      }
      
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist || 'unknown')}/${encodeURIComponent(cleanTitle)}`,
        { signal: AbortSignal.timeout(8000), mode: 'cors' }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.lyrics && data.lyrics.trim()) {
          setPlainLyrics(data.lyrics);
          setIsSynced(false);
          setLoadingLyrics(false);
          return;
        }
      }
      
      setLyricsError('No se encontró la letra para esta canción');
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLyricsError('Error al buscar la letra. Intenta de nuevo.');
    }
    setLoadingLyrics(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const jumpToLine = (index: number) => {
    if (syncedLyrics[index]) {
      seekTo(syncedLyrics[index].time);
    }
  };

  if (!currentSong) return null;

  // Mini Player (Images 1, 2, 4) — Floating Glass Pill
  if (!showPlayer) {
    return (
      <div
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 left-4 right-4 max-w-md mx-auto glass-panel rounded-[var(--radius-float)] p-2.5 shadow-2xl shadow-black/80 border border-white/[0.08] z-40 cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => setShowPlayer(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
            {currentSong.cover ? (
              <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[14px] font-semibold truncate leading-tight">{currentSong.title}</p>
            <p className="text-[#a7a7a7] text-[12px] truncate leading-tight mt-0.5">{currentSong.artist}</p>
          </div>
          
          {/* Botón de Letra rápido en la barra de reproducción */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlayer(true);
              setShowLyrics(true);
            }}
            className="p-2 text-zinc-400 hover:text-[var(--accent)] active:scale-90 transition-colors flex-shrink-0"
            title={t('lyrics')}
            aria-label={t('lyrics')}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
            </svg>
          </button>

          {/* Play / Pause button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              isPlaying ? pauseSong() : resumeSong();
            }}
            className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform shadow-md"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Thin bottom progress indicator line */}
        <div className="mt-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    );
  }

  // Full Screen Player (Image 3)
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0e171e] via-[#0a0a0a] to-[#050505] z-50 flex flex-col justify-between pt-safe-top pb-safe-bottom safe-area-inset">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 pt-3">
        <button
          onClick={() => setShowPlayer(false)}
          className="p-2 -ml-2 text-white/90 active:scale-90 transition-transform flex-shrink-0"
          aria-label="Cerrar reproductor"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="text-center flex-1 mx-2 min-w-0">
          <p className="text-[11px] font-bold tracking-widest text-[#a7a7a7] uppercase truncate">
            {currentSong.album ? currentSong.album : t('nowPlaying')}
          </p>
        </div>

        {/* Botón para activar las letras en la esquina superior derecha */}
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-90 flex-shrink-0 shadow-md ${
            showLyrics
              ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-bold shadow-[var(--accent)]/30'
              : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
          }`}
          title={t('lyrics')}
          aria-label={t('lyrics')}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">{t('lyrics')}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col px-7 max-w-md mx-auto w-full relative pb-4 overflow-y-auto ${
        showLyrics ? 'justify-start' : 'justify-evenly'
      }`}>
        {/* Album Art (Image 3) — se reduce cuando el panel de letras está activo */}
        <div className={`flex justify-center transition-all duration-300 ${showLyrics ? 'my-1 py-1' : 'my-3 py-2'}`}>
          <div
            className={`aspect-square bg-zinc-900 rounded-[20px] shadow-2xl shadow-black/90 overflow-hidden border border-white/[0.08] relative transition-all duration-300 ${
              showLyrics ? 'w-20 h-20' : 'w-56 h-56 max-h-[35vh]'
            }`}
          >
            {currentSong.cover ? (
              <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Track Title, Artist, & Plus button (Image 3) */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate tracking-tight">{currentSong.title}</h1>
              <p className="text-[#a7a7a7] text-base sm:text-lg font-normal truncate mt-1">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform flex-shrink-0"
              title="Guardar en biblioteca"
            >
              {currentSong.isFavorite ? (
                <svg className="w-5 h-5 text-[var(--accent)] fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Seek Slider & Timestamps */}
        <div className="mb-6">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ffffff ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.2) ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs font-medium text-[#a7a7a7]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls (Image 3) */}
        <div className="flex items-center justify-between px-4 mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 transition-colors ${shuffle ? 'text-[var(--accent)]' : 'text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
          
          <button onClick={prevSong} className="p-3 text-white active:scale-90 transition-transform">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          
          <button
            onClick={() => (isPlaying ? pauseSong() : resumeSong())}
            className="w-18 h-18 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-9 h-9 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <button onClick={nextSong} className="p-3 text-white active:scale-90 transition-transform">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`p-2.5 transition-colors ${repeat !== 'none' ? 'text-[var(--accent)]' : 'text-zinc-400'}`}
          >
            {repeat === 'one' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            )}
          </button>
        </div>

        {/* Panel compacto de letras (Image 1) — solo visible cuando se activa con el botón de Letras */}
        {showLyrics && (
          <button
            type="button"
            onClick={() => setLyricsFullscreen(true)}
            aria-label={t('lyrics')}
            className="mb-5 w-full text-left rounded-2xl bg-[#171717] border border-[var(--accent)]/30 overflow-hidden relative active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest text-[var(--accent)] uppercase">
                  {t('lyrics')}
                </span>
                {isSynced && (
                  <span className="text-[10px] bg-[var(--accent)]/20 text-[var(--accent)] font-semibold px-2 py-0.5 rounded-full">
                    Sincronizada
                  </span>
                )}
              </div>
              <svg className="w-4 h-4 text-[var(--accent)]/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 8V4h4M20 8V4h-4M4 16v4h4m12-4v4h-4" />
              </svg>
            </div>

            <div
              ref={compactLyricsContainerRef}
              className="px-4 pb-4 h-[6.5rem] overflow-hidden relative"
            >
              {loadingLyrics ? (
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  Buscando letra...
                </div>
              ) : isSynced && syncedLyrics.length > 0 ? (
                <div className="space-y-2.5">
                  {syncedLyrics.map((line, index) => (
                    <p
                      key={index}
                      ref={(el) => { compactLineRefs.current[index] = el; }}
                      className={`text-base font-bold leading-snug transition-all duration-300 ${
                        index === currentLineIndex
                          ? 'text-white opacity-100'
                          : index < currentLineIndex
                          ? 'text-white/40'
                          : 'text-white/70'
                      }`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              ) : plainLyrics ? (
                <p className="text-white/90 text-base font-medium leading-snug whitespace-pre-wrap">
                  {plainLyrics}
                </p>
              ) : (
                <p className="text-white/60 text-sm">{lyricsError || t('noLyrics')}</p>
              )}
              {/* Difuminado inferior para indicar que hay más letra debajo */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#212121] to-transparent" />
            </div>
          </button>
        )}

        {/* Bottom Utility Row: AirPlay & Share (Image 3) */}
        <div className="flex items-center justify-between px-2 text-zinc-400 mb-2">
          <button className="p-2 hover:text-white transition-colors" title="Conectar dispositivo">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentSong.title,
                  text: `${currentSong.title} - ${currentSong.artist}`,
                }).catch(() => {});
              }
            }}
            className="p-2 hover:text-white transition-colors"
            title="Compartir"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9.316a3 3 0 100-2.684 3 3 0 000 2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pantalla completa de Letras — vista nueva (no se abre sobre el reproductor).
          Muestra las letras completas con una X arriba a la derecha para salir. */}
      {lyricsFullscreen && (
        <div className="fixed inset-0 z-[80] bg-[#0a0a0a] text-white flex flex-col pt-safe-top pb-safe-bottom safe-area-inset">
          {/* Header: info de la canción + X para salir */}
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
                {currentSong.cover ? (
                  <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{currentSong.title}</p>
                <p className="text-[#a7a7a7] text-xs truncate mt-0.5">{currentSong.artist}</p>
              </div>
            </div>

            {isSynced && (
              <span className="text-[11px] bg-[var(--accent)]/20 text-[var(--accent)] font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
                Sincronizada
              </span>
            )}

            {/* Botón X para salir de la vista de letras */}
            <button
              onClick={() => setLyricsFullscreen(false)}
              aria-label="Cerrar letras"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Letras completas de la canción */}
          <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto px-6 pb-12 pt-2 scroll-smooth">
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Buscando letra...</p>
              </div>
            ) : isSynced && syncedLyrics.length > 0 ? (
              <div className="space-y-6 text-center">
                {syncedLyrics.map((line, index) => (
                  <p
                    key={index}
                    ref={(el) => { lineRefs.current[index] = el; }}
                    onClick={() => jumpToLine(index)}
                    className={`text-xl sm:text-2xl font-bold cursor-pointer transition-all duration-300 leading-relaxed ${
                      index === currentLineIndex
                        ? 'text-white scale-105 opacity-100'
                        : index < currentLineIndex
                        ? 'text-zinc-600 opacity-60'
                        : 'text-zinc-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            ) : plainLyrics ? (
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap text-center pb-8 font-medium opacity-90">
                {plainLyrics}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-center">{lyricsError || t('noLyrics')}</p>
                <button
                  onClick={() => currentSong && fetchLyrics(currentSong.artist, currentSong.title)}
                  className="px-5 py-2 bg-white text-black font-semibold rounded-full text-xs active:scale-95 transition-transform"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
