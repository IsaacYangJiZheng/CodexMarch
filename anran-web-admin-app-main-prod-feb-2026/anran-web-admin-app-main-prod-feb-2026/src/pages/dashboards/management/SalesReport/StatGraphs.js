import React from 'react';
import {
  Area,
  AreaChart,
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
// import {useThemeContext} from '@enjoey/utility/AppContextProvider/ThemeContextProvider';

// const data = [
//   {
//     days: '1st',
//     order: 14000,
//     return: 2400,
//   },
//   {
//     days: '2nd',
//     order: 22000,
//     return: 14398,
//   },
//   {
//     days: '3rd',
//     order: 800,
//     return: 2000,
//   },
//   {
//     days: '4th',
//     order: 11000,
//     return: 12000,
//   },
//   {
//     days: '5th',
//     order: 10000,
//     return: 4000,
//   },
//   {
//     days: '6th',
//     order: 12780,
//     return: 10900,
//   },
//   {
//     days: '7th',
//     order: 12000,
//     return: 4300,
//   },
//   {
//     days: '8th',
//     order: 12000,
//     return: 14900,
//   },
//   {
//     days: '9th',
//     order: 18000,
//     return: 1398,
//   },
//   {
//     days: '10th',
//     order: 17000,
//     return: 9800,
//   },
//   {
//     days: '11th',
//     order: 12780,
//     return: 3908,
//   },
//   {
//     days: '12th',
//     order: 20900,
//     return: 12800,
//   },
//   {
//     days: '13th',
//     order: 17000,
//     return: 4900,
//   },
//   {
//     days: '14th',
//     order: 7000,
//     return: 4000,
//   },
//   {
//     days: '15th',
//     order: 17000,
//     return: 9800,
//   },
// ];

const StatGraphs = ({data}) => {
  const theme = useTheme();
  const {messages} = useIntl();
  // const {theme} = useThemeContext();
  // console.log('StatGraphs', data);

   const formatAmount = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return '0.00';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
  };

  const toRMLabel = (value) => {
    // console.log('toPercent', value);
    return `RM ${value}`;
  };

   const monthLabels = {
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
  };

  const formatMonthLabel = (label) => monthLabels[label] || label;


  const renderTooltipContent = (o) => {
  const { active, payload, label } = o;

  if (active && payload?.length) {
    const amount = payload[0].payload.amount;
    const count = payload[0].payload.count;

    return (
      <div className="customized-tooltip-content">
        <Card sx={{ p: 2 }}>
          <p>{formatMonthLabel(label)}</p>
          <p>
            {messages['dashboard.sales.amount']}: RM {formatAmount(amount)}
          </p>
          <p>
            {messages['dashboard.sales.count']}: {count}
          </p>
        </Card>
      </div>
    );
  }

  return null;
};

  return (
    <ResponsiveContainer width='100%' height={250}>
      <AreaChart data={data} margin={{top: 25, right: 0, left: 20, bottom: 0}}>
        <defs>
          <linearGradient id='colorPv' x1='0' y1='0' x2='0' y2='1'>
            <stop
              offset='5%'
              stopColor={theme.palette.primary.main}
              stopOpacity={0.7}
            />
            <stop
              offset='95%'
              stopColor={theme.palette.primary.main}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          tickFormatter={formatMonthLabel}
          padding={{left: 20, right: 20}}
        />
        <YAxis tickCount={10} tickFormatter={toRMLabel} />
        <Tooltip labelStyle={{color: 'black'}} content={renderTooltipContent} />
        <CartesianGrid
          strokeDasharray='2 10'
          horizontal={false}
          vertical={false}
        />
        {/* <Area
          type='monotone'
          dataKey='count'
          stackId='1'
          stroke={'#11C15B'}
          strokeWidth={3}
          fillOpacity={1}
          fill='url(#colorPv)'
        /> */}
        <Area
          type='monotone'
          dataKey='amount'
          stackId='1'
          stroke={theme.palette.primary.main}
          strokeWidth={3}
          fillOpacity={1}
          fill='url(#colorPv)'
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StatGraphs;

StatGraphs.defaultProps = {
  data: [],
};

StatGraphs.propTypes = {
  data: PropTypes.array,
  value: PropTypes.string,
};
