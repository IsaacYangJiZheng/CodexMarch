import React from 'react';
import {useAuthUser} from '@anran/utility/AuthHooks';
// import {checkPermission} from '@anran/utility/helper/RouteHelper';
const AdminDash = React.lazy(() => import('../management'));
// const AdminDash = React.lazy(() => import('../demo/admin'));
// const StaffDash = React.lazy(() => import('../demo/Staff'));
// const ManagementDash = React.lazy(() => import('../management'));
// const AdminDash = React.lazy(() => import('../admin'));
// const StaffDash = React.lazy(() => import('../staff'));
// const FinanceDash = React.lazy(() => import('../finance'));
// const EnjoeyDash = React.lazy(() => import('../tenant'));
// import DasboardContainer from '../parents';

const DashboardMain = () => {
  const {user} = useAuthUser();
  console.log('Role:', user.role);

  // if (checkPermission(['tenant-admin'], user.role)) {
  //   return <EnjoeyDash />;
  // }

  // if (checkPermission(['management'], user.role)) {
  //   return <ManagementDash />;
  // }

  // if (checkPermission(['admin', 'supervisor'], user.role)) {
  //   return <AdminDash />;
  // }
  // if (checkPermission('teacher', user.role)) {
  //   return <StaffDash fullView />;
  // }

  // if (checkPermission('account', user.role)) {
  //   return <FinanceDash fullView />;
  // }

  // return <DasboardContainer fullView />;

  // return <> Dash Board</>;
  return <AdminDash />;
};

export default DashboardMain;
