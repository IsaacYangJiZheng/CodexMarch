import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const DepositHistory = React.lazy(() => import('./depositsHistory/member_deposits'));
const PaymentHistory = React.lazy(() => import('./paymentsHistory'));
const OrderHistory = React.lazy(() => import('./ordersHistory/orders_list'));
const Import = React.lazy(() => import('./import'));

export const financeHistoryConfigs = [
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/deposit-history',
    element: <DepositHistory />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_payments_view],
    path: '/payments-history',
    element: <PaymentHistory />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/orders-history',
    element: <OrderHistory />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/orders-import',
    element: <Import />,
  },
];
