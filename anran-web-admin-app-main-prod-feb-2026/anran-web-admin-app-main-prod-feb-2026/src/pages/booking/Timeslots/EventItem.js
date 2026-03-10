import React from 'react';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';

const EventItem = ({item}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: 2,
        backgroundColor: item?.color + 'AA',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        justifyContent: 'space-between',
        justifyItems: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          borderRadius: '8px 6px 6px 8px',
          backgroundColor: item?.color,
          minWidth: 100,
          height: 34,
        }}
      >
        <Box
          sx={{
            pl: 2,
            pr: 4,
            py: 1.5,
            m: 0,
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.title}
        </Box>
      </Box>
    </Box>
  );
};

export default EventItem;
EventItem.propTypes = {
  item: PropTypes.object,
};
