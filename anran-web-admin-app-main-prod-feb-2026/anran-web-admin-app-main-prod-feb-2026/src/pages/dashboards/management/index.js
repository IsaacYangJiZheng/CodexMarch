import React from 'react';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppInfoView from '@anran/core/AppInfoView';
import AppAnimate from '@anran/core/AppAnimate';
import BookingCard from './Booking';
import TopSelling from './TopSelling';
import SalesReport from './SalesReport';
// import TopBranch from './TopBranch';
import RegisteredMembersByMonth from './RegisteredMembersByMonth';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useIntl} from 'react-intl';

const Analytics = () => {
  const {messages} = useIntl();
  const {user} = useAuthUser();
  console.log('useAuthUser:', user);
  const [branchOptions, setBranchOptions] = React.useState([]);
  const [{apiData: branchDatabase}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  React.useEffect(() => {
  if (branchDatabase?.length > 0) {
    let opt = [];
    if (user?.branchAccess === 'all') {
      opt.push({branch: messages['dashboard.all.branch'], _id: 'All'});
    }

    branchDatabase.forEach((branch) => {
      opt.push({branch: branch.branchName, _id: branch._id});
    });

    setBranchOptions(opt);
  }
}, [branchDatabase, user?.branchAccess, messages]);
  return (
    <>
      <AppAnimate animation='transition.slideUpIn' delay={200}>
        <>
          <AppGridContainer>
            <Grid size={{xs: 12, md: 6, lg: 6, xl: 6}}>
              <BookingCard branchOptions={branchOptions} />
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 6, xl: 6}}>
              <TopSelling branchOptions={branchOptions} />
            </Grid>
            <Grid size={{xs: 12, md: 6, lg: 6, xl: 6}}>
              <SalesReport branchOptions={branchOptions} />
            </Grid>
            {/* <Grid size={{xs: 12, md: 4, lg: 4, xl: 4}}>
              <TopBranch />
            </Grid> */}
            <Grid size={{xs: 12, md: 6, lg: 6, xl: 6}}>
              <RegisteredMembersByMonth />
            </Grid>
            {/* <Grid size={{xs: 12, md: 8, lg: 8, xl: 8}}>
              <RegisteredMembersByMonth />
            </Grid> */}
          </AppGridContainer>
        </>
      </AppAnimate>

      <AppInfoView />
    </>
  );
};

export default Analytics;