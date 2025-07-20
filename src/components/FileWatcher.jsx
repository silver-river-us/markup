import { useState, useEffect, useRef } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, exists, readDir } from '@tauri-apps/plugin-fs';
import MarkdownPreview from './MarkdownPreview';
import { storage } from '../utils/storage';

const FileWatcher = ({ onBack, isRestoring }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [accessibleFiles, setAccessibleFiles] = useState(new Map());
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const intervalRef = useRef(null);
  const lastModifiedRef = useRef(null);

  useEffect(() => {
    // Clear any stale localStorage state that might cause permission errors
    if (isRestoring) {
      console.log('Clearing localStorage state to prevent permission errors');
      storage.clearState();
      setError(null);
    }
  }, [isRestoring]);

  const scanForMarkdownFiles = async (dirPath) => {
    const markdownFiles = new Map();
    
    const scanDirectory = async (currentPath, relativePath = '') => {
      try {
        console.log(`Scanning directory: ${currentPath}`);
        const entries = await readDir(currentPath);
        
        for (const entry of entries) {
          // Skip hidden directories and common build/cache directories
          if (entry.isDirectory && (entry.name.startsWith('.') || 
              ['node_modules', 'dist', 'build', 'target', '.git'].includes(entry.name))) {
            continue;
          }
          
          if (entry.isFile && entry.name.match(/\.(md|markdown|mdown|mkd|mdx)$/i)) {
            const fullPath = `${currentPath}/${entry.name}`;
            const relativeKey = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            console.log(`Found markdown file: ${relativeKey} -> ${fullPath}`);
            markdownFiles.set(relativeKey, fullPath);
          } else if (entry.isDirectory) {
            // Recursively scan subdirectories
            const subDirPath = `${currentPath}/${entry.name}`;
            const subRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            await scanDirectory(subDirPath, subRelativePath);
          }
        }
      } catch (error) {
        // Silently skip directories we can't access
        console.log(`Cannot access directory: ${currentPath}`, error.message);
      }
    };
    
    await scanDirectory(dirPath);
    console.log(`Found ${markdownFiles.size} total markdown files`);
    return markdownFiles;
  };

  const selectDirectory = async () => {
    try {
      setError(null);
      const directory = await open({
        title: 'Select Directory with Markdown Files',
        directory: true,
        multiple: false
      });

      console.log('Selected directory:', directory);

      if (directory && directory !== null) {
        setSelectedDirectory(directory);
        storage.saveWatchedDirectory(directory);
        
        // Scan directory for markdown files
        console.log('Scanning directory for markdown files:', directory);
        const foundFiles = await scanForMarkdownFiles(directory);
        setAccessibleFiles(foundFiles);
        console.log('Found accessible markdown files:', Object.fromEntries(foundFiles));
        
        // If files found, show file picker
        if (foundFiles.size > 0) {
          setShowFilePicker(true);
          setError(null);
        } else {
          setError('No markdown files found in the selected directory.');
        }
      }
    } catch (err) {
      console.error('Directory selection error:', err);
      setError(`Failed to select directory: ${err?.message || 'Unknown error'}`);
    }
  };

  const selectSpecificFile = async (filePath) => {
    try {
      setSelectedFile(filePath);
      storage.saveWatchedFile(filePath);
      await loadFile(filePath);
      startWatching(filePath);
      setShowFilePicker(false);
      setShowFileModal(false);
      setError(null);
    } catch (err) {
      console.error('Error selecting specific file:', err);
      setError(`Failed to load file: ${err?.message || 'Unknown error'}`);
    }
  };

  // Keep the old selectFile function as fallback
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
        await selectSpecificFile(file);
        
        // Try to scan directory for other files (may fail due to permissions)
        const fileDir = file.substring(0, file.lastIndexOf('/'));
        try {
          const foundFiles = await scanForMarkdownFiles(fileDir);
          setAccessibleFiles(foundFiles);
          setSelectedDirectory(fileDir);
          storage.saveWatchedDirectory(fileDir);
        } catch (scanError) {
          console.log('Could not scan directory, using single file mode:', scanError);
        }
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
      
      // If we get a forbidden path error, reset state and ask for reselection
      if (err.message && err.message.includes('forbidden path')) {
        setError('Lost access to file. Please select the directory again to restore permissions.');
        setSelectedFile(null);
        setSelectedDirectory(null);
        setAccessibleFiles(new Map());
        setFileContent('');
        // Clear the invalid saved state
        storage.clearState();
      } else {
        setError(`Failed to read file: ${err?.message || 'Unknown error'}`);
        setFileContent('');
      }
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
      
      // If we get a forbidden path error, stop watching and ask user to reselect
      if (err.message && err.message.includes('forbidden path')) {
        setError('Lost access to file. Please select the directory again to restore permissions.');
        stopWatching();
        setSelectedFile(null);
        setSelectedDirectory(null);
        setAccessibleFiles(new Map());
        // Clear the invalid saved state
        storage.clearState();
      }
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

  const handleLinkClick = async (relativePath) => {
    if (!selectedFile) return;
    
    try {
      const fileName = relativePath.replace('./', '');
      console.log('Link clicked for:', fileName);
      console.log('Available files:', Object.fromEntries(accessibleFiles));
      
      // Check if we have this file in our accessible files map
      let targetFilePath = null;
      
      // Try exact match first
      if (accessibleFiles.has(fileName)) {
        targetFilePath = accessibleFiles.get(fileName);
      } else {
        // Try to find a match by checking all keys
        for (const [key, value] of accessibleFiles) {
          if (key.endsWith(fileName) || key === fileName) {
            targetFilePath = value;
            break;
          }
        }
      }
      
      if (targetFilePath) {
        console.log('Switching to accessible file:', targetFilePath);
        
        // Stop watching current file
        stopWatching();
        
        // Switch to the new file
        setSelectedFile(targetFilePath);
        storage.saveWatchedFile(targetFilePath);
        await loadFile(targetFilePath);
        startWatching(targetFilePath);
        setError(null);
        
      } else {
        console.log('File not found in accessible files, prompting user');
        setError(`Cannot find "${fileName}" in accessible files. Please select this file manually.`);
        
        // Auto-open directory dialog after 2 seconds
        setTimeout(() => {
          selectDirectory();
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error in link click handler:', err);
      setError(`Failed to switch to file: ${err?.message || 'Unknown error'}`);
    }
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
            <button className="bg-indigo-600 border-0 text-white px-4 py-2 rounded text-xs font-medium transition-colors hover:bg-indigo-700 whitespace-nowrap max-sm:px-3 max-sm:py-1.5 max-sm:text-xs" onClick={selectDirectory}>
              📁 Select Directory
            </button>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <span className="text-gray-200 font-mono bg-gray-600 px-2 py-1 rounded-sm text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] max-md:max-w-[120px] max-sm:max-w-[80px] max-md:text-[11px] max-sm:text-[10px]">{selectedFile.split('/').pop()}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 max-sm:text-[10px] max-sm:px-1 ${isWatching ? 'bg-green-800 text-green-200' : 'bg-orange-800 text-orange-200'}`}>
                {isWatching ? '👁️ Watching' : '⏸️ Stopped'}
              </span>
              {accessibleFiles.size > 1 && (
                <button className="bg-blue-600 border-0 text-white px-2.5 py-1.5 rounded-sm text-[11px] transition-colors hover:bg-blue-500 whitespace-nowrap flex-shrink-0" onClick={() => setShowFileModal(true)}>
                  📄 Files ({accessibleFiles.size})
                </button>
              )}
              <button className="bg-gray-500 border-0 text-white px-2.5 py-1.5 rounded-sm text-[11px] transition-colors hover:bg-gray-400 whitespace-nowrap flex-shrink-0 max-lg:hidden" onClick={selectDirectory}>
                Change Dir
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

      {showFilePicker ? (
        <div className="flex-1 flex items-center justify-center bg-neutral-900 overflow-y-auto">
          <div className="text-center text-gray-400 p-4 max-w-2xl w-full">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-gray-200 mb-2 text-2xl font-semibold max-sm:text-xl">Select a markdown file</h3>
            <p className="mb-6 text-base max-sm:text-sm max-sm:mb-4">Found {accessibleFiles.size} markdown file{accessibleFiles.size !== 1 ? 's' : ''} in the directory</p>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Array.from(accessibleFiles.entries()).map(([relativePath, fullPath]) => (
                <button
                  key={fullPath}
                  className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-indigo-500 text-white px-4 py-3 rounded-lg text-left transition-colors group"
                  onClick={() => selectSpecificFile(fullPath)}
                >
                  <div className="font-medium text-white group-hover:text-indigo-200">
                    {relativePath}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono truncate">
                    {fullPath}
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              className="mt-6 bg-gray-600 border-0 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-700"
              onClick={() => {
                setShowFilePicker(false);
                setSelectedDirectory(null);
                setAccessibleFiles(new Map());
              }}
            >
              ← Choose Different Directory
            </button>
          </div>
        </div>
      ) : !selectedFile ? (
        <div className="flex-1 flex items-center justify-center bg-neutral-900 overflow-y-auto">
          <div className="text-center text-gray-400 p-4">
            <div className="text-6xl mb-4 max-sm:text-5xl">📄</div>
            <h3 className="text-gray-200 mb-2 text-2xl font-semibold max-sm:text-xl">No directory selected</h3>
            <p className="mb-6 text-base max-sm:text-sm max-sm:mb-4">Choose a directory with markdown files to watch</p>
            <button className="bg-indigo-600 border-0 text-white px-8 py-4 rounded-lg text-base font-semibold transition-colors hover:bg-indigo-700 max-sm:px-6 max-sm:py-3 max-sm:text-sm" onClick={selectDirectory}>
              📁 Select Directory
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <MarkdownPreview markdown={fileContent} onLinkClick={handleLinkClick} />
        </div>
      )}

      {/* File Selection Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-600 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="border-b border-neutral-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Select a file to watch</h3>
                <button 
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowFileModal(false)}
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {accessibleFiles.size} markdown file{accessibleFiles.size !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {Array.from(accessibleFiles.entries()).map(([relativePath, fullPath]) => {
                  const isCurrentFile = fullPath === selectedFile;
                  return (
                    <button
                      key={fullPath}
                      className={`w-full border text-left px-4 py-3 rounded-lg transition-colors group ${
                        isCurrentFile 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-indigo-500 text-white'
                      }`}
                      onClick={() => selectSpecificFile(fullPath)}
                      disabled={isCurrentFile}
                    >
                      <div className={`font-medium flex items-center justify-between ${
                        isCurrentFile 
                          ? 'text-white' 
                          : 'text-white group-hover:text-indigo-200'
                      }`}>
                        <span>{relativePath}</span>
                        {isCurrentFile && (
                          <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 font-mono truncate ${
                        isCurrentFile 
                          ? 'text-indigo-100' 
                          : 'text-gray-400'
                      }`}>
                        {fullPath}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="border-t border-neutral-600 px-6 py-4 bg-neutral-750">
              <div className="flex items-center justify-between">
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  onClick={() => {
                    setShowFileModal(false);
                    selectDirectory();
                  }}
                >
                  📁 Choose Different Directory
                </button>
                <button 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  onClick={() => setShowFileModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileWatcher;
