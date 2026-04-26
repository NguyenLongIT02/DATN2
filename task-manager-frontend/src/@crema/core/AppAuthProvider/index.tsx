import React from "react";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { JWTAuthAuthProvider } from "@crema/services/auth/jwt-auth";

type AppAuthProviderProps = {
  children: React.ReactNode;
};

const AppAuthProvider = ({ children }: AppAuthProviderProps) => {
  const { fetchStart, fetchSuccess, fetchError } = useInfoViewActionsContext();

  return (
    <JWTAuthAuthProvider
      fetchStart={fetchStart}
      fetchError={fetchError}
      fetchSuccess={fetchSuccess}
    >
      {children}
    </JWTAuthAuthProvider>
  );
};

export default AppAuthProvider;
