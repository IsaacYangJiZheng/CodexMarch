import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
} from 'recharts';
import { Box, Typography, Stack } from '@mui/material';

const LegendItem = ({ color, label, value, percentage }) => (
  <Stack direction="row" alignItems="center" spacing={1.25}>
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: color || '#ccc',
        flex: '0 0 10px',
      }}
    />
    <Typography variant="body2" sx={{ fontFamily: 'Roboto' }}>
      {label}{' '}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        ({value}{typeof percentage === 'number' ? `, ${percentage}%` : ''})
      </Typography>
    </Typography>
  </Stack>
);

LegendItem.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  percentage: PropTypes.number,
};

const CustomerTrackingChart = ({ data, totalMember, totalLabel }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Total in the center header (optional) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              lineHeight: 1.1,
              color: '#2B5CE7',
              fontFamily: 'Roboto',
            }}
          >
            {totalMember}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: '#A9A9A9',
              fontFamily: 'Roboto',
            }}
          >
            {totalLabel}
          </div>
        </Box>
      </Box>

      <ResponsiveContainer height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="95%"
            nameKey="title"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}

            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox || {};
                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontWeight: 700,
                        fontSize: '1.5em',
                        fill: '#2B5CE7',
                        fontFamily: 'Roboto',
                      }}
                    >
                      {totalMember}
                    </text>
                    <text
                      x={cx}
                      y={cy + 20}
                      textAnchor="middle"
                      style={{
                        fontSize: '1em',
                        fill: '#A9A9A9',
                        fontFamily: 'Roboto',
                      }}
                    >
                      {totalLabel}
                    </text>
                  </>
                );
              }}
              position="center"
            />
          </Pie>

          <Tooltip
            formatter={(value, name, { payload }) => {
              const pct = payload?.percentage;
              return [`${value} (${pct ?? 0}%)`, name];
            }}
            labelStyle={{ color: 'black' }}
            contentStyle={{
              borderRadius: 12,
              borderColor: '#31354188',
              background: '#FFFFFFCA',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1.25 }}
      >
        {data.map((d, i) => (
          <LegendItem
            key={`legend-${i}`}
            color={d.color}
            label={d.title}
            value={d.value}
            percentage={d.percentage}
          />
        ))}
      </Stack>
    </Box>
  );
};

CustomerTrackingChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      percentage: PropTypes.number,
      color: PropTypes.string,
    })
  ).isRequired,
  totalMember: PropTypes.number.isRequired,
  totalLabel: PropTypes.string,
};

export default CustomerTrackingChart;
