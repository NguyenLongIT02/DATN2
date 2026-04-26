import React, {ReactNode} from 'react';
import {StarFilled, StarOutlined} from '@ant-design/icons';
import AppIconButton from '../AppIconButton';
import {StyledStarIcon} from './index.styled';

interface AppsStarredIconProps {
  item: any;
  title?: string | ReactNode;
  onChange: any;
}

const AppsStarredIcon: React.FC<AppsStarredIconProps> = ({
  item,
  title,
  onChange,
}) => {
  return (
    <AppIconButton
      icon={
        <StyledStarIcon>
          {item.isStarred ? <StarFilled /> : <StarOutlined />}
        </StyledStarIcon>
      }
      title={title}
      onClick={() => onChange(!item.isStarred, item)}
    />
  );
};

export default AppsStarredIcon;
