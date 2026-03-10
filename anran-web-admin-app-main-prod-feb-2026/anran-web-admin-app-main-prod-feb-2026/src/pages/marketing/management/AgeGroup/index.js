import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppBranchSelect from '@anran/core/AppBranchSelect';
import {Box, Typography} from '@mui/material';
import AgeGroupChart from './AgeGroupChart';
import EmptyChart from './EmptyChart';
import PropTypes from 'prop-types';
import AppLoader from '@anran/core/AppLoader';
import {styled} from '@mui/material/styles';
import AppList from '@anran/core/AppList';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import {useIntl} from 'react-intl';

const BookingRow = styled('div')(({theme}) => {
  return {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    marginLeft: -8,
    marginRight: -8,
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
    '& .top-inquiry-col': {
      width: '100%',
      paddingLeft: 8,
      paddingRight: 8,
      [theme.breakpoints.up('sm')]: {
        width: '50%',
        display: 'flex',
        alignItems: 'center',
      },
      '& > div': {
        width: '100%',
      },
    },
    '& .top-inquiry-chart': {
      [theme.breakpoints.up('sm')]: {
        justifyContent: 'center',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
    },
  };
});

const BookingCell = ({inquiry}) => {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
      }}
      className='item-hover'
    >
      <Box sx={{ mr: 2, overflow: 'hidden' }}>
        <Typography
          variant='h4'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          component='h4'
        >
          {inquiry.value}
        </Typography>
      </Box>
      <Box sx={{ mt: 0.5, bgcolor: inquiry.color, minWidth: 15, height: 15, borderRadius: '50%' }} />
      <Box sx={{ ml: 2, overflow: 'hidden' }}>
        <Typography
          variant='h4'
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          component='h4'
        >
          {inquiry.title}
        </Typography>
      </Box>
    </Box>
  );
};

BookingCell.propTypes = {
  inquiry: PropTypes.object,
};

// consistent colors per age group
const colorForAgeGroup = (label) => {
  switch (label) {
    case 'Teens (<18)': return '#0A8FDC';
    case 'Young Adults (18–25)': return '#F04F47';
    case 'Young Professionals (26–35)': return '#ff9800';
    case 'Young Families / Mid Career (36–45)': return '#ff0000ff';
    case 'Mature Adults (46–59)':
    case 'Mature Adults (46–60)': return '#2bff00ff';
    case 'Seniors (60+)':
    case 'Seniors (61+)': return '#e5ff00ff';
    case 'Unknown DOB': return '#ff00eaff';
    default: return '#9e9e9e';
  }
};

const getAgeGroupLabel = (label, messages) => {
  const normalizedLabel = String(label || '').trim();
  const mapping = {
    'Teens (<18)': messages['marketing.ageGroup.teens'],
    'Young Adults (18–25)': messages['marketing.ageGroup.youngAdults'],
    'Young Professionals (26–35)': messages['marketing.ageGroup.youngProfessionals'],
    'Young Families / Mid Career (36–45)': messages['marketing.ageGroup.youngFamilies'],
    'Mature Adults (46–59)': messages['marketing.ageGroup.matureAdults'],
    'Mature Adults (46–60)': messages['marketing.ageGroup.matureAdults'],
    'Seniors (60+)': messages['marketing.ageGroup.seniors'],
    'Seniors (61+)': messages['marketing.ageGroup.seniors'],
    'Unknown DOB': messages['marketing.ageGroup.unknownDob'],
  };
  return mapping[normalizedLabel] || normalizedLabel;
};

// fold rows from multiple branches into single age-group slices
const foldByAgeGroup = (rows) => {
  const byGroup = new Map();
  rows.forEach((r) => {
    const key = r.ageGroup || r.title;
    const value = Number(r.value ?? r.count ?? 0);
    const color = r.color || colorForAgeGroup(key);
    if (!byGroup.has(key)) byGroup.set(key, { key, value: 0, color });
    byGroup.get(key).value += value;
  });

  const order = [
    'Teens (<18)',
    'Young Adults (18-25)',
    'Young Professionals (26-35)',
    'Young Families / Mid Career (36–45)',
    'Mature Adults (46-59)',
    'Mature Adults (46-60)',
    'Seniors (60+)',
    'Seniors (61+)',
    'Unknown DOB',
  ];
  const out = Array.from(byGroup.values());
  out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return out;
};

const AgeGroupStat = ({branchOptions}) => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [statData, setStatData] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [selectionBranch, setSelectionBranch] = React.useState(null);

  const localizedStatData = React.useMemo(() => {
  return (statData || []).map((item) => ({
    ...item,
    title: getAgeGroupLabel(item.key, messages),
  }));
  }, [statData, messages]);

  React.useEffect(() => {
    if (branchOptions?.length > 0) {
      setSelectionBranch(branchOptions[0]?._id);
    }
  }, [branchOptions]);

  React.useEffect(() => {
    if (selectionBranch) {
      fetchData(selectionBranch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionBranch]);

  const fetchData = async (branchId) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('selectedBranch', branchId);

      const response = await postDataApi(
        'api/marketing/members/ageGroup', // adjust if your router is mounted differently
        infoViewActionsContext,
        formData,
        false,
        false,
        { 'Content-Type': 'multipart/form-data' }
      );

      // backend returns per (branch, ageGroup); fold to age-only slices (esp. for "All")
      const grouped = foldByAgeGroup(response || []);
      const sum = grouped.reduce((acc, it) => acc + Number(it.value || 0), 0);

      // store base data only (no translation)
      const shaped = grouped.map((g, i) => ({
        id: i + 1,
        key: g.key,                 // keep raw key
        value: g.value,
        color: g.color || colorForAgeGroup(g.key),
      }));

      setTotalCount(sum);
      setStatData(shaped);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionBranch = (val) => setSelectionBranch(val);

  return (
    <AppCard
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      title={messages['marketing.ageGroup']}
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
        <BookingRow>
          <div className='top-inquiry-col top-inquiry-chart'>
            {totalCount > 0 ? (
              <AgeGroupChart
                data={localizedStatData}
                totalAgeGroup={totalCount}
                totalLabel={messages['dashboard.booking.total']}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          <div className='top-inquiry-col'>
            <AppList
              data={localizedStatData}
              renderRow={(data) => (
                <BookingCell key={'inquiry-' + data.id} inquiry={data} />
              )}
            />
          </div>    
        </BookingRow>
      ) : null}
    </AppCard>
  );
};

export default AgeGroupStat;

AgeGroupStat.propTypes = {
  branchOptions: PropTypes.array,
};
