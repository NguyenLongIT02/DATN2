import React, {ReactNode} from 'react';
import {LayoutDirection} from '@crema/constants/AppEnums';
import {useLayoutContext} from '@crema/context/AppContextProvider/LayoutContextProvider';
import {
  StyledAppSidebar,
  StyledAppSidebarCard,
  StyledAppSidebarDrawer,
} from './index.styled';

type AppSidebarProps = {
  isAppDrawerOpen: boolean;
  fullView?: boolean;
  setAppDrawerOpen: (value: boolean) => void;
  sidebarContent: ReactNode;
  footer?: ReactNode;
  navStyle?: string;
};

const AppSidebar: React.FC<AppSidebarProps> = ({
  isAppDrawerOpen,
  setAppDrawerOpen,
  sidebarContent,
}) => {
  const {direction} = useLayoutContext();

  return (
    <StyledAppSidebar>
      <StyledAppSidebarDrawer
        closeIcon={null}
        placement={direction === LayoutDirection.LTR ? 'left' : 'right'}
        open={isAppDrawerOpen}
        onClose={() => setAppDrawerOpen(!isAppDrawerOpen)}
      >
        {sidebarContent}
      </StyledAppSidebarDrawer>
      <StyledAppSidebarCard style={{borderRadius: 16}}>
        {sidebarContent}
      </StyledAppSidebarCard>
    </StyledAppSidebar>
  );
};

export default AppSidebar;
