import React, {ReactNode} from 'react';
import {StyledAppsHeader} from './index.styled';

type AppsHeaderProps = {
  children: ReactNode;
};

const AppsHeader: React.FC<AppsHeaderProps> = ({children}) => {
  return <StyledAppsHeader>{children}</StyledAppsHeader>;
};

export default AppsHeader;
