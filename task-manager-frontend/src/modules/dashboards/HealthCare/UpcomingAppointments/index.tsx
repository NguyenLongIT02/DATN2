import React from 'react';
import {useIntl} from 'react-intl';
import AppMenu from '@crema/components/AppMenu';
import AppointmentCell from './AppointmentCell';
import {List} from 'antd';
import {
  StyledUpComingAppointCard,
  StyledUpComingScrollbar,
} from './index.styled';
import type {UpcomingAppointmentType} from '@crema/types/models/dashboards/HealthCare';

type UpcomingAppointmentsProps = {
  data: UpcomingAppointmentType[];
};

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <StyledUpComingAppointCard
      className='no-card-space-ltr-rtl'
      title={messages['healthCare.upcomingAppointments'] as string}
      extra={<AppMenu />}
    >
      <StyledUpComingScrollbar>
        <List
          dataSource={data}
          renderItem={(appointment) => (
            <AppointmentCell key={appointment.id} appointment={appointment} />
          )}
        />
      </StyledUpComingScrollbar>
    </StyledUpComingAppointCard>
  );
};

export default UpcomingAppointments;
