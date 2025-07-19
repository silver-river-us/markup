import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './Homepage.css';

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

  const formatLastUsed = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    }
  };

  const getModeDisplayName = (mode) => {
    return mode === 'editor' ? 'Editor Mode' : 'File Watcher Mode';
  };

  return (
    <div className="homepage">
      <div className="homepage-content">
        <h1 className="homepage-title underline">MarkUp</h1>
        <p className="homepage-subtitle">Choose your editing mode</p>
        
        {savedState?.canContinue && (
          <div className="continue-section">
            <div className="continue-card" onClick={onContinue}>
              <div className="continue-icon">🔄</div>
              <div className="continue-info">
                <h3>Continue where you left off</h3>
                <p>{getModeDisplayName(savedState.mode)} • {formatLastUsed(savedState.lastUsed)}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mode-cards">
          <div className="mode-card" onClick={() => onSelectMode('editor')}>
            <div className="mode-icon">✏️</div>
            <h3>Editor Mode</h3>
            <p>Built-in markdown editor with live preview and mermaid support</p>
            <div className="mode-features">
              <span>• Monaco editor</span>
              <span>• Real-time preview</span>
              <span>• Mermaid diagrams</span>
            </div>
          </div>

          <div className="mode-card" onClick={() => onSelectMode('watcher')}>
            <div className="mode-icon">👁️</div>
            <h3>File Watcher Mode</h3>
            <p>Watch a markdown file and auto-refresh preview when it changes</p>
            <div className="mode-features">
              <span>• Perfect for Vim users</span>
              <span>• Auto file watching</span>
              <span>• External editor support</span>
            </div>
          </div>
        </div>

        <div className="homepage-footer">
          <p>Select a mode to get started</p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
