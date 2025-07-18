import Editor from '@monaco-editor/react';

const MarkdownEditor = ({ value, onChange }) => {
  const handleEditorChange = (value) => {
    onChange(value || '');
  };

  return (
    <div className="markdown-editor">
      <div className="editor-header">
        <h3>Editor</h3>
      </div>
      <Editor
        height="calc(100vh - 60px)"
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
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
};

export default MarkdownEditor;