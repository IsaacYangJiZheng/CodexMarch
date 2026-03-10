import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
const MemberDeposits = React.lazy(() => import('./member_deposits'))

export const memberDepositsConfig = [
  {
    permittedRole: [RoutePermittedRole2.finance_sales_view],
    path: '/member-deposits',
    element: <MemberDeposits />,
  },
];
