import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  // Label,
  LabelList,
  Cell,
  // Customized,
  // Text,
} from 'recharts';
import PropTypes from 'prop-types';

const InquiriesChart = ({data}) => {
  const renderCustomizedLabel = ({x, y, width, height, value}) => {
    // if (value) {
    //   // No label if there is a value. Let the cell handle it.
    //   return (
    //     <Text
    //       style={{transform: `translate(50%, 50%)`}}
    //       x={0}
    //       y={-height}
    //       textAnchor='middle'
    //     >
    //       No data available
    //     </Text>
    //   );
    // }
    // const fireOffset = value.toString().length < 5;
    const offset = 5;
    return (
      <text
        x={x + width - offset}
        y={y + height - 5}
        fill={'white'}
        textAnchor='end'
      >
        {value}
      </text>
    );
  };

  // const renderCustomizedLabel = ({x, y, width, height, value}) => {
  //   // const { x, y, width, height, value } = props;
  //   // const radius = 10;

  //   return (
  //     <g>
  //       {/* <circle cx={x + width / 2} cy={y - radius} r={radius} fill='#8884d8' /> */}
  //       <text
  //         x={x + width / 2}
  //         y={y - height}
  //         fill='#fff'
  //         textAnchor='end'
  //         dominantBaseline='end'
  //       >
  //         {value}
  //       </text>
  //     </g>
  //   );
  // };

  return (
    <ResponsiveContainer height={195}>
      <BarChart width={400} height={170} data={data} layout='vertical'>
        {/* <Customized>
          component=
          {() => {
            return data.length == 0 ? (
              <Text
                style={{transform: `translate(50%, 50%)`}}
                x={0}
                y={-20}
                textAnchor='middle'
                verticalAnchor='middle'
              >
                No data available
              </Text>
            ) : null;
          }}
        </Customized> */}
        <XAxis type='number' orientation='top' stroke='blue' />
        {/* <XAxis type='number' orientation='top' stroke='blue'>
          {data.length == 0 && (
            <Label
              value='No data available'
              position='center'
              style={{transform: `translate(0px, -50%)`}}
            />
          )}
        </XAxis> */}

        <YAxis
          type='category'
          dataKey='packageCode'
          axisLine={false}
          dx={-10}
          tickLine={false}
          style={{fill: 'green'}}
        />
        <Bar dataKey='count'>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList
            dataKey='amount'
            content={renderCustomizedLabel}
            position='insideRight'
            style={{fill: '#285A64'}}
          />
        </Bar>
        {/* <Bar dataKey='amount' fill='#8884d8'>
          <LabelList
            dataKey='amountLabel'
            content={renderCustomizedLabel}
            position='insideRight'
            style={{fill: '#285A64'}}
          />
        </Bar> */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InquiriesChart;

InquiriesChart.propTypes = {
  data: PropTypes.array,
};
