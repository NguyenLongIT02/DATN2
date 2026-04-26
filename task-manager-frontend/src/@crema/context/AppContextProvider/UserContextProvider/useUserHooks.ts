import { useContext } from "react";
import { UserContext } from "./UserContext";
import type { UserContextType } from "./UserContext";

// Custom hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

// Convenience hooks
export const useAuth = () => {
  const { state } = useUser();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
  };
};

export const usePermissions = () => {
  const { hasPermission, hasRole } = useUser();
  return { hasPermission, hasRole };
};
