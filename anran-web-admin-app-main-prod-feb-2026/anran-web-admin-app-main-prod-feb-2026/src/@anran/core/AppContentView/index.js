import React from 'react';
import AppFooter from '../AppLayout/components/AppFooter';
import AppErrorBoundary from '../AppErrorBoundary';
import {useAuthUser} from '../../utility/AuthHooks';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import AppContentViewWrapper from './AppContentViewWrapper';
import AppSuspense from '../AppSuspense';
import generateRoutes from '../../utility/RouteGenerator';
import AppLoader from '../AppLoader';
import {
  anonymousStructure,
  authorizedStructure,
  unAuthorizedStructure,
} from '../../../pages';

const AppContentView = ({sxStyle}) => {
  const {user, isAuthenticated, isLoading} = useAuthUser();
  if (isLoading || (isAuthenticated && !user?.permission)) {
    return (
      <AppContentViewWrapper>
        <AppLoader />
      </AppContentViewWrapper>
    );
  }
  return (
    <AppContentViewWrapper>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          p: {xs: 5, md: 7.5, xl: 4},
          ...sxStyle,
        }}
        className='app-content'
      >
        <AppSuspense>
          <AppErrorBoundary>
            {generateRoutes({
              isAuthenticated: isAuthenticated,
              userRole: user?.permission,
              unAuthorizedStructure,
              authorizedStructure,
              anonymousStructure,
            })}
          </AppErrorBoundary>
        </AppSuspense>
      </Box>
      <AppFooter />
    </AppContentViewWrapper>
  );
};

export default AppContentView;

AppContentView.propTypes = {
  sxStyle: PropTypes.object,
};
