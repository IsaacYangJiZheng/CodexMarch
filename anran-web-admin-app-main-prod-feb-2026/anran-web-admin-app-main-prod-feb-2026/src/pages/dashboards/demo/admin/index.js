import React from 'react';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppInfoView from '@anran/core/AppInfoView';
import AppAnimate from '@anran/core/AppAnimate';
import ActivitiesCard from './ActivitiesCard';
import AttendanceCard from './AttendanceCard';
import EnrollmentCard from './EnrollmentCard';
import BillingCard from './BillingCard';
import TodayTasks from './TodayTasks';
// import {useGetMockDataApi} from '@anran/utility/APIHooksMock';
// import {useBranchAuth} from '@anran/utility/AuthHooks';
import analyticsData from '@anran/services/db/dashboard/analytics';
import crmData from '@anran/services/db/dashboard/crm';

const Analytics = () => {
  // const [{apiData: analyticsData}] = useGetMockDataApi('/dashboard/analytics');
  // const [{apiData: crmData}] = useGetMockDataApi('/dashboard/crm');
  // const {roomlist} = useBranchAuth();

  return (
    <>
      {analyticsData ? (
        <AppAnimate animation='transition.slideUpIn' delay={200}>
          <>
            <AppGridContainer>
              <Grid size={{xs: 12, md: 4, xl: 4}}>
                <AppGridContainer>
                  <Grid size={12}>
                    <ActivitiesCard
                      data={analyticsData.visitorsPageView}
                      roomlist={[]}
                    />
                  </Grid>
                  <Grid size={12}>
                    <AttendanceCard
                      data={analyticsData.visitorsPageView}
                      roomlist={[]}
                    />
                  </Grid>
                  <Grid size={12}>
                    <EnrollmentCard
                      data={analyticsData.visitorsPageView}
                      roomlist={[]}
                    />
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={{xs: 12, md: 8, xl: 8}}>
                <AppGridContainer>
                  <Grid size={12}>
                    <BillingCard
                      data={analyticsData.visitorsPageView}
                      roomlist={[]}
                    />
                  </Grid>
                  <Grid size={12}>
                    {crmData ? (
                      <TodayTasks todayTaskData={crmData.todayTaskData} />
                    ) : null}
                  </Grid>
                </AppGridContainer>
              </Grid>
            </AppGridContainer>
          </>
        </AppAnimate>
      ) : null}

      <AppInfoView />
    </>
  );
};

export default Analytics;
