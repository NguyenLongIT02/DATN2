import React, {ReactNode} from 'react';
import clsx from 'clsx';
import {StyledAppContentContainer} from './index.styled';

type AppsContentProps = {
  children: ReactNode;
  isDetailView?: boolean;
  fullView?: boolean;

  [x: string]: any;
};
const AppsContent: React.FC<AppsContentProps> = ({
  children,
  isDetailView = false,
  fullView,
  ...rest
}) => {
  return (
    <StyledAppContentContainer
      {...rest}
      className={clsx({isDetailView: isDetailView}, {fullView: fullView})}
    >
      {children}
    </StyledAppContentContainer>
  );
};

export default AppsContent;
