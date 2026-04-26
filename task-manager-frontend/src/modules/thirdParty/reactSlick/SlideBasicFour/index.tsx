import AppCard from "@crema/components/AppCard";
import Slider from "react-slick";
import SlideItem from "./SlideItem";
import MediaSlider from "./MediaSlider";
import { SlideBasicFourType } from "@crema/types/models/thirdParty/reactSlick";

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
  slideBasicFour: SlideBasicFourType[];
};

const SlideBasicFour = ({ slideBasicFour }: Props) => {
  return (
    <AppCard>
      <MediaSlider>
        <Slider {...settings}>
          {slideBasicFour.map((slide, index) => (
            <div key={index}>
              <SlideItem slide={slide} />
            </div>
          ))}
        </Slider>
      </MediaSlider>
    </AppCard>
  );
};

export default SlideBasicFour;
