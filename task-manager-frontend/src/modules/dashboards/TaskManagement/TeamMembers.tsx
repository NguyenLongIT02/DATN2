import React from 'react';
import AppCard from '@crema/components/AppCard';
import AppScrollbar from '@crema/components/AppScrollbar';
import AppList from '@crema/components/AppList';
import { Avatar, Progress } from 'antd';
import styled from 'styled-components';

const StyledMemberItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.dividerColor};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledMemberInfo = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 500;
  }

  p {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

const mockMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Frontend Developer',
    avatar: '/assets/images/avatar/A11.jpg',
    tasksCompleted: 12,
    totalTasks: 15,
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Backend Developer',
    avatar: '/assets/images/avatar/A12.jpg',
    tasksCompleted: 8,
    totalTasks: 10,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'UI/UX Designer',
    avatar: '/assets/images/avatar/A13.jpg',
    tasksCompleted: 15,
    totalTasks: 18,
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Project Manager',
    avatar: '/assets/images/avatar/A14.jpg',
    tasksCompleted: 10,
    totalTasks: 12,
  },
];

const TeamMembers = () => {
  return (
    <AppCard title="Team Members">
      <AppScrollbar style={{ height: 300 }}>
        <AppList
          data={mockMembers}
          renderItem={(member) => {
            const progress = Math.round((member.tasksCompleted / member.totalTasks) * 100);
            return (
              <StyledMemberItem key={member.id}>
                <Avatar src={member.avatar} size={40} />
                <StyledMemberInfo>
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                  <Progress
                    percent={progress}
                    size="small"
                    format={() => `${member.tasksCompleted}/${member.totalTasks}`}
                  />
                </StyledMemberInfo>
              </StyledMemberItem>
            );
          }}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default TeamMembers;

