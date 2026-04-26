import React from 'react';
import {StyledTimelineCircle} from '../index.styled';

type Props = {
  children: React.ReactNode;
};

const CircleWrapper = ({children}: Props) => {
  return <StyledTimelineCircle>{children}</StyledTimelineCircle>;
};

export default CircleWrapper;
