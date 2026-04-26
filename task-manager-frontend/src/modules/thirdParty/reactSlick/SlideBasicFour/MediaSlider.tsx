import React from 'react';
import {StyledSlide4Wrapper} from './index.styled';

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({children}: Props) => {
  return <StyledSlide4Wrapper>{children}</StyledSlide4Wrapper>;
};

export default MediaSlider;
