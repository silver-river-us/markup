import { useState, useEffect, useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import MarkdownPreview from './MarkdownPreview';
import { storage } from '../utils/storage';
import './FileWatcher.css';

const FileWatcher = ({ onBack, isRestoring }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const intervalRef = useRef(null);
  const lastModifiedRef = useRef(null);

  useEffect(() => {
    if (isRestoring) {
      const savedFile = storage.getWatchedFile();
      if (savedFile) {
        setSelectedFile(savedFile);
        loadFile(savedFile);
        startWatching(savedFile);
      }
    }
  }, [isRestoring]);

  const selectFile = async () => {
    try {
      setError(null);
      const file = await open({
        title: 'Select Markdown File',
        multiple: false,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx']
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ]
      });

      console.log('Selected file:', file);

      if (file && file !== null) {
        setSelectedFile(file);
        storage.saveWatchedFile(file);
        await loadFile(file);
        startWatching(file);
      }
    } catch (err) {
      console.error('File selection error:', err);
      setError(`Failed to select file: ${err?.message || 'Unknown error'}`);
    }
  };

  const loadFile = async (filePath) => {
    try {
      setError(null);
      console.log('Loading file:', filePath);
      const content = await readTextFile(filePath);
      console.log('File content loaded, length:', content.length);
      setFileContent(content);
    } catch (err) {
      console.error('Load file error:', err);
      setError(`Failed to read file: ${err?.message || 'Unknown error'}`);
      setFileContent('');
    }
  };

  const checkFileChanges = async (filePath) => {
    try {
      // Check if file still exists
      const fileExists = await exists(filePath);
      if (!fileExists) {
        setError('File was deleted');
        stopWatching();
        return;
      }

      // For simplicity, we'll just reload the file content periodically
      // In a real implementation, you might want to use file system watchers
      await loadFile(filePath);
    } catch (err) {
      console.error('Error checking file changes:', err);
    }
  };

  const startWatching = (filePath) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsWatching(true);
    // Check for changes every 500ms
    intervalRef.current = setInterval(() => {
      checkFileChanges(filePath);
    }, 500);
  };

  const stopWatching = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsWatching(false);
  };

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return (
    <div className="file-watcher">
      <div className="file-watcher-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h2>File Watcher Mode</h2>
        <div className="file-controls">
          {!selectedFile ? (
            <button className="select-file-button" onClick={selectFile}>
              📁 Select Markdown File
            </button>
          ) : (
            <div className="file-info">
              <span className="file-path">{selectedFile.split('/').pop()}</span>
              <span className={`watch-status ${isWatching ? 'watching' : 'stopped'}`}>
                {isWatching ? '👁️ Watching' : '⏸️ Stopped'}
              </span>
              <button className="change-file-button" onClick={selectFile}>
                Change File
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {!selectedFile ? (
        <div className="no-file-selected">
          <div className="no-file-content">
            <div className="no-file-icon">📄</div>
            <h3>No file selected</h3>
            <p>Choose a markdown file to watch for changes</p>
            <button className="select-file-button-large" onClick={selectFile}>
              📁 Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <MarkdownPreview markdown={fileContent} />
        </div>
      )}
    </div>
  );
};

export default FileWatcher;