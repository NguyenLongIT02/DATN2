import React from 'react';
import {useIntl} from 'react-intl';
import PatientGraph from './PatientGraph';
import AppMenu from '@crema/components/AppMenu';
import {
  StyledPatientArrowIcon,
  StyledPatientCard,
  StyledPatientsContent,
  StyledPatientsGraph,
  StyledPatientsNumber,
} from './index.styled';
import type {NewPatientsDataType} from '@crema/types/models/dashboards/HealthCare';

type NewPatientsProps = {
  data: NewPatientsDataType[];
};

const NewPatients: React.FC<NewPatientsProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <StyledPatientCard
      title={messages['healthCare.newPatient'] as string}
      extra={<AppMenu />}
    >
      <StyledPatientsContent>
        <StyledPatientsNumber>214</StyledPatientsNumber>
        <StyledPatientArrowIcon>
          <img
            src={'/assets/images/dashboard/metrics_icon_active.png'}
            alt='down'
          />
        </StyledPatientArrowIcon>
      </StyledPatientsContent>
      <StyledPatientsGraph>
        <PatientGraph data={data} />
      </StyledPatientsGraph>
    </StyledPatientCard>
  );
};

export default NewPatients;
