import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

const data = [
  {
    month: 'Jan',
    collected: 14000,
    pending: 2400,
  },
  {
    month: 'Feb',
    collected: 28000,
    pending: 4398,
  },
  {
    month: 'Mar',
    collected: 9800,
    pending: 2000,
  },
  {
    month: 'Apr',
    collected: 11000,
    pending: 10000,
  },
  {
    month: 'May',
    collected: 7000,
    pending: 4000,
  },
  {
    month: 'Jun',
    collected: 12780,
    pending: 2300,
  },
  {
    month: 'Jul',
    collected: 8000,
    pending: 4300,
  },
  {
    month: 'Aug',
    collected: 14000,
    pending: 2400,
  },
  {
    month: 'Sep',
    collected: 13000,
    pending: 1398,
  },
  {
    month: 'Oct',
    collected: 17000,
    pending: 9800,
  },
  {
    month: 'Nov',
    collected: 12780,
    pending: 3908,
  },
  {
    month: 'Dec',
    collected: 18900,
    pending: 4800,
  },
];

const SaleStaticChart = () => {
  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart
        data={data}
        margin={{
          top: 15,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid
          strokeDasharray='3 1'
          horizontal={true}
          vertical={false}
        />
        <XAxis dataKey='month' />
        <Tooltip labelStyle={{color: 'black'}} />
        <Bar dataKey='pending' fill='#F44D50' barSize={8} />
        <Bar dataKey='collected' fill='#49BD65' barSize={8} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SaleStaticChart;
