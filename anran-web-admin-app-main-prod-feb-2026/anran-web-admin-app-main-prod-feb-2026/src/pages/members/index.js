import React from 'react';
import {RoutePermittedRole2, otpTestingEnabled} from 'shared/constants/AppConst';

const Members = React.lazy(() => import('./member_info'));
const PackageTransfer = React.lazy(() => import('./package_transfer'));
const Import = React.lazy(() => import('./import'));
const MemberFeedback = React.lazy(() => import('./member_feedback'));
const OtpTesting = React.lazy(() => import('./otp_testing'));
// const ComingSoon = React.lazy(() => import('../errorPages/ComingSoon'));

export const memberConfigs = [
  {
    permittedRole: [RoutePermittedRole2.member_member_view],
    path: '/members',
    element: <Members />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_member_view],
    path: '/package_transfer',
    element: <PackageTransfer />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_member_view],
    path: '/memberImport',
    element: <Import />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_feedback_view],
    path: '/memberFeedback',
    element: <MemberFeedback />,
  },
  ...(otpTestingEnabled
    ? [
        {
          permittedRole: [RoutePermittedRole2.member_otp_testing_view],
          path: '/members/otp-testing',
          element: <OtpTesting />,
        },
      ]
    : []),
];
