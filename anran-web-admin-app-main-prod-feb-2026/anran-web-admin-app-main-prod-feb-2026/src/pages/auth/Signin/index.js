import React from 'react';
import Box from '@mui/material/Box';
import AuthWrapper from '../AuthWrapper';
import SigninJWT from './SigninJWT';
import {Fonts} from 'shared/constants/AppEnums';
import {Typography} from '@mui/material';

const Signin = () => {
  return (
    <AuthWrapper>
      <Box sx={{width: '100%'}}>
        <Box sx={{mb: {xs: 6, xl: 8}}}>
          <Box
            sx={{
              mb: 5,
              ml: 17,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                height: {xs: 56, sm: 70, md: 100},
                padding: 2.5,
                display: 'flex',
                flexDirection: 'row',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                '& img': {
                  height: {xs: 40, sm: 45, md: 120},
                },
              }}
              className='app-logo'
            >
              <img src='https://anranwellness.com/wp-content/uploads/2024/04/10.-Anran_GR_no-bg_FULL.png' />
            </Box>
            {/* <AppLogo /> */}
          </Box>
          <Box
            sx={{
              mb: 1.5,
              fontWeight: Fonts.BOLD,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              component='h2'
              sx={{
                fontWeight: Fonts.BOLD,
                fontSize: 30,
                mb: 4,
              }}
            >
              Login
            </Typography>
          </Box>
        </Box>

        <SigninJWT />
      </Box>
    </AuthWrapper>
  );
};

export default Signin;
