import React from 'react';
import {List} from 'antd';
import {
  StyledNotifyListItem,
  StyledNotifyMsgAvatar,
} from './NotificationItem.styled';

type NotificationItemProps = {
  item: {
    id?: number;
    title?: string;
    name?: string;
    message: string;
    image?: string;
    isRead?: boolean;
    actor?: {
      name: string;
      avatar?: string;
    };
  };
};

const NotificationItem: React.FC<NotificationItemProps> = ({item}) => {
  // Support both mock (name, image) and real (title, actor) data structures
  const displayTitle = item.title || item.name || 'Notification';
  const displayAvatar = item.actor?.avatar || item.image;
  const displayActorName = item.actor?.name || item.name || 'System';
  
  return (
    <StyledNotifyListItem 
      className='item-hover' 
      style={{ opacity: item.isRead === true ? 0.7 : 1 }}
    >
      <List.Item.Meta
        avatar={
          <StyledNotifyMsgAvatar src={displayAvatar} alt={displayActorName}>
            {!displayAvatar && displayActorName.charAt(0).toUpperCase()}
          </StyledNotifyMsgAvatar>
        }
        title={displayTitle}
        description={item.message}
      />
    </StyledNotifyListItem>
  );
};

export default NotificationItem;
