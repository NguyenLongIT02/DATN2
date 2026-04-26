import React from 'react';
import AppCard from '@crema/components/AppCard';
import {useIntl} from 'react-intl';
import StudentRankingsTable from './StudentRankingsTable';
import AppMenu from '@crema/components/AppMenu';

import {StudentRankingDataType} from '@crema/types/models/dashboards/AcademyType';

type StudentRankingsProps = {
  studentRankings: StudentRankingDataType[];
};

const StudentRankings: React.FC<StudentRankingsProps> = ({studentRankings}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      heightFull
      className='no-card-space-ltr-rtl'
      title={messages['academy.studentRankings'] as string}
      extra={<AppMenu />}
    >
      <StudentRankingsTable studentRankings={studentRankings} />
    </AppCard>
  );
};

export default StudentRankings;
