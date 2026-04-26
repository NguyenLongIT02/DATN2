import React from 'react';
import {StyledTimelineContainer} from './index.styled';

type Props = {
  children: React.ReactNode;
};

const TimelineContainer = ({children}: Props) => {
  return <StyledTimelineContainer>{children}</StyledTimelineContainer>;
};

export default TimelineContainer;
