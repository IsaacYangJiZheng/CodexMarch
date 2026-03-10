export const checkPermission = (routeRole, userRole, routePath = '') => {
  if (!routeRole || routeRole.length === 0) {
    return true;
  }

  const normalizedRouteRole = Array.isArray(routeRole)
    ? routeRole
    : [routeRole];
  let permissions = [];
  let role;

  if (userRole && typeof userRole === 'object' && !Array.isArray(userRole)) {
    permissions = userRole?.permission ?? [];
    role = userRole?.role;
  } else if (Array.isArray(userRole)) {
    permissions = userRole;
  } else if (userRole) {
    role = userRole;
  }
 const hasPermission = normalizedRouteRole.some(
    (required) =>
      (permissions && permissions.includes(required)) ||
      (role && required === role),
  );
  if (routePath?.includes('/members/otp-testing')) {
    console.group('[PERM CHECK] OTP Testing');
    console.log('routePath:', routePath);
    console.log('routePermitted:', routeRole);
    console.log('user.role:', role);
    console.log('user.permission length:', permissions.length);
    console.log(
      'user.permission includes otp:',
      permissions.includes('member_otp_testing_view'),
    );
    console.log('computed has:', hasPermission);
    console.groupEnd();
  }
  return hasPermission;
};
