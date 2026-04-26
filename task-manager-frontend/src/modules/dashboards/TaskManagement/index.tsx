import React from 'react';
import { Row, Col } from 'antd';
import AppPageMeta from '@crema/components/AppPageMeta';
import AppRowContainer from '@crema/components/AppRowContainer';
import StatsCards from './StatsCards';
import TaskCompletionTrend from './TaskCompletionTrend';
import TeamProductivity from './TeamProductivity';
import RecentActivities from './RecentActivities';
import UpcomingDeadlines from './UpcomingDeadlines';
import BoardOverview from './BoardOverview';
import TeamMembers from './TeamMembers';

const TaskManagement = () => {
  return (
    <>
      <AppPageMeta title="Task Management Dashboard" />
      <div style={{ padding: '20px' }}>
        {/* Stats Cards Row */}
        <StatsCards />

        {/* Charts Row */}
        <AppRowContainer>
          <Col xs={24} lg={16}>
            <TaskCompletionTrend />
          </Col>
          <Col xs={24} lg={8}>
            <TeamProductivity />
          </Col>
        </AppRowContainer>

        {/* Board Overview & Team Members */}
        <AppRowContainer>
          <Col xs={24} lg={16}>
            <BoardOverview />
          </Col>
          <Col xs={24} lg={8}>
            <TeamMembers />
          </Col>
        </AppRowContainer>

        {/* Recent Activities & Upcoming Deadlines */}
        <AppRowContainer>
          <Col xs={24} lg={12}>
            <RecentActivities />
          </Col>
          <Col xs={24} lg={12}>
            <UpcomingDeadlines />
          </Col>
        </AppRowContainer>
      </div>
    </>
  );
};

export default TaskManagement;

