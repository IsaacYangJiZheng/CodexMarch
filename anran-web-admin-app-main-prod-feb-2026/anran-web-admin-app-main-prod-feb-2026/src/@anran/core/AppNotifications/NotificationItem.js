import React from 'react';
// import ListItemAvatar from '@mui/material/ListItemAvatar';
// import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import {Typography} from '@mui/material';
// import Divider from '@mui/material/Divider';
// import {Box, ListItem, Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import {NotificationItemWrapper} from './index.styles';

const NotificationItem = (props) => {
  const {item, onViewDetail} = props;
  console.log(
    'item.mediaURL',
    item?.notification?.haveMedia,
    item.notification.mediaURL,
  );
  return (
    <NotificationItemWrapper
      mail={item}
      dense
      key={item.id}
      // className={clsx('item-hover', {
      //   active: checkedMails.includes(mail.id),
      // })}
      onClick={() => onViewDetail(item.notification)}
    >
      <Box
        sx={{
          display: 'flex',
          padding: '3px 20px',
          width: '100%',
        }}
        className='item-hover'
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            mr: 3.5,
          }}
          src={item.notification.content.mediaURL}
        />
        <Box
          sx={{
            fontSize: 14,
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontWeight: Fonts.MEDIUM,
                color: (theme) => theme.palette.text.primary,
              }}
            >
              {item.notification.content.topic}
            </Typography>
            <Box
              sx={{
                color: (theme) => theme.palette.text.secondary,
                ml: 'auto',
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                }}
              >
                {dayjs(item.notification.content.createdOn).fromNow()}
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{
              color: (theme) => theme.palette.text.secondary,
              fontSize: 13,
              mb: 1,
            }}
          >
            {item.notification.message}
          </Typography>
        </Box>
      </Box>
      {/* <Divider variant='inset' component='li' /> */}
    </NotificationItemWrapper>
  );
};

export default NotificationItem;

NotificationItem.propTypes = {
  item: PropTypes.object.isRequired,
  onViewDetail: PropTypes.func,
};
