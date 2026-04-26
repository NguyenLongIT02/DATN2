import React from 'react';
import {StyledSlideBasic5Wrapper} from './index.styled';

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({children}: Props) => {
  return <StyledSlideBasic5Wrapper>{children}</StyledSlideBasic5Wrapper>;
};

export default MediaSlider;
