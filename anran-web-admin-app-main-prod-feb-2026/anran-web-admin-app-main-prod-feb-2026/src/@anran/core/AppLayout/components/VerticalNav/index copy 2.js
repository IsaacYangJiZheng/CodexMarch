import React from 'react';
import List from '@mui/material/List';

import adminRoutesConfig from '../../../../../pages/routesConfigAdmin';
import staffRoutesConfig from '../../../../../pages/routesConfigStaff';
import financeRoutesConfig from '../../../../../pages/routesConfigFinance';
import NavVerticalGroup from './VerticalNavGroup';
import VerticalCollapse from './VerticalCollapse';
import VerticalItem from './VerticalItem';
import {useAuthUser} from '@anran/utility/AuthHooks';
import SideBarMenuItem from '../../../../../pages/routesConfig';

const VerticalNav = () => {
  const {user} = useAuthUser();

  console.log('VerticalNav Role:', user.role);

  const getSideMenuItem = (routesConfig) => {
    return (
      <List
        sx={{
          position: 'relative',
          padding: 0,
        }}
        component='div'
      >
        {routesConfig.map((item) => (
          <React.Fragment key={item.id}>
            {item.type === 'group' && (
              <NavVerticalGroup item={item} level={0} />
            )}

            {item.type === 'collapse' && (
              <VerticalCollapse item={item} level={0} />
            )}

            {item.type === 'item' && <VerticalItem item={item} level={0} />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (
    user.role == 'admin' ||
    user.role == 'management' ||
    user.role == 'supervisor'
  ) {
    return <>{getSideMenuItem(adminRoutesConfig)}</>;
  }

  if (user.role == 'account') {
    return <>{getSideMenuItem(financeRoutesConfig)}</>;
  }

  if (user.role == 'staff') {
    return <>{getSideMenuItem(staffRoutesConfig)}</>;
  }

  return <SideBarMenuItem />;
};

export default VerticalNav;
