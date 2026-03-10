import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
// import {Typography} from '@mui/material';
// import {Fonts} from 'shared/constants/AppEnums';
// import {ReactComponent as Logo} from '../../assets/icon/En-Joey-Logo_full.svg';

const FormWrapper = ({children}) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          minHeight: {xs: 320, sm: 450},
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: {xs: '100%'},
            padding: {xs: 5, lg: 10},
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {children}
        </Box>
      </Card>
    </Box>
  );
};

export default FormWrapper;

FormWrapper.propTypes = {
  children: PropTypes.node,
};
