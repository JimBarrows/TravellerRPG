import React, { useCallback } from 'react';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Star, 
  Lock, 
  Clock, 
  BookOpen, 
  MoreVertical,
  Eye,
  Tag
} from 'lucide-react';
import type { CharacterNote } from '../../../../types/characterSheet';
import { getCategoryColor, getCategoryIcon } from '../../../../constants/noteCategories';
import { extractPlainText } from '../../../../utils/notesUtils';
import Button from '../../../../../../shared/components/atoms/Button';
import Card, { CardContent } from '../../../../../../shared/components/molecules/Card';

interface NoteCardProps {
  note: CharacterNote;
  viewMode: 'grid' | 'list';
  selected?: boolean;
  readonly?: boolean;
  showPrivateIndicator?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleFavorite?: () => void;
  onTogglePrivate?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  selected = false,
  readonly = false,
  showPrivateIndicator = true,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onTogglePrivate,
}) => {
  const categoryColor = getCategoryColor(note.category);
  const categoryIcon = getCategoryIcon(note.category);
  
  const plainText = note.plainTextContent || extractPlainText(note.content);
  const preview = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit?.();
  }, [onEdit]);

  if (viewMode === 'list') {
    return (
      <Card 
        className={`
          cursor-pointer transition-all duration-200 hover:shadow-md
          ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${note.isPrivate ? 'border-red-200' : ''}
        `}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Selection checkbox */}
            {!readonly && onSelect && (
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelect(e.target.checked);
                  }}
                  className="rounded border-border focus:ring-blue-500"
                />
              </div>
            )}

            {/* Category indicator */}
            <div className="flex-shrink-0 pt-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColor }}
                title={note.category}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{note.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{categoryIcon} {note.category}</span>
                    {note.subcategory && (
                      <>
                        <span>•</span>
                        <span>{note.subcategory}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(note.updatedAt)}
                    </span>
                    {note.metadata?.wordCount && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {note.metadata.wordCount} words
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-1 ml-2">
                  {note.isFavorite && (
                    <Star size={16} className="text-yellow-500 fill-current" />
                  )}
                  {note.isPrivate && showPrivateIndicator && (
                    <Lock size={16} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* Preview */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {preview}
              </p>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-1 mb-2 flex-wrap">
                  {note.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {!readonly && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                  title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={16} className={note.isFavorite ? 'text-yellow-500 fill-current' : ''} />
                </Button>

                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="More actions"
                  >
                    <MoreVertical size={16} />
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1 min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.();
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate?.();
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePrivate?.();
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        {note.isPrivate ? <Eye size={14} /> : <Lock size={14} />}
                        {note.isPrivate ? 'Make Public' : 'Make Private'}
                      </button>
                      <div className="border-t border-border" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.();
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-red-600 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md h-full
        ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        ${note.isPrivate ? 'border-red-200' : ''}
      `}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Selection checkbox */}
            {!readonly && onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(e.target.checked);
                }}
                className="rounded border-border focus:ring-blue-500"
              />
            )}

            {/* Category indicator */}
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
              title={note.category}
            />

            {/* Status indicators */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {note.isFavorite && (
                <Star size={14} className="text-yellow-500 fill-current" />
              )}
              {note.isPrivate && showPrivateIndicator && (
                <Lock size={14} className="text-red-500" />
              )}
            </div>
          </div>

          {/* Actions dropdown */}
          {!readonly && (
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                title="More actions"
              >
                <MoreVertical size={16} />
              </Button>
              
              <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Star size={14} className={note.isFavorite ? 'text-yellow-500 fill-current' : ''} />
                    {note.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePrivate?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    {note.isPrivate ? <Eye size={14} /> : <Lock size={14} />}
                    {note.isPrivate ? 'Make Public' : 'Make Private'}
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium mb-2 line-clamp-2">{note.title}</h3>

        {/* Category and subcategory */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{categoryIcon} {note.category}</span>
          {note.subcategory && (
            <>
              <span>•</span>
              <span>{note.subcategory}</span>
            </>
          )}
        </div>

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-3">
          {preview}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {note.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTimeAgo(note.updatedAt)}
          </span>
          {note.metadata?.wordCount && (
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {note.metadata.wordCount} words
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;