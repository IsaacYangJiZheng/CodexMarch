import React from 'react';
import {
  RoutePermittedRole,
  RoutePermittedRole2,
} from 'shared/constants/AppConst';

const MarketingMain = React.lazy(() => import('./main'));

export const marketingConfigs = [
  {
    permittedRole: [
      RoutePermittedRole2.dashboard_branch_view,
      RoutePermittedRole2.dashboard_management_view,
      RoutePermittedRole2.dashboard_marketing_view,
      RoutePermittedRole.Admin,
      RoutePermittedRole.Staff,
      RoutePermittedRole.Management,
      RoutePermittedRole.Supervisor,
      RoutePermittedRole.Account,
    ],
    path: '/marketing',
    element: <MarketingMain />,
  },
];
