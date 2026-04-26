import React from 'react';
import {StyledSlideMediaWrapper} from './index.styled';

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({children}: Props) => {
  return <StyledSlideMediaWrapper>{children}</StyledSlideMediaWrapper>;
};

export default MediaSlider;
