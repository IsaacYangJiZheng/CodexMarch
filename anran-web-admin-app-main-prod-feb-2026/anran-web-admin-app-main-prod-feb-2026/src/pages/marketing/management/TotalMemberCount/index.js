import React from 'react';
import AppCard from '@anran/core/AppCard';
import {Box, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import AppList from '@anran/core/AppList';
import AppLoader from '@anran/core/AppLoader';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import TotalMemberCountChart from './TotalMemberCountChart';
import EmptyChart from './EmptyChart';

const RowWrap = styled('div')(({theme}) => ({
  position: 'relative',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  marginLeft: -8,
  marginRight: -8,
  [theme.breakpoints.up('sm')]: {flexDirection: 'row'},
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
    '& > div': {width: '100%'},
  },
}));

const StatCell = ({item}) => (
  <Box sx={{p: 2, display: 'flex', alignItems: 'center', gap: 1}} className='item-hover'>
    {/* VALUE: do NOT truncate */}
    <Box sx={{minWidth: 40, flexShrink: 0}}>
      <Typography variant='h4' sx={{whiteSpace: 'normal'}}>
        {item.value}
      </Typography>
    </Box>

    {/* DOT */}
    <Box sx={{bgcolor: item.color, minWidth: 15, height: 15, borderRadius: '50%', flexShrink: 0}} />

    {/* TITLE: allow wrap so it never cuts */}
    <Box sx={{flex: 1, minWidth: 0}}>
      <Typography
        variant='h4'
        sx={{
          whiteSpace: 'normal',
          overflow: 'visible',
          textOverflow: 'unset',
          wordBreak: 'break-word',
        }}
      >
        {item.title}
      </Typography>
    </Box>
  </Box>
);

StatCell.propTypes = {
  item: PropTypes.object,
};

const normalizeRegistrationCounts = (resp) => {
  const payload = Array.isArray(resp) ? resp : resp?.data ?? resp;
  let fullCount = 0;
  let partialCount = 0;

  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      const isDeleted = item?.isDeleted === true;
      if (isDeleted) return;
      const isFull = item?.fullRegister === true;
      if (isFull) {
        fullCount += 1;
      } else {
        partialCount += 1;
      }
    });
  }

  return {
    full: Number.isFinite(fullCount) ? fullCount : 0,
    partial: Number.isFinite(partialCount) ? partialCount : 0,
  };
};

const TotalMemberCount = () => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();

  const infoViewRef = React.useRef(infoViewActionsContext);
  React.useEffect(() => {
    infoViewRef.current = infoViewActionsContext;
  }, [infoViewActionsContext]);

  const [loading, setLoading] = React.useState(false);
  const [counts, setCounts] = React.useState({full: 0, partial: 0});

  React.useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await postDataApi(
          '/api/members/findallv3',
          infoViewRef.current,
          {},
          false,
          false,
        );
        if (!cancelled) setCounts(normalizeRegistrationCounts(response));
      } catch (error) {
        if (!cancelled) {
          infoViewRef.current.fetchError?.(error?.message || 'Failed to load');
          setCounts({full: 0, partial: 0});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []); // run once only

  const statData = React.useMemo(
    () => [
      {
        id: 1,
        title: messages['marketing.memberStatus.fullRegister'],
        value: counts.full,
        color: '#0A8FDC',
      },
      {
        id: 2,
        title: messages['marketing.memberStatus.partialRegister'],
        value: counts.partial,
        color: '#F04F47',
      },
    ],
    [counts.full, counts.partial, messages],
  );

  const totalMember = counts.full + counts.partial;

  return (
    <AppCard
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      contentStyle={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
      title={messages['marketing.totalMemberCount']}
      titleStyle={{marginTop: 0, marginRight: 0}}
    >
      {loading ? (
        <AppLoader />
      ) : totalMember > 0 ? (
        <RowWrap>
          <div className='col-chart'>
            <TotalMemberCountChart
              data={statData}
              totalMember={totalMember}
              totalLabel={messages['marketing.memberStatus.total']}
            />
          </div>
          <div className='col-list'>
            <AppList
              data={statData}
              renderRow={(row) => <StatCell key={`member-${row.id}`} item={row} />}
            />
          </div>
        </RowWrap>
      ) : (
        <EmptyChart />
      )}
    </AppCard>
  );
};

export default TotalMemberCount;
