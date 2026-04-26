import SlideItem from "./SlideItem";
import AppCard from "@crema/components/AppCard";
import Slider from "react-slick";
import MediaSlider from "./MediaSlider";
import { SlideBasicType } from "@crema/types/models/thirdParty/reactSlick";

const settings = {
  dots: true,
  arrows: false,
  infinite: true,
  speed: 500,
  autoplay: true,
  slidesToShow: 1,
  slidesToScroll: 1,
};

type Props = {
  slideBasicFive: SlideBasicType[];
};

const SlideBasicFive = ({ slideBasicFive }: Props) => {
  return (
    <AppCard>
      <MediaSlider>
        <Slider {...settings}>
          {slideBasicFive.map((slide, index) => (
            <SlideItem key={index} slide={slide} />
          ))}
        </Slider>
      </MediaSlider>
    </AppCard>
  );
};

export default SlideBasicFive;
