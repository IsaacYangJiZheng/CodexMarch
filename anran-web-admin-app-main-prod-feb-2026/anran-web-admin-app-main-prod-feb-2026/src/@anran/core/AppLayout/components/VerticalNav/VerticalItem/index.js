import React, {useMemo} from 'react';
import {Icon, ListItemText} from '@mui/material';
import clsx from 'clsx';
import PropTypes from 'prop-types';
// import AppBadge from '@anran/core/AppBadge';
import Badge from '@mui/material/Badge';
import AppNavLink from '@anran/core/AppNavLink';
import Box from '@mui/material/Box';
import IntlMessages from '../../../../../utility/IntlMessages';
import {checkPermission} from '../../../../../utility/helper/RouteHelper';
import {useAuthUser} from '../../../../../utility/AuthHooks';
import VerticalNavItem from './VerticalNavItem';

const VerticalItem = ({level, item}) => {
  const {user} = useAuthUser();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user),
    [item.permittedRole, user?.permission, user?.role],
  );
  let hasBadge = false;
  if (!hasPermission) {
    return null;
  }

  return (
    <VerticalNavItem
      level={level}
      button
      component={AppNavLink}
      to={item.url}
      activeClassName='active'
      exact={item.exact}
    >
      {item.icon && (
        <Box component='span'>
          {hasBadge ? (
            <Badge
              color='secondary'
              variant='dot'
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Icon
                sx={{
                  fontSize: 18,
                  display: 'block',
                  mr: 2,
                }}
                className={clsx('nav-item-icon', 'material-icons-outlined')}
                color='action'
              >
                {item.icon}
              </Icon>
            </Badge>
          ) : (
            <Icon
              sx={{
                fontSize: 18,
                display: 'block',
                mr: 4,
              }}
              className={clsx('nav-item-icon', 'material-icons-outlined')}
              color='action'
            >
              {item.icon}
            </Icon>
          )}
        </Box>
      )}
      {/* {item.count > 0 && (
        <ListItemText
          className='nav-item-content'
          primary={<IntlMessages id={item.messageId} />}
          classes={{primary: 'nav-item-text'}}
        />
      )} */}
      <ListItemText
        className='nav-item-content'
        primary={<IntlMessages id={item.messageId} />}
        classes={{primary: 'nav-item-text'}}
      />
      {/* <AppBadge count={item.count} color={item.color} /> */}
      {/* {item.count && unReadMsgCount > 0 && (
        <Box sx={{mr: 3.5}} className='menu-badge'>
          <AppBadge count={unReadMsgCount} color={item.color} />
        </Box>
      )} */}
    </VerticalNavItem>
  );
};

VerticalItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    permittedRole: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    exact: PropTypes.bool,
    messageId: PropTypes.string,
    count: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.bool,
    ]),
    url: PropTypes.string,
    color: PropTypes.string,
  }),
  level: PropTypes.number,
};

VerticalItem.defaultProps = {};

export default React.memo(VerticalItem);
