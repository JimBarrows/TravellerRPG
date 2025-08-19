import React from 'react';
import { Trash2, Star, Lock, Eye, CheckSquare, Square } from 'lucide-react';
import Button from '../../../../../../shared/components/atoms/Button';
import Card, { CardContent } from '../../../../../../shared/components/molecules/Card';

interface BulkActionsProps {
  selectedCount: number;
  isAllSelected: boolean;
  onAction: (action: string) => void;
  onSelectAll: (selected: boolean) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  isAllSelected,
  onAction,
  onSelectAll,
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Select all toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={() => onSelectAll(!isAllSelected)}
                className="p-1 hover:bg-blue-100 rounded"
              >
                {isAllSelected ? (
                  <CheckSquare size={16} className="text-blue-600" />
                ) : (
                  <Square size={16} className="text-blue-600" />
                )}
              </button>
              <span className="text-sm font-medium">
                {selectedCount} note{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </label>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('favorite')}
                title="Add to favorites"
                className="text-blue-600 hover:bg-blue-100"
              >
                <Star size={16} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('unfavorite')}
                title="Remove from favorites"
                className="text-blue-600 hover:bg-blue-100"
              >
                <Star size={16} className="fill-current" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('private')}
                title="Make private"
                className="text-blue-600 hover:bg-blue-100"
              >
                <Lock size={16} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('public')}
                title="Make public"
                className="text-blue-600 hover:bg-blue-100"
              >
                <Eye size={16} />
              </Button>

              <div className="w-px h-4 bg-blue-300 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('delete')}
                title="Delete selected"
                className="text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectAll(false)}
            className="text-blue-600 hover:bg-blue-100"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActions;