import React from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts';
import PropTypes from 'prop-types';

const ResidentialAreaChart = ({ data, totalMember, totalLabel }) => {
  return (
    <ResponsiveContainer height={195}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          innerRadius='80%'
          outerRadius='95%'
          nameKey='title'
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox;
                return (
                  <>
                    {/* Centered number */}
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        style={{
                          fontWeight: 700,
                          fontSize: '1.5em',
                          fill: '#2B5CE7',
                          fontFamily: 'Roboto',
                        }}
                      >
                        {totalMember}
                      </tspan>
                    </text>

                    {/* Label below */}
                    <text x={cx - 30} y={cy + 25}>
                    <tspan
                      style={{
                        fontSize: '1.8em',
                        fill: '#A9A9A9',
                        fontFamily: 'Roboto',
                      }}
                    >
                      {totalLabel}
                    </tspan>
                  </text>
                  </>
                );
              }}
              position="center"
            />
        </Pie>
        <Tooltip
          labelStyle={{ color: 'black' }}
          contentStyle={{
            borderRadius: 12,
            borderColor: '#31354188',
            background: '#FFFFFFCA',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

ResidentialAreaChart.propTypes = {
  data: PropTypes.array,
  totalMember: PropTypes.number,
  totalLabel: PropTypes.string,
};

export default ResidentialAreaChart;
