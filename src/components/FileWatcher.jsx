import { useState, useEffect, useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import MarkdownPreview from './MarkdownPreview';
import { storage } from '../utils/storage';

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
    <div className="h-screen flex flex-col bg-neutral-900">
      <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-600 flex items-center gap-3 flex-shrink-0 min-h-[48px] max-md:px-3 max-md:py-2 max-md:gap-2 max-sm:px-2">
        <button className="bg-gray-600 border border-gray-500 text-gray-200 px-3 py-1.5 rounded text-xs transition-colors hover:bg-gray-500 flex-shrink-0 max-md:px-2 max-md:py-1 max-sm:px-2 max-sm:py-1 max-sm:text-xs" onClick={onBack}>
          ← Back to Home
        </button>
        <h2 className="text-white m-0 text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-md:hidden">File Watcher Mode</h2>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {!selectedFile ? (
            <button className="bg-indigo-600 border-0 text-white px-4 py-2 rounded text-xs font-medium transition-colors hover:bg-indigo-700 whitespace-nowrap max-sm:px-3 max-sm:py-1.5 max-sm:text-xs" onClick={selectFile}>
              📁 Select Markdown File
            </button>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <span className="text-gray-200 font-mono bg-gray-600 px-2 py-1 rounded-sm text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] max-md:max-w-[120px] max-sm:max-w-[80px] max-md:text-[11px] max-sm:text-[10px]">{selectedFile.split('/').pop()}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 max-sm:text-[10px] max-sm:px-1 ${isWatching ? 'bg-green-800 text-green-200' : 'bg-orange-800 text-orange-200'}`}>
                {isWatching ? '👁️ Watching' : '⏸️ Stopped'}
              </span>
              <button className="bg-gray-500 border-0 text-white px-2.5 py-1.5 rounded-sm text-[11px] transition-colors hover:bg-gray-400 whitespace-nowrap flex-shrink-0 max-lg:hidden" onClick={selectFile}>
                Change File
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-600 text-white px-6 py-3 text-sm font-medium flex-shrink-0 max-sm:px-4 max-sm:py-2 max-sm:text-xs">
          ⚠️ {error}
        </div>
      )}

      {!selectedFile ? (
        <div className="flex-1 flex items-center justify-center bg-neutral-900 overflow-y-auto">
          <div className="text-center text-gray-400 p-4">
            <div className="text-6xl mb-4 max-sm:text-5xl">📄</div>
            <h3 className="text-gray-200 mb-2 text-2xl font-semibold max-sm:text-xl">No file selected</h3>
            <p className="mb-6 text-base max-sm:text-sm max-sm:mb-4">Choose a markdown file to watch for changes</p>
            <button className="bg-indigo-600 border-0 text-white px-8 py-4 rounded-lg text-base font-semibold transition-colors hover:bg-indigo-700 max-sm:px-6 max-sm:py-3 max-sm:text-sm" onClick={selectFile}>
              📁 Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <MarkdownPreview markdown={fileContent} />
        </div>
      )}
    </div>
  );
};

export default FileWatcher;
