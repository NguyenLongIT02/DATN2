import React from 'react';
import AppCard from '@crema/components/AppCard';
import {useIntl} from 'react-intl';
import {List} from 'antd';
import {
  StyledNotificationThumb,
  StyledNotificationContent,
  StyledNotificationItem,
} from './index.styled';

import {NotificationDataType} from '@crema/types/models/dashboards/AcademyType';

type NotificationItemProps = {
  notification: NotificationDataType;
};

const NotificationItem: React.FC<NotificationItemProps> = ({notification}) => {
  return (
    <StyledNotificationItem className='item-hover'>
      <StyledNotificationThumb
        style={{
          backgroundColor: notification.bgcolor,
          color: notification.color,
        }}
      >
        {notification.letter}
      </StyledNotificationThumb>
      <StyledNotificationContent>
        <h3>{notification.content}</h3>
        <p className='text-truncate'>{notification.date}</p>
      </StyledNotificationContent>
    </StyledNotificationItem>
  );
};

type NotificationsProps = {
  notifications: NotificationDataType[];
};

const Notifications: React.FC<NotificationsProps> = ({notifications}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      heightFull
      title={messages['academy.notifications'] as string}
    >
      <List
        dataSource={notifications}
        renderItem={(data, index) => (
          <NotificationItem key={index} notification={data} />
        )}
      />
    </AppCard>
  );
};

export default Notifications;
