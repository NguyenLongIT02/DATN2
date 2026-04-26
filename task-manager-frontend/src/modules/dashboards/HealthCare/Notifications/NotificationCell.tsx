import React from 'react';
import {
  StyledHcNotificationCell,
  StyledNotificationContent,
} from './index.styled';
import type {NotificationDataType} from '@crema/types/models/dashboards/HealthCare';

type NotificationCellProps = {
  notification: NotificationDataType;
};

const NotificationCell: React.FC<NotificationCellProps> = ({notification}) => {
  return (
    <StyledHcNotificationCell className='item-hover'>
      <span
        className='dot'
        style={{
          backgroundColor: notification.color,
        }}
      />
      <StyledNotificationContent>
        <h5>{notification.title}</h5>
        <p>{notification.time}</p>
      </StyledNotificationContent>
    </StyledHcNotificationCell>
  );
};

export default NotificationCell;
