import React from 'react';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import {Typography} from '@mui/material';

const AppLogo = () => {
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
          color: '#045147',
          fontWeight: Fonts.BOLD,
          fontSize: 30,
          ml: 4,
        }}
      >
        Anran Wellness
      </Typography>
    </Box>
  );
};

export default AppLogo;
