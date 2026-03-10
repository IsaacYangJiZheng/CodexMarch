import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const Staff = React.lazy(() => import('./staffs'));
const Attendance = React.lazy(() => import('./attendance'));
const Import = React.lazy(() => import('./import'));

export const staffConfigs = [
  {
    permittedRole: [RoutePermittedRole2.admin_staff_view],
    path: '/staff',
    element: <Staff />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_staff_view],
    path: '/attendance',
    element: <Attendance />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_staff_view],
    path: '/staffImport',
    element: <Import />,
  },
];
