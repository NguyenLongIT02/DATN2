import AppComponentHeader from "@crema/components/AppComponentHeader";
import AppComponentCard from "@crema/components/AppComponentCard";
import SimpleMap from "./Simple";
import SimpleMapSource from "././Simple?raw";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Col } from "antd";

const GoogleMap = () => {
  return (
    <>
      <AppComponentHeader
        title="Google Map"
        description="A wrapper around google.maps.Map"
        refUrl="https://developers.google.com/maps/documentation/javascript/3.exp/reference#Map/"
      />

      <AppRowContainer>
        <Col xs={24}>
          <AppComponentCard
            title="Simple Map"
            component={SimpleMap}
            source={SimpleMapSource}
          />
        </Col>
      </AppRowContainer>
    </>
  );
};

export default GoogleMap;
