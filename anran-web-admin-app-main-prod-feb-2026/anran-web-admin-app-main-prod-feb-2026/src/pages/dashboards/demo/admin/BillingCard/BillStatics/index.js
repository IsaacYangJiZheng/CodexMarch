import React from 'react';
import AppCard from '@anran/core/AppCard';
import {useIntl} from 'react-intl';
import AppSelect from '@anran/core/AppSelect';
import Grid from '@mui/material/Grid2';
// import {Box, Grid} from '@mui/material';
// import Typography from '@mui/material/Typography';
// import AppCircularProgress from '@anran/core/AppCircularProgress';
import BillStaticChart from './BillStaticChart';
import AppGridContainer from '@anran/core/AppGridContainer';

const SaleStatics = () => {
  const {messages} = useIntl();
  const handleSelectionType = (data) => {
    console.log('data: ', data);
  };

  return (
    <AppCard
      title={'Statics'}
      action={
        <AppSelect
          menus={[
            messages['dashboard.ytd'],
            messages['dashboard.thisMonth'],
            messages['dashboard.lastMonth'],
          ]}
          defaultValue={messages['dashboard.ytd']}
          onChange={handleSelectionType}
        />
      }
    >
      <AppGridContainer>
        <Grid size={12}>
          <BillStaticChart />
        </Grid>
      </AppGridContainer>
    </AppCard>
  );
};

export default SaleStatics;
