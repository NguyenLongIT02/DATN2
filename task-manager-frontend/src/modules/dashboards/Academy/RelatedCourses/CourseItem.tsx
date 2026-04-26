import React from 'react';
import {EyeOutlined} from '@ant-design/icons';
import {
  StyledCourseView,
  StyledRelatedCourseAction,
  StyledRelatedCourseItem,
  StyledRelatedCourseThumb,
} from './index.styled';

import {RelatedCoursesDataType} from '@crema/types/models/dashboards/AcademyType';

type CourseItemProps = {
  data: RelatedCoursesDataType;
};

const CourseItem: React.FC<CourseItemProps> = ({data}) => {
  return (
    <StyledRelatedCourseItem>
      <StyledRelatedCourseThumb>
        <img src={data.image} alt={data.title} />
      </StyledRelatedCourseThumb>
      <h4>{data.title}</h4>
      <StyledRelatedCourseAction>
        <p>{data.author}</p>
        <StyledCourseView>
          <EyeOutlined />
          <span>{data.views} views</span>
        </StyledCourseView>
      </StyledRelatedCourseAction>
    </StyledRelatedCourseItem>
  );
};

export default CourseItem;
