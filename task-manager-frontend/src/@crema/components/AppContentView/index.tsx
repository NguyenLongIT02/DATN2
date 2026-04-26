import React from 'react';
import AppSuspense from '../AppSuspense';
import AppErrorBoundary from '../AppErrorBoundary';
import {StyledMainContentView} from './index.styled';

type AppContentViewProps = {
  routes: React.ReactElement | null;
};

const AppContentView: React.FC<AppContentViewProps> = ({routes}) => {
  return (
    <StyledMainContentView>
      <AppSuspense>
        <AppErrorBoundary>{routes}</AppErrorBoundary>
      </AppSuspense>
    </StyledMainContentView>
  );
};

export default AppContentView;
