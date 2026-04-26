import React from 'react';
import {useIntl} from 'react-intl';
import VisitsGraph from './VisitsGraph';
import AppMenu from '@crema/components/AppMenu';
import {
  StyledCancelVisitCard,
  StyledCancelVisitContent,
  StyledCancelVisitNumber,
  StyledCancelVisitsGraph,
  // StyledCancelVisitsIcon,
} from './index.styled';
import type {CancelVisitDataType} from '@crema/types/models/dashboards/HealthCare';

type CancelVisitsProps = {
  data: CancelVisitDataType[];
};

const CancelVisits: React.FC<CancelVisitsProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <StyledCancelVisitCard
      title={messages['healthCare.cancelledVisits'] as string}
      extra={<AppMenu />}
    >
      <StyledCancelVisitContent>
        <StyledCancelVisitNumber>32</StyledCancelVisitNumber>
        <span>
          <img src={'/assets/images/dashboard/decries_icon.svg'} alt='down' />
        </span>
      </StyledCancelVisitContent>
      <StyledCancelVisitsGraph>
        <VisitsGraph data={data} />
      </StyledCancelVisitsGraph>
    </StyledCancelVisitCard>
  );
};

export default CancelVisits;
