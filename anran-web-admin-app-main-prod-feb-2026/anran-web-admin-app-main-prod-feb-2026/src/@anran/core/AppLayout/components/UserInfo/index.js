import React from 'react';
import orange from '@mui/material/colors/orange';
import blue from '@mui/material/colors/blue';
import {useAuthMethod, useAuthUser} from '../../../../utility/AuthHooks';
import {Box} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Fonts} from 'shared/constants/AppEnums';
import {useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import {useGetDataApi} from '@anran/utility/APIHooks';

const UserInfo = ({color}) => {
  const {logout} = useAuthMethod();
  const {user} = useAuthUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [{apiData: loggedUserData}] = useGetDataApi(
    'api/staff/verify',
    {},
    {},
    true,
  );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserAvatar = () => {
    // console.log('loggedUserData', loggedUserData);
    // if (loggedUserData.profile.fullName) {
    //   return loggedUserData.profile.fullName.charAt(0).toUpperCase();
    // }
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

  const getUserLogout = () => {
    logout();
  };

  console.log('loggedUserData-full', loggedUserData, user);

  return (
    <>
      {user?.id && (
        <Box
          onClick={handleClick}
          sx={{
            py: 3,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          className='user-info-view'
        >
          {user.photoURL ? (
            <Box sx={{py: 0.5}}>
              <Avatar
                sx={{
                  height: 40,
                  width: 40,
                  fontSize: 24,
                  backgroundColor: blue[500],
                }}
                src={user.photoURL}
              />
            </Box>
          ) : (
            <Box sx={{py: 0.5}}>
              <Avatar
                sx={{
                  height: 40,
                  width: 40,
                  fontSize: 24,
                  backgroundColor: orange[500],
                }}
              >
                {getUserAvatar()}
              </Avatar>
            </Box>
          )}
          <Box
            sx={{
              width: {xs: 'calc(100% - 62px)', xl: 'calc(100% - 72px)'},
              ml: 4,
              color: color,
            }}
            className='user-info'
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  mb: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 16,
                  fontWeight: Fonts.MEDIUM,
                  color: 'inherit',
                }}
                component='span'
              >
                {user.displayName}
              </Box>
              <Box
                sx={{
                  ml: 3,
                  color: 'inherit',
                  display: 'flex',
                }}
              >
                <ExpandMoreIcon />
              </Box>
            </Box>
            <Box
              sx={{
                mt: -0.5,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'inherit',
                textTransform: 'capitalize',
              }}
            >
              {user.role}
            </Box>
          </Box>
        </Box>
      )}

      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate('/my-profile');
          }}
        >
          My account
        </MenuItem>
        <MenuItem onClick={getUserLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UserInfo;

UserInfo.defaultProps = {
  color: 'text.secondary',
};

UserInfo.propTypes = {
  color: PropTypes.string,
};
