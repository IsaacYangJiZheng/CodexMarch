import React from 'react';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppInfoView from '@anran/core/AppInfoView';
import AppAnimate from '@anran/core/AppAnimate';
import AgeGroupCard from './AgeGroup';
import GenderCard from './Gender';
import ResidentialArea from './ResidentialArea';
import ReferralCard from './Referral';
import CustomerTracking from './CustomerTracking';
import TotalMemberCount from './TotalMemberCount';
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
            <Grid size={{xs: 12, md: 8, lg: 8, xl: 8}}>
              <AgeGroupCard branchOptions={branchOptions} />
            </Grid>
            <Grid size={{xs: 12, md: 4, lg: 4, xl: 4}}>
              <GenderCard branchOptions={branchOptions} />
            </Grid>
            <Grid size={{xs: 12, md: 7, lg: 7, xl: 7}}>
              <ResidentialArea />
            </Grid>
            <Grid size={{xs: 12, md: 5, lg: 5, xl: 5  }}>
              <ReferralCard branchOptions={branchOptions} />
            </Grid>
            <Grid size={{xs: 12, md: 8, lg: 8, xl: 8}}>
              <CustomerTracking branchOptions={branchOptions}/>
            </Grid>
              <Grid size={{xs: 12, md: 4, lg: 4, xl: 4}}>
              <TotalMemberCount />
            </Grid>
          </AppGridContainer>
        </>
      </AppAnimate>

      <AppInfoView />
    </>
  );
};

export default Analytics;