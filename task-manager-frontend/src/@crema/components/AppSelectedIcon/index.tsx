import React from 'react';
import clsx from 'clsx';
import {CheckOutlined} from '@ant-design/icons';
import {StyledAppSelectedIcon} from './index.styled';

type AppSelectedIconProps = {
  backgroundColor?: string;
  color?: string;
  isCenter?: boolean;
};

const AppSelectedIcon: React.FC<AppSelectedIconProps> = ({
  backgroundColor,
  isCenter = true,
  color,
}) => {
  return (
    <StyledAppSelectedIcon
      className={clsx({isCenter: isCenter})}
      backgroundColor={backgroundColor}
      color={color}
    >
      <CheckOutlined />
    </StyledAppSelectedIcon>
  );
};

export default AppSelectedIcon;
