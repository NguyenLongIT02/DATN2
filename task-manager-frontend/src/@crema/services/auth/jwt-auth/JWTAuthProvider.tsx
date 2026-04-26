/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthUserType } from "@crema/types/models/AuthUser";
import { jwtAxios, setAuthToken } from "./index";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { tokenManager } from "@crema/services/TokenManager";

interface JWTAuthContextProps {
  user: AuthUserType | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SignUpProps {
  name: string;
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

interface SignInProps {
  username: string;
  password: string;
  deviceId?: string;
}

interface JWTAuthActionsProps {
  signUpUser: (data: SignUpProps) => void;
  signInUser: (data: SignInProps) => void;
  logout: () => void;
}

const JWTAuthContext = createContext<JWTAuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});
const JWTAuthActionsContext = createContext<JWTAuthActionsProps>({
  signUpUser: () => {},
  signInUser: () => {},
  logout: () => {},
});

export const useJWTAuth = () => useContext(JWTAuthContext);

export const useJWTAuthActions = () => useContext(JWTAuthActionsContext);

interface JWTAuthAuthProviderProps {
  children: ReactNode;
}

const JWTAuthAuthProvider: React.FC<JWTAuthAuthProviderProps> = ({
  children,
}) => {
  const [firebaseData, setJWTAuthData] = useState<JWTAuthContextProps>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const infoViewActionsContext = useInfoViewActionsContext();

  useEffect(() => {
    const getAuthUser = async () => {
      const accessToken = tokenManager.getAccessToken();
      const legacyToken = localStorage.getItem("token");

      if (!accessToken && !legacyToken) {
        setJWTAuthData({
          user: undefined,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      try {
        // Ensure we have a valid token (refresh if needed)
        const validToken = await tokenManager.ensureValidToken();

        if (!validToken) {
          setJWTAuthData({
            user: undefined,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        setAuthToken(validToken);

        // Skip profile API call during initial load to avoid unnecessary requests
        // User profile will be loaded during login process
        setJWTAuthData({
          user: undefined,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error("Failed to get user profile:", error);
        setJWTAuthData({
          user: undefined,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getAuthUser();
  }, []);

  const signInUser = async ({
    username,
    password,
    deviceId,
  }: {
    username: string;
    password: string;
    deviceId?: string;
  }) => {
    infoViewActionsContext.fetchStart();
    try {
      // Prepare request data
      const requestData: any = {
        username: username, // Username or email
        password,
      };

      // Only add device ID for first-time login (when deviceId is provided)
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (deviceId) {
        headers["x-device-id"] = deviceId;
      }

      // Use backend API endpoint
      const { data } = await jwtAxios.post("/auth/login", requestData, {
        headers,
      });

      // Store tokens from backend response
      if (data.data && data.data.access_token) {
        tokenManager.setTokens(data.data.access_token, data.data.refresh_token);
        setAuthToken(data.data.access_token);

        // Use user data from login response instead of calling separate API
        const userData = data.data.user || data.data;
        setJWTAuthData({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });

        // Show success message from backend if available
        let successMessage = "Đăng nhập thành công!";
        if (data) {
          if (
            data.status === true &&
            data.data &&
            typeof data.data === "string"
          ) {
            successMessage = data.data;
          } else if (data.message) {
            successMessage = data.message;
          } else if (
            data.data &&
            typeof data.data === "object" &&
            data.data.message
          ) {
            successMessage = data.data.message;
          }
        }

        infoViewActionsContext.fetchSuccess();
        infoViewActionsContext.showMessage(successMessage);

        // Redirect to home page after successful login
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);

      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });

      // Extract error message from server response
      let errorMessage = "Đăng nhập thất bại";
      if (error.response?.data) {
        const responseData = error.response.data;

        // Check different response formats
        if (responseData.status === false && responseData.data) {
          errorMessage = responseData.data;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        } else if (
          responseData.data &&
          typeof responseData.data === "object" &&
          responseData.data.message
        ) {
          errorMessage = responseData.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      infoViewActionsContext.fetchError(errorMessage);
    }
  };

  const signUpUser = async ({
    name,
    email,
    password,
    username,
    full_name,
  }: {
    name: string;
    email: string;
    password: string;
    username?: string;
    full_name?: string;
  }) => {
    infoViewActionsContext.fetchStart();
    try {
      // Use backend API endpoint with correct field mapping
      const { data } = await jwtAxios.post("/auth/register", {
        username: username || email, // Use provided username or fallback to email
        email,
        password,
        full_name: full_name || name, // Use full_name if provided, otherwise use name
      });

      // Registration successful - show success message from response data
      infoViewActionsContext.fetchSuccess();

      // Check if response has status and data fields, and show appropriate message
      let successMessage = "Đăng ký thành công! Vui lòng đăng nhập.";
      if (data && data.status === true && data.data) {
        successMessage = data.data;
      } else if (data && data.message) {
        successMessage = data.message;
      }

      // Show success message and wait for user to see it
      infoViewActionsContext.showMessage(successMessage);

      // Reset auth state
      setJWTAuthData({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Redirect to login page after showing message for 3 seconds
      setTimeout(() => {
        window.location.href = "/signin";
      }, 3000);
    } catch (error: any) {
      setJWTAuthData({
        ...firebaseData,
        isAuthenticated: false,
        isLoading: false,
      });

      // Extract error message from server response
      let errorMessage = "Đăng ký thất bại";

      if (error.response?.data) {
        // Check for different error response formats
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          // Handle validation errors array
          errorMessage = error.response.data.errors
            .map((err: any) => err.message || err)
            .join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error message
      infoViewActionsContext.fetchError(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Get device ID for logout request
      const deviceId = localStorage.getItem("device-id");

      // Prepare headers with device ID
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (deviceId) {
        headers["x-device-id"] = deviceId;
      }

      // Call backend logout endpoint
      const { data } = await jwtAxios.post("/auth/logout", {}, { headers });

      // Show logout success message from backend if available
      let successMessage = "Đăng xuất thành công!";
      if (data) {
        if (
          data.status === true &&
          data.data &&
          typeof data.data === "string"
        ) {
          successMessage = data.data;
        } else if (data.message) {
          successMessage = data.message;
        } else if (
          data.data &&
          typeof data.data === "object" &&
          data.data.message
        ) {
          successMessage = data.data.message;
        }
      }

      infoViewActionsContext.showMessage(successMessage);
    } catch (error: any) {
      console.error("Logout error:", error);

      // Show logout error message from backend if available
      let errorMessage = "Đăng xuất thất bại";
      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.status === false && responseData.data) {
          errorMessage = responseData.data;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }
      }

      infoViewActionsContext.fetchError(errorMessage);
    } finally {
      // Clear tokens using TokenManager
      tokenManager.clearTokens();
      setAuthToken();
      setJWTAuthData({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  return (
    <JWTAuthContext.Provider
      value={{
        ...firebaseData,
      }}
    >
      <JWTAuthActionsContext.Provider
        value={{
          signUpUser,
          signInUser,
          logout,
        }}
      >
        {children}
      </JWTAuthActionsContext.Provider>
    </JWTAuthContext.Provider>
  );
};
export default JWTAuthAuthProvider;
