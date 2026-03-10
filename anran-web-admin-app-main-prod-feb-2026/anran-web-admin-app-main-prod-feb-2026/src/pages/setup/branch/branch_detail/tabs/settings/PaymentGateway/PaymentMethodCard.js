import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Box, Checkbox, Typography, CardContent, Card} from '@mui/material';
import Grid from '@mui/material/Grid2';
import './style.css';

const PaymentMethodCard = ({
  isEdit,
  label,
  icon,
  color,
  onSelect,
  selected,
  title,
  items,
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(selected ? true : false);
  };

  useEffect(() => {
    setHovered(false);
  }, [selected]);

  return (
    <Card
      sx={{
        border: hovered ? `2px solid ${color}` : '1px solid #ccc',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#cee1ff7d',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect()}
    >
      <CardContent>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 1,
            visibility: selected ? 'visible' : 'hidden',
          }}
        >
          <Checkbox
            disabled={!isEdit}
            checked={selected}
            color='primary'
            style={{padding: 0}}
            onChange={() => onSelect()}
          />
        </Box>
        {icon}
        <Typography variant='body2'>{label}</Typography>
        <Box>
          <Typography variant='h6' sx={{marginBottom: '10px'}}>
            {title}
          </Typography>
          <Grid
            container
            spacing={{xs: 2, md: 3}}
            columns={{xs: 4, sm: 8, md: 12}}
          >
            {items.map((item, index) => (
              <Grid key={index}>
                <div className='icon-container-1'>
                  <img src={item.icon} alt={item.label} className='image' />
                  {/* <span className='span'>{item.label}</span> */}
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;

PaymentMethodCard.propTypes = {
  isEdit: PropTypes.bool,
  label: PropTypes.string,
  icon: PropTypes.any,
  color: PropTypes.any,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  title: PropTypes.string,
  items: PropTypes.array,
};
