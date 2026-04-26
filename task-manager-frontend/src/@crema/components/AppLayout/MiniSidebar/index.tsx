import React from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppContentView from '../../AppContentView';
import AppThemeSetting from '../../AppThemeSetting';
import clsx from 'clsx';
import {FooterType, LayoutType} from '@crema/constants/AppEnums';
import AppFooter from '../components/AppFooter';
import {useLayoutContext} from '@crema/context/AppContextProvider/LayoutContextProvider';
import {
  StyledAppLayoutMini,
  StyledAppLayoutMiniMain,
  StyledMainMiniScrollbar,
} from './index.styled';
import {RouterConfigData} from '@crema/types/models/Apps';

type Props = {
  routes: React.ReactElement | null;
  routesConfig: RouterConfigData[];
};
const MiniSidebar: React.FC<Props> = ({routes, routesConfig}) => {
  const {footer, layoutType, footerType} = useLayoutContext();

  return (
    <StyledAppLayoutMini
      className={clsx({
        appMainFooter: footer && footerType === FooterType.FLUID,
        appMainFixedFooter: footer && footerType === FooterType.FIXED,
        boxedLayout: layoutType === LayoutType.BOXED,
      })}
    >
      <AppSidebar routesConfig={routesConfig} />
      <StyledAppLayoutMiniMain className='app-layout-mini-main'>
        <AppHeader />
        <StyledMainMiniScrollbar>
          <AppContentView routes={routes} />
          <AppFooter />
        </StyledMainMiniScrollbar>
      </StyledAppLayoutMiniMain>
      <AppThemeSetting />
    </StyledAppLayoutMini>
  );
};

export default MiniSidebar;
