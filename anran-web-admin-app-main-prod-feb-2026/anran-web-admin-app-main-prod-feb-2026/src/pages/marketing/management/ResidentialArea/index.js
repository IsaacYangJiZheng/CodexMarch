import React from 'react';
import AppCard from '@anran/core/AppCard';
import { useIntl } from 'react-intl';
import { Box, Typography, TextField, MenuItem, Stack } from '@mui/material';
import ResidentialAreaChart from './ResidentialAreaChart';
import EmptyChart from './EmptyChart';
import PropTypes from 'prop-types';
import AppLoader from '@anran/core/AppLoader';
import { styled } from '@mui/material/styles';
import AppList from '@anran/core/AppList';
import { useInfoViewActionsContext } from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import { postDataApi } from '@anran/utility/APIHooks';

const RowWrap = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  marginLeft: -8,
  marginRight: -8,
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
  '& .col-chart': {
    width: '100%',
    paddingLeft: 8,
    paddingRight: 8,
    [theme.breakpoints.up('sm')]: {
      width: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  '& .col-list': {
    width: '100%',
    paddingLeft: 8,
    paddingRight: 8,
    [theme.breakpoints.up('sm')]: {
      width: '50%',
      display: 'flex',
      alignItems: 'center',
    },
    '& > div': { width: '100%' },
  },
}));

const StatCell = ({ item }) => {
  return (
    <Box sx={{ p: 2, display: 'flex' }} className='item-hover'>
      <Box sx={{ mr: 2, overflow: 'hidden' }}>
        <Typography variant='h4' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.value}
        </Typography>
      </Box>
      <Box sx={{ mt: 0.5, bgcolor: item.color, minWidth: 15, height: 15, borderRadius: '50%' }} />
      <Box sx={{ ml: 2, overflow: 'hidden' }}>
        <Typography variant='h4' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </Typography>
      </Box>
    </Box>
  );
};

StatCell.propTypes = { item: PropTypes.object };

const palette = [
  '#0A8FDC', '#F04F47', '#ff9800', '#8bc34a', '#9c27b0',
  '#00bcd4', '#795548', '#607d8b', '#3f51b5', '#009688',
  '#ffc107', '#e91e63', '#4caf50', '#673ab7', '#2196f3',
];

const colorAt = (i) => palette[i % palette.length];

// Map backend arrays into chartData your Pie expects
const mapStateToChartData = (arr, total) =>
  (arr || []).map((r, i) => ({
    id: i + 1,
    key: r.state,
    title: r.state,
    value: r.count,
    percentage: total ? Math.round((r.count / total) * 10000) / 100 : 0,
    color: colorAt(i),
  }));

const mapCityToChartData = (arr, total) =>
  (arr || []).map((r, i) => ({
    id: i + 1,
    key: r.city,
    title: r.city,
    value: r.count,
    percentage: total ? Math.round((r.count / total) * 10000) / 100 : 0,
    color: colorAt(i),
  }));

/**
 * ResidentialAreaStat
 * - Fetches POST api/marketing/members/residentialArea
 * - Body (multipart): mode ("state" | "topCities"), topN (cities)
 */
const ResidentialAreaStat = () => {
  const { messages } = useIntl();
  const infoView = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [chartData, setChartData] = React.useState([]);
  const [totalMember, setTotalMember] = React.useState(0);

  // UI controls
  const [mode, setMode] = React.useState('state'); // 'state' | 'topCities'
  const [topN, setTopN] = React.useState(12);

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, topN]);

  const fetchData = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('mode', mode);
    if (mode === 'topCities') {
      formData.append('topN', String(topN));
    }

    try {
      // Adjust the URL if your router is mounted differently
      const resp = await postDataApi(
        'api/marketing/members/residentialArea',
        infoView,
        formData,
        false,
        false,
        { 'Content-Type': 'multipart/form-data' }
      );

      // Support both raw and wrapped payloads
      const payload = Array.isArray(resp?.data) || resp?.byState ? resp : resp?.data || resp;

      const total = payload?.totals?.considered || 0;
      setTotalMember(total);

      let dataForChart = [];
      if (mode === 'state') {
        dataForChart = mapStateToChartData(payload?.byState || [], total);
      } else {
        const cities = (payload?.byCity || []).slice(0, topN);
        dataForChart = mapCityToChartData(cities, total);
      }

      // Optionally filter out weird entries like "-" city
      dataForChart = dataForChart.filter((d) => d.title && d.title !== '-');

      setChartData(dataForChart);
      setLoading(false);
    } catch (err) {
      infoView.fetchError(err?.message || 'Failed to load residential area data');
      setLoading(false);
    }
  };

  return (
    <AppCard
      sxStyle={{ height: 1, backgroundColor: '#f2edde' }}
      contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      title={messages['marketing.residentialArea']}
      titleStyle={{ marginTop: 0, marginRight: 0 }}
      action={
        <Stack direction='row' spacing={2} alignItems='center'>
          <TextField
            select
            size='small'
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            label={messages['marketing.residentialArea.mode']}
          >
            <MenuItem value='state'>{messages['marketing.residentialArea.byState']}</MenuItem>
            <MenuItem value='topCities'>{messages['marketing.residentialArea.topCities']}</MenuItem>
          </TextField>

          {mode === 'topCities' ? (
            <TextField
              size='small'
              type='number'
              label={messages['marketing.residentialArea.topN']}
              value={topN}
              onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                    setTopN('');          // empty → 0
                    } else {
                    setTopN(Number(val)); // allow 0, 1, 2, etc.
                    }}}
              inputProps={{ min: 5, max: 50 }}
              sx={{ width: 110 }}
            />
          ) : null}
        </Stack>
      }
    >
      {loading ? (
        <AppLoader />
      ) : (
        <RowWrap>
          <div className='col-chart'>
            {totalMember > 0 && chartData.length > 0 ? (
              <ResidentialAreaChart
                data={chartData}
                totalMember={totalMember}
                totalLabel={messages['dashboard.booking.total']}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          <div className='col-list'>
            <AppList
              data={chartData}
              renderRow={(row) => <StatCell key={`res-${row.id}`} item={row} />}
            />
          </div>
        </RowWrap>
      )}
    </AppCard>
  );
};

ResidentialAreaStat.propTypes = {};

export default ResidentialAreaStat;
