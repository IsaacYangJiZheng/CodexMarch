// ReferralSourceStat/index.js
import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppBranchSelect from '@anran/core/AppBranchSelect';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AppList from '@anran/core/AppList';
import PropTypes from 'prop-types';
import AppLoader from '@anran/core/AppLoader';
import EmptyChart from './EmptyChart';
import ReferralChart from './ReferralChart';
import { useInfoViewActionsContext } from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import { postDataApi } from '@anran/utility/APIHooks';
import { useIntl } from 'react-intl';

const RowWrap = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  marginLeft: -8,
  marginRight: -8,
  [theme.breakpoints.up('sm')]: { flexDirection: 'row' },
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
    [theme.breakpoints.up('sm')]: { width: '50%', display: 'flex', alignItems: 'center' },
    '& > div': { width: '100%' },
  },
}));

const StatCell = ({ item }) => (
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
StatCell.propTypes = { item: PropTypes.object };

// Fallback palette if any entry lacks color
const palette = ['#0A8FDC','#F04F47','#ff9800','#8bc34a','#9c27b0','#00bcd4','#795548','#607d8b','#3f51b5','#009688','#ffc107','#e91e63','#4caf50','#673ab7','#2196f3'];
const colorAt = (i) => palette[i % palette.length];

const normalizePayload = (resp) => {
  const data = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : (resp?.data || []);
  return (data || []).map((d, i) => ({
    id: d.id ?? i + 1,
    key: d.key ?? d.source ?? d.title,
    title: d.title ?? d.source ?? 'Unknown',
    value: Number(d.value ?? d.count ?? 0),
    percentage: Number(d.percentage ?? 0),
    color: d.color || colorAt(i),
  }));
};

const ReferralSourceStat = ({ branchOptions }) => {
  const { messages } = useIntl();
  const infoView = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [chartData, setChartData] = React.useState([]);
  const [totalMember, setTotalMember] = React.useState(0);

  // Match your AgeStat pattern: default to first option's _id
  const [selectionBranch, setSelectionBranch] = React.useState(null);

  React.useEffect(() => {
    if (branchOptions?.length > 0) {
      setSelectionBranch(branchOptions[0]?._id || 'All');
    }
  }, [branchOptions]);

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionBranch]);

  const fetchData = async () => {
    if (!selectionBranch) return;
    setLoading(true);
    const formData = new FormData();
    // Controller: if 'All', it ignores filter; otherwise splits comma string.
    formData.append('selectedBranch', selectionBranch);

    try {
      const resp = await postDataApi(
        'api/marketing/referral',
        infoView,
        formData,
        false,
        false,
        { 'Content-Type': 'multipart/form-data' }
      );

      const rows = normalizePayload(resp);
      const total = rows.reduce((s, r) => s + (Number.isFinite(r.value) ? r.value : 0), 0);
      setChartData(rows);
      setTotalMember(total);
    } catch (e) {
      infoView.fetchError(e?.message || 'Failed to load referral source data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionBranch = (val) => {
    // AppBranchSelect onChange gives you the selection value directly (like your AgeStat)
    setSelectionBranch(val);
  };

  return (
    <AppCard
      sxStyle={{ height: 1, backgroundColor: '#f2edde' }}
      contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      title={messages['marketing.referralSources']}
      titleStyle={{ marginTop: 0, marginRight: 0 }}
      action={
        selectionBranch ? (
          <Box>
            <AppBranchSelect
              menus={branchOptions}
              defaultValue={selectionBranch}
              onChange={handleSelectionBranch}
              selectionKey={'_id'}
              labelKey={'branch'}
            />
          </Box>
        ) : null
      }
    >
      {loading ? (
        <AppLoader />
      ) : selectionBranch ? (
        <RowWrap>
          <div className='col-chart'>
            {totalMember > 0 && chartData.length > 0 ? (
              <ReferralChart
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
              renderRow={(row) => <StatCell key={`ref-${row.id}`} item={row} />}
            />
          </div>
        </RowWrap>
      ) : null}
    </AppCard>
  );
};

ReferralSourceStat.propTypes = {
  branchOptions: PropTypes.array,
};

export default ReferralSourceStat;
