import React from 'react';
import {StyledTimelineItem} from '../index.styled';

type Props = {
  children: React.ReactNode;
};

const TimelineItemWrapper = ({children}: Props) => {
  return <StyledTimelineItem>{children}</StyledTimelineItem>;
};

export default TimelineItemWrapper;
