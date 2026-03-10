import React from 'react';
import PropTypes from 'prop-types';
// import AvatarGroup from '@mui/material/AvatarGroup';
// import Avatar from '@mui/material/Avatar';
// import InsertCommentIcon from '@mui/icons-material/InsertComment';
// import AttachmentIcon from '@mui/icons-material/Attachment';
// import StarBorderIcon from '@mui/icons-material/StarBorder';
// import StarIcon from '@mui/icons-material/Star';
import {Box} from '@mui/material';

const EventItem = ({item}) => {
  console.log('EventItem', item);
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
      {/* <Box sx={{display: 'flex', p: 1}}>
        <AvatarGroup max={4}>
          <Avatar alt={''} src={item?.image} sx={{width: 24, height: 24}} />
          <Avatar
            alt={item?.createdBy?.name}
            src={item?.createdBy?.image}
            sx={{width: 24, height: 24}}
          />
        </AvatarGroup>
      </Box> */}
    </Box>
  );
};

export default EventItem;
EventItem.propTypes = {
  item: PropTypes.object,
};
