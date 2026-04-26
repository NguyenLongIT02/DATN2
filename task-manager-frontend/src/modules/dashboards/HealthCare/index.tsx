import AppRowContainer from "@crema/components/AppRowContainer";
import AppAnimate from "@crema/components/AppAnimate";
import { useGetDataApi } from "@crema/hooks/APIHooks";

import DrCard from "./DrCard";
import HealthStatics from "./HealthStatics";
import UpcomingAppointments from "./UpcomingAppointments";
import Notifications from "./Notifications";
import RecentPatients from "./RecentPatients";

import AppLoader from "@crema/components/AppLoader";
import { Col } from "antd";
import type { HealthCareType } from "@crema/types/models/dashboards/HealthCare";

const HealthCare = () => {
  const [{ apiData: healthCareData, loading }] = useGetDataApi<HealthCareType>(
    "/dashboard/health_care",
  );

  return (
    <>
      {loading ? (
        <AppLoader />
      ) : (
        <AppAnimate animation="transition.slideUpIn" delay={200}>
          <AppRowContainer>
            {healthCareData.salesState.map((data, index) => (
              <Col xs={24} sm={12} lg={6} key={"a" + index}>
                <DrCard data={data} />
              </Col>
            ))}
            <Col xs={24} sm={24} lg={12} key={"l"}>
              <UpcomingAppointments data={healthCareData.upcomingAppointment} />
            </Col>
            <Col xs={24} sm={24} lg={12} key={"o"}>
              <Notifications data={healthCareData.notifications} />
            </Col>
            <Col xs={24} md={24} lg={24} key={"m"}>
              <HealthStatics data={healthCareData.heathStatics} />
            </Col>
            <Col xs={24} sm={24} lg={24} key={"r"}>
              <RecentPatients recentPatients={healthCareData.recentPatients} />
            </Col>
            <Col xs={24} sm={24} lg={8} className="mb-0" key={"s"}>
              {/* <AppRowContainer>
                {healthCareData.bloodCard.map((data, index) => (
                  <Col xs={24} sm={12} key={"t" + index}>
                    <InfoWidget data={data} />
                  </Col>
                ))}
              </AppRowContainer> */}
            </Col>
          </AppRowContainer>
        </AppAnimate>
      )}
    </>
  );
};

export default HealthCare;
