import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
const Orders = React.lazy(() => import('./orders_list'));

export const ordersConfigs = [
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/orders',
    element: <Orders />,
  },
];
