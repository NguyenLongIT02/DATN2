import React from 'react';
import VisitorsGraph from './VisitorsGraph';
import {useIntl} from 'react-intl';
import AppCard from '@crema/components/AppCard';
import {green, red} from '@ant-design/colors';
import {
  StyledActiveVisitorContent,
  StyledActiveVisitorContentHeader,
  StyledActiveVisitorFooter,
  StyledActiveVisitorGraph,
  StyledActiveVisitorGraphHeader,
  StyledActiveVisitorGraphWrap,
  StyledActiveVisitorLink,
} from './index.styled';

import type {ActiveVisitorsType} from '@crema/types/models/dashboards/Analytics';

type Props = {
  data: ActiveVisitorsType;
};

const ActiveVisitors: React.FC<Props> = ({data}) => {
  const {messages} = useIntl();
  return (
    <AppCard className='no-card-space'>
      <StyledActiveVisitorGraphWrap>
        <StyledActiveVisitorGraphHeader>
          <h3>{messages['dashboard.analytics.activeVisitors'] as string}</h3>
          <p>{messages['dashboard.analytics.pageViewPerMinutes'] as string}</p>
        </StyledActiveVisitorGraphHeader>
        <StyledActiveVisitorGraph>
          <VisitorsGraph data={data.graphData} />
        </StyledActiveVisitorGraph>
      </StyledActiveVisitorGraphWrap>
      <StyledActiveVisitorContent>
        <div>
          <StyledActiveVisitorContentHeader>
            <h3>{data.value}</h3>
            <span style={{color: data.growth > 0.0 ? green[6] : red[5]}}>
              {data.growth}% Then yesterday
            </span>
          </StyledActiveVisitorContentHeader>
          <p>{data.slug}</p>
        </div>
        <StyledActiveVisitorFooter>
          <StyledActiveVisitorLink to='#'>View Report</StyledActiveVisitorLink>
        </StyledActiveVisitorFooter>
      </StyledActiveVisitorContent>
    </AppCard>
  );
};

export default ActiveVisitors;
