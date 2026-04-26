/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useEffect, ReactNode } from "react";
import { authService } from "@crema/services/AuthService";
import { UserProfile, UserPreferences } from "@crema/types/models/UnifiedTypes";

// User types - using backend API types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_image_url?: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  preferences?: UserPreferences;
  statistics?: {
    total_boards: number;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  };
}

// Auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "CLEAR_ERROR" }
  | { type: "LOAD_USER_START" }
  | { type: "LOAD_USER_SUCCESS"; payload: User }
  | { type: "LOAD_USER_FAILURE"; payload: string };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "LOAD_USER_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "LOAD_USER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
    case "LOAD_USER_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              preferences: state.user.preferences
                ? { ...state.user.preferences, ...action.payload }
                : (action.payload as UserPreferences),
            }
          : null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
export interface UserContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    full_name?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Provider component
interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user profile on mount if authenticated
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await loadUserProfile();
        } catch (error) {
          console.error("Failed to load user profile:", error);
          // Clear invalid tokens
          authService.logout();
        }
      }
    };

    initializeAuth();
  }, []);

  // Save user to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("current_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("current_user");
    }
  }, [state.user]);

  // Auth methods
  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Call backend login API
      const response = await authService.login({ username, password });

      // After successful login, load user profile
      await loadUserProfile();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    full_name?: string
  ): Promise<void> => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Call backend register API
      await authService.register({ username, email, password, full_name });

      // After successful registration, automatically login
      await login(username, password);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const loadUserProfile = async (): Promise<void> => {
    dispatch({ type: "LOAD_USER_START" });

    try {
      const response = await authService.getUserProfile();
      dispatch({ type: "LOAD_USER_SUCCESS", payload: response.data });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user profile";
      dispatch({ type: "LOAD_USER_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await authService.updateUserProfile(userData);
      dispatch({ type: "UPDATE_USER", payload: response.data });
    } catch (error) {
      console.error("Update user failed:", error);
      throw error;
    }
  };

  const updatePreferences = async (
    preferences: Partial<UserPreferences>
  ): Promise<void> => {
    try {
      const response = await authService.updateUserProfile({ preferences });
      dispatch({ type: "UPDATE_PREFERENCES", payload: preferences });
    } catch (error) {
      console.error("Update preferences failed:", error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Permission helpers
  const hasPermission = (permission: string): boolean => {
    // For now, return true for admin role, false for user role
    // This should be enhanced with proper permission checking
    return state.user?.role === "ADMIN";
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const contextValue: UserContextType = {
    state,
    login,
    register,
    logout,
    loadUserProfile,
    updateUser,
    updatePreferences,
    clearError,
    hasPermission,
    hasRole,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Types are already exported above
