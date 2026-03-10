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
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CountdownTimer from './CountdownTimer';
import CountdownTimerV2 from './CountdownTimerV2';

const MemberItem = ({
  item,
  handleWebCheckIn,
  handleEditBooking,
  handleCancelBooking,
  slotEnd,
}) => {
  console.log('MemberItem', item);

  return (
    <Card sx={{m: 2}} variant='outlined'>
      <Box className='item-hover' px={5} py={2} display='flex'>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            marginTop: 0.5,
          }}
          src={item.member[0].profileImageUrl}
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
                {item.member[0].memberFullName}
              </Typography>
            </Box>
            <Box display='flex' alignItems='center'>
              <CallOutlinedIcon fontSize='small' />
              <Box component='p' color='text.secondary' sx={{m: 0}}>
                {item.member[0].mobileNumber}
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
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <Button
              variant='contained'
              color='primary'
              startIcon={<TaskAltOutlinedIcon />}
              onClick={() => handleWebCheckIn(item._id)}
            >
              Check In
            </Button>
          </Box>
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <Button
              variant='contained'
              color='info'
              startIcon={<EditOutlinedIcon />}
              onClick={() => handleEditBooking(item)}
            >
              Change
            </Button>
          </Box>
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <Button
              variant='contained'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => handleCancelBooking(item._id)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
      {item.bookingstatus == 'CheckedIn' && (
        <Box
          sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}
        >
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <CountdownTimer />
          </Box>
          <Box
            sx={{fontSize: 14, fontWeight: Fonts.REGULAR, ml: 2, mt: 1, mb: 4}}
          >
            <CountdownTimerV2 time1={slotEnd} />
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
    </Card>
  );
};

export default MemberItem;

MemberItem.propTypes = {
  item: PropTypes.object,
  handleWebCheckIn: PropTypes.func,
  handleEditBooking: PropTypes.func,
  handleCancelBooking: PropTypes.func,
  slotEnd: PropTypes.any,
};
