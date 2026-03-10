import React from 'react';
import {Checkbox, Card, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';

const PackageCard = ({item, onSelect, carts}) => {
  const {formatMessage} = useIntl();
  const onCardClick = (value) => {
    onSelect(value);
  };

  return (
    <Grid size={{md: 12, xs: 12}}>
      <Card
        sx={{backgroundColor: item?.allowedQty <= 0 ? '#9e9e9efc' : 'white'}}
        onClick={() => {
          if (item?.allowedQty > 0) {
            onCardClick(item);
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{bgcolor: '#f2edde', height: 65, width: 65}}
              aria-label='recipe'
              variant='rounded'
              src={item?.packageImageURL}
            >
              P
            </Avatar>
          }
          action={
            item?.allowedQty > 0 ? (
              <Checkbox
                checked={
                  carts.some((cart) => cart._id == item._id) ? true : false
                }
                color='primary'
                style={{padding: 0}}
                onChange={() => onCardClick(item)}
                disabled
              />
            ) : null
          }
          title={
            <Typography
              variant='h6'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3, // Limit to one line
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '100%', // Matches font size for single line
                lineHeight: '1.5em', // Consistent line height
              }}
            >
              {item?.allowedQty > 0
                ? item.packageName
                : formatMessage(
                    {id: 'finance.sales.package.notAvailable'},
                    {packageName: item.packageName},
                  )}
            </Typography>
          }
          subheader={
            item.packageUnlimitedStatus
              ? formatMessage(
                  {id: 'finance.sales.package.unlimited'},
                  {validity: item.packageValidity},
                )
              : formatMessage(
                  {id: 'finance.sales.package.limited'},
                  {count: item.packageUsageLimit, validity: item.packageValidity},
                )
          }
        />
      </Card>
    </Grid>
  );
};

export default PackageCard;

PackageCard.propTypes = {
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  carts: PropTypes.array,
};