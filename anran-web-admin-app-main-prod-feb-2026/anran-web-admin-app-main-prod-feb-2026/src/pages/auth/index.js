import React from 'react';

const Signin = React.lazy(() => import('./Signin'));
const ForgotPassword = React.lazy(() => import('./ForgetPassword'));

export const authRouteConfig = [
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/forget-password',
    element: <ForgotPassword />,
  },
];
