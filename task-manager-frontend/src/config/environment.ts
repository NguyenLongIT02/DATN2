/**
 * ENVIRONMENT CONFIGURATION
 * Centralized configuration for different environments
 */

export interface EnvironmentConfig {
  API_URL: string;
  WS_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
    USER_DATA_KEY: string;
    TOKEN_EXPIRY_BUFFER_MINUTES: number;
  };
  // API Configuration
  API: {
    TIMEOUT: number;
    RETRY_ATTEMPTS: number;
    RETRY_DELAY: number;
  };
  // WebSocket Configuration
  WS: {
    RECONNECT_INTERVAL: number;
    MAX_RECONNECT_ATTEMPTS: number;
  };
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    // Base URLs
    API_URL: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:8080/api' : '/api'),
    WS_URL: process.env.REACT_APP_WS_URL || (isDevelopment ? 'ws://localhost:8080/ws' : `wss://${window.location.host}/ws`),
    
    // Environment
    ENVIRONMENT: (process.env.REACT_APP_ENVIRONMENT as 'development' | 'staging' | 'production') || (isDevelopment ? 'development' : 'production'),
    
    // Debug & Logging
    DEBUG: process.env.REACT_APP_DEBUG === 'true' || isDevelopment,
    LOG_LEVEL: (process.env.REACT_APP_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || (isDevelopment ? 'debug' : 'error'),
    
    // JWT Configuration
    JWT: {
      ACCESS_TOKEN_KEY: process.env.REACT_APP_ACCESS_TOKEN_KEY || 'auth_token',
      REFRESH_TOKEN_KEY: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token',
      USER_DATA_KEY: process.env.REACT_APP_USER_DATA_KEY || 'current_user',
      TOKEN_EXPIRY_BUFFER_MINUTES: parseInt(process.env.REACT_APP_TOKEN_EXPIRY_BUFFER || '5'),
    },
    
    // API Configuration
    API: {
      TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
      RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3'),
      RETRY_DELAY: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000'),
    },
    
    // WebSocket Configuration
    WS: {
      RECONNECT_INTERVAL: parseInt(process.env.REACT_APP_WS_RECONNECT_INTERVAL || '5000'),
      MAX_RECONNECT_ATTEMPTS: parseInt(process.env.REACT_APP_WS_MAX_RECONNECT || '5'),
    },
  };
};

export const config = getEnvironmentConfig();

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const validateEnvironment = () => {
  const errors: string[] = [];

  // Validate API URL
  if (!config.API_URL) {
    errors.push('API_URL is required');
  }

  // Validate JWT keys
  if (!config.JWT.ACCESS_TOKEN_KEY || !config.JWT.REFRESH_TOKEN_KEY) {
    errors.push('JWT token keys are required');
  }

  // Validate numeric values
  if (config.API.TIMEOUT <= 0) {
    errors.push('API_TIMEOUT must be greater than 0');
  }

  if (config.JWT.TOKEN_EXPIRY_BUFFER_MINUTES < 0) {
    errors.push('TOKEN_EXPIRY_BUFFER_MINUTES must be non-negative');
  }

  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:', errors);
    if (config.ENVIRONMENT === 'production') {
      throw new Error(`Environment configuration errors: ${errors.join(', ')}`);
    }
  }
};

// ============================================================================
// ENVIRONMENT HELPERS
// ============================================================================

export const isDevelopment = () => config.ENVIRONMENT === 'development';
export const isStaging = () => config.ENVIRONMENT === 'staging';
export const isProduction = () => config.ENVIRONMENT === 'production';

export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.API_URL.endsWith('/') ? config.API_URL.slice(0, -1) : config.API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const getWsUrl = () => {
  return config.WS_URL;
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Validate environment on load
validateEnvironment();

// Log configuration in development
if (config.DEBUG) {
  console.log('🔧 Environment Configuration:', {
    ...config,
    // Don't log sensitive keys in production
    JWT: isProduction() ? { ...config.JWT, ACCESS_TOKEN_KEY: '[HIDDEN]', REFRESH_TOKEN_KEY: '[HIDDEN]' } : config.JWT
  });
}
