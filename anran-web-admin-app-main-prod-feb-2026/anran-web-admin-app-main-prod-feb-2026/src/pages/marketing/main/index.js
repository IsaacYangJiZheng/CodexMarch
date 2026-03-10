import React from 'react';
import {useAuthUser} from '@anran/utility/AuthHooks';
const MarketingDash = React.lazy(() => import('../management'));

const MarketingMain = () => {
  const {user} = useAuthUser();
  console.log('Role:', user.role);

  return <MarketingDash />;
};

export default MarketingMain;
