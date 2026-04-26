import {
  StyledHeading,
  StyledHeadingWrapper,
  StyledSlick3Wrapper,
  StyledSlide3ItemWrapper,
} from "./index.styled";
import { SlideBasicType } from "@crema/types/models/thirdParty/reactSlick";

type Props = {
  slide: SlideBasicType;
};

const SlideItem = ({ slide }: Props) => {
  return (
    <StyledSlide3ItemWrapper>
      <StyledSlick3Wrapper>
        <img src={slide.srcImg} alt={slide.title} />
      </StyledSlick3Wrapper>
      <StyledHeadingWrapper>
        <StyledHeading level={5}>{slide.title}</StyledHeading>
      </StyledHeadingWrapper>
    </StyledSlide3ItemWrapper>
  );
};

export default SlideItem;
