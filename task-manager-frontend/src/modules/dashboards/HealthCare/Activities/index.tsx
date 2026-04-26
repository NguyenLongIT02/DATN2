import { useIntl } from "react-intl";
import ActivitiesItem from "./ActivitiesItem";
import AppRowContainer from "@crema/components/AppRowContainer";
import AppCard from "@crema/components/AppCard";
import { Col } from "antd";
import type { ActivityType } from "@crema/types/models/dashboards/HealthCare";

type Props = {
  activities: ActivityType[];
};

const Activities = ({ activities }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard title={messages["dashboard.crypto.activities"] as string}>
      <AppRowContainer>
        {activities.map((activities, index) => (
          <Col xs={12} sm={8} md={12} lg={12} xl={8} key={index}>
            <ActivitiesItem activities={activities} />
          </Col>
        ))}
      </AppRowContainer>
    </AppCard>
  );
};

export default Activities;
