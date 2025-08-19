import React, { useState } from 'react';
import { X, Calendar, Tag, Star, Lock, Filter } from 'lucide-react';
import type { NoteFilter, NoteCategoryDefinition } from '../../../../types/characterSheet';
import Button from '../../../../../../shared/components/atoms/Button';

interface NoteFiltersProps {
  filters: NoteFilter;
  onFiltersChange: (filters: Partial<NoteFilter>) => void;
  categories: NoteCategoryDefinition[];
  availableTags: string[];
}

const NoteFilters: React.FC<NoteFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  availableTags,
}) => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === filters.category);
  const subcategoryOptions = selectedCategory?.subcategories || [];

  const handleClearFilter = (filterKey: keyof NoteFilter) => {
    onFiltersChange({ [filterKey]: undefined });
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({})}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="relative">
            <select
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ 
                category: e.target.value || undefined,
                subcategory: undefined // Reset subcategory when category changes
              })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {filters.category && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearFilter('category')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1"
              >
                <X size={12} />
              </Button>
            )}
          </div>
        </div>

        {/* Subcategory filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Subcategory</label>
          <div className="relative">
            <select
              value={filters.subcategory || ''}
              onChange={(e) => onFiltersChange({ subcategory: e.target.value || undefined })}
              disabled={!filters.category || subcategoryOptions.length === 0}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-muted disabled:text-muted-foreground"
            >
              <option value="">All subcategories</option>
              {subcategoryOptions.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            {filters.subcategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearFilter('subcategory')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
              >
                <X size={12} />
              </Button>
            )}
          </div>
        </div>

        {/* Status filters */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isFavorite === true}
                onChange={(e) => onFiltersChange({ 
                  isFavorite: e.target.checked ? true : undefined 
                })}
                className="rounded border-border focus:ring-blue-500"
              />
              <Star size={14} className="text-yellow-500" />
              <span className="text-sm">Favorites only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isPrivate === true}
                onChange={(e) => onFiltersChange({ 
                  isPrivate: e.target.checked ? true : undefined 
                })}
                className="rounded border-border focus:ring-blue-500"
              />
              <Lock size={14} className="text-red-500" />
              <span className="text-sm">Private only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tags filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Tags</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="text-xs"
          >
            <Tag size={12} className="mr-1" />
            {showTagFilter ? 'Hide' : 'Show'} tags
          </Button>
        </div>

        {showTagFilter && (
          <div className="space-y-2">
            {/* Selected tags */}
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available tags */}
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(tag => !filters.tags?.includes(tag))
                  .slice(0, 20)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded-md text-xs transition-colors"
                    >
                      <Tag size={10} />
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date range filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Date Range</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDateRange(!showDateRange)}
            className="text-xs"
          >
            <Calendar size={12} className="mr-1" />
            {showDateRange ? 'Hide' : 'Show'} dates
          </Button>
        </div>

        {showDateRange && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => onFiltersChange({
                  dateRange: e.target.value 
                    ? { 
                        start: e.target.value, 
                        end: filters.dateRange?.end || new Date().toISOString().split('T')[0] 
                      }
                    : undefined
                })}
                className="w-full px-2 py-1 border border-border rounded text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => onFiltersChange({
                  dateRange: e.target.value && filters.dateRange?.start
                    ? { 
                        start: filters.dateRange.start, 
                        end: e.target.value 
                      }
                    : undefined
                })}
                className="w-full px-2 py-1 border border-border rounded text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filters.dateRange && (
              <div className="col-span-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('dateRange')}
                  className="text-xs w-full"
                >
                  Clear date range
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteFilters;