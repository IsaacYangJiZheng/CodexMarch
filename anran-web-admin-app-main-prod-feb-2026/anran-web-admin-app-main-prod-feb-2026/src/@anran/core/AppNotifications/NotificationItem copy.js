import React from 'react';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import {Box, ListItem} from '@mui/material';
import Divider from '@mui/material/Divider';
// import {Box, ListItem, Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';

const NotificationItem = (props) => {
  const {item} = props;
  console.log('item.mediaURL', item?.haveMedia, item.mediaURL);
  return (
    <>
      <ListItem
        sx={{
          padding: '8px 20px',
        }}
        className='item-hover'
        secondaryAction={
          <Box
            component='span'
            sx={{
              fontSize: 14,
              fontWeight: Fonts.MEDIUM,
              mb: 0.5,
              color: (theme) => theme.palette.text.primary,
              mr: 1,
              display: 'inline-block',
            }}
          >
            {item.topic}
          </Box>
        }
      >
        {item?.haveMedia ? (
          <ListItemAvatar
            sx={{
              minWidth: 0,
              mr: 4,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
              }}
              src={item.mediaURL}
            />
          </ListItemAvatar>
        ) : (
          <ListItemAvatar
            sx={{
              minWidth: 0,
              mr: 4,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
              }}
              alt='NNNN'
              src={item.image}
            />
          </ListItemAvatar>
        )}
        <ListItemText primary={item.topic} secondary={item.message} />
        {/* <Box
        sx={{
          fontSize: 14,
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        <Typography>
          <Box
            component='span'
            sx={{
              fontSize: 14,
              fontWeight: Fonts.MEDIUM,
              mb: 0.5,
              color: (theme) => theme.palette.text.primary,
              mr: 1,
              display: 'inline-block',
            }}
          >
            {item.topic}
          </Box>
          {item.message}
        </Typography>
      </Box> */}
      </ListItem>
      <Divider variant='inset' component='li' />
    </>
  );
};

export default NotificationItem;

NotificationItem.propTypes = {
  item: PropTypes.object.isRequired,
};
