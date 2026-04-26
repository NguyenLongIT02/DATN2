import { StyledSlide3Wrapper } from "./index.styled";

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({ children }: Props) => {
  return <StyledSlide3Wrapper>{children}</StyledSlide3Wrapper>;
};

export default MediaSlider;
