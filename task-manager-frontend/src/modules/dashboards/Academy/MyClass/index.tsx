import AppCard from '@crema/components/AppCard';
import React from 'react';
import {useIntl} from 'react-intl';
import {List, Progress} from 'antd';
import {
  StyledMyClassContent,
  StyledMyClassContentHeader,
  StyledMyClassItem,
  StyledMyClassPercent,
  StyledMyClassProgressView,
  StyledMyClassThumb,
} from './index.styled';
import {ClassDataType} from '@crema/types/models/dashboards/AcademyType';

type ClassItemProps = {
  item: ClassDataType;
};

const ClassItem: React.FC<ClassItemProps> = ({item}) => {
  return (
    <StyledMyClassItem key={item.id} className='item-hover'>
      <StyledMyClassThumb>
        <img alt='' src={item.icon} />
      </StyledMyClassThumb>
      <StyledMyClassContent>
        <StyledMyClassContentHeader>
          <h3>{item.name}</h3>
          <StyledMyClassPercent>{item.percent}%</StyledMyClassPercent>
        </StyledMyClassContentHeader>
        <StyledMyClassProgressView>
          <Progress
            percent={item.percent}
            strokeColor='#0A8FDC'
            trailColor='#d6d6d6'
            strokeWidth={5}
            showInfo={false}
          />
        </StyledMyClassProgressView>
      </StyledMyClassContent>
    </StyledMyClassItem>
  );
};

type MyClassProps = {
  classData: ClassDataType[];
};

const MyClass: React.FC<MyClassProps> = ({classData}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      heightFull
      className='no-card-space-ltr-rtl'
      title={messages['academy.myClass'] as string}
    >
      <List
        dataSource={classData}
        renderItem={(data, index) => <ClassItem key={index} item={data} />}
      />
    </AppCard>
  );
};

export default MyClass;
