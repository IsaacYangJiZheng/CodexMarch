import React from 'react';
// import notification from '@anran/services/db/notifications';
import {IconButton} from '@mui/material';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import AppScrollbar from '@anran/core/AppScrollbar';
import IntlMessages from '@anran/utility/IntlMessages';
import NotificationItem from './NotificationItem';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {putDataApi} from '@anran/utility/APIHooks';
import {useNavigate} from 'react-router-dom';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

// const notification = [
//   {
//     id: '1000',
//     name: 'Aysha Julka',
//     image: '/assets/images/avatar/A1.jpg',
//     message: 'commented on your wall picture.',
//   },
//   {
//     id: '1001',
//     name: 'Ayra Rovishi',
//     image: '/assets/images/avatar/A2.jpg',
//     message: 'added to their stories.',
//   },
// ];

const AppNotificationContent = ({onClose, sxStyle}) => {
  const navigate = useNavigate();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [{apiData: notifyList, loading}] = useGetDataApi(
    '/notify/user/list/new',
    {},
    {},
    true,
  );

  console.log('notifyList', notifyList);

  const onViewDetail = (item) => {
    console.log('onViewMailDetail');
    if (item.isRead) {
      switch (item.content.topic) {
        case 'Activity':
          onClose();
          navigate(`/children/activities`);
          break;
        case 'Attendance':
          onClose();
          navigate(`/children/attendance`);
          break;
        default:
          break;
      }
    } else {
      // mail.isRead = true;
      putDataApi('/notify/mark/read', infoViewActionsContext, {item})
        .then(() => {
          // onUpdateItem(data);
          onClose();
          switch (item.content.topic) {
            case 'Activity':
              navigate(`/children/activities`);
              break;

            default:
              break;
          }
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  // const onUpdateItem = (data) => {
  //   setData(
  //     notifyList.map((item) => {
  //       if (item.id === data.id) {
  //         return data;
  //       }
  //       return item;
  //     }),
  //   );
  // };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 380,
        height: '100%',
        ...sxStyle,
      }}
    >
      {loading ? (
        <>Loading ....</>
      ) : (
        <>
          <Box
            sx={{
              padding: '5px 20px',
              display: 'flex',
              alignItems: 'center',
              borderBottom: 1,
              borderBottomColor: (theme) => theme.palette.divider,
              minHeight: {xs: 56, sm: 70},
            }}
          >
            <Typography component='h3' variant='h3'>
              <IntlMessages id='common.notifications' />(
              {notifyList?.total ? notifyList?.total : 0})
            </Typography>
            <IconButton
              sx={{
                height: 40,
                width: 40,
                marginLeft: 'auto',
                color: 'text.secondary',
              }}
              onClick={onClose}
              size='large'
            >
              <CancelOutlinedIcon />
            </IconButton>
          </Box>
          <AppScrollbar
            sx={{
              height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
            }}
          >
            <List sx={{py: 0}}>
              {notifyList?.data?.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onViewDetail={onViewDetail}
                />
              ))}
            </List>
          </AppScrollbar>
          <Button
            sx={{
              borderRadius: 0,
              width: '100%',
              textTransform: 'capitalize',
              marginTop: 'auto',
              height: 40,
            }}
            variant='contained'
            color='primary'
          >
            <IntlMessages id='common.viewAll' />
          </Button>
        </>
      )}
    </Box>
  );
};

export default AppNotificationContent;

AppNotificationContent.propTypes = {
  onClose: PropTypes.func,
  sxStyle: PropTypes.object,
};
