import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
// import AlarmOnOutlinedIcon from '@mui/icons-material/AlarmOnOutlined';

const MemberItem = ({item}) => {
  console.log('MemberItem-123', item);
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
    </Card>
  );
};

export default MemberItem;

MemberItem.propTypes = {
  item: PropTypes.object,
};
