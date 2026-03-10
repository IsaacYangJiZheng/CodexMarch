import React from 'react';
import PropTypes from 'prop-types';

import {Box} from '@mui/material';
const AppsHeaderWithImage = ({children}) => {
  return (
    <Box
      sx={{
        height: 80,
        display: 'flex',
        alignItems: 'center',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.primary.contrastText,
        padding: {
          xs: '4px 10px',
          xl: '12px 10px',
        },
      }}
      className='apps-header'
    >
      {children}
    </Box>
  );
};

export default AppsHeaderWithImage;

AppsHeaderWithImage.propTypes = {
  children: PropTypes.node,
};

AppsHeaderWithImage.defaultProps = {};
