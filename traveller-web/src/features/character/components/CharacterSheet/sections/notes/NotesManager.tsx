import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, Filter, Download, Upload, Grid, List, Star, Lock, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { useNotes } from '../../../../hooks/useNotes';
import { DEFAULT_NOTE_CATEGORIES, COMMON_TAGS } from '../../../../constants/noteCategories';
import { createNoteTemplate } from '../../../../utils/notesUtils';
import type { CharacterNote, NoteFilter, NoteSortOptions, CharacterSheetSectionProps } from '../../../../types/characterSheet';
import Button from '../../../../../../shared/components/atoms/Button';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import NoteFilters from './NoteFilters';
import BulkActions from './BulkActions';
import ImportExportModal from './ImportExportModal';

interface NotesManagerProps extends CharacterSheetSectionProps {
  viewMode?: 'grid' | 'list';
  showPrivateNotes?: boolean;
}

const NotesManager: React.FC<NotesManagerProps> = ({
  character,
  onUpdate,
  readonly = false,
  viewMode: initialViewMode = 'grid',
  showPrivateNotes: initialShowPrivate = true,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showPrivateNotes, setShowPrivateNotes] = useState(initialShowPrivate);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<CharacterNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'export' | 'import'>('export');

  const {
    notes,
    filteredNotes,
    filters,
    sortOptions,
    searchQuery,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    toggleFavorite,
    togglePrivate,
    setFilters,
    setSortOptions,
    setSearchQuery,
    clearFilters,
    deleteSelectedNotes,
    updateSelectedNotes,
    exportNotes,
    getNotesStats,
  } = useNotes(character.notes || [], (newNotes) => {
    onUpdate({ notes: newNotes });
  });

  // Filter out private notes if user can't see them
  const visibleNotes = useMemo(() => {
    return filteredNotes.filter(note => showPrivateNotes || !note.isPrivate);
  }, [filteredNotes, showPrivateNotes]);

  const stats = getNotesStats();

  const handleCreateNote = useCallback((category?: string, subcategory?: string) => {
    const template = createNoteTemplate(category || 'personal', subcategory);
    setEditingNote({
      id: '',
      title: template.title || 'New Note',
      content: template.content || '<p>Start writing your note here...</p>',
      plainTextContent: '',
      category: template.category || 'personal',
      subcategory: template.subcategory,
      isPrivate: false,
      createdAt: '',
      updatedAt: '',
      tags: [],
    } as CharacterNote);
    setIsCreating(true);
  }, []);

  const handleSaveNote = useCallback((noteData: CharacterNote) => {
    if (isCreating) {
      addNote(noteData);
      setIsCreating(false);
    } else {
      updateNote(noteData.id, noteData);
    }
    setEditingNote(null);
  }, [isCreating, addNote, updateNote]);

  const handleDeleteNote = useCallback((noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
    }
  }, [deleteNote]);

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} notes?`)) {
          deleteSelectedNotes(selectedNotes);
          setSelectedNotes([]);
        }
        break;
      case 'favorite':
        updateSelectedNotes(selectedNotes, { isFavorite: true });
        break;
      case 'unfavorite':
        updateSelectedNotes(selectedNotes, { isFavorite: false });
        break;
      case 'private':
        updateSelectedNotes(selectedNotes, { isPrivate: true });
        break;
      case 'public':
        updateSelectedNotes(selectedNotes, { isPrivate: false });
        break;
      default:
        break;
    }
  }, [selectedNotes, deleteSelectedNotes, updateSelectedNotes]);

  const handleImportNotes = useCallback((importedNotes: CharacterNote[]) => {
    // Add imported notes to existing notes
    const allNotes = [...notes, ...importedNotes];
    onUpdate({ notes: allNotes });
  }, [notes, onUpdate]);

  const handleSelectNote = useCallback((noteId: string, selected: boolean) => {
    setSelectedNotes(prev => 
      selected 
        ? [...prev, noteId]
        : prev.filter(id => id !== noteId)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedNotes(selected ? visibleNotes.map(note => note.id) : []);
  }, [visibleNotes]);

  if (editingNote) {
    return (
      <NoteEditor
        note={editingNote}
        isCreating={isCreating}
        onSave={handleSaveNote}
        onCancel={() => {
          setEditingNote(null);
          setIsCreating(false);
        }}
        readonly={readonly}
        categories={DEFAULT_NOTE_CATEGORIES}
        commonTags={COMMON_TAGS}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Notes & Background</h2>
              <p className="text-sm text-muted-foreground">
                {stats.total} notes • {stats.totalWordCount} words
                {stats.favorites > 0 && (
                  <> • <Star size={14} className="inline text-yellow-500" /> {stats.favorites} favorites</>
                )}
                {stats.private > 0 && (
                  <> • <Lock size={14} className="inline text-red-500" /> {stats.private} private</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List size={16} />
                </Button>
              </div>

              {/* Private notes toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivateNotes(!showPrivateNotes)}
                title={showPrivateNotes ? 'Hide private notes' : 'Show private notes'}
              >
                {showPrivateNotes ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>

              {/* Import/Export */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Import/Export notes"
                >
                  <MoreVertical size={16} />
                </Button>
                
                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1 min-w-[140px]">
                    <button
                      onClick={() => {
                        setImportExportMode('export');
                        setShowImportExport(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Download size={14} />
                      Export Notes
                    </button>
                    <button
                      onClick={() => {
                        setImportExportMode('import');
                        setShowImportExport(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Upload size={14} />
                      Import Notes
                    </button>
                  </div>
                </div>
              </div>

              {/* Add note */}
              {!readonly && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateNote()}
                >
                  <Plus size={16} className="mr-1" />
                  Add Note
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and filters */}
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  ×
                </Button>
              )}
            </div>

            {/* Filters toggle and quick filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} className="mr-1" />
                  Filters
                </Button>

                {/* Quick filter chips */}
                <div className="flex items-center gap-1">
                  {Object.entries(stats.byCategory)
                    .filter(([_, count]) => count > 0)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <Button
                        key={category}
                        variant={filters.category === category ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilters({ 
                          category: filters.category === category ? undefined : category as any 
                        })}
                        className="text-xs"
                      >
                        {category} ({count})
                      </Button>
                    ))}
                </div>

                {(Object.keys(filters).length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Sort options */}
              <select
                value={`${sortOptions.field}-${sortOptions.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortOptions({ 
                    field: field as any, 
                    direction: direction as 'asc' | 'desc' 
                  });
                }}
                className="text-sm border border-border rounded px-2 py-1"
              >
                <option value="updatedAt-desc">Recently updated</option>
                <option value="createdAt-desc">Recently created</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="category-asc">Category</option>
                <option value="wordCount-desc">Longest</option>
                <option value="wordCount-asc">Shortest</option>
              </select>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <NoteFilters
                filters={filters}
                onFiltersChange={setFilters}
                categories={DEFAULT_NOTE_CATEGORIES}
                availableTags={COMMON_TAGS}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedNotes.length > 0 && !readonly && (
        <BulkActions
          selectedCount={selectedNotes.length}
          onAction={handleBulkAction}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedNotes.length === visibleNotes.length}
        />
      )}

      {/* Notes grid/list */}
      {visibleNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-lg font-medium mb-2">
              {notes.length === 0 ? 'No Notes Yet' : 'No Notes Match Filters'}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {notes.length === 0 
                ? 'Start documenting your character\'s story, background, and adventures'
                : 'Try adjusting your search terms or filters'
              }
            </div>
            {!readonly && notes.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {DEFAULT_NOTE_CATEGORIES.slice(0, 4).map(category => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateNote(category.id)}
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }>
          {visibleNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              selected={selectedNotes.includes(note.id)}
              onSelect={(selected) => handleSelectNote(note.id, selected)}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
              onDuplicate={() => duplicateNote(note.id)}
              onToggleFavorite={() => toggleFavorite(note.id)}
              onTogglePrivate={() => togglePrivate(note.id)}
              readonly={readonly}
              showPrivateIndicator={!readonly}
            />
          ))}
        </div>
      )}

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        mode={importExportMode}
        notes={notes}
        onImportNotes={handleImportNotes}
      />
    </div>
  );
};

export default NotesManager;