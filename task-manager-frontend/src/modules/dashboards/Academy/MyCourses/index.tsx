import React, {useState} from 'react';
import AppCard from '@crema/components/AppCard';
import CourseCell from './CourseCell';
import {useIntl} from 'react-intl';
import {List} from 'antd';
import clsx from 'clsx';
import {
  StyledCategoryBadge,
  StyledMyCategoryItem,
  StyledMyCourseHeader,
} from './index.styled';

import {CoursesType} from '@crema/types/models/dashboards/AcademyType';

type MyCoursesProps = {
  courses: CoursesType;
};

const MyCourses: React.FC<MyCoursesProps> = ({courses}) => {
  const [selectedCategory, setSelectedCategory] = useState(
    courses.categories[0].slug,
  );

  const handleChangeCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const {messages} = useIntl();

  return (
    <AppCard
      className='no-card-space-ltr-rtl'
      heightFull
      title={messages['academy.myCourses'] as string}
    >
      <StyledMyCourseHeader>
        {courses.categories.map((item, index) => (
          <StyledMyCategoryItem
            key={index}
            onClick={() => handleChangeCategory(item.slug)}
          >
            <StyledCategoryBadge
              className={clsx({
                active: item.slug === selectedCategory,
              })}
              key={index}
            >
              {item.title}
            </StyledCategoryBadge>
          </StyledMyCategoryItem>
        ))}
      </StyledMyCourseHeader>
      <List
        dataSource={courses.courses}
        renderItem={(data, index) => <CourseCell key={index} course={data} />}
      />
    </AppCard>
  );
};

export default MyCourses;
