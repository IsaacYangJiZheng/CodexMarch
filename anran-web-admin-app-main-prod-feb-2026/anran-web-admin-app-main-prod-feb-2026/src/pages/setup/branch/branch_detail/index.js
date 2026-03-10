import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import AppAnimate from '@anran/core/AppAnimate';
import {MailDetailSkeleton} from '@anran/core/AppSkeleton/MailDetailSkeleton';
import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import BranchDetailHeader from './BranchDetailHeader';
import BranchInfo from './tabs/BranchInfo';
import BeanchFloors from './tabs/floor';
import BeanchFloorRooms from './tabs/rooms';
import Settings from './tabs/settings';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useGetDataApi} from '@anran/utility/APIHooks';
// import {useBranchAuth} from '@anran/utility/AuthHooks';
import AppInfoView from '@anran/core/AppInfoView';
import {Card, AppBar} from '@mui/material';
import AppScrollbar from '@anran/core/AppScrollbar';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const BranchDetails = ({
  selectedBranch,
  setSelectedBranch,
  hqStatusError,
  refresh,
}) => {
  const {user} = useAuthUser();
  console.log('useAuthUser:', user);
  console.log('selectedBranch', selectedBranch);
  const hasRoomViewPermission = user.permission.includes(RoutePermittedRole2.admin_room_view);
  const [mainTabValue, setMainTabValue] = React.useState(0);

  const [{apiData: staffData}, {setQueryParams, reCallAPI}] = useGetDataApi(
    `api/branch/${selectedBranch._id}`,
    undefined,
    {id: selectedBranch.id},
    true,
  );

  useEffect(() => {
    if (selectedBranch) {
      setQueryParams({id: selectedBranch.id});
    }
  }, [selectedBranch]);

  const onMainTabsChange = (newValue) => {
    setMainTabValue(newValue);
  };

  if (!staffData) {
    return <MailDetailSkeleton />;
  }

  return (
    <>
      <AppBar position='sticky'>
        <AppsHeaderWithImage>
          <BranchDetailHeader
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            mainTabValue={mainTabValue}
            setMainTabValue={onMainTabsChange}
          />
        </AppsHeaderWithImage>
      </AppBar>
      <AppScrollbar
        sx={{
          height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
        }}
      >
        <AppAnimate animation='transition.slideUpIn' delay={200}>
          {/* <>
            {mainTabValue === 0 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <BranchInfo
                    rawData={staffData}
                    reCallAPI={reCallAPI}
                    refresh={refresh}
                    hqStatusError={hqStatusError}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 1 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <BeanchFloors
                    selectedBranch={staffData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 2 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <BeanchFloorRooms
                    selectedBranch={staffData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 3 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <Settings selectedBranch={staffData} reCallAPI={reCallAPI} />
                </Card>
              </>
            )}
          </> */}
          <>
            {mainTabValue === 0 && (
              <Card sx={{ mt: 2, p: 5 }}>
                <BranchInfo rawData={staffData} reCallAPI={reCallAPI} refresh={refresh} hqStatusError={hqStatusError} />
              </Card>
            )}

            {mainTabValue === 1 && (
              <Card sx={{ mt: 2, p: 5 }}>
                <BeanchFloors selectedBranch={staffData} reCallAPI={reCallAPI} />
              </Card>
            )}

            {hasRoomViewPermission && mainTabValue === 2 && (
              <Card sx={{ mt: 2, p: 5 }}>
                <BeanchFloorRooms selectedBranch={staffData} reCallAPI={reCallAPI} />
              </Card>
            )}

            {mainTabValue === (hasRoomViewPermission ? 3 : 2) && (
              <Card sx={{ mt: 2, p: 5 }}>
                <Settings selectedBranch={staffData} reCallAPI={reCallAPI} />
              </Card>
            )}
          </>
        </AppAnimate>
      </AppScrollbar>
      <AppInfoView />
    </>
  );
};

export default BranchDetails;

BranchDetails.propTypes = {
  selectedBranch: PropTypes.object,
  setSelectedBranch: PropTypes.func,
  hqStatusError: PropTypes.bool,
  refresh: PropTypes.func,
};
