import React from 'react';
import {Box, Typography} from '@mui/material';
import MuiCard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import TapAndPlayOutlinedIcon from '@mui/icons-material/TapAndPlayOutlined';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import {styled} from '@mui/material/styles';
import PropTypes from 'prop-types';
import './style.css';

const Card = styled(MuiCard)(({theme}) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  '&:hover': {
    background:
      'linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)',
    borderColor: 'primary.light',
    boxShadow: '0px 2px 8px hsla(0, 0%, 0%, 0.1)',
    ...theme.applyStyles('dark', {
      background:
        'linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)',
      borderColor: 'primary.dark',
      boxShadow: '0px 1px 8px hsla(210, 100%, 25%, 0.5) ',
    }),
  },
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
    maxWidth: `calc(90% - ${theme.spacing(1)})`,
  },
  variants: [
    {
      props: ({selected}) => selected,
      style: {
        borderColor: theme.palette.primary.light,
        ...theme.applyStyles('dark', {
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
  ],
}));

const PayMethodCard = ({item, onSelect, payMethodList}) => {
  const onCardClick = (value) => {
    onSelect(value);
  };
  return (
    <Card
      selected={payMethodList.some((cart) => cart.id == item.id) ? true : false}
    >
      <CardActionArea
        onClick={() => onCardClick(item)}
        sx={{
          '.MuiCardActionArea-focusHighlight': {
            backgroundColor: 'transparent',
          },
          '&:focus-visible': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <CardContent sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Typography sx={{fontWeight: 'medium'}}>
            {item.displayName || item.name}
          </Typography>
          <Box sx={{flex: 1}}></Box>
          {item.images?.map((image, index) => {
            if (image.type == 'card') {
              return (
                <CreditCardRoundedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 50,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'visa') {
              return (
                <CreditCardRoundedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 45,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'master') {
              return (
                <CreditCardRoundedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 45,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'bank') {
              return (
                <AccountBalanceRoundedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 50,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'cash') {
              return (
                <PaidOutlinedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 50,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'wallet') {
              return (
                <TapAndPlayOutlinedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 50,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
            if (image.type == 'amex') {
              return (
                <CreditCardRoundedIcon
                  key={index}
                  sx={[
                    (theme) => ({
                      fontSize: 50,
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    payMethodList.some((cart) => cart.id == item.id) && {
                      color: 'primary.main',
                    },
                  ]}
                />
              );
            }
          })}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PayMethodCard;

PayMethodCard.propTypes = {
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  payMethodList: PropTypes.array,
};