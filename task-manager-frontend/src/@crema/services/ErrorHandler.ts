/**
 * ERROR HANDLER
 * Centralized error handling and error type definitions
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  userMessage?: string;
  retryable?: boolean;
  action?: string;
  details?: any;
  timestamp?: string;
}

export interface NetworkError extends AppError {
  status?: number;
  url?: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: any;
}

export interface AuthError extends AppError {
  reason?: 'expired' | 'invalid' | 'missing' | 'insufficient_permissions';
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createNetworkError = (
  message: string,
  status?: number,
  url?: string
): NetworkError => ({
  code: 'NETWORK_ERROR',
  message,
  userMessage: 'Không thể kết nối đến máy chủ',
  retryable: true,
  action: 'Thử lại',
  status,
  url,
  timestamp: new Date().toISOString(),
});

export const createValidationError = (
  message: string,
  field?: string,
  value?: any
): ValidationError => ({
  code: 'VALIDATION_ERROR',
  message,
  userMessage: 'Dữ liệu không hợp lệ',
  field,
  value,
  timestamp: new Date().toISOString(),
});

export const createAuthError = (
  message: string,
  reason?: AuthError['reason']
): AuthError => ({
  code: 'AUTH_ERROR',
  message,
  userMessage: 'Lỗi xác thực',
  reason,
  timestamp: new Date().toISOString(),
});

export const createGenericError = (
  message: string,
  userMessage?: string
): AppError => ({
  code: 'GENERIC_ERROR',
  message,
  userMessage: userMessage || message,
  timestamp: new Date().toISOString(),
});

// ============================================================================
// ERROR HANDLER CLASS
// ============================================================================

class ErrorHandler {
  // ============================================================================
  // ERROR PARSING METHODS
  // ============================================================================

  public parseAxiosError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        return createAuthError(
          data?.message || 'Unauthorized',
          'invalid'
        );
      }
      
      if (status === 403) {
        return createAuthError(
          data?.message || 'Forbidden',
          'insufficient_permissions'
        );
      }
      
      if (status >= 400 && status < 500) {
        return createValidationError(
          data?.message || `Client error: ${status}`,
          data?.field,
          data?.value
        );
      }
      
      if (status >= 500) {
        return createNetworkError(
          data?.message || `Server error: ${status}`,
          status,
          error.config?.url
        );
      }
    }
    
    if (error.request) {
      // Request was made but no response received
      return createNetworkError(
        'No response from server',
        undefined,
        error.config?.url
      );
    }
    
    // Something else happened
    return createGenericError(
      error.message || 'Unknown error occurred'
    );
  }

  public parseFetchError(error: any, url?: string): AppError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createNetworkError(
        'Network connection failed',
        undefined,
        url
      );
    }
    
    return createGenericError(
      error.message || 'Request failed'
    );
  }

  // ============================================================================
  // ERROR LOGGING METHODS
  // ============================================================================

  public logError(error: AppError, context?: string): void {
    const logData = {
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.error('Application Error:', logData);
    
    // In production, you might want to send this to an error tracking service
    // this.sendToErrorTracking(logData);
  }

  // ============================================================================
  // ERROR RECOVERY METHODS
  // ============================================================================

  public isRetryable(error: AppError): boolean {
    return error.retryable === true;
  }

  public getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s...
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  public formatErrorForUser(error: AppError): string {
    return error.userMessage || error.message;
  }

  public isNetworkError(error: AppError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  public isAuthError(error: AppError): boolean {
    return error.code === 'AUTH_ERROR';
  }

  public isValidationError(error: AppError): boolean {
    return error.code === 'VALIDATION_ERROR';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const errorHandler = new ErrorHandler();
export default errorHandler;

