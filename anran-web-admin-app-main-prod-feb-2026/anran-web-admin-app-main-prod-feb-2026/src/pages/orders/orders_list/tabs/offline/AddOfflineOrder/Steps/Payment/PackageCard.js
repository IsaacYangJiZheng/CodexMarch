import React from 'react';
import {Checkbox, Card, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';

const PackageCard = ({item}) => {
  const {formatMessage} = useIntl();
  return (
    <Grid size={{md: 12, xs: 12}}>
      <Card>
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
            <Checkbox
              checked={true}
              color='primary'
              style={{padding: 0}}
              disabled
            />
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
              {item.packageName}
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