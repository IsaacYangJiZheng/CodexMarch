import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppSelect from '@anran/core/AppSelect';
import AppBranchSelect from '@anran/core/AppBranchSelect';
import {useIntl} from 'react-intl';
import {Box} from '@mui/material';
import TopSellingChart from './TopSellingChart';
import EmptyChart from './EmptyChart';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import {styled} from '@mui/material/styles';
import AppLoader from '@anran/core/AppLoader';

const topInquiries = [
  {packageCode: 'Label-1', count: 12, amount: 'No Data', color: '#9e9e9e'},
  {packageCode: 'Label-2', count: 12, amount: 'No Data', color: '#9e9e9e'},
  {packageCode: 'Label-3', count: 12, amount: 'No Data', color: '#9e9e9e'},
  {packageCode: 'Label-4', count: 12, amount: 'No Data', color: '#9e9e9e'},
  {packageCode: 'Label-5', count: 12, amount: 'No Data', color: '#9e9e9e'},
];

// const topInquiries = [#C1876B, #008F39,  #A12312, #D6AE01, , #587246
//   {currency: 'CHF', amountLabel: 300, amount: 3023.0},
//   {currency: 'GBP', amountLabel: 260, amount: 6275.0},
//   {currency: 'USD', amountLabel: 100, amount: 9999.0},
//   {currency: 'EUR', amountLabel: 60, amount: 14819.0},
//   {currency: 'LEK', amountLabel: 20, amount: 260230.0},
// ];

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
        width: '100%',
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

const TopSellingStat = ({branchOptions}) => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [statData, setStatData] = React.useState([]);
  const [selectionBranch, setSelectionBranch] = React.useState(null);
  const [selectionType, setSelectionType] = React.useState('today');
  const [selectedStartDate, setSelectedStartDate] = React.useState(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState(null);
  const timeOptions = [
    {value: 'today', label: messages['dashboard.today']},
    {value: 'thisWeek', label: messages['dashboard.thisWeek']},
    {value: 'lastWeeks', label: messages['dashboard.lastWeeks']},
    {value: 'thisMonth', label: messages['dashboard.thisMonth']},
    {value: 'thisYear', label: messages['dashboard.thisYear']},
  ];

  React.useEffect(() => {
    if (branchOptions?.length > 0) {
      setSelectionBranch(branchOptions[0]?._id);
    }
  }, [branchOptions]);

  React.useEffect(() => {
    if (selectionType && selectionBranch) {
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = startOfWeek.add(6, 'day');
      const startOfMonth = dayjs().startOf('month');
      const endOfMonth = dayjs().endOf('month');
      const startOfYear = dayjs().startOf('year');
      const endOfYear = dayjs().endOf('year');
      switch (selectionType) {
        case 'today':
          setSelectedStartDate(dayjs().format('YYYY-MM-DD'));
          setSelectedEndDate(dayjs().format('YYYY-MM-DD'));
          break;
        case 'thisWeek':
          // var curr = new Date(); // get current date
          // var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
          // var last = first + 6; // last day is the first day + 6

          // var firstday = new Date(curr.setDate(first)).toUTCString();
          // var lastday = new Date(curr.setDate(last)).toUTCString();
          setSelectedStartDate(startOfWeek.format('YYYY-MM-DD'));
          setSelectedEndDate(endOfWeek.format('YYYY-MM-DD'));
          break;
        case 'lastWeeks':
          var temp = startOfWeek.subtract(1, 'day');
          var startOfLastWeek = dayjs(temp).startOf('week');
          var endOfLastWeek = startOfLastWeek.add(6, 'day');
          setSelectedStartDate(startOfLastWeek.format('YYYY-MM-DD'));
          setSelectedEndDate(endOfLastWeek.format('YYYY-MM-DD'));
          break;
        case 'thisMonth':
          setSelectedStartDate(startOfMonth.format('YYYY-MM-DD'));
          setSelectedEndDate(endOfMonth.format('YYYY-MM-DD'));
          break;
        case 'thisYear':
          setSelectedStartDate(startOfYear.format('YYYY-MM-DD'));
          setSelectedEndDate(endOfYear.format('YYYY-MM-DD'));
          break;
        default:
          break;
      }
    }
  }, [selectionBranch, selectionType]);

  React.useEffect(() => {
    fetchData();
  }, [selectedStartDate, selectedEndDate, selectionBranch]);

  const fetchData = async () => {
    if (selectedStartDate && selectedEndDate) {
      setLoading(true);
      const formData = new FormData();
      formData.append('selectedBranch', selectionBranch);
      formData.append(
        'selectedStartDate',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      formData.append(
        'selectedEndDate',
        dayjs(selectedEndDate).format('YYYY-MM-DD'),
      );
      try {
        const response = await postDataApi(
          'api/dashboard/top10Packages',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setStatData(response);
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

  const handleSelectionType = (data) => {
    console.log('data: ', data);
    setSelectionType(data);
  };

  return (
    <AppCard
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      title={messages['dashboard.management.topselling']}
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
            <AppSelect
               menus={timeOptions}
              selectionKey='value'
              labelKey='label'
              defaultValue='today'
              onChange={handleSelectionType}
            />
          </Box>
        ) : null
      }
    >
      {loading ? (
        <AppLoader />
      ) : selectionBranch ? (
        statData?.length > 0 ? (
          <BookingRow>
            <div className='top-inquiry-col top-inquiry-chart'>
              <TopSellingChart data={statData} />
            </div>
          </BookingRow>
        ) : (
          <BookingRow>
            <div className='top-inquiry-col top-inquiry-chart'>
              <EmptyChart data={topInquiries} />
            </div>
          </BookingRow>
        )
      ) : null}
    </AppCard>
  );
};

export default TopSellingStat;

TopSellingStat.propTypes = {
  branchOptions: PropTypes.array,
};
