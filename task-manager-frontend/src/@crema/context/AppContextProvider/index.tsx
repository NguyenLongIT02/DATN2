import React, {ReactNode} from 'react';
import ThemeContextProvider from './ThemeContextProvider';
import LocaleContextProvider from './LocaleContextProvider';
import LayoutContextProvider from './LayoutContextProvider';
import SidebarContextProvider from './SidebarContextProvider';
import InfoViewContextProvider from './InfoViewContextProvider';

type AppContextProviderProps = {
  children: ReactNode;
};

const AppContextProvider: React.FC<AppContextProviderProps> = ({children}) => {
  return (
    <ThemeContextProvider>
      <LocaleContextProvider>
        <InfoViewContextProvider>
          <LayoutContextProvider>
            <SidebarContextProvider>{children}</SidebarContextProvider>
          </LayoutContextProvider>
        </InfoViewContextProvider>
      </LocaleContextProvider>
    </ThemeContextProvider>
  );
};

export default AppContextProvider;
