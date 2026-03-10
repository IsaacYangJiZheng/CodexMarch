import React from 'react';
import {useAuthUser} from '@anran/utility/AuthHooks';
import SideBarMenuItem from '../../../../../pages/routesConfig';

const VerticalNav = () => {
  const {user} = useAuthUser();

  console.log('VerticalNav Role:', user.role);

  return <SideBarMenuItem />;
};

export default VerticalNav;
