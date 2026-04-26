import React from 'react';
import AppCard from '@crema/components/AppCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', completed: 12, inProgress: 8, todo: 5 },
  { name: 'Tue', completed: 15, inProgress: 6, todo: 7 },
  { name: 'Wed', completed: 10, inProgress: 10, todo: 4 },
  { name: 'Thu', completed: 18, inProgress: 5, todo: 6 },
  { name: 'Fri', completed: 20, inProgress: 7, todo: 3 },
  { name: 'Sat', completed: 8, inProgress: 3, todo: 2 },
  { name: 'Sun', completed: 5, inProgress: 2, todo: 1 },
];

const TaskCompletionTrend = () => {
  return (
    <AppCard title="Task Completion Trend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="completed" stroke="#52c41a" strokeWidth={2} />
          <Line type="monotone" dataKey="inProgress" stroke="#1890ff" strokeWidth={2} />
          <Line type="monotone" dataKey="todo" stroke="#faad14" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </AppCard>
  );
};

export default TaskCompletionTrend;

