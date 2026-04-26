import React from 'react';
import {useSidebarContext} from '@crema/context/AppContextProvider/SidebarContextProvider';
import {StyledAppLogo} from './index.styled';

type AppLogoProps = {
  hasSidebarColor?: boolean;
};
const AppLogo: React.FC<AppLogoProps> = ({hasSidebarColor}) => {
  const {sidebarColorSet} = useSidebarContext();
  return (
    <StyledAppLogo>
      {hasSidebarColor && sidebarColorSet.mode === 'dark' ? (
        <img src='/assets/images/logo-white-with-name.png' alt='crema-logo' />
      ) : (
        <img src='/assets/images/logo-with-name.png' alt='crema-logo' />
      )}
    </StyledAppLogo>
  );
};

export default AppLogo;
