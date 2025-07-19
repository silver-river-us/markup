import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import './SplitScreen.css';

const SplitScreen = ({ onBack }) => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markup

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
`);

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
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="preview-panel">
          <MarkdownPreview markdown={markdown} />
        </div>
      </div>
    </div>
  );
};

export default SplitScreen;