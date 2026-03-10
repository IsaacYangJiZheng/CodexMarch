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
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const WhoToFollow = (props) => {
  const {user} = useAuthUser();
    const {formatMessage} = useIntl();
  const {
    startTime,
    endTime,
    isMemberListOpen,
    onCloseList,
    slot,
    reCallAPI,
    selectedBranch,
  } = props;
  const [addSlotOpen, setAddSlotOpen] = React.useState(false);

  const handleOpenDialog = () => {
    setAddSlotOpen(true);
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
            {slot.room.Title}
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
            {formatMessage({id: 'booking.floorView.dateLabel'})}
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
            {formatMessage({id: 'booking.floorView.slotLabel'})}
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
            {slot.room.Title}
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
            {formatMessage({id: 'booking.floorView.slotLabel'})}
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
            {formatMessage({id: 'booking.floorView.slotLabel'})}
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

  console.log('WhoToFollow', slot);

  return (
    <Drawer
      PaperProps={{
        sx: {width: '80%', maxWidth: '80%', flex: 1},
      }}
      anchor='right'
      open={isMemberListOpen}
      onClose={onCloseList}
      ModalProps={{onBackdropClick: (e) => e.preventDefault()}}
    >
      <CardHeader
        onCloseAddCard={onCloseList}
        title={formatMessage({id: 'booking.floorView.detailsTitle'})}
      />
      {slot?.members ? (
        <>
          <Header />
          <AppCard
            sxStyle={{mb: 8}}
            contentStyle={{px: 0, minHeight: '500px'}}
            title={
              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                <Typography variant='h3' sx={{}}>
                  {formatMessage({id: 'booking.floorView.membersList'})}
                </Typography>
                <Box sx={{flex: 1}}></Box>
                {slot?.availableSlot == 0 ? (
                  <Typography sx={{color: 'red'}}>
                    {formatMessage({id: 'booking.floorView.fullyBooked'})}
                  </Typography>
                ) : (
                  user.permission.includes(RoutePermittedRole2.member_booking_create) && (
                    <Button
                      variant='outlined'
                      startIcon={<PostAddOutlinedIcon />}
                      onClick={handleOpenDialog}
                    >
                      {formatMessage({id: 'booking.floorView.addBooking'})}
                    </Button>
                  )
                )}
              </Box>
            }
          >
            <AppScrollbar
              sx={{
                height: 'calc(100% - 30px)',
                minHeight: '400px',
              }}
            >
              <AppList
                data={slot?.members}
                renderRow={(item, index) => (
                  <MemberItem
                    key={index}
                    item={item}
                    start={slot.start}
                    startTime={startTime}
                    endTime={endTime}
                    slot={slot}
                    reCallAPI={reCallAPI}
                    onClose={onCloseList}
                  />
                )}
              />
            </AppScrollbar>
          </AppCard>
        </>
      ) : (
        <>
          <EmptySlotHeader />
          {user.permission.includes(RoutePermittedRole2.member_booking_create) && (
            <Button
              variant='outlined'
              startIcon={<PostAddOutlinedIcon />}
              onClick={handleOpenDialog}
            >
              {formatMessage({id: 'booking.floorView.addBooking'})}
            </Button>
          )}
        </>
      )}
      <AddSlotBooking
        isOpen={addSlotOpen}
        setOpenDialog={() => setAddSlotOpen(false)}
        slot={slot}
        reCallAPI={reCallAPI}
        onClose={onCloseList}
        selectedBranch={selectedBranch}
      />
    </Drawer>
  );
};

export default WhoToFollow;

WhoToFollow.propTypes = {
  startTime: PropTypes.object,
  endTime: PropTypes.object,
  slot: PropTypes.object.isRequired,
  isMemberListOpen: PropTypes.bool.isRequired,
  onCloseList: PropTypes.func.isRequired,
  reCallAPI: PropTypes.func,
  selectedBranch: PropTypes.object,
};
