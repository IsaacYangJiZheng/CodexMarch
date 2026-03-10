import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppSelect from '@anran/core/AppSelect';
import Box from '@mui/material/Box';
import {useIntl} from 'react-intl';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import MonthlyChart from './MonthlyChart';
import {registeredMembersByMonth} from './data';

const RegisteredMembersByMonth = () => {
  const {messages} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();

  const infoViewRef = React.useRef(infoViewActionsContext);
  React.useEffect(() => {
    infoViewRef.current = infoViewActionsContext;
  }, [infoViewActionsContext]);

  const [loading, setLoading] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(2026);
  const [chartData, setChartData] = React.useState(registeredMembersByMonth);

  const yearOptions = React.useMemo(
  () => [
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
  ],
  [],
);

  React.useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = { selectedYear };

      const response = await postDataApi(
        'api/dashboard/members/monthly',
        infoViewActionsContext,
        payload,
        false,
        false,
        { 'Content-Type': 'application/json' },
      );

      if (!Array.isArray(response)) {
        throw new Error('Invalid API response');
      }

      const nextData = registeredMembersByMonth.map((item) => {
        const match = response.find(
          (entry) => entry.month === item.monthIndex,
        );
        return { ...item, count: match ? match.count : 0 };
      });

      if (!cancelled) setChartData(nextData);
    } catch (error) {
      if (!cancelled)
        infoViewActionsContext.fetchError(error.message);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  fetchData();
  return () => {
    cancelled = true;
  };
}, [selectedYear]);


  const handleSelectionYear = (value) => setSelectedYear(Number(value));

  return (
    <AppCard
      sxStyle={{height: 1, backgroundColor: '#f2edde'}}
      title={messages['dashboard.management.registeredMembersMonthly']}
      action={
        <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
          <AppSelect
            menus={yearOptions}
            selectionKey="value"
            labelKey="label"
            defaultValue={selectedYear}
            onChange={handleSelectionYear}
          />
        </Box>
      }
    >
      {loading ? <>loading....</> : <MonthlyChart data={chartData} />}
    </AppCard>
  );
};

export default RegisteredMembersByMonth;