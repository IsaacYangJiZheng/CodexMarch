import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@mui/material';
import AppAnimate from '@anran/core/AppAnimate';
import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import MemberDetailHeader from './MemberDetailHeader';
import MemberDetails from './tabs/memberDetails';
import PackageInfo from './tabs/packageInfo';
import VoucherInfo from './tabs/voucherInfo';
import TransferSession from './tabs/transferSession';
import MemberDeposits from './tabs/memberDeposits';
import BookingStatus from './tabs/bookingStatus';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useGetDataApi} from '@anran/utility/APIHooks';
// import {useBranchAuth} from '@anran/utility/AuthHooks';
import AppInfoView from '@anran/core/AppInfoView';
// import {Card, AppBar} from '@mui/material';
import {Card} from '@mui/material';
import AppScrollbar from '@anran/core/AppScrollbar';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {deleteDataApi} from '@anran/utility/APIHooks';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';

const MemberDetail = ({
  selectedMember,
  setSelectedMember,
  infoViewActionsContext,
}) => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  console.log('useAuthUser:', user);
  console.log('selectedMember', selectedMember);

  const [mainTabValue, setMainTabValue] = React.useState(0);
  const [openWithdrawMemberDialog, setOpenWithdrawMemberDialog] =
    React.useState(false);

  const [{apiData: memberData}, {setQueryParams, reCallAPI}] = useGetDataApi(
    selectedMember && selectedMember._id
      ? `api/members/detail/${selectedMember._id}`
      : '',
    undefined,
    {id: selectedMember?.id},
    true,
  );

  useEffect(() => {
    if (selectedMember) {
      setQueryParams({id: selectedMember._id});
    }
  }, [selectedMember, setQueryParams]);

  const onMainTabsChange = (newValue) => {
    setMainTabValue(newValue);
  };

  const handleOpenWithdrawMemberDialog = () => {
    setOpenWithdrawMemberDialog(true);
  };

  const handleCloseWithdrawMemberDialog = () => {
    setOpenWithdrawMemberDialog(false);
  };

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/members/${selectedMember._id}`,
      infoViewActionsContext,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.detail.delete.success'}),
        );
        setOpenWithdrawMemberDialog(false);
        setSelectedMember(null);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <>
      {/* <AppBar position='sticky'> */}
      <AppsHeaderWithImage>
        <MemberDetailHeader
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          mainTabValue={mainTabValue}
          setMainTabValue={onMainTabsChange}
          handleOpenWithdrawMemberDialog={handleOpenWithdrawMemberDialog}
        />
      </AppsHeaderWithImage>
      {/* </AppBar> */}
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
                  {memberData ? (
                    <MemberDetails rawData={memberData} reCallAPI={reCallAPI} />
                  ) : null}
                </Card>
              </>
            )}
            {mainTabValue === 1 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <PackageInfo
                    selectedMember={memberData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 2 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <VoucherInfo
                    selectedMember={memberData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 3 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <TransferSession
                    selectedMember={memberData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 4 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <MemberDeposits
                    selectedMember={memberData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
            {mainTabValue === 5 && (
              <>
                <Card sx={{mt: 2, p: 5}}>
                  <BookingStatus
                    selectedMember={memberData}
                    reCallAPI={reCallAPI}
                  />
                </Card>
              </>
            )}
          </>
        </AppAnimate>
      </AppScrollbar>
      <AppInfoView />
      <AppConfirmDialogV2
        dividers
        open={openWithdrawMemberDialog}
        dialogTitle={formatMessage({id: 'member.detail.delete.title'})}
        title={
          <Typography
            component='h4'
            variant='h4'
            sx={{
              mb: 3,
              fontWeight: Fonts.SEMI_BOLD,
            }}
            id='alert-dialog-title'
          >
            {formatMessage({id: 'member.detail.delete.confirm'})}
          </Typography>
        }
        onDeny={handleCloseWithdrawMemberDialog}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
};

export default MemberDetail;

MemberDetail.propTypes = {
  selectedMember: PropTypes.object,
  setSelectedMember: PropTypes.func,
  infoViewActionsContext: PropTypes.func,
};