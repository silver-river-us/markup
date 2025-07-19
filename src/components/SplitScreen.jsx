import { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import { storage } from '../utils/storage';
import './SplitScreen.css';

const defaultMarkdown = `# Welcome to Markup

This is a split-screen markdown editor with mermaid support!

## Features
- Real-time preview
- Mermaid diagram support
- Monaco editor with syntax highlighting

## Example Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
\`\`\`

## Try it out!
Edit this text in the left panel and see the preview update in real-time.
`;

const SplitScreen = ({ onBack, isRestoring }) => {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  useEffect(() => {
    if (isRestoring) {
      const savedContent = storage.getEditorContent();
      if (savedContent) {
        setMarkdown(savedContent);
      }
    }
  }, [isRestoring]);

  const handleMarkdownChange = (newMarkdown) => {
    setMarkdown(newMarkdown);
    // Debounced save to localStorage
    const timeoutId = setTimeout(() => {
      storage.saveEditorContent(newMarkdown);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="split-screen">
      <div className="split-screen-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h2>Editor Mode</h2>
      </div>
      <div className="split-screen-content">
        <div className="editor-panel">
          <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
        </div>
        <div className="preview-panel">
          <MarkdownPreview markdown={markdown} />
        </div>
      </div>
    </div>
  );
};

export default SplitScreen;