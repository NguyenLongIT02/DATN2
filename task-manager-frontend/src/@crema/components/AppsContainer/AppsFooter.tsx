import React, {ReactNode} from 'react';
import clsx from 'clsx';
import {StyledAppFooter} from './index.styled';

type AppsFooterProps = {
  children: ReactNode;
  className?: string;

  [x: string]: any;
};

const AppsFooter: React.FC<AppsFooterProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <StyledAppFooter className={clsx(className)} {...rest}>
      {children}
    </StyledAppFooter>
  );
};

export default AppsFooter;
