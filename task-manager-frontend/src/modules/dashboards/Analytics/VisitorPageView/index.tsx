import React from 'react';
import StatGraphs from './StatGraphs';
import AppCard from '@crema/components/AppCard';
import AppSelect from '@crema/components/AppSelect';
import {useIntl} from 'react-intl';
import type {VisitorsPageViewType} from '@crema/types/models/dashboards/Analytics';

type VisitorPageViewProps = {
  data: VisitorsPageViewType[];
};

const VisitorPageView: React.FC<VisitorPageViewProps> = ({data}) => {
  const handleSelectionType = (data: VisitorsPageViewType) => {
    console.log('data: ', data);
  };
  const {messages} = useIntl();
  return (
    <AppCard
      heightFull
      title={messages['dashboard.analytics.visitorsPageViews'] as string}
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
export default VisitorPageView;
