import React from 'react';
import {
  StyledAppointmentCell,
  StyledAppointmentCellAction,
  StyledAppointmentCellAvatar,
  StyledAppointmentCellContent,
  StyledAppointmentCellTime,
} from './index.styled';
import type {UpcomingAppointmentType} from '@crema/types/models/dashboards/HealthCare';

type AppointmentCellProps = {
  appointment: UpcomingAppointmentType;
};

const AppointmentCell: React.FC<AppointmentCellProps> = ({appointment}) => {
  return (
    <StyledAppointmentCell className='item-hover'>
      <StyledAppointmentCellAvatar src={appointment.profile_pic} />
      <StyledAppointmentCellContent>
        <h5>{appointment.name}</h5>
        <p>{appointment.speciality}</p>
      </StyledAppointmentCellContent>
      <StyledAppointmentCellAction>
        <StyledAppointmentCellTime>
          {appointment.appointmentTime}
        </StyledAppointmentCellTime>
        <p>{appointment.appointmentDate}</p>
      </StyledAppointmentCellAction>
    </StyledAppointmentCell>
  );
};

export default AppointmentCell;
