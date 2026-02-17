import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import { ErrorHandlers } from '../../types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Use centralized error logging
    ErrorHandlers.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // In production, you'd send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: { errorInfo } });
    }
  }

  private handleRefresh = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorData = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // Copy error data to clipboard for easy reporting (with fallback)
    const errorText = JSON.stringify(errorData, null, 2);
    
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(errorText)
        .then(() => {
          alert('Error details copied to clipboard. Please send this to our support team.');
        })
        .catch(() => {
          // Fallback: show in prompt for manual copy
          prompt('Copy this error report:', errorText);
        });
    } else {
      // Fallback for browsers without clipboard API
      prompt('Copy this error report:', errorText);
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-[#111] border border-[#222] py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                
                <h2 className="text-lg font-medium text-white mb-2 font-display">
                  Something went wrong
                </h2>
                
                <p className="text-sm text-gray-400 mb-6">
                  We encountered an unexpected error. This has been logged and our team will investigate.
                </p>

                {/* Error details for development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 text-left">
                    <details className="bg-[#0b0b0b] border border-[#222] rounded p-3">
                      <summary className="text-sm font-medium text-gray-200 cursor-pointer">
                        Error Details
                      </summary>
                      <div className="mt-2 text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">
                        {this.state.error.toString()}
                        {this.state.error.stack && (
                          <div className="mt-2 border-t border-red-200 pt-2">
                            {this.state.error.stack}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={this.handleRefresh}
                    className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh Page</span>
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-[#222] rounded-md shadow-sm text-sm font-medium text-gray-200 bg-[#111] hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/10 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span>Go to Home</span>
                  </button>

                  <button
                    onClick={this.handleReportError}
                    className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-[#222] rounded-md shadow-sm text-sm font-medium text-gray-200 bg-[#111] hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/10 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Report Issue</span>
                  </button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  <p>If this problem persists, please contact support.</p>
                  <p className="mt-1">Error ID: {Date.now()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC moved to withErrorBoundary.tsx for fast refresh compatibility

export default ErrorBoundary;