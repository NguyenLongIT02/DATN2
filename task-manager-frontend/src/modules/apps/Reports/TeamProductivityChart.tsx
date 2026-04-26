import AppCard from "@crema/components/AppCard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import styled from "styled-components";

const StyledTeamProductivityChart = styled(AppCard)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  & .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 20px 24px 16px;
  }

  & .ant-card-head-title {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  & .ant-card-body {
    padding: 24px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #faad14, #ff4d4f);
    border-radius: 16px 16px 0 0;
  }
`;

type TeamProductivityChartProps = {
  data: any[];
};

const COLORS = ["#52c41a", "#1890ff", "#faad14", "#ff4d4f"];

const TeamProductivityChart = ({ data }: TeamProductivityChartProps) => {
  return (
    <StyledTeamProductivityChart title="Task Distribution" heightFull>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </StyledTeamProductivityChart>
  );
};

export default TeamProductivityChart;
