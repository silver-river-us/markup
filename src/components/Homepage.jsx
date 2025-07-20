import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { formatLastUsed } from '../services/dates.js';

const Homepage = ({ onSelectMode, onContinue }) => {
  const [savedState, setSavedState] = useState(null);

  useEffect(() => {
    const lastMode = storage.getLastMode();
    const lastUsed = storage.getLastUsed();
    
    if (lastMode && lastUsed) {
      const now = Date.now();
      const daysSince = (now - lastUsed) / (1000 * 60 * 60 * 24);
      
      // Show continue option if used within the last 7 days
      if (daysSince < 7) {
        setSavedState({
          mode: lastMode,
          lastUsed: new Date(lastUsed),
          canContinue: true
        });
      }
    }
  }, []);

  const getModeDisplayName = (mode) => {
    return mode === 'editor' ? 'Editor Mode' : 'File Watcher Mode';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center p-10 max-sm:p-4 max-sm:py-8 overflow-y-auto">
      <div className="text-center max-w-3xl w-full">
        <h1 className="text-[3.5rem] max-md:text-[2.5rem] max-sm:text-3xl font-bold text-white mb-4 -tracking-wider">MarkUp</h1>
        <p className="text-xl max-sm:text-lg text-neutral-300 mb-8 max-sm:mb-6 font-normal">Choose your editing mode</p>
        
        {savedState?.canContinue && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 border-2 border-indigo-600 rounded-2xl p-5 px-6 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 hover:border-indigo-400 flex items-center gap-4 max-w-lg mx-auto" onClick={onContinue}>
              <div className="text-3xl flex-shrink-0">🔄</div>
              <div className="text-left flex-1">
                <h3 className="text-white m-0 mb-1 text-lg font-semibold">Continue where you left off</h3>
                <p className="text-indigo-100 m-0 text-sm opacity-90">{getModeDisplayName(savedState.mode)} • {formatLastUsed(savedState.lastUsed)}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-md:gap-5 mb-12 max-sm:mb-8">
          <div className="bg-neutral-700 border-2 border-neutral-600 rounded-2xl py-8 px-6 max-md:py-6 max-md:px-5 max-sm:py-5 max-sm:px-4 cursor-pointer transition-all duration-300 hover:border-indigo-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-600/20 relative overflow-hidden group" onClick={() => onSelectMode('editor')}>
            <div className="text-5xl max-sm:text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 block">✏️</div>
            <h3 className="text-2xl max-sm:text-xl font-semibold text-white mb-3">Editor Mode</h3>
            <p className="text-base max-sm:text-sm text-neutral-300 leading-6 mb-5 max-sm:mb-4">Built-in markdown editor with live preview and mermaid support</p>
            <div className="flex flex-col gap-2 text-left">
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• Monaco editor</span>
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• Real-time preview</span>
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• Mermaid diagrams</span>
            </div>
          </div>

          <div className="bg-neutral-700 border-2 border-neutral-600 rounded-2xl py-8 px-6 max-md:py-6 max-md:px-5 max-sm:py-5 max-sm:px-4 cursor-pointer transition-all duration-300 hover:border-indigo-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-600/20 relative overflow-hidden group" onClick={() => onSelectMode('watcher')}>
            <div className="text-5xl max-sm:text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 block">👁️</div>
            <h3 className="text-2xl max-sm:text-xl font-semibold text-white mb-3">File Watcher Mode</h3>
            <p className="text-base max-sm:text-sm text-neutral-300 leading-6 mb-5 max-sm:mb-4">Watch a markdown file and auto-refresh preview when it changes</p>
            <div className="flex flex-col gap-2 text-left">
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• Perfect for Vim users</span>
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• Auto file watching</span>
              <span className="text-sm max-sm:text-xs text-neutral-500 pl-1">• External editor support</span>
            </div>
          </div>
        </div>

        <div className="text-neutral-600 text-sm">
          <p>Select a mode to get started</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
