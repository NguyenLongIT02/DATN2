import React from 'react';
import AppCard from '@crema/components/AppCard';
import AppScrollbar from '@crema/components/AppScrollbar';
import AppList from '@crema/components/AppList';
import { Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const StyledDeadlineItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.dividerColor};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledTaskInfo = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

const mockDeadlines = [
  {
    id: 1,
    task: 'Design Homepage',
    board: 'Website Redesign',
    dueDate: 'Today',
    priority: 'high',
  },
  {
    id: 2,
    task: 'API Integration',
    board: 'Backend Development',
    dueDate: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: 3,
    task: 'Database Migration',
    board: 'Infrastructure',
    dueDate: 'In 3 days',
    priority: 'high',
  },
  {
    id: 4,
    task: 'User Testing',
    board: 'QA',
    dueDate: 'In 5 days',
    priority: 'low',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'default';
  }
};

const UpcomingDeadlines = () => {
  return (
    <AppCard title="Upcoming Deadlines">
      <AppScrollbar style={{ height: 300 }}>
        <AppList
          data={mockDeadlines}
          renderItem={(deadline) => (
            <StyledDeadlineItem key={deadline.id}>
              <StyledTaskInfo>
                <h4>{deadline.task}</h4>
                <p>{deadline.board}</p>
              </StyledTaskInfo>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <Tag icon={<ClockCircleOutlined />}>{deadline.dueDate}</Tag>
                <Tag color={getPriorityColor(deadline.priority)}>{deadline.priority}</Tag>
              </div>
            </StyledDeadlineItem>
          )}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default UpcomingDeadlines;

