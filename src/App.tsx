import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SongsTab } from './components/SongsTab';
import { SearchTab } from './components/SearchTab';
import { LibraryTab } from './components/LibraryTab';
import { SettingsTab } from './components/SettingsTab';
import { Player } from './components/Player';
import { AudioHandler } from './components/AudioHandler';
import { TabType } from './types';

const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab, playerState, setAudioElement } = useApp();

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'songs', label: 'Inicio', icon: HomeIcon },
    { id: 'search', label: 'Buscar', icon: SearchNavIcon },
    { id: 'library', label: 'Biblioteca', icon: LibraryNavIcon },
    { id: 'settings', label: 'Ajustes', icon: SettingsNavIcon },
  ];

  return (
    <div
      data-theme="dark"
      className="min-h-screen bg-[#0a0a0a] text-white font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] overflow-x-hidden relative flex flex-col justify-between"
    >
      {/* Audio Handler para iOS */}
      <AudioHandler onAudioReady={setAudioElement} />

      {/* Main Tab Views */}
      <main className="flex-1 w-full max-w-md mx-auto relative">
        {currentTab === 'songs' && <SongsTab />}
        {currentTab === 'search' && <SearchTab />}
        {currentTab === 'library' && <LibraryTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>

      {/* Floating Mini Player (if song selected) */}
      {playerState.currentSong && <Player />}

      {/* Floating Glass Pill Bottom Navigation Bar — Exactly 4 Tabs */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="glass-panel pointer-events-auto rounded-[24px] shadow-2xl shadow-black/80 border border-white/[0.08] px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className="flex flex-col items-center justify-center p-2 transition-transform active:scale-90"
                  aria-label={tab.label}
                >
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 shadow-inner'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-[var(--accent)]' : 'text-zinc-400'
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

// Nav Icons
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const SearchNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LibraryNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
  </svg>
);

const SettingsNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
