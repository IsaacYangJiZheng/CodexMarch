import React from 'react';
import AppScrollbar from '@anran/core/AppScrollbar';
import AppList from '@anran/core/AppList';
import AppCard from '@anran/core/AppCard';
import MemberItem from './memberItem';
import PropTypes from 'prop-types';
import Drawer from '@mui/material/Drawer';
import CardHeader from './CardHeader';
import {Box} from '@mui/material';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import {Fonts} from 'shared/constants/AppEnums';
// import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';

const ViewPastBooking = (props) => {
  const {isMemberListOpen, onCloseList, slot} = props;

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

  console.log('WhoToFollow', slot);

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
                <Typography sx={{color: 'red'}}>{'Past Booking'}</Typography>
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
                  <MemberItem key={index} item={item} />
                )}
              />
            </AppScrollbar>
          </AppCard>
        </>
      ) : null}
    </Drawer>
  );
};

export default ViewPastBooking;

ViewPastBooking.propTypes = {
  slot: PropTypes.object.isRequired,
  isMemberListOpen: PropTypes.bool.isRequired,
  onCloseList: PropTypes.func.isRequired,
  reCallAPI: PropTypes.func,
};
