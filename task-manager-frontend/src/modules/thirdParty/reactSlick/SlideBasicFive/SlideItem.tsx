import {
  StyledSlide5Img,
  StyledSlide5ItemWrapper,
  StyledSlidePos,
  StyledSlidePosSpace,
  StyledSlideThumbnailWrapper,
  StyledSlideTitleWrapper,
} from "./index.styled";
import { Typography } from "antd";
import { StyledHeading } from "../SlideBasicTwo/index.styled";
import { SlideBasicType } from "@crema/types/models/thirdParty/reactSlick";

type Props = {
  slide: SlideBasicType;
};
const SlideItem = ({ slide }: Props) => {
  return (
    <StyledSlidePos>
      <StyledSlidePosSpace>
        <StyledSlide5ItemWrapper>
          <StyledSlide5Img>
            <img src={slide.srcImg} alt={slide.title} />
          </StyledSlide5Img>
        </StyledSlide5ItemWrapper>

        <StyledSlideThumbnailWrapper>
          <img src={slide.srcImg} alt={slide.title} />
        </StyledSlideThumbnailWrapper>
      </StyledSlidePosSpace>
      <StyledSlideTitleWrapper>
        <StyledHeading level={5}>{slide.title}</StyledHeading>
        <Typography.Paragraph style={{ margin: 0 }}>
          {slide.description}
        </Typography.Paragraph>
      </StyledSlideTitleWrapper>
    </StyledSlidePos>
  );
};

export default SlideItem;
