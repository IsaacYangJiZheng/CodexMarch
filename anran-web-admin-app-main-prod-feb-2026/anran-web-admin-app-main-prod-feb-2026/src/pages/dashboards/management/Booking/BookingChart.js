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
import {useIntl} from 'react-intl';

const BookingChart = ({data, totalBooking}) => {
   const {messages} = useIntl();

  const RenderCustomizedLabel = (o) => {
    const {viewBox, total} = o;
    console.log('viewBox', viewBox);
    const {cx, cy} = viewBox;
    return (
      <React.Fragment>
        <text x={cx - 5} y={cy - 5}>
          <tspan
            style={{
              fontWeight: 700,
              fontSize: '1.5em',
              fill: '#2B5CE7',
              fontFamily: 'Roboto',
            }}
          >
            {total}
          </tspan>
        </text>
        <text x={cx - 30} y={cy + 25}>
          <tspan
            style={{
              fontSize: '1.8em',
              fill: '#A9A9A9',
              fontFamily: 'Roboto',
            }}
          >
            {messages['dashboard.booking.total']}
          </tspan>
        </text>
      </React.Fragment>
    );
  };

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
            content={<RenderCustomizedLabel total={totalBooking} />}
            position='center'
          />
        </Pie>
        <Tooltip
          labelStyle={{color: 'black'}}
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

export default BookingChart;

BookingChart.propTypes = {
  data: PropTypes.array,
  totalBooking: PropTypes.number,
};
