/**
 * TOKEN MANAGER
 * Handles JWT token storage, retrieval, and refresh operations
 */

// ============================================================================
// TOKEN MANAGER CLASS
// ============================================================================

class TokenManager {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';

  // ============================================================================
  // TOKEN STORAGE METHODS
  // ============================================================================

  public setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
    try {
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem('token', accessToken); // Backward compatibility
      localStorage.setItem(this.refreshTokenKey, refreshToken);
      
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
      }
      
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  public getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.accessTokenKey);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  public clearTokens(): void {
    try {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem('token'); // Backward compatibility
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.tokenExpiryKey);
      console.log('Tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // ============================================================================
  // TOKEN VALIDATION METHODS
  // ============================================================================

  public isTokenExpired(): boolean {
    try {
      const expiryTime = localStorage.getItem(this.tokenExpiryKey);
      if (!expiryTime) return false; // No expiry set, assume valid
      
      return Date.now() >= parseInt(expiryTime);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true; // Assume expired on error
    }
  }

  public async ensureValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      console.log('No access token found');
      return null;
    }

    if (!this.isTokenExpired()) {
      console.log('Access token is still valid');
      return accessToken;
    }

    console.log('Access token expired, attempting refresh...');
    return await this.refreshAccessToken();
  }

  // ============================================================================
  // TOKEN REFRESH METHODS
  // ============================================================================

  public async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token available');
        return null;
      }

      // Make refresh request to backend
      const response = await fetch('http://localhost:8081/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      
      if (data.status && data.data && data.data.access_token) {
        // Store new tokens
        this.setTokens(
          data.data.access_token,
          data.data.refresh_token || refreshToken,
          data.data.expires_in
        );
        
        console.log('Token refreshed successfully');
        return data.data.access_token;
      } else {
        console.error('Invalid refresh response format');
        this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const tokenManager = new TokenManager();
export default tokenManager;

