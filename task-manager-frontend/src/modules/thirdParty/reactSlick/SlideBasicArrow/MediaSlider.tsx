import React from 'react';
import {StyledSlideBasicWrapper} from './index.styled';

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({children}: Props) => {
  return <StyledSlideBasicWrapper>{children}</StyledSlideBasicWrapper>;
};

export default MediaSlider;
