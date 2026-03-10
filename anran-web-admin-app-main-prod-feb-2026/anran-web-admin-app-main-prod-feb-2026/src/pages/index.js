import React from 'react';
import {Navigate} from 'react-router-dom';
import {initialUrl, landingUrl} from 'shared/constants/AppConst';

import {authRouteConfig} from './auth';
import Error403 from './errorPages/Error403';
import {errorPagesConfigs} from './errorPages';
import {accountPagesConfigs} from './account';
import {dashBoardConfigs} from './dashboards';
import {marketingConfigs} from './marketing';
import {settingConfigs} from './setup';
import {bookingConfigs} from './booking';
import {memberConfigs} from './members';
import {staffConfigs} from './staff';
import {memberDepositsConfig} from './deposits';
import {ordersCancellationConfigs} from './ordersCancellation';
// import {financeConfigs} from './finance';
// import {voucherConfigs} from './voucher';
import {reportsConfigs} from './reports';
import {ordersConfigs} from './orders';
import {paymentsConfigs} from './payments';
import {financeHistoryConfigs} from './financeHistory';

const authorizedStructure = {
  fallbackPath: '/signin',
  unAuthorizedComponent: <Error403 />,
  routes: [
    ...accountPagesConfigs,
    ...dashBoardConfigs,
    ...marketingConfigs,
    ...settingConfigs,
    ...bookingConfigs,
    ...memberConfigs,
    ...staffConfigs,
    ...memberDepositsConfig,
    ...financeHistoryConfigs,
    // ...financeConfigs,
    // ...voucherConfigs,
    ...reportsConfigs,
    ...ordersConfigs,
    ...paymentsConfigs,
    ...ordersCancellationConfigs,
  ],
};

const unAuthorizedStructure = {
  fallbackPath: initialUrl,
  routes: authRouteConfig,
};
const anonymousStructure = {
  routes: errorPagesConfigs.concat([
    {
      path: '/',
      element: <Navigate to={landingUrl} />,
    },
    {
      path: '*',
      element: <Navigate to='/error-pages/error-404' />,
    },
  ]),
};

export {authorizedStructure, unAuthorizedStructure, anonymousStructure};
