import AppCard from "@crema/components/AppCard";
import Slider from "react-slick";
import MediaSlider from "./MediaSlider";
import SlideItem from "./SlideItem";
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
  slideBasicThree: SlideBasicType[];
};

const SlideBasicThree = ({ slideBasicThree }: Props) => {
  return (
    <AppCard>
      <MediaSlider>
        <Slider {...settings}>
          {slideBasicThree.map((slide, index) => (
            <SlideItem key={index} slide={slide} />
          ))}
        </Slider>
      </MediaSlider>
    </AppCard>
  );
};

export default SlideBasicThree;
