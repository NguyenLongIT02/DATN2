import React, {ReactNode} from 'react';
import {Tooltip} from 'antd';
import {StyledIconBtn} from './index.styled';
import clsx from 'clsx';

type AppIconButtonProps = {
  title?: string | ReactNode;
  icon: ReactNode;
  className?: string;
  onClick?: () => void;

  [x: string]: any;
};

const AppIconButton: React.FC<AppIconButtonProps> = ({
  title = '',
  icon,
  className = '',
  onClick,
  ...rest
}) => {
  if (title)
    return (
      <Tooltip title={title}>
        <StyledIconBtn
          className={clsx('icon-btn', className)}
          shape='circle'
          icon={icon}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick();
            }
          }}
          {...rest}
        />
      </Tooltip>
    );
  return (
    <StyledIconBtn
      className={clsx('icon-btn', className)}
      shape='circle'
      icon={icon}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick();
        }
      }}
      {...rest}
    />
  );
};

export default AppIconButton;
