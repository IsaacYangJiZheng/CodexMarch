import React, {useEffect, useMemo} from 'react';
import {Collapse, Icon, IconButton, ListItemText} from '@mui/material';
import {useLocation} from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import VerticalItem from '../VerticalItem';
import Box from '@mui/material/Box';
import IntlMessages from '../../../../../utility/IntlMessages';
import {checkPermission} from '../../../../../utility/helper/RouteHelper';
import {useAuthUser} from '../../../../../utility/AuthHooks';
import {useThemeContext} from '../../../../../utility/AppContextProvider/ThemeContextProvider';
import {useSidebarContext} from '../../../../../utility/AppContextProvider/SidebarContextProvider';
import VerticalCollapseItem from './VerticalCollapseItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const needsToBeOpened = (pathname, item) => {
  return pathname && isUrlInChildren(item, pathname);
};

const isUrlInChildren = (parent, url) => {
  if (!parent.children) {
    return false;
  }

  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].children) {
      if (isUrlInChildren(parent.children[i], url)) {
        return true;
      }
    }

    if (parent.children[i].url === url) {
      return true;
    }
  }

  return false;
};


const VerticalCollapse = ({item, level, openGroupId, setOpenGroupId}) => {
  const {theme} = useThemeContext();
  const {sidebarTextColor} = useSidebarContext();
  const {pathname} = useLocation();
  // Determine if this group should be open
  const isOpen = openGroupId === item.id || needsToBeOpened(pathname, item);

  useEffect(() => {
    if (needsToBeOpened(pathname, item) && setOpenGroupId) {
      setOpenGroupId(item.id);
    }
  }, [pathname, item, setOpenGroupId]);

  const handleClick = () => {
    if (setOpenGroupId) {
      setOpenGroupId(isOpen ? null : item.id);
    }
  };

  const {user} = useAuthUser();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user),
    [item.permittedRole, user?.permission, user?.role],
  );

  if (!hasPermission) {
    return null;
  }


  return (
    <>
      <VerticalCollapseItem
        level={level}
        sidebarTextColor={sidebarTextColor}
        button
        component='div'
        className={clsx('menu-vertical-collapse', isOpen && 'open')}
        onClick={handleClick}
      >
        {item.icon && (
          <Box component='span'>
            <Icon sx={{mr: 4}} color='action' className={clsx('nav-item-icon')}>
              {item.icon}
            </Icon>
          </Box>
        )}
        <ListItemText
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 14,
          }}
          className='nav-item-content'
          classes={{primary: clsx('nav-item-text')}}
          primary={<IntlMessages id={item.messageId} />}
        />
        <IconButton
          className='nav-item-icon-arrow-btn'
          sx={{p: 0, mr: 0.75}}
          disableRipple
          size='large'
        >
          <Icon className='nav-item-icon-arrow' color='inherit'>
            {isOpen ? (
              <ExpandMoreIcon />
            ) : theme.direction === 'ltr' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </Icon>
        </IconButton>
      </VerticalCollapseItem>

      {item.children && (
        <Collapse in={isOpen} className='collapse-children'>
          {item.children.map((child) => (
            <React.Fragment key={child.id}>
              {child.type === 'collapse' && (
                <VerticalCollapse item={child} level={level + 1} openGroupId={openGroupId} setOpenGroupId={setOpenGroupId} />
              )}

              {child.type === 'item' && (
                <VerticalItem item={child} level={level + 1} />
              )}
            </React.Fragment>
          ))}
        </Collapse>
      )}
    </>
  );
};

VerticalCollapse.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    permittedRole: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    children: PropTypes.array,
    messageId: PropTypes.string,
    type: PropTypes.string,
  }),
  level: PropTypes.number,
  openGroupId: PropTypes.string,
  setOpenGroupId: PropTypes.func,
};
VerticalCollapse.defaultProps = {};

export default React.memo(VerticalCollapse);
