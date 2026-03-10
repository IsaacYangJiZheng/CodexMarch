import React from 'react';
import AppCard from '@anran/core/AppCard';
import SalesChart from './SalesChart';
import AppSelect from '@anran/core/AppSelect';
import {useIntl} from 'react-intl';
// import IntlMessages from '@anran/utility/IntlMessages';
// import {alpha, useTheme} from '@mui/material';
import Box from '@mui/material/Box';

// import {styled} from '@mui/material/styles';
import dayjs from 'dayjs';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';

// const DotActionItem = styled('div')(({theme}) => {
//   return {
//     display: 'flex',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     lineHeight: 1,
//     paddingBottom: 2,
//     fontSize: 12,
//     color: theme.palette.text.secondary,
//     '&:not(:first-of-type)': {
//       marginLeft: 16,
//       paddingLeft: 16,
//       borderLeft: `solid 1px ${alpha(theme.palette.text.secondary, 0.2)}`,
//     },
//     '& .dot-icon': {
//       height: 10,
//       width: 10,
//       marginRight: 4,
//       marginTop: 3,
//       borderRadius: '50%',
//     },
//   };
// });

const SalesReport = () => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [loading, setLoading] = React.useState(false);
  const [statData, setStatData] = React.useState([]);
  const [selectionType, setSelectionType] = React.useState('thisWeek');
  const [selectedStartDate, setSelectedStartDate] = React.useState(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState(null);
  const timeOptions = [
    {value: 'today', label: messages['dashboard.today']},
    {value: 'thisWeek', label: messages['dashboard.thisWeek']},
    {value: 'lastWeeks', label: messages['dashboard.lastWeeks']},
    {value: 'thisMonth', label: messages['dashboard.thisMonth']},
    {value: 'thisYear', label: messages['dashboard.thisYear']},
  ];


  // const theme = useTheme();

  React.useEffect(() => {
    if (selectionType) {
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
  }, [selectionType]);

  React.useEffect(() => {
    fetchData();
  }, [selectedStartDate, selectedEndDate]);

  const fetchData = async () => {
    if (selectedStartDate && selectedEndDate) {
      setLoading(true);
      const formData = new FormData();
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
          'api/dashboard/members/count',
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

  const handleSelectionType = (data) => {
    console.log('data: ', data);
    setSelectionType(data);
  };

  return (
    <AppCard
      // sxStyle={{position: 'relative'}}
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      title={messages['dashboard.management.register']}
      titleStyle={{
        marginTop: 0,
        marginRight: 0,
      }}
      action={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              display: {xs: 'none', sm: 'flex'},
              alignItems: 'center',
              flexWrap: 'wrap',
              mr: 2,
            }}
          >
            {/* <DotActionItem>
              <span
                style={{backgroundColor: theme.palette.secondary.main}}
                className='dot-icon'
              />
              <IntlMessages id='dashboard.eCommerce.return' />
            </DotActionItem>
            <DotActionItem>
              <span
                style={{backgroundColor: theme.palette.primary.main}}
                className='dot-icon'
              />
              <IntlMessages id='common.orders' />
            </DotActionItem> */}
          </Box>
          <AppSelect
            menus={timeOptions}
            selectionKey='value'
            labelKey='label'
            defaultValue='thisWeek'
            onChange={handleSelectionType}
          />
        </Box>
      }
    >
      {loading ? <> loading....</> : <SalesChart data={statData} />}
    </AppCard>
  );
};

export default SalesReport;
