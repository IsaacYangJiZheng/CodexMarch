import React from 'react';
import {Box} from '@mui/material';
// import {useTenantAuth, useTenantAuthMethod} from '@anran/utility/AuthHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {Fonts} from 'shared/constants/AppEnums';
import {Typography} from '@mui/material';

const AppTenantLogo = () => {
  const {tenant} = useAuthUser();
  // const {tenant} = useTenantAuth();
  // const {user} = useAuthUser();
  // const {getAuthInfo} = useTenantAuthMethod();
  // React.useEffect(() => {
  //   if (tenant == null) {
  //     getAuthInfo({email: user.email, password: null});
  //   }
  // }, []);

  return (
    <Box
      sx={{
        height: {xs: 56, sm: 70},
        padding: 2.5,
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          height: {xs: 40, sm: 45},
        },
        '& img': {
          // height: {xs: 50, sm: 55},
          maxHeight: {xs: 70},
        },
      }}
      className='app-logo'
    >
      <Box sx={{mt: 2, mb: 2}}>
        <img
          src={
            'https://anranwellness.com/wp-content/uploads/2024/04/10.-Anran_GR_no-bg_FULL.png'
          }
          alt='ANRAN'
          style={{height: '57px'}}
        />
      </Box>
      <Typography
        component='h2'
        sx={{
          fontWeight: Fonts.BOLD,
          fontSize: 30,
          ml: 4,
        }}
      >
        Anran Wellness
      </Typography>
      {tenant?.logoTxt && (
        <Box
          sx={{
            mt: 1,
            display: {xs: 'none', md: 'block'},
            '& svg': {
              height: {xs: 25, sm: 30},
            },
            '& img': {
              height: {xs: 25, sm: 30},
            },
          }}
        >
          <img src={tenant.logoTxt} alt='ANRAN' />
        </Box>
      )}
    </Box>
  );
};

export default AppTenantLogo;
