import React from 'react';
import {StyledMediaSliderWrapper} from './index.styled';

type Props = {
  children: React.ReactNode;
};
const MediaSlider = ({children}: Props) => {
  return <StyledMediaSliderWrapper>{children}</StyledMediaSliderWrapper>;
};

export default MediaSlider;
