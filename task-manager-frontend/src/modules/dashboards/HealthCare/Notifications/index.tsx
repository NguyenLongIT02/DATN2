import React from 'react';
import {useIntl} from 'react-intl';
import AppMenu from '@crema/components/AppMenu';
import NotificationCell from './NotificationCell';
import {List} from 'antd';
import {
  StyledHcNotificationCard,
  StyledNotificationScroll,
} from './index.styled';
import type {NotificationDataType} from '@crema/types/models/dashboards/HealthCare';

type NotificationsProps = {
  data: NotificationDataType[];
};

const Notifications: React.FC<NotificationsProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <StyledHcNotificationCard
      className='no-card-space-ltr-rtl'
      title={messages['healthCare.notification'] as string}
      extra={<AppMenu />}
    >
      <StyledNotificationScroll>
        <List
          dataSource={data}
          renderItem={(notification) => (
            <NotificationCell
              key={notification.id}
              notification={notification}
            />
          )}
        />
      </StyledNotificationScroll>
    </StyledHcNotificationCard>
  );
};

export default Notifications;
