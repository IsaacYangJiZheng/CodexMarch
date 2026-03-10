import React from 'react';
import {Cell, Pie, PieChart, ResponsiveContainer, Label} from 'recharts';

const EmptyChart = () => {
  return (
    <ResponsiveContainer height={195}>
      <PieChart>
        <Pie
          data={[{title: 'No Data', value: 1}]}
          cx='50%'
          cy='50%'
          innerRadius='80%'
          outerRadius='95%'
          nameKey='title'
          dataKey='value'
        >
          <Cell key={`cell-1`} fill='#9e9e9e' />
          <Label
            value={'No Data'}
            position='center'
            fill='grey'
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              fontFamily: 'Roboto',
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default EmptyChart;
