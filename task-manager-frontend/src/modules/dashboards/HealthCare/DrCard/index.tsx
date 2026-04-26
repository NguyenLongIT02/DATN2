import React from 'react';
import {
  StyledDrCard,
  StyledDrCardContent,
  StyledDrCardContentMain,
  StyledDrCardInfo,
  StyledDrThumb,
  StyledDrTime,
} from './index.styled';

import type {DrStateType} from '@crema/types/models/dashboards/HealthCare';

type DrCardProps = {
  data: DrStateType;
};

const DrCard: React.FC<DrCardProps> = ({data}) => {
  const {bgColor, icon, time, category, name} = data;

  return (
    <StyledDrCard
      heightFull
      style={{backgroundColor: bgColor}}
      className='card-hover'
    >
      <StyledDrCardInfo>
        <StyledDrThumb>
          <img src={icon} alt='icon' />
        </StyledDrThumb>
        <StyledDrCardContent>
          <StyledDrCardContentMain>
            <h5 className='text-truncate'>{category}</h5>
            <p className='text-truncate'>{name}</p>
          </StyledDrCardContentMain>
          <StyledDrTime>{time}</StyledDrTime>
        </StyledDrCardContent>
      </StyledDrCardInfo>
    </StyledDrCard>
  );
};

export default DrCard;
