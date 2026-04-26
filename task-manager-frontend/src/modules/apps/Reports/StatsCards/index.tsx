import { Row, Col } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  StyledStatsCard,
  StyledStatsIcon,
  StyledStatsContent,
  StyledStatsInfo,
} from "./index.styled";

type StatsCardsProps = {
  data: {
    id: number;
    title: string;
    value: string;
    growth: number;
    icon: string;
    color: string;
  }[];
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "CheckCircleOutlined":
      return <CheckCircleOutlined />;
    case "ClockCircleOutlined":
      return <ClockCircleOutlined />;
    case "TeamOutlined":
      return <TeamOutlined />;
    case "ProjectOutlined":
      return <ProjectOutlined />;
    default:
      return <CheckCircleOutlined />;
  }
};

const StatsCards = ({ data }: StatsCardsProps) => {
  return (
    <Row gutter={[32, 32]}>
      {data.map((stat) => (
        <Col key={stat.id} xs={24} sm={12} lg={6}>
          <StyledStatsCard>
            <StyledStatsContent>
              <StyledStatsIcon style={{ backgroundColor: stat.color }}>
                {getIcon(stat.icon)}
              </StyledStatsIcon>
              <StyledStatsInfo>
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span className="growth">+{stat.growth}%</span>
              </StyledStatsInfo>
            </StyledStatsContent>
          </StyledStatsCard>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
