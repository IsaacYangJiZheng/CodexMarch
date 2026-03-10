import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {useTheme} from '@mui/material';
import PropTypes from 'prop-types';

// const data = [
//   {
//     days: 'B0001',
//     order: 14000,
//     return: 2400,
//   },
//   {
//     days: 'B0002',
//     order: 22000,
//     return: 14398,
//   },
//   {
//     days: 'B0003',
//     order: 800,
//     return: 2000,
//   },
//   {
//     days: 'B0004',
//     order: 11000,
//     return: 12000,
//   },
//   {
//     days: 'B0005',
//     order: 10000,
//     return: 4000,
//   },
//   {
//     days: 'B0001',
//     order: 14000,
//     return: 2400,
//   },
//   {
//     days: 'B0002',
//     order: 22000,
//     return: 14398,
//   },
//   {
//     days: 'B0003',
//     order: 800,
//     return: 2000,
//   },
//   {
//     days: 'B0004',
//     order: 11000,
//     return: 12000,
//   },
//   {
//     days: 'B0005',
//     order: 10000,
//     return: 4000,
//   },
// ];

const MembersChart = ({data}) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width='100%' height={250}>
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
        <XAxis dataKey='branchCode' />
        {/*<YAxis />*/}
        <Tooltip
          labelStyle={{color: 'black'}}
          contentStyle={{
            borderRadius: 12,
            borderColor: '#31354188',
            background: '#FFFFFFCA',
          }}
        />
        {/* <Bar
          stackId='a'
          dataKey='itemCount'
          fill={theme.palette.secondary.main}
          barSize={8}
        /> */}
        <Bar
          stackId='a'
          dataKey='count'
          fill={theme.palette.primary.main}
          margin={{bottom: -15}}
          barSize={8}
          radius={[20, 20, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MembersChart;

MembersChart.propTypes = {
  data: PropTypes.array,
};
