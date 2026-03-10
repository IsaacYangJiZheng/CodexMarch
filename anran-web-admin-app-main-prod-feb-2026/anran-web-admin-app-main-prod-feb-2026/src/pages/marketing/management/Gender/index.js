import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppBranchSelect from '@anran/core/AppBranchSelect';
import {useIntl} from 'react-intl';
import {Box, Typography} from '@mui/material';
import GenderChart from './GenderChart';
import EmptyChart from './EmptyChart';
import PropTypes from 'prop-types';
import AppLoader from '@anran/core/AppLoader';
import {styled} from '@mui/material/styles';
import AppList from '@anran/core/AppList';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';

const GenderRow = styled('div')(({theme}) => {
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

const GenderCell = ({inquiry}) => {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
      }}
      className='item-hover'
    >
      <Box
        sx={{
          mr: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant='h4'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
          }}
          component='h4'
        >
          {inquiry.value}
        </Typography>
      </Box>
      <Box
        sx={{
          mt: 0.5,
          bgcolor: inquiry.color,
          minWidth: 15,
          height: 15,
          borderRadius: '50%',
        }}
      />
      <Box
        sx={{
          ml: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant='h4'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          component='h4'
        >
          {inquiry.title}
        </Typography>
      </Box>
    </Box>
  );
};

GenderCell.propTypes = {
  inquiry: PropTypes.object,
};

const getGenderLabel = (label, messages) => {
  const normalizedLabel = String(label || '').trim().toLowerCase();
  if (normalizedLabel === 'male' || normalizedLabel === 'm' || normalizedLabel === '男') {
    return messages['marketing.gender.male'];
  }
  if (normalizedLabel === 'female' || normalizedLabel === 'f' || normalizedLabel === '女') {
    return messages['marketing.gender.female'];
  }
  if (normalizedLabel === 'non-binary' || normalizedLabel === 'nonbinary' || normalizedLabel === '非二元') {
    return messages['marketing.gender.nonBinary'];
  }
  if (!normalizedLabel || normalizedLabel === 'unknown' || normalizedLabel === '未知') {
    return messages['marketing.gender.unknown'];
  }
  return label;
};

const AgeStat = ({branchOptions}) => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [statData, setStatData] = React.useState([]);
  const [totalMember, setTotalMember] = React.useState(0);
  const [selectionBranch, setSelectionBranch] = React.useState(null);

  const localizedStatData = React.useMemo(() => {
  return (statData || []).map((item) => ({
    ...item,
    title: getGenderLabel(item.genderKey, messages),
   }));
  }, [statData, messages]);

  React.useEffect(() => {
    if (branchOptions?.length > 0) {
      setSelectionBranch(branchOptions[0]?._id);
    }
  }, [branchOptions]);

  React.useEffect(() => {
    fetchData();
  }, [selectionBranch]);

  const fetchData = async () => {
    if (selectionBranch) {
      setLoading(true);
      const formData = new FormData();
      formData.append('selectedBranch', selectionBranch);
      try {
        const response = await postDataApi(
          'api/marketing/gender',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        const values = response.map((item) => item.value);
        const sum = values.reduce((acc, value) => acc + value, 0);
        setTotalMember(sum);
        const mapped = (response || []).map((item, i) => ({
          ...item,
          // keep a stable raw label/key for translation later
          genderKey: item.gender ?? item.key ?? item.title ?? '',
          // ensure you have an id for list keys if backend doesn't provide one
          id: item.id ?? i + 1,
        }));
        setStatData(mapped);
        setLoading(false);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
        setLoading(false);
      }
    }
  };

  const handleSelectionBranch = (data) => {
    console.log('data: ', data);
    setSelectionBranch(data);
  };

  return (
    <AppCard
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      title={messages['marketing.genderStat']}
      titleStyle={{
        marginTop: 0,
        marginRight: 0,
      }}
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
        <GenderRow>
          <div className='top-inquiry-col top-inquiry-chart'>
            {totalMember > 0 ? (
              <GenderChart
                data={localizedStatData}
                totalMember={totalMember}
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
                <GenderCell key={'inquiry-' + data.id} inquiry={data} />
              )}
            />
          </div>
        </GenderRow>
      ) : null}
    </AppCard>
  );
};

export default AgeStat;

AgeStat.propTypes = {
  branchOptions: PropTypes.array,
};
