import React from 'react';
import {Button} from 'antd';
import {
  StyledDoctorContent,
  StyledDoctorAvatar,
  StyledDoctorCell,
  StyledDoctorAction,
} from './index.styled';
import type {TopDoctorDataType} from '@crema/types/models/dashboards/HealthCare';

type DoctorCellProps = {
  doctor: TopDoctorDataType;
};

const DoctorCell: React.FC<DoctorCellProps> = ({doctor}) => {
  return (
    <StyledDoctorCell className='item-hover'>
      <StyledDoctorAvatar src={doctor.profile_pic} />
      <StyledDoctorContent>
        <h5>{doctor.name}</h5>
        <p>{doctor.speciality}</p>
      </StyledDoctorContent>
      <StyledDoctorAction>
        {doctor.scheduled ? (
          <Button className='btn-secondary-outline'>Remove</Button>
        ) : (
          <Button className='btn-primary-outline'>Schedule</Button>
        )}
      </StyledDoctorAction>
    </StyledDoctorCell>
  );
};

export default DoctorCell;
