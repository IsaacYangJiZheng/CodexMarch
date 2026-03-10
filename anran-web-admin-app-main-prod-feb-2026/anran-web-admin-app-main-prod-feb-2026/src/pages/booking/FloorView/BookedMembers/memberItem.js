import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import {Fonts} from 'shared/constants/AppEnums';
import DeleteIcon from '@mui/icons-material/Delete';
// import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
// import AlarmOnOutlinedIcon from '@mui/icons-material/AlarmOnOutlined';
// import CountdownTimer from './CountdownTimer';
import dayjs from 'dayjs';
import EditDialog from './editDialog';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(timezone);

const MemberItem = ({item, start, slot, reCallAPI, onClose}) => {
  const {user} = useAuthUser();
  console.log('MemberItem-123', item);
  console.log('Slot', slot);
  console.log('SlotStart-123', start);
  const infoViewActionsContext = useInfoViewActionsContext();
  const currentTime = dayjs();
  const bookedTime = dayjs(start);
  const isBefore5Minutes = currentTime.isBefore(
    bookedTime.subtract(5, 'minutes'),
  );
  // const isCheckInWindow =
  //   currentTime.isAfter(bookedTime) &&
  //   currentTime.isBefore(bookedTime.add(50, 'minute'));
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // const handleCheckIn = async () => {
  //   const formData = new FormData();
  //   formData.append('id', item._id);

  //   try {
  //     await postDataApi(
  //       '/api/booking/webcheckin',
  //       infoViewActionsContext,
  //       formData,
  //       false,
  //       false,
  //       {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     );
  //     item.bookingstatus = 'CheckedIn';
  //     reCallAPI();
  //     infoViewActionsContext.showMessage('Check-in successful!');
  //   } catch (error) {
  //     infoViewActionsContext.fetchError(error.message);
  //   }
  // };

  const handleCheckOut = async () => {
    const formData = new FormData();
    formData.append('id', item._id);

    try {
      await postDataApi(
        '/api/booking/manual-checkout',
        infoViewActionsContext,
        formData,
        false,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      );
      item.bookingstatus = 'Complete';
      reCallAPI();
      infoViewActionsContext.showMessage('Check-out successful!');
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const onDeleteConfirm = () => {
    const formData = new FormData();

    formData.append('id', item?._id);
    formData.append('slotId', slot?._id);

    postDataApi(
      `/api/booking/cancel-booking`,
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        onClose();
        infoViewActionsContext.showMessage('Deleted successfully!');
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <Card sx={{m: 2}} variant='outlined'>
      <Box className='item-hover' px={5} py={2} display='flex'>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            marginTop: 0.5,
          }}
          src={item.member.profileImageUrl}
        />
        <Box
          ml={3.5}
          flex={1}
          display='flex'
          alignItems='center'
          flexWrap='wrap'
        >
          <Box mb={1} flex={1} mr={1}>
            <Box display='flex' alignItems='center'>
              <Typography component='h5' variant='h5'>
                {item.member.memberFullName}
              </Typography>
            </Box>
            <Box display='flex' alignItems='center'>
              <CallOutlinedIcon fontSize='small' />
              <Box component='p' color='text.secondary' sx={{m: 0}}>
                {item.member.mobileNumber}
              </Box>
            </Box>
          </Box>
          {item.bookingstatus == 'Booked' && (
            <Box mb={1}>
              <Button
                variant='outlined'
                color='primary'
                size='small'
                sx={{
                  borderRadius: 30,
                }}
              >
                Booked
              </Button>
            </Box>
          )}
          {item.bookingstatus == 'No Show' && (
            <Box mb={1}>
              <Button
                variant='outlined'
                color='warning'
                size='small'
                sx={{
                  borderRadius: 30,
                }}
              >
                No Show
              </Button>
            </Box>
          )}
          {item.bookingstatus == 'Cancel' && (
            <Box mb={1}>
              <Button
                variant='outlined'
                color='error'
                size='small'
                sx={{
                  borderRadius: 30,
                }}
              >
                Cancelled
              </Button>
            </Box>
          )}
          {item.bookingstatus == 'CheckedIn' && (
            <Box mb={1}>
              <Button
                variant='outlined'
                color='success'
                size='small'
                sx={{
                  borderRadius: 30,
                }}
              >
                CheckedIn
              </Button>
            </Box>
          )}
          {item.bookingstatus == 'Complete' && (
            <Box mb={1}>
              <Button
                variant='outlined'
                color='warning'
                size='small'
                sx={{
                  borderRadius: 30,
                }}
              >
                Complete
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          fontWeight: 'bold',
        }}
      >
        {`Booked for ${item.pax} person(s)`}
      </Box>
      {item.bookingstatus == 'Booked' && (
        <Box
          sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}
        >
          {/* {isCheckInWindow && (
            <Box
              sx={{
                fontSize: 14,
                fontWeight: Fonts.REGULAR,
                ml: 2,
                mt: 1,
                mb: 4,
              }}
            >
              {user.permission.includes(RoutePermittedRole2.member_checkin_view) && (
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<TaskAltOutlinedIcon />}
                  onClick={handleCheckIn}
                >
                  Check In
                </Button>
              )}
            </Box>
          )} */}
          <Box
            sx={{
              fontSize: 14,
              fontWeight: Fonts.REGULAR,
              ml: 2,
              mt: 1,
              mb: 4,
            }}
          >
            {user.permission.includes(RoutePermittedRole2.member_booking_update) && (
              <Button
                variant='contained'
                color='info'
                startIcon={<EditOutlinedIcon />}
                onClick={handleOpenEditDialog}
              >
                Change
              </Button>
            )}
          </Box>
          {isBefore5Minutes && (
            <Box
              sx={{
                fontSize: 14,
                fontWeight: Fonts.REGULAR,
                ml: 2,
                mt: 1,
                mb: 4,
              }}
            >
              {user.permission.includes(RoutePermittedRole2.member_booking_delete) && (
                <Button
                  variant='contained'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                >
                  Cancel
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
      {item.bookingstatus == 'CheckedIn' && (
        <Box
          sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}
        >
          {/* https://github.com/vivekreddy-k/ReactJS-digital-timer/tree/main */}
          {/* https://stackoverflow.com/questions/54735598/a-click-to-start-the-countdown-timer-and-a-second-one-to-pause-the-timer-in-the */}
          {/* https://dev.to/thesohailjafri/how-to-schedule-cron-job-in-nodejs-expressjs-2flm */}
          {/* <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <Button
              variant='contained'
              color='primary'
              startIcon={<AlarmOnOutlinedIcon />}
            >
              Check In : 11:00 AM
            </Button>
           
          </Box> */}
          <Box
            sx={{
              fontSize: 14,
              fontWeight: Fonts.REGULAR,
              ml: 2,
              mt: 1,
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>{`Checked in at ${dayjs(item.checkin_date).format('DD MMM YYYY, h:mm A')}`}</Typography>
            <Button
              variant='contained'
              color='warning'
              startIcon={<ArrowOutwardIcon />}
              onClick={handleCheckOut}
            >
              Check Out
            </Button>
          </Box>
        </Box>
      )}
      {item.bookingstatus == 'No Show' && (
        <Box
          sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}
        >
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <Button
              variant='contained'
              color='info'
              startIcon={<NotificationsActiveOutlinedIcon />}
            >
              Send Reminder
            </Button>
          </Box>
        </Box>
      )}
      {openEditDialog ? (
        <EditDialog
          item={item}
          slot={slot}
          handleCloseEditDialog={handleCloseEditDialog}
          openEditDialog={openEditDialog}
          reCallAPI={reCallAPI}
          onClose={onClose}
        />
      ) : null}
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={'Delete Confirmation'}
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
            {'Are you sure you want to delete the booking?'}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
    </Card>
  );
};

export default MemberItem;

MemberItem.propTypes = {
  item: PropTypes.object,
  start: PropTypes.object,
  slot: PropTypes.object,
  reCallAPI: PropTypes.func,
  onClose: PropTypes.func,
};
