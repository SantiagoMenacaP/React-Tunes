import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getStorageUsage } from '../utils/db';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, t, songs, playlists } = useApp();
  const [storageInfo, setStorageInfo] = useState<{ used: string; total: string; percent: number }>({
    used: '0', total: '0', percent: 0
  });

  useEffect(() => {
    getStorageUsage().then(({ used, total }) => {
      const usedMB = (used / 1024 / 1024).toFixed(1);
      const totalMB = total > 0 ? (total / 1024 / 1024 / 1024).toFixed(1) + ' GB' : '—';
      const percent = total > 0 ? Math.round((used / total) * 100) : 0;
      setStorageInfo({ used: usedMB, total: totalMB, percent });
    });
  }, [songs]);

  const clearAllData = async () => {
    const msg = settings.language === 'es'
      ? '¿Estás seguro de que deseas borrar todos los datos? Esto eliminará todas tus canciones y playlists.'
      : 'Are you sure you want to clear all data? This will remove all your songs and playlists.';
    if (confirm(msg)) {
      localStorage.clear();
      const dbs = await indexedDB.databases?.() ?? [];
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-44 px-5 pt-safe-top">
      <div className="py-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-6">{t('settings')}</h1>

        {/* Language Selection */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">{t('language')}</h2>
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            <button
              onClick={() => updateSettings({ language: 'es' })}
              className={`w-full flex items-center justify-between p-4 ${settings.language === 'es' ? 'text-[var(--accent)] font-bold' : 'text-white'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇸</span>
                <span className="text-sm font-semibold">{t('spanish')}</span>
              </div>
              {settings.language === 'es' && (
                <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
            <div className="h-px bg-white/5" />
            <button
              onClick={() => updateSettings({ language: 'en' })}
              className={`w-full flex items-center justify-between p-4 ${settings.language === 'en' ? 'text-[var(--accent)] font-bold' : 'text-white'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <span className="text-sm font-semibold">{t('english')}</span>
              </div>
              {settings.language === 'en' && (
                <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Theme Selection (Dark Theme with Green Accent only) */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">{t('theme')}</h2>
          <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-950 rounded-full border-2 border-[#1ed760] shadow-md flex items-center justify-center">
                <span className="w-3 h-3 bg-[#1ed760] rounded-full" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Streaming Glass Oscuro</p>
                <p className="text-[#a7a7a7] text-xs mt-0.5">Verde vibrante #1ED760</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-full">
              Activo
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">Reproducción</h2>
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            {/* Equalizer */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-semibold text-sm block">{t('equalizer')}</span>
                  <span className="text-[#a7a7a7] text-xs">Ajuste de respuesta de frecuencia Web Audio</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ equalizer: !settings.equalizer })}
                className={`w-12 h-7 rounded-full transition-colors p-1 ${settings.equalizer ? 'bg-[var(--accent)]' : 'bg-zinc-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.equalizer ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px bg-white/5" />

            {/* Crossfade */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-semibold text-sm block">{t('crossfade')}</span>
                  <span className="text-[#a7a7a7] text-xs">Transición suave entre pistas</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ crossfade: !settings.crossfade })}
                className={`w-12 h-7 rounded-full transition-colors p-1 ${settings.crossfade ? 'bg-[var(--accent)]' : 'bg-zinc-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.crossfade ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px bg-white/5" />

            {/* Autoplay */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-semibold text-sm block">{t('autoPlay')}</span>
                  <span className="text-[#a7a7a7] text-xs">Reproducir siguiente pista automáticamente</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ autoPlay: !settings.autoPlay })}
                className={`w-12 h-7 rounded-full transition-colors p-1 ${settings.autoPlay ? 'bg-[var(--accent)]' : 'bg-zinc-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.autoPlay ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Storage & Data */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">{t('storage')}</h2>
          <div className="bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{t('storage')} (IndexedDB)</span>
                <span className="text-[var(--accent)] font-bold text-sm">{storageInfo.used} MB</span>
              </div>
              <p className="text-[#a7a7a7] text-xs mb-3">{songs.length} canciones · {playlists.length} playlists</p>
              {storageInfo.percent > 0 && (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full"
                    style={{ width: `${Math.min(storageInfo.percent, 100)}%` }}
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-white/5" />

            <button
              onClick={clearAllData}
              className="w-full flex items-center justify-between p-4 text-red-400 font-semibold hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm">{t('clearData')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* About App */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-[#a7a7a7] uppercase tracking-wider mb-3">{t('about')}</h2>
          <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--accent)] text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">React Tunes PWA</h3>
                <p className="text-[#a7a7a7] text-xs mt-0.5">{t('version')} 2.0.0 (Netlify Ready)</p>
                <p className="text-[var(--accent)] text-xs font-semibold mt-1">Optimizado para iPhone & iOS PWA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
