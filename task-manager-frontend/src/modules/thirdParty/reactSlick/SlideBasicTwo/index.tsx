import AppCard from "@crema/components/AppCard";
import Slider from "react-slick";
import SlideItem from "./SlideItem";
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
  slideBasicTwo: SlideBasicType[];
};

const SlideBasicTwo = ({ slideBasicTwo }: Props) => {
  return (
    <AppCard>
      <MediaSlider>
        <Slider {...settings}>
          {slideBasicTwo.map((slide, index) => (
            <SlideItem key={index} slide={slide} />
          ))}
        </Slider>
      </MediaSlider>
    </AppCard>
  );
};

export default SlideBasicTwo;
