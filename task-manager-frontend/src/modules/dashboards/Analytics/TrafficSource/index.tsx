import React from 'react';
import AppCard from '@crema/components/AppCard';
import {useIntl} from 'react-intl';

import {Progress} from 'antd';
import {
  StyledCollapseHeaderPanel,
  StyledTrafficCollapse,
  StyledTrafficCollapseContent,
  StyledTrafficCollapseData,
  StyledTrafficCollapseHeader,
  StyledTrafficCollapsePanel,
} from './index.styled';
import type {TrafficDataType} from '@crema/types/models/dashboards/Analytics';

type TrafficSourceProps = {
  trafficData: TrafficDataType[];
};

const TrafficSource: React.FC<TrafficSourceProps> = ({trafficData}) => {
  const {messages} = useIntl();
  return (
    <AppCard title={messages['dashboard.analytics.trafficSource'] as string}>
      <StyledTrafficCollapse
        bordered={false}
        defaultActiveKey={['1']}
        accordion
      >
        {trafficData.map((data) => (
          <StyledTrafficCollapsePanel
            header={
              <StyledCollapseHeaderPanel>
                <StyledTrafficCollapseHeader>
                  <h3>{data.title}</h3>
                  <span>{data.value}%</span>
                </StyledTrafficCollapseHeader>
                <Progress
                  percent={data.value}
                  strokeWidth={10}
                  strokeColor='#0698EC'
                  trailColor='#d6d6d6'
                  showInfo={false}
                />
              </StyledCollapseHeaderPanel>
            }
            key={data.id}
          >
            <StyledTrafficCollapseContent>
              <StyledTrafficCollapseData>
                {data.session}
              </StyledTrafficCollapseData>
              <span>Session</span>
            </StyledTrafficCollapseContent>
          </StyledTrafficCollapsePanel>
        ))}
      </StyledTrafficCollapse>
    </AppCard>
  );
};

export default TrafficSource;
