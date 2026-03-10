import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import {useTheme} from '@mui/material';
import {useIntl} from 'react-intl';

const MonthlyChart = ({data}) => {
  const theme = useTheme();
  const {messages} = useIntl();

  const monthLabels = React.useMemo(
    () => ({
      Jan: messages['dashboard.month.jan'],
      Feb: messages['dashboard.month.feb'],
      Mar: messages['dashboard.month.mar'],
      Apr: messages['dashboard.month.apr'],
      May: messages['dashboard.month.may'],
      Jun: messages['dashboard.month.jun'],
      Jul: messages['dashboard.month.jul'],
      Aug: messages['dashboard.month.aug'],
      Sep: messages['dashboard.month.sep'],
      Oct: messages['dashboard.month.oct'],
      Nov: messages['dashboard.month.nov'],
      Dec: messages['dashboard.month.dec'],
    }),
    [messages],
  );

  const formatMonthLabel = (label) => monthLabels[label] || label;

  const renderTooltipContent = ({active, payload, label}) => {
    if (!active || !payload?.length) {
      return null;
    }
    return (
      <div className='customized-tooltip-content'>
        <Card sx={{p: 2}}>
          <p>{formatMonthLabel(label)}</p>
          <p>
            {messages['dashboard.management.registeredMembersCount']}:&nbsp;
            {payload[0].value}
          </p>
        </Card>
      </div>
    );
  };

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
        <XAxis dataKey='month' tickFormatter={formatMonthLabel} />
        <YAxis />
        <Tooltip
          labelStyle={{color: 'black'}}
          contentStyle={{
            borderRadius: 12,
            borderColor: '#31354188',
            background: '#FFFFFFCA',
          }}
          content={renderTooltipContent}
        />
        <Bar
          dataKey='count'
          fill={theme.palette.primary.main}
          margin={{bottom: -15}}
          barSize={10}
          radius={[20, 20, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;

MonthlyChart.propTypes = {
  data: PropTypes.array,
};