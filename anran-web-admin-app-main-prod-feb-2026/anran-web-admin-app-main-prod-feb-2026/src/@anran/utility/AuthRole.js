import React from 'react';
import PropTypes from 'prop-types';
import {useAuthUser} from './AuthHooks';
import AppLoader from '../core/AppLoader';

const AuthRole = ({children}) => {
  const {isLoading} = useAuthUser();
  return isLoading ? <AppLoader /> : <>{children}</>;
  // console.log('AuthRole');
  // const {isAuthenticated, isLoading} = useAuthUser();
  // if (isAuthenticated && !isLoading) {
  //   return <>{children}</>;
  // }
  // return <AppLoader page={'AuthRole'} />;
};

export default AuthRole;

AuthRole.propTypes = {
  children: PropTypes.node.isRequired,
};
