import React from 'react';
import AppCard from '@anran/core/AppCard';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import PropTypes from 'prop-types';

const InfoWidget = () => {
  return (
    <AppCard
      sxStyle={{height: 1}}
      className='card-hover'
      contentStyle={{px: 2}}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              color: 'text.secondary',
              mb: 3,
            }}
          >
            {'data.name'}
          </Box>
          <Box
            component='p'
            sx={{
              color: 'red',
              fontSize: 14,
              fontWeight: Fonts.BOLD,
            }}
          >
            {'10'}
          </Box>
        </Box>
      </Box>
    </AppCard>
  );
};

export default InfoWidget;

InfoWidget.propTypes = {
  data: PropTypes.object,
};
