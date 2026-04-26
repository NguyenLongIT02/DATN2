// Export everything from UserContext
export { UserContextProvider, UserContext } from './UserContext';
export type { User, UserPreferences, UserContextType } from './UserContext';

// Export hooks
export { useUser, useAuth, usePermissions } from './useUserHooks';
