import React from 'react';
import AppCard from '@crema/components/AppCard';
import LearningItem from './LearningItem';
import {useIntl} from 'react-intl';
import {List} from 'antd';
import {LearningDataType} from '@crema/types/models/dashboards/AcademyType';

type MyLearningProps = {
  learningData: LearningDataType[];
};

const MyLearning: React.FC<MyLearningProps> = ({learningData}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      title={messages['academy.myLearning'] as string}
    >
      <List
        dataSource={learningData}
        renderItem={(data, index) => <LearningItem key={index} course={data} />}
      />
    </AppCard>
  );
};

export default MyLearning;
