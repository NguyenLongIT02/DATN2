import React from 'react';
import AppCard from '@crema/components/AppCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Completed', value: 156 },
  { name: 'In Progress', value: 42 },
  { name: 'Todo', value: 28 },
  { name: 'Blocked', value: 8 },
];

const COLORS = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'];

const TeamProductivity = () => {
  return (
    <AppCard title="Task Distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </AppCard>
  );
};

export default TeamProductivity;

