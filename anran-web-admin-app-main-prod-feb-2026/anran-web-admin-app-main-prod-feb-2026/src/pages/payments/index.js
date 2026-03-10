import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
const Payments = React.lazy(() => import('./Listing'));

export const paymentsConfigs = [
  {
    permittedRole: [RoutePermittedRole2.finance_payments_view],
    path: '/payments',
    element: <Payments />,
  },
];
