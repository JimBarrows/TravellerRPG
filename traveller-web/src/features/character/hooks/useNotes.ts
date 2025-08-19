import { useState, useCallback, useMemo } from 'react';
import type { CharacterNote, NoteFilter, NoteSortOptions, NoteCategory } from '../types/characterSheet';
import { DEFAULT_NOTES_CONFIG } from '../constants/noteCategories';

interface UseNotesOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseNotesReturn {
  // State
  notes: CharacterNote[];
  filteredNotes: CharacterNote[];
  isLoading: boolean;
  error: string | null;
  
  // Filters and sorting
  filters: NoteFilter;
  sortOptions: NoteSortOptions;
  searchQuery: string;
  
  // Actions
  addNote: (note: Omit<CharacterNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<CharacterNote>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePrivate: (id: string) => void;
  
  // Filtering and searching
  setFilters: (filters: Partial<NoteFilter>) => void;
  setSortOptions: (options: NoteSortOptions) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Bulk operations
  deleteSelectedNotes: (ids: string[]) => void;
  updateSelectedNotes: (ids: string[], updates: Partial<CharacterNote>) => void;
  exportNotes: (format: 'json' | 'markdown') => string;
  
  // Statistics
  getNotesStats: () => {
    total: number;
    byCategory: Record<string, number>;
    favorites: number;
    private: number;
    totalWordCount: number;
  };
}

export const useNotes = (
  initialNotes: CharacterNote[] = [],
  onNotesChange?: (notes: CharacterNote[]) => void,
  options: UseNotesOptions = {}
): UseNotesReturn => {
  const [notes, setNotes] = useState<CharacterNote[]>(initialNotes);
  const [filters, setFiltersState] = useState<NoteFilter>({});
  const [sortOptions, setSortOptionsState] = useState<NoteSortOptions>({
    field: 'updatedAt',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update notes when they change
  const handleNotesChange = useCallback((newNotes: CharacterNote[]) => {
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  // Add a new note
  const addNote = useCallback((noteData: Omit<CharacterNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: CharacterNote = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      metadata: {
        ...noteData.metadata,
        wordCount: noteData.plainTextContent?.split(/\s+/).length || 0,
        characterCount: noteData.content.length,
        readTimeMinutes: Math.ceil((noteData.plainTextContent?.split(/\s+/).length || 0) / 200),
      },
    };

    handleNotesChange([...notes, newNote]);
  }, [notes, handleNotesChange]);

  // Update an existing note
  const updateNote = useCallback((id: string, updates: Partial<CharacterNote>) => {
    const now = new Date().toISOString();
    
    handleNotesChange(
      notes.map(note => 
        note.id === id 
          ? {
              ...note,
              ...updates,
              updatedAt: now,
              metadata: {
                ...note.metadata,
                ...updates.metadata,
                wordCount: updates.plainTextContent?.split(/\s+/).length || note.metadata?.wordCount,
                characterCount: updates.content?.length || note.metadata?.characterCount,
                readTimeMinutes: Math.ceil((updates.plainTextContent?.split(/\s+/).length || note.metadata?.wordCount || 0) / 200),
              },
            }
          : note
      )
    );
  }, [notes, handleNotesChange]);

  // Delete a note
  const deleteNote = useCallback((id: string) => {
    handleNotesChange(notes.filter(note => note.id !== id));
  }, [notes, handleNotesChange]);

  // Duplicate a note
  const duplicateNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      addNote({
        ...note,
        title: `${note.title} (Copy)`,
        isFavorite: false,
      });
    }
  }, [notes, addNote]);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    updateNote(id, { 
      isFavorite: !notes.find(n => n.id === id)?.isFavorite 
    });
  }, [notes, updateNote]);

  // Toggle private status
  const togglePrivate = useCallback((id: string) => {
    updateNote(id, { 
      isPrivate: !notes.find(n => n.id === id)?.isPrivate 
    });
  }, [notes, updateNote]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<NoteFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Set sort options
  const setSortOptions = useCallback((options: NoteSortOptions) => {
    setSortOptionsState(options);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchQuery('');
  }, []);

  // Bulk delete
  const deleteSelectedNotes = useCallback((ids: string[]) => {
    handleNotesChange(notes.filter(note => !ids.includes(note.id)));
  }, [notes, handleNotesChange]);

  // Bulk update
  const updateSelectedNotes = useCallback((ids: string[], updates: Partial<CharacterNote>) => {
    const now = new Date().toISOString();
    
    handleNotesChange(
      notes.map(note => 
        ids.includes(note.id) 
          ? { ...note, ...updates, updatedAt: now }
          : note
      )
    );
  }, [notes, handleNotesChange]);

  // Export notes
  const exportNotes = useCallback((format: 'json' | 'markdown' = 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(notes, null, 2);
    }

    // Markdown export
    const markdown = notes.map(note => {
      const date = new Date(note.createdAt).toLocaleDateString();
      const tags = note.tags?.map(tag => `#${tag}`).join(' ') || '';
      
      return `# ${note.title}

**Category:** ${note.category}${note.subcategory ? ` > ${note.subcategory}` : ''}
**Created:** ${date}
**Tags:** ${tags}
${note.isPrivate ? '**Private Note**' : ''}
${note.isFavorite ? '**⭐ Favorite**' : ''}

${note.plainTextContent || note.content}

---
`;
    }).join('\n');

    return markdown;
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(note => note.category === filters.category);
    }

    if (filters.subcategory) {
      filtered = filtered.filter(note => note.subcategory === filters.subcategory);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(note => 
        filters.tags!.some(tag => note.tags?.includes(tag))
      );
    }

    if (filters.isPrivate !== undefined) {
      filtered = filtered.filter(note => note.isPrivate === filters.isPrivate);
    }

    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(note => note.isFavorite === filters.isFavorite);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= start && noteDate <= end;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.plainTextContent?.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'wordCount':
          aValue = a.metadata?.wordCount || 0;
          bValue = b.metadata?.wordCount || 0;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [notes, filters, searchQuery, sortOptions]);

  // Get statistics
  const getNotesStats = useCallback(() => {
    const byCategory: Record<string, number> = {};
    let favorites = 0;
    let privateNotes = 0;
    let totalWordCount = 0;

    notes.forEach(note => {
      // Count by category
      byCategory[note.category] = (byCategory[note.category] || 0) + 1;

      // Count favorites and private notes
      if (note.isFavorite) favorites++;
      if (note.isPrivate) privateNotes++;

      // Sum word counts
      totalWordCount += note.metadata?.wordCount || 0;
    });

    return {
      total: notes.length,
      byCategory,
      favorites,
      private: privateNotes,
      totalWordCount,
    };
  }, [notes]);

  return {
    // State
    notes,
    filteredNotes,
    isLoading,
    error,
    
    // Filters and sorting
    filters,
    sortOptions,
    searchQuery,
    
    // Actions
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    toggleFavorite,
    togglePrivate,
    
    // Filtering and searching
    setFilters,
    setSortOptions,
    setSearchQuery,
    clearFilters,
    
    // Bulk operations
    deleteSelectedNotes,
    updateSelectedNotes,
    exportNotes,
    
    // Statistics
    getNotesStats,
  };
};