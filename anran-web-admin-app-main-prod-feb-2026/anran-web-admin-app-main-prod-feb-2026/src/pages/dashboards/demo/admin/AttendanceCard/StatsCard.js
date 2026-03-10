import React from 'react';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import AppCard from '@anran/core/AppCard';

const StatsCard = (props) => {
  const {bgColor, icon, data, heading} = props;

  return (
    <AppCard
      sxStyle={{
        backgroundColor: bgColor,
        height: 1,
      }}
      className='card-hover'
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
        <Box>
          <Avatar
            sx={{
              height: {xs: 50, md: 35},
              width: {xs: 50, md: 35},
              backgroundColor: 'white',
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Box
            component='h3'
            sx={{
              color: 'white',
              fontWeight: Fonts.MEDIUM,
              fontSize: 18,
              mt: 0,
              mb: 0,
            }}
          >
            {data.value}
          </Box>
          <Box
            component='p'
            sx={{
              color: 'white',
              mt: 0,
            }}
          >
            {heading}
          </Box>
        </Box>
      </Box>
    </AppCard>
  );
};

export default StatsCard;

StatsCard.defaultProps = {
  data: {
    count: '',
  },
};

StatsCard.propTypes = {
  icon: PropTypes.node,
  data: PropTypes.object,
  heading: PropTypes.any.isRequired,
  bgColor: PropTypes.string,
};
