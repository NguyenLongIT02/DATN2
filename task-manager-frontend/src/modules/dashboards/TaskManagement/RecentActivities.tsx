import React from 'react';
import AppCard from '@crema/components/AppCard';
import AppScrollbar from '@crema/components/AppScrollbar';
import AppList from '@crema/components/AppList';
import { Avatar } from 'antd';
import styled from 'styled-components';

const StyledActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.dividerColor};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledActivityInfo = styled.div`
  flex: 1;

  p {
    margin: 0 0 4px 0;
    font-size: 14px;
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

const mockActivities = [
  {
    id: 1,
    user: { name: 'John Doe', avatar: '/assets/images/avatar/A11.jpg' },
    action: 'created card "Design Homepage"',
    time: '2 hours ago',
  },
  {
    id: 2,
    user: { name: 'Jane Smith', avatar: '/assets/images/avatar/A12.jpg' },
    action: 'moved card "API Integration" to Done',
    time: '5 hours ago',
  },
  {
    id: 3,
    user: { name: 'Mike Johnson', avatar: '/assets/images/avatar/A13.jpg' },
    action: 'commented on "Bug Fix #123"',
    time: '1 day ago',
  },
  {
    id: 4,
    user: { name: 'Sarah Wilson', avatar: '/assets/images/avatar/A14.jpg' },
    action: 'assigned you to "Database Migration"',
    time: '2 days ago',
  },
];

const RecentActivities = () => {
  return (
    <AppCard title="Recent Activities">
      <AppScrollbar style={{ height: 300 }}>
        <AppList
          data={mockActivities}
          renderItem={(activity) => (
            <StyledActivityItem key={activity.id}>
              <Avatar src={activity.user.avatar} size={40} />
              <StyledActivityInfo>
                <p>
                  <strong>{activity.user.name}</strong> {activity.action}
                </p>
                <span>{activity.time}</span>
              </StyledActivityInfo>
            </StyledActivityItem>
          )}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default RecentActivities;

