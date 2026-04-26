import AppCard from "@crema/components/AppCard";
import { Table, Tag, Progress } from "antd";
import styled from "styled-components";

const StyledBoardAnalytics = styled(AppCard)`
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
    background: linear-gradient(90deg, #0a8fdc, #52c41a);
    border-radius: 16px 16px 0 0;
  }

  & .ant-table {
    border-radius: 12px;
    overflow: hidden;
  }

  & .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-bottom: 2px solid rgba(0, 0, 0, 0.06);
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.primary};
    padding: 16px 12px;
  }

  & .ant-table-tbody > tr > td {
    padding: 16px 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }

  & .ant-table-tbody > tr:hover > td {
    background: rgba(10, 143, 220, 0.04);
  }

  & .ant-progress-bg {
    background: linear-gradient(90deg, #52c41a, #1890ff);
  }

  & .ant-tag {
    border-radius: 20px;
    padding: 4px 12px;
    font-weight: 500;
    border: none;
  }
`;

type BoardAnalyticsProps = {
  data: any[];
};

const BoardAnalytics = ({ data }: BoardAnalyticsProps) => {
  const columns = [
    {
      title: "Board Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: "#0A8FDC" }}>{text}</span>
      ),
    },
    {
      title: "Total Tasks",
      dataIndex: "totalTasks",
      key: "totalTasks",
      render: (value: number) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      render: (value: number) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>{value}</span>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress
          percent={progress}
          strokeColor={{
            "0%": "#52c41a",
            "100%": "#1890ff",
          }}
          trailColor="rgba(0, 0, 0, 0.06)"
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "Active" ? "success" : "default"}
          style={{
            borderRadius: "20px",
            padding: "4px 12px",
            fontWeight: 500,
            border: "none",
          }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <StyledBoardAnalytics title="Board Analytics" heightFull>
      <Table
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.id }))}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} boards`,
        }}
      />
    </StyledBoardAnalytics>
  );
};

export default BoardAnalytics;
