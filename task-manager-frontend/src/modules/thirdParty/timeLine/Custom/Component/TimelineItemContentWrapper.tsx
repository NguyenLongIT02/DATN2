import React from 'react';
import {StyledTimelineItemContent} from '../index.styled';

type Props = {
  children: React.ReactNode;
};

const TimelineItemContentWrapper = ({children}: Props) => {
  return (
    <StyledTimelineItemContent className='timelineItemContent'>
      {children}
    </StyledTimelineItemContent>
  );
};

export default TimelineItemContentWrapper;
