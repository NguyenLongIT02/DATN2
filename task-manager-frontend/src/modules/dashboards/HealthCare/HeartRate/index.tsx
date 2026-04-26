import React from 'react';
import AppCard from '@crema/components/AppCard';
import ViewGraph from './ViewGraph';
import {
  StyledHeartGraphItem,
  StyledHeartGraphView,
  StyledHeartRate,
  StyledUnitTitle,
} from './index.styled';
import type {HeartCardType} from '@crema/types/models/dashboards/HealthCare';

type HeartRateProps = {
  data: HeartCardType;
};

const HeartRate: React.FC<HeartRateProps> = ({data}) => {
  return (
    <AppCard
      heightFull
      style={{
        overflow: 'hidden',
        backgroundColor: data.color,
        color: 'white',
      }}
    >
      <StyledHeartRate>
        <h3>{data.title}</h3>
        <StyledHeartGraphView>
          <StyledHeartGraphItem>
            <ViewGraph data={data.graphData} />
          </StyledHeartGraphItem>
        </StyledHeartGraphView>
        <StyledUnitTitle>
          {data.measurement}
          <span>{data.unit}</span>
        </StyledUnitTitle>
      </StyledHeartRate>
    </AppCard>
  );
};

export default HeartRate;
