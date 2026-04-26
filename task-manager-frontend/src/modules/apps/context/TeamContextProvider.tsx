import React, { createContext, useContext, ReactNode } from 'react';

export type TeamContextType = {
  members: any[];
  loading: boolean;
};

const TeamContext = createContext<TeamContextType>({
  members: [],
  loading: false,
});

export const useTeamContext = () => useContext(TeamContext);

type TeamContextProviderProps = {
  children: ReactNode;
};

const TeamContextProvider: React.FC<TeamContextProviderProps> = ({ children }) => {
  const members: any[] = [];
  const loading = false;

  return (
    <TeamContext.Provider value={{ members, loading }}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContextProvider;

