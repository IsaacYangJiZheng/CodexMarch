import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const TextMessagePreview = ({title, desc, color}) => {
  console.log('TextMessagePreview', color);
  return (
    <Card sx={{maxWidth: 345}}>
      <CardContent sx={{backgroundColor: '#' + color, minHeight: '150px'}}>
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
            WebkitLineClamp: '4',
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

export default TextMessagePreview;

TextMessagePreview.propTypes = {
  title: PropTypes.object,
  desc: PropTypes.object,
  color: PropTypes.any,
};
