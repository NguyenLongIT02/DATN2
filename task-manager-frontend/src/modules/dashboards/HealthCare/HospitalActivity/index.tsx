import React from 'react';
import StatGraphs from './StatGraphs';
import AppCard from '@crema/components/AppCard';
import AppSelect from '@crema/components/AppSelect';
import {useIntl} from 'react-intl';
import type {HospitalActivityDataType} from '@crema/types/models/dashboards/HealthCare';

type HospitalActivityProps = {
  data: HospitalActivityDataType[];
};

const HospitalActivity: React.FC<HospitalActivityProps> = ({data}) => {
  const handleSelectionType = (data: HospitalActivityDataType[]) => {
    console.log('data: ', data);
  };
  const {messages} = useIntl();
  return (
    <AppCard
      heightFull
      title={messages['healthCare.hospitalActivity'] as string}
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
      <StatGraphs data={data} />
    </AppCard>
  );
};
export default HospitalActivity;
