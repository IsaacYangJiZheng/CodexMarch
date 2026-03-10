  import React from 'react';
  import AppCard from '@anran/core/AppCard';
  // import SalesChart from './SalesChart';
  import SalesChart from './StatGraphs';
  import AppSelect from '@anran/core/AppSelect';
  import AppBranchSelect from '@anran/core/AppBranchSelect';
  import {useIntl} from 'react-intl';
  // import IntlMessages from '@anran/utility/IntlMessages';
  // import {alpha, useTheme} from '@mui/material';
  import Box from '@mui/material/Box';
  import PropTypes from 'prop-types';
  import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
  import {postDataApi} from '@anran/utility/APIHooks';
  import {statisticsGraph} from './data';

  // import {styled} from '@mui/material/styles';

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

  const SalesReport = ({branchOptions}) => {
    const {messages} = useIntl();
    const infoViewActionsContext = useInfoViewActionsContext();
    const [loading, setLoading] = React.useState(false);
    const [statData, setStatData] = React.useState(statisticsGraph);
    const [selectionBranch, setSelectionBranch] = React.useState(null);
    const [selectedYear, setSelectedYear] = React.useState(2026);
    // const [selectionType, setSelectionType] = React.useState('Today');
    // const [selectedStartDate, setSelectedStartDate] = React.useState(null);
    // const [selectedEndDate, setSelectedEndDate] = React.useState(null);
    // const theme = useTheme();

    // React.useEffect(() => {
    //   if (selectionType && selectionBranch) {
    //     const startOfWeek = dayjs().startOf('week');
    //     const endOfWeek = startOfWeek.add(6, 'day');
    //     const startOfMonth = dayjs().startOf('month');
    //     const endOfMonth = dayjs().endOf('month');
    //     const startOfYear = dayjs().startOf('year');
    //     const endOfYear = dayjs().endOf('year');
    //     switch (selectionType) {
    //       case 'Today':
    //         setSelectedStartDate(dayjs().format('YYYY-MM-DD'));
    //         setSelectedEndDate(dayjs().format('YYYY-MM-DD'));
    //         break;
    //       case 'This Week':
    //         // var curr = new Date(); // get current date
    //         // var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    //         // var last = first + 6; // last day is the first day + 6

    //         // var firstday = new Date(curr.setDate(first)).toUTCString();
    //         // var lastday = new Date(curr.setDate(last)).toUTCString();
    //         setSelectedStartDate(startOfWeek.format('YYYY-MM-DD'));
    //         setSelectedEndDate(endOfWeek.format('YYYY-MM-DD'));
    //         break;
    //       case 'Last Weeks':
    //         var temp = startOfWeek.subtract(1, 'day');
    //         var startOfLastWeek = dayjs(temp).startOf('week');
    //         var endOfLastWeek = startOfLastWeek.add(6, 'day');
    //         setSelectedStartDate(startOfLastWeek.format('YYYY-MM-DD'));
    //         setSelectedEndDate(endOfLastWeek.format('YYYY-MM-DD'));
    //         break;
    //       case 'This Month':
    //         setSelectedStartDate(startOfMonth.format('YYYY-MM-DD'));
    //         setSelectedEndDate(endOfMonth.format('YYYY-MM-DD'));
    //         break;
    //       case 'This Year':
    //         setSelectedStartDate(startOfYear.format('YYYY-MM-DD'));
    //         setSelectedEndDate(endOfYear.format('YYYY-MM-DD'));
    //         break;
    //       default:
    //         break;
    //     }
    //   }
    // }, [selectionBranch, selectionType]);

    React.useEffect(() => {
      if (branchOptions?.length > 0) {
        setSelectionBranch(branchOptions[0]?._id);
      }
    }, [branchOptions]);

    React.useEffect(() => {
      fetchData();
  }, [selectionBranch, selectedYear]);

    const fetchData = async () => {
      if (selectionBranch) {
        setLoading(true);
        const formData = new FormData();
        formData.append('selectedBranch', selectionBranch);
        formData.append('selectedYear', selectedYear);
        try {
          const response = await postDataApi(
            'api/dashboard/sales-report',
            infoViewActionsContext,
            formData,
            false,
            false,
            {
              'Content-Type': 'multipart/form-data',
            },
          );
          console.log('sales-response', response);
          if (response && response.length > 0) {
            const newItem = JSON.parse(JSON.stringify(statisticsGraph));
            newItem?.map((item) => {
              var result = response.filter((obj) => {
                return obj.month === item.month;
              });
              if (result.length > 0) {
                item.count = parseFloat(result[0].count);
                item.amount = parseFloat(result[0].amount);
              }
              return item;
            });
            setLoading(false);
            setStatData(newItem);
          } else {
            setLoading(false);
            setStatData(statisticsGraph);
          }
          // setStatData(response);
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

    const handleYearChange = (year) => {
      setSelectedYear(year);
    };

    // const handleSelectionType = (data) => {
    //   console.log('data: ', data);
    //   setSelectionType(data);
    // };

    return (
      <AppCard
        // sxStyle={{position: 'relative'}}
        sxStyle={{height: 1, backgroundColor: '#f2edde'}}
        title={messages['dashboard.management.salesreport']}
        titleStyle={{
          marginTop: 0,
          marginRight: 0,
        }}
        action={
          selectionBranch ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 1.5 },
                width: { xs: '100%', sm: 'auto' },

                // Make the selects responsive even if the inner components use FormControl
                '& .MuiFormControl-root': {
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { sm: 160 },
                },
              }}
            >
              <AppBranchSelect
                menus={branchOptions}
                defaultValue={selectionBranch}
                onChange={handleSelectionBranch}
                selectionKey={'_id'}
                labelKey={'branch'}
              />

              <AppSelect
                menus={[2025, 2026]}
                defaultValue={selectedYear}
                onChange={handleYearChange}
              />
              {/* <AppSelect
              menus={[
                messages['dashboard.thisWeek'],
                messages['dashboard.lastWeeks'],
                messages['dashboard.thisMonth'],
                messages['dashboard.thisYear'],
              ]}
              defaultValue={messages['dashboard.thisWeek']}
              onChange={handleSelectionType}
            /> */}
            </Box>
          ) : null
        }
      >
        {loading ? <> loading....</> : <SalesChart data={statData} />}
      </AppCard>
    );
  };

  export default SalesReport;

  SalesReport.propTypes = {
    branchOptions: PropTypes.array,
  };
