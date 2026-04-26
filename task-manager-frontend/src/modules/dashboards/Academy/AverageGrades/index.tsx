import React from 'react';
import AppSelect from '@crema/components/AppSelect';
import GradeGraph from './GradeGraph';
import {useIntl} from 'react-intl';
import {
  StyledAverageGradeCard,
  StyledAverageGradeGraphView,
} from './index.styled';
import {GradesType} from '@crema/types/models/dashboards/AcademyType';

type AverageGradesProps = {
  grades: GradesType[];
};

const AverageGrades: React.FC<AverageGradesProps> = ({grades}) => {
  const {messages} = useIntl();

  function handleSelectionType() {
    // empty function
  }

  return (
    <StyledAverageGradeCard
      heightFull
      title={messages['academy.averageGrade'] as string}
      extra={
        <div className='ant-row ant-row-middle'>
          <AppSelect
            menus={[2020, 2021, 2018]}
            defaultValue={2020}
            onChange={handleSelectionType}
          />
          <AppSelect
            menus={['All Months', 'Jan', 'Feb']}
            defaultValue={'All Months'}
            onChange={handleSelectionType}
          />
        </div>
      }
    >
      <StyledAverageGradeGraphView>
        <GradeGraph grades={grades} />
      </StyledAverageGradeGraphView>
    </StyledAverageGradeCard>
  );
};

export default AverageGrades;
