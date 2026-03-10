import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
const OrdersCancellation = React.lazy(() => import('./cancellation'));

export const ordersCancellationConfigs = [
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/orders-cancellation',
    element: <OrdersCancellation />,
  },
];
