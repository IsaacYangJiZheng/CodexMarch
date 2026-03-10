import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
const Roles = React.lazy(() => import('./role'));
const Area = React.lazy(() => import('./area'));
const Bannner = React.lazy(() => import('./banner'));
const Messages = React.lazy(() => import('./messages'));
const PopupMessages = React.lazy(() => import('./popupMessages'));
const Packages = React.lazy(() => import('./package'));
const Voucher = React.lazy(() => import('./voucher'));
const Branch = React.lazy(() => import('./branch'));

// const BannnerV2 = React.lazy(() => import('./bannerV2'));
// const ComingSoon = React.lazy(() => import('../errorPages/ComingSoon'));

export const settingConfigs = [
  {
    permittedRole: [RoutePermittedRole2.admin_role_view],
    path: '/role',
    element: <Roles />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_area_view],
    path: '/area',
    element: <Area />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_branch_view],
    path: '/branch',
    element: <Branch />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_banner_view],
    path: '/mobile/banner',
    element: <Bannner />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_message_view],
    path: '/mobile/messages',
    element: <Messages />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_message_view],
    path: '/mobile/popup-messages',
    element: <PopupMessages />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_voucher_view],
    path: '/voucher',
    element: <Voucher />,
  },
  {
    permittedRole: [RoutePermittedRole2.admin_package_view],
    path: '/package',
    element: <Packages />,
  },
  // {
  //   path: '/mobile/banner/v2',
  //   element: <BannnerV2 />,
  // },

  // {
  //   path: '/mobile/messages/old',
  //   element: <ComingSoon />,
  // },
  // {
  //   path: '/promotion',
  //   element: <ComingSoon />,
  // },
  // {
  //   path: '/voucher',
  //   element: <ComingSoon />,
  // },
];
