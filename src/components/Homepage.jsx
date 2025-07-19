import './Homepage.css';

const Homepage = ({ onSelectMode }) => {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <h1 className="homepage-title">MarkUp</h1>
        <p className="homepage-subtitle">Choose your editing mode</p>
        
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