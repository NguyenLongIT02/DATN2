import {
  StyledActivityFlex,
  StyledImgWrapper,
  StyledText,
  StyledTextWrapper,
} from "./index.styled";
import { Typography } from "antd";
import type { ActivityType } from "@crema/types/models/dashboards/HealthCare";

type Props = {
  activities: ActivityType;
};

const ActivitiesItem = ({ activities }: Props) => {
  return (
    <StyledActivityFlex>
      <StyledImgWrapper>
        <img src={activities.srcImg} alt={activities.name} />
      </StyledImgWrapper>
      <StyledTextWrapper>
        <StyledText>{activities.name}</StyledText>
        <Typography.Text strong>{activities.value}</Typography.Text>
      </StyledTextWrapper>
    </StyledActivityFlex>
  );
};

export default ActivitiesItem;
