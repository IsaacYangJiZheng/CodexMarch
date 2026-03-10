import React from 'react';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
// const Timeslots = React.lazy(() => import('./Timeslots'));
const Listing = React.lazy(() => import('./Listing'));
const CurrentBookingList = React.lazy(() => import('./CurrentBookingList'));
const BlockBooking = React.lazy(() => import('./BlockBooking'));
const FloorView = React.lazy(() => import('./FloorView'));

export const bookingConfigs = [
  // {
  //   path: '/timeslots',
  //   element: <Timeslots />, //not using timeslots
  // },
  {
    permittedRole: [RoutePermittedRole2.member_booking_view],
    path: '/booking',
    element: <Listing />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_booking_view],
    path: '/curent-booking',
    element: <CurrentBookingList />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_booking_view],
    path: '/floor/timeslots',
    element: <FloorView />,
  },
  {
    permittedRole: [RoutePermittedRole2.member_booking_view],
    path: '/block-booking',
    element: <BlockBooking />,
  },
];
