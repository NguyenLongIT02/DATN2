/**
 * Authentication Hook - Provides easy access to authentication context
 */

import { useContext } from 'react';
import { UserContext, UserContextType } from '@crema/context/AppContextProvider/UserContextProvider/UserContext';

export const useAuth = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserContextProvider');
  }
  
  return context;
};

export default useAuth;
