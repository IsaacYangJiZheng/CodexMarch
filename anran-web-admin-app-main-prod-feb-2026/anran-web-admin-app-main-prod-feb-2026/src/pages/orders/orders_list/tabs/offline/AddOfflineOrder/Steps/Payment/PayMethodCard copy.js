import React from 'react';
import {Checkbox, Card} from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
const PayMethodCard = ({item, onSelect, payMethodList}) => {
  const onCardClick = (value) => {
    onSelect(value);
  };

  return (
    <Card
      onClick={() => {
        onCardClick(item);
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{bgcolor: '#f2edde', height: 65, width: 65}}
            aria-label='recipe'
            variant='rounded'
            src={item?.image}
          >
            P
          </Avatar>
        }
        action={
          <Checkbox
            checked={
              payMethodList.some((cart) => cart.id == item.id) ? true : false
            }
            color='primary'
            style={{padding: 0}}
            onChange={() => onCardClick(item)}
            disabled
          />
        }
        title={item.name}
      />
    </Card>
  );
};

export default PayMethodCard;

PayMethodCard.propTypes = {
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  payMethodList: PropTypes.array,
};
