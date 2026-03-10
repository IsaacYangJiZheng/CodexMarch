import React from 'react';
import AppCard from '@anran/core/AppCard';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import PropTypes from 'prop-types';

const InfoWidget = ({data}) => {
  return (
    <AppCard
      variant='outlined'
      sxStyle={{height: 1, backgroundColor: '#0a8fdc14'}}
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
            {data.label}
          </Box>
          <Box
            component='p'
            sx={{
              color: data.color,
              fontSize: 14,
              fontWeight: Fonts.BOLD,
            }}
          >
            {data.value}
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
