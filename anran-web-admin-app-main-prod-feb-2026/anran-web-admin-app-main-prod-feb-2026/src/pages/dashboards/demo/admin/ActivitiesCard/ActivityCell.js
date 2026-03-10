import React from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';

const ActivityCell = ({activity}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 20px',
      }}
      className='item-hover'
    >
      <Box
        sx={{
          height: 10,
          minWidth: 10,
          borderRadius: '50%',
          backgroundColor: activity.color,
          mr: 4,
          mt: 1.5,
        }}
      />
      <Box
        component='h5'
        sx={{
          fontWeight: Fonts.MEDIUM,
          mb: 0.5,
          mt: 0,
        }}
      >
        {activity.label}
      </Box>
      <Box sx={{flex: 1}}></Box>
      <Box
        component='span'
        sx={{
          ml: 2,
          mt: 0,
          color: 'text.secondary',
          fontSize: '10px',
          fontWeight: 'bold',
        }}
      >
        {activity.value}
      </Box>
    </Box>
  );
};

export default ActivityCell;

ActivityCell.propTypes = {
  activity: PropTypes.object.isRequired,
};
