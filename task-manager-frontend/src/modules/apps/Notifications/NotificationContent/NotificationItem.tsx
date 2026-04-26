import React from "react";
import { Avatar, Badge } from "antd";
import {
  StyledNotificationItem,
  StyledNotificationInfo,
  StyledNotificationMeta,
} from "./index.styled";

type NotificationItemProps = {
  notification: {
    id: number;
    type: string;
    user: { name: string; avatar: string };
    message: string;
    target: string;
    timestamp: string;
    isRead: boolean;
  };
  onMarkAsRead?: (notificationId: number) => void;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const handleClick = () => {
    // Mark as read khi click vào thông báo (dù đã đọc hay chưa)
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <StyledNotificationItem
      className={notification.isRead ? "read" : "unread"}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <Badge dot={!notification.isRead} offset={[-5, 5]}>
        <Avatar src={notification.user.avatar} size={40} />
      </Badge>
      <StyledNotificationInfo>
        <div>
          <strong>{notification.user.name}</strong> {notification.message}{" "}
          {notification.target && <strong>{notification.target}</strong>}
        </div>
        <StyledNotificationMeta>
          {notification.timestamp}
        </StyledNotificationMeta>
      </StyledNotificationInfo>
    </StyledNotificationItem>
  );
};

export default NotificationItem;
