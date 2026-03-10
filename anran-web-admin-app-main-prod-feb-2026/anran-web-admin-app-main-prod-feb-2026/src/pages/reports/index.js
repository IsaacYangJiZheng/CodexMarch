import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const CustomOutletSalesReport = React.lazy(() => import('./customOutletSalesReport'));
const DailyOutletSalesReport = React.lazy(() => import('./dailyOutletSalesReport'));
// const CategorySalesReport = React.lazy(() => import('./categorySalesReport'));
const ItemSalesReport = React.lazy(() => import('./itemSalesReport'));
const FinanceReport = React.lazy(() => import('./financeReport'));
const ConfirmationHistoryLogs = React.lazy(() => import('./confirmationHistoryLogs'));
const CustomerCheckInReport = React.lazy(() => import('./customerCheckInReport'),);
const InterbranchReport = React.lazy(() => import('./interbranchReport'));
// const CustomerWalkInReport = React.lazy(() => import('./customerWalkInReport'));

export const reportsConfigs = [
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/dailyOutletSalesReport',
    element: <DailyOutletSalesReport />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/customOutletSalesReport',
    element: <CustomOutletSalesReport />,
  },
  // {
  //   permittedRole: [RoutePermittedRole2.finance_report_view],
  //   path: '/categorySalesReport',
  //   element: <CategorySalesReport />,
  // },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/itemSalesReport',
    element: <ItemSalesReport />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/customerCheckInReport',
    element: <CustomerCheckInReport />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/interbranchReport',
    element: <InterbranchReport />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/financeReport',
    element: <FinanceReport />,
  },
  {
    permittedRole: [RoutePermittedRole2.finance_report_view],
    path: '/confirmationHistoryLogs',
    element: <ConfirmationHistoryLogs />,
  },

  // {
  //   permittedRole: [RoutePermittedRole2.finance_report_view],
  //   path: '/customerWalkInReport',
  //   element: <CustomerWalkInReport />,
  // },
];
