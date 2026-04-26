import React from 'react';
import { Row, Col } from 'antd';
import AppCard from '@crema/components/AppCard';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const StyledStatsCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledStatsIcon = styled.div<{ bgColor: string }>`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  color: white;
  background-color: ${({ bgColor }) => bgColor};
`;

const StyledStatsContent = styled.div`
  flex: 1;

  h3 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .change {
    font-size: 12px;
    color: #52c41a;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const StatsCards = () => {
  const stats = [
    {
      id: 1,
      title: 'Completed Tasks',
      value: '156',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      change: '+12%',
    },
    {
      id: 2,
      title: 'In Progress',
      value: '42',
      icon: <ClockCircleOutlined />,
      color: '#1890ff',
      change: '+5%',
    },
    {
      id: 3,
      title: 'Team Members',
      value: '24',
      icon: <TeamOutlined />,
      color: '#722ed1',
      change: '+3',
    },
    {
      id: 4,
      title: 'Active Boards',
      value: '8',
      icon: <ProjectOutlined />,
      color: '#fa8c16',
      change: '+2',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {stats.map((stat) => (
        <Col key={stat.id} xs={24} sm={12} lg={6}>
          <AppCard>
            <StyledStatsCard>
              <StyledStatsIcon bgColor={stat.color}>{stat.icon}</StyledStatsIcon>
              <StyledStatsContent>
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span className="change">
                  <RiseOutlined /> {stat.change}
                </span>
              </StyledStatsContent>
            </StyledStatsCard>
          </AppCard>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;

