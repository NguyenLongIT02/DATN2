import React from 'react';
import AppCard from '@crema/components/AppCard';
import { Table, Progress, Tag } from 'antd';

const BoardOverview = () => {
  const columns = [
    {
      title: 'Board Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Tasks',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Website Redesign',
      totalTasks: 45,
      completed: 32,
      progress: 71,
      status: 'Active',
    },
    {
      key: '2',
      name: 'Mobile App',
      totalTasks: 38,
      completed: 28,
      progress: 74,
      status: 'Active',
    },
    {
      key: '3',
      name: 'Backend API',
      totalTasks: 52,
      completed: 45,
      progress: 87,
      status: 'Active',
    },
  ];

  return (
    <AppCard title="Board Overview">
      <Table columns={columns} dataSource={data} pagination={false} />
    </AppCard>
  );
};

export default BoardOverview;

