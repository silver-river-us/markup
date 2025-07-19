// Utility functions for localStorage persistence

const STORAGE_KEYS = {
  LAST_MODE: 'markup_last_mode',
  EDITOR_CONTENT: 'markup_editor_content',
  WATCHED_FILE: 'markup_watched_file',
  LAST_USED: 'markup_last_used'
};

export const storage = {
  // Save the last used mode and timestamp
  saveLastMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_MODE, mode);
      localStorage.setItem(STORAGE_KEYS.LAST_USED, Date.now().toString());
    } catch (error) {
      console.warn('Failed to save last mode to localStorage:', error);
    }
  },

  // Get the last used mode
  getLastMode: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_MODE);
    } catch (error) {
      console.warn('Failed to get last mode from localStorage:', error);
      return null;
    }
  },

  // Save editor content
  saveEditorContent: (content) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDITOR_CONTENT, content);
    } catch (error) {
      console.warn('Failed to save editor content to localStorage:', error);
    }
  },

  // Get editor content
  getEditorContent: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.EDITOR_CONTENT);
    } catch (error) {
      console.warn('Failed to get editor content from localStorage:', error);
      return null;
    }
  },

  // Save watched file path
  saveWatchedFile: (filePath) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHED_FILE, filePath);
    } catch (error) {
      console.warn('Failed to save watched file to localStorage:', error);
    }
  },

  // Get watched file path
  getWatchedFile: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WATCHED_FILE);
    } catch (error) {
      console.warn('Failed to get watched file from localStorage:', error);
      return null;
    }
  },

  // Get last used timestamp
  getLastUsed: () => {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_USED);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.warn('Failed to get last used timestamp from localStorage:', error);
      return null;
    }
  },

  // Check if there's any saved state
  hasSavedState: () => {
    const lastMode = storage.getLastMode();
    return lastMode === 'editor' || lastMode === 'watcher';
  },

  // Clear all saved state
  clearState: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear state from localStorage:', error);
    }
  }
};