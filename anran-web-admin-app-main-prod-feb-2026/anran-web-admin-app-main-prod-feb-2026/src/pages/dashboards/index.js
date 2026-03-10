import React from 'react';
import {
  RoutePermittedRole,
  RoutePermittedRole2,
} from 'shared/constants/AppConst';

const DashboardMain = React.lazy(() => import('./main'));
// const ComingSoon = React.lazy(() => import('../errorPages/ComingSoon'));

export const dashBoardConfigs = [
  {
    permittedRole: [
      RoutePermittedRole2.dashboard_branch_view,
      RoutePermittedRole2.dashboard_management_view,
      RoutePermittedRole.Admin,
      RoutePermittedRole.Staff,
      RoutePermittedRole.Management,
      RoutePermittedRole.Supervisor,
      RoutePermittedRole.Account,
    ],
    path: '/dashboard',
    element: <DashboardMain />,
  },
];
