import React from 'react';
import PropTypes from 'prop-types';

import {Box} from '@mui/material';
const AppsHeaderWithBg = ({children}) => {
  return (
    <Box
      sx={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        padding: {
          xs: '4px 10px',
          xl: '12px 10px',
        },
        backgroundColor: '#079CE9',
        color: 'white',
      }}
      className='apps-header'
    >
      {children}
    </Box>
  );
};

export default AppsHeaderWithBg;

AppsHeaderWithBg.propTypes = {
  children: PropTypes.node,
};

AppsHeaderWithBg.defaultProps = {};
