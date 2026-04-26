import React from 'react';
import AppCard from '@crema/components/AppCard';
import VisitsTable from './VisitsTable';
import {useIntl} from 'react-intl';
import type {PageVisitType} from '@crema/types/models/dashboards/Analytics';

type PageVisitsProps = {
  pageVisits: PageVisitType[];
};

const PageVisits: React.FC<PageVisitsProps> = ({pageVisits}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      title={messages['dashboard.analytics.pageVisits'] as string}
      extra={<a href='#/'>{messages['common.viewAll'] as string}</a>}
    >
      <VisitsTable visitsData={pageVisits} />
    </AppCard>
  );
};

export default PageVisits;
