import { Avatar, List, Collapse } from "antd";
import AppCard from "@crema/components/AppCard";
import AppScrollbar from "@crema/components/AppScrollbar";
import styled from "styled-components";
import { rgba } from "polished";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const StyledRecentActivities = styled(AppCard)`
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

const StyledActivityAction = styled.div`
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

const StyledActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

  .activity-content {
    flex: 1;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: ${({ theme }) => theme.palette.text.primary};
      transition: color 0.2s ease;
    }

    p {
      margin: 4px 0 0;
      font-size: 13px;
      color: ${({ theme }) => theme.palette.text.secondary};
      transition: color 0.2s ease;
    }
  }

  .activity-time {
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.disabled};
    transition: color 0.2s ease;
  }

  &:hover .activity-content h4 {
    color: #1890ff;
  }

  &:hover .activity-content p {
    color: #1890ff;
  }

  &:hover .activity-time {
    color: #1890ff;
  }
`;

type RecentActivitiesProps = {
  data: {
    id: number;
    user: { name: string; avatar: string };
    action: string;
    time: string;
  }[];
};

const RecentActivities = ({ data }: RecentActivitiesProps) => {
  const handleCollapseChange = (key: any) => {
    console.log(key);
  };

  const genExtra = () => (
    <>
      <span>{data.length} Activities</span>
    </>
  );

  return (
    <StyledRecentActivities
      className="no-card-space"
      actions={[
        <StyledActivityAction key={1}>
          <ClockCircleOutlined style={{ fontSize: 16 }} />
          <span>Last update 30 min ago</span>
        </StyledActivityAction>,
      ]}
    >
      <Collapse
        bordered={false}
        defaultActiveKey={["1"]}
        accordion
        onChange={handleCollapseChange}
      >
        <Panel header="Recent Activities" key="1" extra={genExtra()}>
          <AppScrollbar style={{ height: 300 }}>
            <List
              dataSource={data}
              renderItem={(item) => (
                <StyledActivityItem>
                  <Avatar src={item.user.avatar} size={32} />
                  <div className="activity-content">
                    <h4>{item.user.name}</h4>
                    <p>{item.action}</p>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </StyledActivityItem>
              )}
            />
          </AppScrollbar>
        </Panel>
      </Collapse>
    </StyledRecentActivities>
  );
};

export default RecentActivities;
