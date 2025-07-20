import { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import { storage } from '../services/storage';

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
    <div className="flex flex-col h-screen bg-neutral-900 overflow-hidden">
      <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-600 flex items-center gap-3 flex-shrink-0 min-h-[48px] max-md:px-3 max-md:py-2 max-md:gap-2 max-sm:px-2">
        <button className="bg-gray-600 border border-gray-500 text-gray-200 px-3 py-1.5 rounded text-xs transition-colors hover:bg-gray-500 flex-shrink-0 max-md:px-2 max-md:py-1 max-sm:px-2 max-sm:py-1 max-sm:text-xs" onClick={onBack}>
          ← Back to Home
        </button>
        <h2 className="text-white m-0 text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-md:hidden">Editor Mode</h2>
      </div>
      <div className="flex flex-1 overflow-hidden max-md:flex-col">
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-48px)] border-r border-neutral-600 max-md:h-[50vh] max-md:min-h-[250px] max-md:border-r-0 max-md:border-b max-md:border-neutral-600">
          <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-48px)] max-md:h-[50vh] max-md:min-h-[250px]">
          <MarkdownPreview markdown={markdown} onLinkClick={null} currentFilePath={null} />
        </div>
      </div>
    </div>
  );
};

export default SplitScreen;
