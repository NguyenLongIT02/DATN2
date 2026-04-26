import AppCard from "@crema/components/AppCard";
import Slider from "react-slick";
import MediaSlider from "./MediaSlider";
import { StyledSlickBasicContainer, StyledSlickWrapper } from "../index.styled";
import { SlideBasicType } from "@crema/types/models/thirdParty/reactSlick";

const settings = {
  dots: true,
  arrows: true,
  infinite: true,
  speed: 500,
  autoplay: true,
  slidesToShow: 1,
  slidesToScroll: 1,
};

type Props = {
  slideBasicArrow: SlideBasicType[];
};

const SlideBasicArrow = ({ slideBasicArrow }: Props) => {
  return (
    <AppCard>
      <MediaSlider>
        <Slider {...settings}>
          {slideBasicArrow.map((slide, index) => (
            <StyledSlickBasicContainer key={index}>
              <StyledSlickWrapper>
                <img src={slide.srcImg} alt={slide.title} />
              </StyledSlickWrapper>
            </StyledSlickBasicContainer>
          ))}
        </Slider>
      </MediaSlider>
    </AppCard>
  );
};

export default SlideBasicArrow;
