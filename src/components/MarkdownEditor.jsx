import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const MarkdownEditor = ({ value, onChange }) => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsNarrowScreen(window.innerWidth <= 768);
    };

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  const handleEditorChange = (value) => {
    onChange(value || '');
  };

  const editorHeight = isNarrowScreen ? 'calc(50vh - 28px)' : 'calc(100vh - 76px)';

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="bg-neutral-700 px-4 py-1 border-b border-neutral-600 text-white text-xs font-medium flex-shrink-0 h-7 flex items-center">
        <h3>Editor</h3>
      </div>
      <Editor
        height={editorHeight}
        defaultLanguage="markdown"
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          }
        }}
      />
    </div>
  );
};

export default MarkdownEditor;