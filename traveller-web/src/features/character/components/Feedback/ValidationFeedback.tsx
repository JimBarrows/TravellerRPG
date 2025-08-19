import React from 'react';

interface ValidationError {
  field: string;
  messages: string[];
}

interface ValidationFeedbackProps {
  errors: ValidationError[];
  warnings?: ValidationError[];
  className?: string;
  showErrorCount?: boolean;
  showFieldNames?: boolean;
  maxDisplayedErrors?: number;
  onDismiss?: (errorField: string) => void;
  onDismissAll?: () => void;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors = [],
  warnings = [],
  className = '',
  showErrorCount = true,
  showFieldNames = true,
  maxDisplayedErrors = 10,
  onDismiss,
  onDismissAll,
}) => {
  const totalErrors = errors.length;
  const totalWarnings = warnings.length;
  const hasErrors = totalErrors > 0;
  const hasWarnings = totalWarnings > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  const displayedErrors = errors.slice(0, maxDisplayedErrors);
  const hiddenErrorCount = Math.max(0, totalErrors - maxDisplayedErrors);

  const formatFieldName = (field: string): string => {
    return field
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' → ');
  };

  const getErrorIcon = () => (
    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  const getWarningIcon = () => (
    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
    </svg>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Section */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getErrorIcon()}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {showErrorCount && totalErrors > 1 
                    ? `${totalErrors} Validation Errors` 
                    : 'Validation Error'
                  }
                </h3>
                
                <div className="mt-2 space-y-2">
                  {displayedErrors.map((error, index) => (
                    <div key={`${error.field}-${index}`} className="text-sm text-red-700">
                      {showFieldNames && (
                        <div className="font-medium text-red-800">
                          {formatFieldName(error.field)}
                        </div>
                      )}
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {error.messages.map((message, msgIndex) => (
                          <li key={msgIndex} className="break-words">
                            {message}
                            {onDismiss && (
                              <button
                                onClick={() => onDismiss(error.field)}
                                className="ml-2 text-red-600 hover:text-red-800 focus:outline-none focus:underline"
                                aria-label={`Dismiss error for ${error.field}`}
                              >
                                ×
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {hiddenErrorCount > 0 && (
                    <div className="text-sm text-red-600 font-medium">
                      And {hiddenErrorCount} more error{hiddenErrorCount > 1 ? 's' : ''}...
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {onDismissAll && (
              <button
                onClick={onDismissAll}
                className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="Dismiss all errors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Warning Section */}
      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex items-start space-x-3">
            {getWarningIcon()}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                {totalWarnings > 1 ? `${totalWarnings} Warnings` : 'Warning'}
              </h3>
              
              <div className="mt-2 space-y-2">
                {warnings.map((warning, index) => (
                  <div key={`${warning.field}-${index}`} className="text-sm text-yellow-700">
                    {showFieldNames && (
                      <div className="font-medium text-yellow-800">
                        {formatFieldName(warning.field)}
                      </div>
                    )}
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {warning.messages.map((message, msgIndex) => (
                        <li key={msgIndex} className="break-words">
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;