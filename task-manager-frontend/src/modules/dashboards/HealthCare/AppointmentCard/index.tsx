import React from 'react';
import AppCard from '@crema/components/AppCard';
import Graph from './Graph';
import {
  StyledAppointmentArrowIcon,
  StyledAppointmentContent,
  StyledAppointmentContentItem,
  StyledAppointmentContentRight,
  StyledAppointmentThumb,
} from './index.styled';
import type {AppointmentCardsType} from '@crema/types/models/dashboards/HealthCare';

type AppointmentCardProps = {
  data: AppointmentCardsType;
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({data}) => {
  return (
    <AppCard
      style={{backgroundColor: data.color, color: 'white'}}
      className='card-hover'
    >
      <StyledAppointmentContent>
        <StyledAppointmentContentItem>
          <StyledAppointmentThumb>
            <img src={data.icon} alt={data.name} />
          </StyledAppointmentThumb>
          <p className='text-truncate'>{data.name}</p>
          <h3>{data.value}</h3>
        </StyledAppointmentContentItem>
        <StyledAppointmentContentRight>
          <div className='ant-row ant-row-middle'>
            <StyledAppointmentArrowIcon />
            <span>{data.chartValue}</span>
          </div>
          <h5 className='text-truncate'>{data.chartTime}</h5>
          <Graph data={data.chartData} />
        </StyledAppointmentContentRight>
      </StyledAppointmentContent>
    </AppCard>
  );
};

export default AppointmentCard;
