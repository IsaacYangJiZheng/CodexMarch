import React from 'react';
import {Box, Typography} from '@mui/material';
import MuiCard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {styled} from '@mui/material/styles';
import PropTypes from 'prop-types';
import IntlMessages from '@anran/utility/IntlMessages';
import './style.css';

const Card = styled(MuiCard)(({theme}) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  width: '100%',
  cursor: 'pointer', // make it look clickable
  '&:hover': {
    backgroundColor: theme.palette.action.hover, // simple hover effect
  },
}));

const DepositCard = ({depositAmount, handleOpenDepositDialog}) => {
  return (
    <Card>
      <CardActionArea
        onClick={handleOpenDepositDialog}
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
            <IntlMessages id='finance.sales.deposit.balanceLabel' />
          </Typography>
          <Typography 
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: depositAmount < 10 ? 'red' : 'text.primary',
            }}
          >
            RM {parseFloat(depositAmount).toFixed(2)}
          </Typography>
          <Box sx={{flex: 1}}></Box>
          <AccountBalanceWalletIcon />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DepositCard;

DepositCard.propTypes = {
  depositAmount: PropTypes.number,
  handleOpenDepositDialog: PropTypes.func,
};