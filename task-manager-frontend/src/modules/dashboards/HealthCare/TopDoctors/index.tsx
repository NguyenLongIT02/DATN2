import React from 'react';
import {useIntl} from 'react-intl';
import AppCard from '@crema/components/AppCard';
import AppMenu from '@crema/components/AppMenu';
import DoctorCell from './DoctorCell';
import {List} from 'antd';
import {StyledDrScrollbar} from './index.styled';
import type {TopDoctorDataType} from '@crema/types/models/dashboards/HealthCare';

type TopDoctorsProps = {
  data: TopDoctorDataType[];
};

const TopDoctors: React.FC<TopDoctorsProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      title={messages['healthCare.topDoctors'] as string}
      extra={<AppMenu />}
    >
      <StyledDrScrollbar>
        <List
          dataSource={data}
          renderItem={(doctor) => (
            <DoctorCell key={doctor.id} doctor={doctor} />
          )}
        />
      </StyledDrScrollbar>
    </AppCard>
  );
};

export default TopDoctors;
