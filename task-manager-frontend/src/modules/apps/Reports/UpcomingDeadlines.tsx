import { List, Tag, Collapse } from "antd";
import AppCard from "@crema/components/AppCard";
import AppScrollbar from "@crema/components/AppScrollbar";
import styled from "styled-components";
import { rgba } from "polished";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const StyledUpcomingDeadlines = styled(AppCard)`
  border-radius: ${({ theme }) => theme.cardRadius};
  overflow: hidden;

  & .ant-collapse-content > .ant-collapse-content-box {
    padding-left: 20px;
    padding-right: 20px;
  }

  & .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding-left: 20px;
    padding-right: 20px;
    font-size: ${({ theme }) => theme.font.size.lg};
    font-weight: ${({ theme }) => theme.font.weight.bold};

    [dir="rtl"] & {
      padding-left: 20px;
      padding-right: 20px;
    }
  }

  &
    .ant-collapse
    > .ant-collapse-item
    > .ant-collapse-header
    .ant-collapse-arrow {
    left: 20px;

    [dir="rtl"] & {
      left: auto;
      right: 20px;
    }
  }

  & .ant-collapse-extra {
    font-weight: ${({ theme }) => theme.font.weight.medium};
    font-size: ${({ theme }) => theme.font.size.base};
  }

  & .ant-card-actions {
    border-top: 0 none;
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const StyledDeadlineAction = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.secondary};

  & span {
    margin-left: 8px;

    [dir="rtl"] & {
      margin-left: 0;
      margin-right: 8px;
    }
  }
`;

const StyledDeadlineItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  margin: 0 -16px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(24, 144, 255, 0.08);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }

  &:last-child {
    border-bottom: none;
  }

  .deadline-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 12px;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: ${({ theme }) => theme.palette.text.primary};
      flex: 1;
      transition: color 0.2s ease;
    }
  }

  .deadline-info {
    font-size: 13px;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-bottom: 4px;
    transition: color 0.2s ease;
  }

  .deadline-date {
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.disabled};
    transition: color 0.2s ease;
  }

  .ant-tag {
    border-radius: 12px;
    padding: 2px 8px;
    font-weight: 500;
    font-size: 11px;
    border: none;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
  }

  &:hover .deadline-header h4 {
    color: #1890ff;
  }

  &:hover .deadline-info {
    color: #1890ff;
  }

  &:hover .deadline-date {
    color: #1890ff;
  }

  &:hover .ant-tag {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

type UpcomingDeadlinesProps = {
  data: {
    id: number;
    task: string;
    board: string;
    dueDate: string;
    priority: string;
  }[];
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

const UpcomingDeadlines = ({ data }: UpcomingDeadlinesProps) => {
  const handleCollapseChange = (key: any) => {
    console.log(key);
  };

  const genExtra = () => (
    <>
      <span>{data.length} Deadlines</span>
    </>
  );

  return (
    <StyledUpcomingDeadlines
      className="no-card-space"
      actions={[
        <StyledDeadlineAction key={1}>
          <ClockCircleOutlined style={{ fontSize: 16 }} />
          <span>Last update 30 min ago</span>
        </StyledDeadlineAction>,
      ]}
    >
      <Collapse
        bordered={false}
        defaultActiveKey={["1"]}
        accordion
        onChange={handleCollapseChange}
      >
        <Panel header="Upcoming Deadlines" key="1" extra={genExtra()}>
          <AppScrollbar style={{ height: 300 }}>
            <List
              dataSource={data}
              renderItem={(item) => (
                <StyledDeadlineItem>
                  <div className="deadline-header">
                    <h4>{item.task}</h4>
                    <Tag color={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Tag>
                  </div>
                  <div className="deadline-info">{item.board}</div>
                  <div className="deadline-date">Due: {item.dueDate}</div>
                </StyledDeadlineItem>
              )}
            />
          </AppScrollbar>
        </Panel>
      </Collapse>
    </StyledUpcomingDeadlines>
  );
};

export default UpcomingDeadlines;
