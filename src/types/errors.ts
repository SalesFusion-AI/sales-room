/**
 * Application error types and utilities
 */

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR';
  severity: AppError['severity'] = 'medium';
  context?: Record<string, unknown>;
  timestamp = new Date();

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.context = context;
  }
}

export class NetworkError extends Error implements AppError {
  code = 'NETWORK_ERROR';
  severity: AppError['severity'] = 'high';
  statusCode?: number;
  context?: Record<string, unknown>;
  timestamp = new Date();

  constructor(message: string, statusCode?: number, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class ChatServiceError extends Error implements AppError {
  code = 'CHAT_SERVICE_ERROR';
  severity: AppError['severity'] = 'high';
  statusCode?: number;
  context?: Record<string, unknown>;
  timestamp = new Date();

  constructor(message: string, statusCode?: number, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ChatServiceError';
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class StateError extends Error implements AppError {
  code = 'STATE_ERROR';
  severity: AppError['severity'] = 'medium';
  context?: Record<string, unknown>;
  timestamp = new Date();

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'StateError';
    this.context = context;
  }
}

/**
 * Error handler utility functions
 */
export const ErrorHandlers = {
  /**
   * Safely extract error message from various error types
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'Unknown error occurred';
  },

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: unknown): boolean {
    if (error && typeof error === 'object' && 'severity' in error && 'code' in error) {
      const appError = error as AppError;
      return appError.severity !== 'critical' && !['FATAL_ERROR', 'SYSTEM_ERROR'].includes(appError.code || '');
    }
    return true; // Assume recoverable by default
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: unknown): string {
    if (error instanceof ValidationError) {
      return error.message; // Validation messages are already user-friendly
    }
    if (error instanceof NetworkError) {
      return 'Network connection failed. Please check your connection and try again.';
    }
    if (error instanceof ChatServiceError) {
      return 'Unable to process your message right now. Please try again in a moment.';
    }
    return 'Something went wrong. Please try again.';
  },

  /**
   * Log error with context
   */
  logError(error: unknown, context?: Record<string, unknown>) {
    const errorInfo = {
      message: this.getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    console.error('Application Error:', errorInfo);

    // In production, you'd send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }
};

export default {
  ValidationError,
  NetworkError,
  ChatServiceError,
  StateError,
  ErrorHandlers,
};