import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card, { CardHeader, CardContent } from '../../../../shared/components/molecules/Card';
import Button from '../../../../shared/components/atoms/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class FormErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('FormErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Integration with error monitoring (e.g., Sentry)
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset on props change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for error monitoring service integration
    try {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.warn('Error logging service not configured:', error.message);
    } catch (e) {
      console.error('Failed to log error to monitoring service:', e);
    }
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleRetry = () => {
    this.resetError();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getErrorMessage = (error: Error): string => {
    if (error.name === 'ChunkLoadError') {
      return 'Failed to load application resources. The app may have been updated.';
    }

    if (error.message.includes('Loading chunk')) {
      return 'Failed to load part of the application. Please refresh the page.';
    }

    if (error.message.includes('NetworkError')) {
      return 'Network connection issue. Please check your connection and try again.';
    }

    if (error.message.includes('validation')) {
      return 'Data validation error. Please check your input and try again.';
    }

    return error.message || 'An unexpected error occurred';
  };

  private getErrorActions = (error: Error) => {
    const actions = [
      {
        label: 'Try Again',
        onClick: this.handleRetry,
        variant: 'primary' as const,
      }
    ];

    // Add reload option for certain error types
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      actions.push({
        label: 'Reload Page',
        onClick: this.handleReload,
        variant: 'outline' as const,
      });
    }

    return actions;
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const errorMessage = this.getErrorMessage(error);
      const actions = this.getErrorActions(error);

      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg 
                  className="w-8 h-8 text-red-500"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-700">
                  Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground">
                {errorMessage}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm font-mono">
                    <div className="text-red-600 font-semibold">Error:</div>
                    <pre className="whitespace-pre-wrap break-words">
                      {error.toString()}
                    </pre>
                    
                    {errorInfo && (
                      <>
                        <div className="text-red-600 font-semibold mt-3">Stack Trace:</div>
                        <pre className="whitespace-pre-wrap break-words text-xs">
                          {errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.onClick}
                    size="sm"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                If this problem persists, please contact support with the Error ID above.
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default FormErrorBoundary;