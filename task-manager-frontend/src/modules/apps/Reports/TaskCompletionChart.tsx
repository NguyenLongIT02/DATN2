import AppCard from "@crema/components/AppCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled from "styled-components";

const StyledTaskCompletionChart = styled(AppCard)`
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
    background: linear-gradient(90deg, #52c41a, #1890ff);
    border-radius: 16px 16px 0 0;
  }
`;

type TaskCompletionChartProps = {
  data: any[];
};

const TaskCompletionChart = ({ data }: TaskCompletionChartProps) => {
  return (
    <StyledTaskCompletionChart title="Task Completion Trend" heightFull>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.06)" />
          <XAxis
            dataKey="name"
            stroke="#8c8c8c"
            fontSize={12}
            fontWeight={500}
          />
          <YAxis stroke="#8c8c8c" fontSize={12} fontWeight={500} />
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
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#52c41a"
            strokeWidth={3}
            dot={{ fill: "#52c41a", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#52c41a", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="inProgress"
            stroke="#1890ff"
            strokeWidth={3}
            dot={{ fill: "#1890ff", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#1890ff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </StyledTaskCompletionChart>
  );
};

export default TaskCompletionChart;
