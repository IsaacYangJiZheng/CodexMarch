import React from 'react';
import AppScrollbar from '@anran/core/AppScrollbar';
import AppList from '@anran/core/AppList';
import AppCard from '@anran/core/AppCard';
import MemberItem from './memberItem';
import PropTypes from 'prop-types';
import Drawer from '@mui/material/Drawer';
import CardHeader from './CardHeader';
import {Box, Button} from '@mui/material';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import {Fonts} from 'shared/constants/AppEnums';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import AddSlotBooking from './SlotNewBooking';
import EditSlotBooking from './SlotEditBooking';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';

const WhoToFollow = (props) => {
  const {isMemberListOpen, onCloseList, slot, reCallAPI} = props;
  const [addSlotOpen, setAddSlotOpen] = React.useState(false);
  const [editSlotOpen, setEditSlotOpen] = React.useState(false);
  const [selectedMemberBooking, setSelectedMemberBooking] =
    React.useState(null);
  const infoViewActionsContext = useInfoViewActionsContext();

  const handleOpenDialog = () => {
    setAddSlotOpen(true);
  };

  const handleEditBooking = (item) => {
    setSelectedMemberBooking(item);
    setEditSlotOpen(true);
  };

  const handleWebCheckIn = (id) => {
    postDataApi(
      '/api/booking/webcheckin',
      infoViewActionsContext,
      {id: id},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage('Added successfully!');
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const handleCancelBooking = (id) => {
    postDataApi(
      '/api/booking/cancel-booking',
      infoViewActionsContext,
      {id: id, slotId: slot._id},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage('Cancelled successfully!');
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const Header = () => {
    return (
      <Box
        display='flex'
        flexDirection='column'
        sx={{backgroundColor: slot.color}}
      >
        <Box
          sx={{
            py: 2,
            px: {xs: 5, lg: 8, xl: 10},
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            // borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {'Date:'}
          </Box>
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {dayjs(slot.start).format('MMMM D, YYYY')}
          </Box>
        </Box>
        <Box
          sx={{
            py: 2,
            px: {xs: 5, lg: 8, xl: 10},
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {'Slot:'}
          </Box>
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {dayjs(slot.start).format('h:mm A')}
            {' - '}
            {dayjs(slot.end).format('h:mm A')}
          </Box>
        </Box>
      </Box>
    );
  };

  const EmptySlotHeader = () => {
    return (
      <Box
        display='flex'
        flexDirection='column'
        sx={{backgroundColor: '#045147'}}
      >
        <Box
          sx={{
            py: 2,
            px: {xs: 5, lg: 8, xl: 10},
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            // borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {'Date:'}
          </Box>
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {dayjs(slot.start).format('MMMM D, YYYY')}
          </Box>
        </Box>
        <Box
          sx={{
            py: 2,
            px: {xs: 5, lg: 8, xl: 10},
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {'Slot:'}
          </Box>
          <Box
            component='h1'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: 'white',
            }}
          >
            {dayjs(slot.start).format('h:mm A')}
            {' - '}
            {dayjs(slot.end).format('h:mm A')}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
        },
      }}
      anchor='right'
      open={isMemberListOpen}
      onClose={onCloseList}
      ModalProps={{onBackdropClick: (e) => e.preventDefault()}}
    >
      <CardHeader onCloseAddCard={onCloseList} title={'Booking Details'} />
      {slot?.members ? (
        <>
          <Header />
          <AppCard
            sxStyle={{mb: 8}}
            contentStyle={{px: 0, minHeight: '500px'}}
            title={
              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                <Typography variant='h3' sx={{}}>
                  Members List
                </Typography>
                <Box sx={{flex: 1}}></Box>
                {slot?.availableSlot == 0 ? (
                  <Typography sx={{color: 'red'}}>{'Fully Booked'}</Typography>
                ) : (
                  <Button
                    variant='outlined'
                    startIcon={<PostAddOutlinedIcon />}
                    onClick={handleOpenDialog}
                  >
                    Add Booking
                  </Button>
                )}
              </Box>
            }
          >
            <AppScrollbar
              sx={{
                height: 'calc(100% - 30px)',
              }}
            >
              <AppList
                data={slot?.members}
                renderRow={(item, index) => (
                  <MemberItem
                    key={index}
                    item={item}
                    handleWebCheckIn={handleWebCheckIn}
                    handleEditBooking={handleEditBooking}
                    handleCancelBooking={handleCancelBooking}
                    slotEnd={slot.end}
                  />
                )}
              />
            </AppScrollbar>
          </AppCard>
        </>
      ) : (
        <>
          <EmptySlotHeader />
          <Button
            variant='outlined'
            startIcon={<PostAddOutlinedIcon />}
            onClick={handleOpenDialog}
          >
            Add Booking
          </Button>
        </>
      )}
      <AddSlotBooking
        isOpen={addSlotOpen}
        setOpenDialog={() => setAddSlotOpen(false)}
        slot={slot}
        reCallAPI={reCallAPI}
      />
      <EditSlotBooking
        isOpen={editSlotOpen}
        setOpenDialog={() => setEditSlotOpen(false)}
        slot={slot}
        item={selectedMemberBooking}
        reCallAPI={reCallAPI}
      />
    </Drawer>
  );
};

export default WhoToFollow;

WhoToFollow.propTypes = {
  slot: PropTypes.object.isRequired,
  isMemberListOpen: PropTypes.bool.isRequired,
  onCloseList: PropTypes.func.isRequired,
  reCallAPI: PropTypes.func,
};
