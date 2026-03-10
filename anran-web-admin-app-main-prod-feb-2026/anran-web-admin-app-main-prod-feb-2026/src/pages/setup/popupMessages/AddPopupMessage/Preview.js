import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const MessagePreview = ({image, title, desc}) => {
  return (
    <Card sx={{maxWidth: 345}}>
      {image ? (
        <CardMedia
          component='img'
          sx={{height: '100%', width: '100%'}}
          image={image}
          title='anran'
        />
      ) : null}

      <CardContent>
        <Typography
          gutterBottom
          variant='h5'
          component='div'
          sx={{fontWeight: 'bold'}}
        >
          {title}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            color: 'text.secondary',
          }}
        >
          {desc}
        </Typography>
      </CardContent>
      <CardActions sx={{p: 0}}>
        <Button size='small'>Learn More</Button>
      </CardActions>
    </Card>
  );
};

export default MessagePreview;

MessagePreview.propTypes = {
  image: PropTypes.object,
  title: PropTypes.object,
  desc: PropTypes.object,
};
