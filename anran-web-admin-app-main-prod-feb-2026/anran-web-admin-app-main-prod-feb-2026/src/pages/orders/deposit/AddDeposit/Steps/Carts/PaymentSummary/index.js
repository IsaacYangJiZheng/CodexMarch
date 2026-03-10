import React from 'react';
import AppCard from '@anran/core/AppCard';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';
import AppAnimate from '@anran/core/AppAnimate';
import PropTypes from 'prop-types';

const getTotalDeposit = (paymentItems) => {
  let total = 0;
  paymentItems.map((data) => {
    total = total + parseFloat(data.amount);
    return data;
  });
  return total.toFixed(2);
};

const PaymentSummary = ({paymentItems}) => {
  const {messages} = useIntl();
  const totalDeposit = getTotalDeposit(paymentItems);

  return (
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <AppCard
        title={
          <Box fontSize={16} fontWeight={Fonts.BOLD}>
            {messages['ecommerce.depositSummary']}
          </Box>
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            mt: 2,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>Total Deposit: </Box>
          <Box>RM {totalDeposit}</Box>
        </Box>
      </AppCard>
    </AppAnimate>
  );
};

export default PaymentSummary;

PaymentSummary.propTypes = {
  paymentItems: PropTypes.array,
};
