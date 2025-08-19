import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryEntry<T> {
  data: T;
  timestamp: Date;
  description: string;
  type: 'auto' | 'manual' | 'checkpoint';
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  autoSaveInterval?: number;
  enableKeyboardShortcuts?: boolean;
}

interface UseUndoRedoReturn<T> {
  // State
  currentData: T;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
  redoSize: number;
  
  // Actions
  pushHistory: (data: T, description?: string, type?: 'auto' | 'manual' | 'checkpoint') => void;
  undo: () => T | null;
  redo: () => T | null;
  clearHistory: () => void;
  createCheckpoint: (description?: string) => void;
  
  // Utils
  getHistoryPreview: () => Array<{ description: string; timestamp: Date; type: string }>;
  jumpToHistory: (index: number) => T | null;
}

export const useUndoRedo = <T>(
  initialData: T,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> => {
  const {
    maxHistorySize = 50,
    debounceMs = 1000,
    autoSaveInterval = 30000,
    enableKeyboardShortcuts = true,
  } = options;

  const [currentData, setCurrentData] = useState<T>(initialData);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const historyRef = useRef<HistoryEntry<T>[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const lastManualSaveRef = useRef<Date>(new Date());

  // Initialize with first entry
  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current.push({
        data: initialData,
        timestamp: new Date(),
        description: 'Initial state',
        type: 'checkpoint',
      });
      setHistoryIndex(0);
    }
  }, [initialData]);

  // Deep clone function (simple JSON-based cloning)
  const deepClone = useCallback((obj: T): T => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj; // Fallback for non-serializable objects
    }
  }, []);

  // Check if data has changed significantly
  const hasSignificantChange = useCallback((oldData: T, newData: T): boolean => {
    try {
      const oldStr = JSON.stringify(oldData);
      const newStr = JSON.stringify(newData);
      return oldStr !== newStr;
    } catch {
      return true; // Assume change if can't compare
    }
  }, []);

  // Add entry to history
  const pushHistory = useCallback((
    data: T,
    description = 'Auto save',
    type: 'auto' | 'manual' | 'checkpoint' = 'auto'
  ) => {
    const now = new Date();
    
    // Don't add if data hasn't changed significantly
    if (historyRef.current.length > 0) {
      const lastEntry = historyRef.current[historyIndex];
      if (!hasSignificantChange(lastEntry.data, data)) {
        return;
      }
    }

    // Create new entry
    const newEntry: HistoryEntry<T> = {
      data: deepClone(data),
      timestamp: now,
      description,
      type,
    };

    // If we're not at the end of history, truncate the redo stack
    if (historyIndex < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndex + 1);
    }

    // Add new entry
    historyRef.current.push(newEntry);

    // Maintain max history size
    if (historyRef.current.length > maxHistorySize) {
      // Keep checkpoints and recent entries
      const checkpoints = historyRef.current.filter(entry => entry.type === 'checkpoint');
      const recentEntries = historyRef.current.slice(-Math.floor(maxHistorySize * 0.7));
      
      // Merge, avoiding duplicates
      const merged = [...checkpoints];
      recentEntries.forEach(entry => {
        if (!merged.find(m => m.timestamp.getTime() === entry.timestamp.getTime())) {
          merged.push(entry);
        }
      });
      
      // Sort by timestamp and keep within limit
      historyRef.current = merged
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-maxHistorySize);
    }

    setHistoryIndex(historyRef.current.length - 1);
    setCurrentData(data);

    if (type === 'manual') {
      lastManualSaveRef.current = now;
    }
  }, [historyIndex, maxHistorySize, deepClone, hasSignificantChange]);

  // Undo last change
  const undo = useCallback((): T | null => {
    if (historyIndex <= 0) {
      return null;
    }

    const newIndex = historyIndex - 1;
    const entry = historyRef.current[newIndex];
    
    setHistoryIndex(newIndex);
    setCurrentData(entry.data);
    
    return entry.data;
  }, [historyIndex]);

  // Redo last undone change
  const redo = useCallback((): T | null => {
    if (historyIndex >= historyRef.current.length - 1) {
      return null;
    }

    const newIndex = historyIndex + 1;
    const entry = historyRef.current[newIndex];
    
    setHistoryIndex(newIndex);
    setCurrentData(entry.data);
    
    return entry.data;
  }, [historyIndex]);

  // Clear all history
  const clearHistory = useCallback(() => {
    historyRef.current = [{
      data: deepClone(currentData),
      timestamp: new Date(),
      description: 'History cleared',
      type: 'checkpoint',
    }];
    setHistoryIndex(0);
  }, [currentData, deepClone]);

  // Create a checkpoint
  const createCheckpoint = useCallback((description = 'Manual checkpoint') => {
    pushHistory(currentData, description, 'checkpoint');
  }, [currentData, pushHistory]);

  // Get history preview for UI
  const getHistoryPreview = useCallback(() => {
    return historyRef.current.map(entry => ({
      description: entry.description,
      timestamp: entry.timestamp,
      type: entry.type,
    }));
  }, []);

  // Jump to specific history entry
  const jumpToHistory = useCallback((index: number): T | null => {
    if (index < 0 || index >= historyRef.current.length) {
      return null;
    }

    const entry = historyRef.current[index];
    setHistoryIndex(index);
    setCurrentData(entry.data);
    
    return entry.data;
  }, []);

  // Debounced auto-save
  const debouncedPushHistory = useCallback((data: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      pushHistory(data, 'Auto save', 'auto');
    }, debounceMs);
  }, [pushHistory, debounceMs]);

  // Auto-save interval
  useEffect(() => {
    if (autoSaveInterval > 0) {
      autoSaveRef.current = setInterval(() => {
        const timeSinceLastManual = new Date().getTime() - lastManualSaveRef.current.getTime();
        
        if (timeSinceLastManual >= autoSaveInterval) {
          pushHistory(currentData, 'Periodic checkpoint', 'checkpoint');
        }
      }, autoSaveInterval);

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
      };
    }
  }, [autoSaveInterval, currentData, pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            if (event.shiftKey) {
              // Ctrl+Shift+Z or Cmd+Shift+Z for redo
              event.preventDefault();
              redo();
            } else {
              // Ctrl+Z or Cmd+Z for undo
              event.preventDefault();
              undo();
            }
            break;
            
          case 'y':
            // Ctrl+Y or Cmd+Y for redo (alternative)
            event.preventDefault();
            redo();
            break;
            
          case 's':
            // Ctrl+S or Cmd+S for manual checkpoint
            event.preventDefault();
            createCheckpoint('Manual save');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo, createCheckpoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  // Update current data and trigger debounced save
  const updateData = useCallback((newData: T) => {
    setCurrentData(newData);
    debouncedPushHistory(newData);
  }, [debouncedPushHistory]);

  return {
    currentData,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < historyRef.current.length - 1,
    historySize: historyIndex + 1,
    redoSize: historyRef.current.length - historyIndex - 1,
    pushHistory,
    undo,
    redo,
    clearHistory,
    createCheckpoint,
    getHistoryPreview,
    jumpToHistory,
  };
};