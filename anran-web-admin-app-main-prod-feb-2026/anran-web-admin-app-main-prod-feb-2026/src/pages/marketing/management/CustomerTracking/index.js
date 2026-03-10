// src/pages/marketing/management/CustomerTracking/index.js
import React from 'react';
import AppCard from '@anran/core/AppCard';
import AppBranchSelect from '@anran/core/AppBranchSelect';
import { useIntl } from 'react-intl';
import { Box } from '@mui/material';
import CustomerTrackingChart from './CustomerTrackingChart';
import EmptyChart from './EmptyChart'; // adjust the relative path if needed
import PropTypes from 'prop-types';
import AppLoader from '@anran/core/AppLoader';
import { useInfoViewActionsContext } from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import { postDataApi } from '@anran/utility/APIHooks';

const CustomerTracking = ({ branchOptions }) => {
  const { messages } = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [loading, setLoading] = React.useState(false);
  const [statData, setStatData] = React.useState([]);
  const [totalMember, setTotalMember] = React.useState(0);
  const [selectionBranch, setSelectionBranch] = React.useState(null);

  // Initialize dropdown with first branch like your example
  React.useEffect(() => {
    if (branchOptions?.length > 0) {
      setSelectionBranch(branchOptions[0]?._id);
    }
  }, [branchOptions]);

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionBranch]);

  const mapUsageLabel = (label, intlMessages) => {
    const normalizedLabel = String(label || '').trim().toLowerCase();
    if (normalizedLabel === 'first time' || normalizedLabel === '首次') {
      return intlMessages['marketing.customerTracking.firstTime'];
    }
    if (normalizedLabel === 'returning' || normalizedLabel === '回访' || normalizedLabel === '复访') {
      return intlMessages['marketing.customerTracking.returning'];
    }
    return label;
  };

  const fetchData = async () => {
    if (!selectionBranch) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('selectedBranch', selectionBranch);
    try {
      const response = await postDataApi(
        'api/marketing/customer-booking-usage',
        infoViewActionsContext,
        formData,
        false,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      );
      const list = Array.isArray(response) ? response : [];
       const mapped = list.map((item) => ({
        ...item,
        title: mapUsageLabel(item.title ?? item.type ?? item.key, messages),
      }));
      const sum = list.reduce((acc, item) => acc + (Number(item?.value) || 0), 0);
      setTotalMember(sum);
      setStatData(mapped);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
      setStatData([]);
      setTotalMember(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionBranch = (value) => {
    setSelectionBranch(value);
  };

  return (
    <AppCard
      sxStyle={{ height: 1, backgroundColor: '#f2edde' }}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      title={messages['marketing.customerTracking'] || 'Customer Tracking'}
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
        totalMember > 0 ? (
          <CustomerTrackingChart
            data={statData}
            totalMember={totalMember}
            totalLabel={messages['dashboard.booking.total']}
          />
        ) : (
          <EmptyChart />
        )
      ) : null}
    </AppCard>
  );
};

CustomerTracking.propTypes = {
  branchOptions: PropTypes.array,
};

export default CustomerTracking;
