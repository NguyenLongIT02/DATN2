import React from 'react';
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis} from 'recharts';
import type {YourActivityDataType} from '@crema/types/models/dashboards/HealthCare';

type ActivityGraphProps = {
  data: YourActivityDataType[];
};

const ActivityGraph: React.FC<ActivityGraphProps> = ({data}) => {
  return (
    <ResponsiveContainer width='100%' height={143}>
      <BarChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        barSize={16}
      >
        <Tooltip
          labelStyle={{color: 'black'}}
          contentStyle={{
            borderRadius: 12,
            borderColor: '#0A8FDC',
            background: '#FFFFFF42',
          }}
          itemStyle={{color: '#0A8FDC'}}
        />
        <Bar radius={[5, 5, 0, 0]} dataKey='Visits' fill='#0A8FDC53' />{' '}
        <XAxis
          dataKey='day'
          tickLine={false}
          axisLine={false}
          padding={{left: 20, right: 20}}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ActivityGraph;
