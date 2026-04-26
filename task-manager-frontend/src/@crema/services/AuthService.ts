/**
 * Authentication Service - Handles all authentication related API calls
 * Matches backend API endpoints and response formats
 */

import { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest,
  UpdateUserProfileRequest,
  TokenResponse,
  UserRegistration,
  UserProfile,
  ApiResponse
} from '@crema/types/models/UnifiedTypes';

// API Base URL - should be moved to environment config
const API_BASE_URL = 'http://localhost:8081/api/v1';

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(tokens: TokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    
    if (tokens.expires_in) {
      const expiryTime = Date.now() + (tokens.expires_in * 1000);
      localStorage.setItem('token_expiry', expiryTime.toString());
    }
  }

  private clearTokensFromStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem('token_expiry');
    if (!expiryTime) return true;
    
    return Date.now() >= parseInt(expiryTime);
  }

  // ============================================================================
  // HTTP REQUEST HELPERS
  // ============================================================================

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION API METHODS
  // ============================================================================

  /**
   * Login user
   */
  public async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.makeRequest<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Save tokens to storage
      this.saveTokensToStorage(response.data);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  public async register(userData: RegisterRequest): Promise<ApiResponse<UserRegistration>> {
    try {
      const response = await this.makeRequest<UserRegistration>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<ApiResponse<TokenResponse>> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest<TokenResponse>('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      // Save new tokens to storage
      this.saveTokensToStorage(response.data);

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens if refresh fails
      this.clearTokensFromStorage();
      throw error;
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<ApiResponse<string>> {
    try {
      const response = await this.makeRequest<string>('/auth/logout', {
        method: 'POST',
      });

      // Clear tokens from storage
      this.clearTokensFromStorage();

      return response;
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens even if logout request fails
      this.clearTokensFromStorage();
      throw error;
    }
  }

  /**
   * Get user profile
   */
  public async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.makeRequest<UserProfile>('/user/profile', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(profileData: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.makeRequest<UserProfile>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      return response;
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  /**
   * Auto refresh token if needed
   */
  public async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated() && this.refreshToken) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        console.error('Auto token refresh failed:', error);
        return false;
      }
    }
    return this.isAuthenticated();
  }

  /**
   * Get authorization header for API requests
   */
  public getAuthHeader(): { Authorization: string } | {} {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
