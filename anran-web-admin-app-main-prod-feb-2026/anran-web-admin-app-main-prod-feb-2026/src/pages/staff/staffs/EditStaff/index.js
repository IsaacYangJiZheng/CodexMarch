import React, {useState} from 'react';
import PropTypes from 'prop-types';
import AppAnimate from '@anran/core/AppAnimate';
import {MailDetailSkeleton} from '@anran/core/AppSkeleton/MailDetailSkeleton';
import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import StaffDetailHeader from './StaffDetailHeader';
import StaffInfo from './tabs/StaffInfo';
import StaffWithdraw from './tabs/StaffWithdraw';
import StaffSettings from './tabs/StaffSettings';
import AppInfoView from '@anran/core/AppInfoView';
import {Card, AppBar} from '@mui/material';
import AppScrollbar from '@anran/core/AppScrollbar';
import {useGetDataApi} from '@anran/utility/APIHooks';


const EditStaff = ({
  selectedStaff,
  setSelectedStaff,
  branchOptions,
  roleOptions,
  refresh,
}) => {
  const [mainTabValue, setMainTabValue] = useState(0);
  const [openWithdrawStaffDialog, setOpenWithdrawStaffDialog] = useState(false);

  const [{apiData: staffDatabase}, {reCallAPI}] = useGetDataApi(
    `api/staff/${selectedStaff._id}`,
    {},
    {},
    true,
  );

  const onMainTabsChange = (newValue) => {
    setMainTabValue(newValue);
  };

  const handleOpenWithdrawStaffDialog = () => {
    setOpenWithdrawStaffDialog(true);
  };

  const handleCloseWithdrawStaffDialog = () => {
    setOpenWithdrawStaffDialog(false);
  };

  if (!staffDatabase) {
    return <MailDetailSkeleton />;
  }

  return (
    <>
      <AppBar position='sticky'>
        <AppsHeaderWithImage>
          <StaffDetailHeader
            setSelectedStaff={setSelectedStaff}
            mainTabValue={mainTabValue}
            setMainTabValue={onMainTabsChange}
            handleOpenWithdrawStaffDialog={handleOpenWithdrawStaffDialog}
            refresh={refresh}
          />
        </AppsHeaderWithImage>
      </AppBar>
      <AppScrollbar
        sx={{
          height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
        }}
      >
        <AppAnimate animation='transition.slideUpIn' delay={200}>
          <>
            {mainTabValue === 0 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <StaffInfo
                    rawData={staffDatabase}
                    branchOptions={branchOptions}
                    roleOptions={roleOptions}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 1 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <StaffSettings
                    rawData={staffDatabase}
                    roleOptions={roleOptions}
                    branchOptions={branchOptions}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
          </>
        </AppAnimate>
      </AppScrollbar>
      <AppInfoView />
      <StaffWithdraw
        open={openWithdrawStaffDialog}
        onClose={handleCloseWithdrawStaffDialog}
        selectedStaff={selectedStaff}
        refresh={refresh}
        setSelectedStaff={setSelectedStaff}
      />
    </>
  );
};

export default EditStaff;

EditStaff.propTypes = {
  selectedStaff: PropTypes.object,
  setSelectedStaff: PropTypes.func,
  branchOptions: PropTypes.array,
  roleOptions: PropTypes.array,
  refresh: PropTypes.func,
};
