import React, { useEffect, useState } from 'react';

interface SaveStatusProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  conflictDetected?: boolean;
  className?: string;
  showTimestamp?: boolean;
  onRetry?: () => void;
  onResolveConflict?: () => void;
}

const SaveStatus: React.FC<SaveStatusProps> = ({
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  saveError,
  conflictDetected = false,
  className = '',
  showTimestamp = true,
  onRetry,
  onResolveConflict,
}) => {
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Update relative time every minute
  useEffect(() => {
    if (!lastSaved) return;

    const updateRelativeTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 60) {
        setRelativeTime('just now');
      } else if (diffMinutes < 60) {
        setRelativeTime(`${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`);
      } else if (diffHours < 24) {
        setRelativeTime(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      } else {
        setRelativeTime(lastSaved.toLocaleDateString());
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Priority order: Conflict > Error > Saving > Unsaved > Saved
  const getStatusContent = () => {
    // Conflict detected
    if (conflictDetected) {
      return {
        icon: (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
          </svg>
        ),
        text: 'Conflict detected',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        action: onResolveConflict && (
          <button
            onClick={onResolveConflict}
            className="ml-2 text-xs text-orange-700 hover:text-orange-800 underline focus:outline-none"
          >
            Resolve
          </button>
        ),
      };
    }

    // Save error
    if (saveError) {
      return {
        icon: (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        text: 'Save failed',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        action: onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-xs text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            Retry
          </button>
        ),
        details: saveError,
      };
    }

    // Currently saving
    if (isSaving) {
      return {
        icon: (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ),
        text: 'Saving...',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
      };
    }

    // Has unsaved changes
    if (hasUnsavedChanges) {
      return {
        icon: (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Unsaved changes',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
      };
    }

    // Successfully saved
    if (lastSaved) {
      return {
        icon: (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        text: showTimestamp ? `Saved ${relativeTime}` : 'Saved',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
      };
    }

    // Default state
    return {
      icon: (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      text: 'Ready',
      textColor: 'text-gray-500',
      bgColor: 'bg-gray-50 border-gray-200',
    };
  };

  const status = getStatusContent();

  return (
    <div 
      className={`inline-flex items-center px-3 py-2 rounded-md border text-sm ${status.bgColor} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center space-x-2">
        {status.icon}
        <span className={`font-medium ${status.textColor}`}>
          {status.text}
        </span>
        {status.action}
      </div>
      
      {status.details && (
        <div className="ml-2 text-xs text-gray-600 max-w-xs truncate" title={status.details}>
          {status.details}
        </div>
      )}
    </div>
  );
};

export default SaveStatus;