import React from 'react';
import AppCard from '@crema/components/AppCard';
import {useIntl} from 'react-intl';
import AppSelect from '@crema/components/AppSelect';
import PatientsTable from './PatientsTable';
import type {RecentPatientDataType} from '@crema/types/models/dashboards/HealthCare';

type RecentPatientsProps = {
  recentPatients: RecentPatientDataType[];
};

const RecentPatients: React.FC<RecentPatientsProps> = ({recentPatients}) => {
  const {messages} = useIntl();
  const handleSelectionType = (data: RecentPatientDataType[]) => {
    console.log('data: ', data);
  };
  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      title={messages['healthCare.recentPatient'] as string}
      extra={
        <AppSelect
          menus={[
            messages['dashboard.thisWeek'],
            messages['dashboard.lastWeeks'],
            messages['dashboard.lastMonth'],
          ]}
          defaultValue={messages['dashboard.thisWeek']}
          onChange={handleSelectionType}
        />
      }
    >
      <PatientsTable recentPatients={recentPatients} />
    </AppCard>
  );
};

export default RecentPatients;
