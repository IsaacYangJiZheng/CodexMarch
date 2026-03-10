import React, {useContext} from 'react';
import {FormContext} from '../../../../AddOfflineOrder';
import AppCard from '@anran/core/AppCard';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import Divider from '@mui/material/Divider';
import {useIntl} from 'react-intl';
import AppAnimate from '@anran/core/AppAnimate';
import PropTypes from 'prop-types';

const getTotalPrice = (paymentItems) => {
  let total = 0;
  paymentItems.forEach((data) => {
    if (data.amount !== '' && data.name !== 'Deposit') {
      total += parseFloat(data.amount);
    }
  });
  return total;
};

const PaymentSummary = ({paymentItems}) => {
  const {
    orderTotal,
    orderBalanceTotal,
    setOrderBalanceTotal,
    orderTaxTotal,
    useDeposit,
  } = useContext(FormContext);
  console.log('useDeposit', useDeposit);
  const {messages, formatMessage} = useIntl();
  const totalPrice = getTotalPrice(paymentItems);
  if (totalPrice > 0 || useDeposit > 0) {
    const totalDue = parseFloat(orderTotal) + parseFloat(orderTaxTotal);
    const balance =
      (Number(totalDue) - Number(totalPrice)).toFixed(2) - Number(useDeposit);
    setOrderBalanceTotal(parseFloat(balance));
  } else {
    const totalDue = parseFloat(orderTotal) + parseFloat(orderTaxTotal);
    setOrderBalanceTotal(totalDue);
  }
  return (
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <AppCard
        title={
          <Box fontSize={16} fontWeight={Fonts.BOLD}>
            {messages['ecommerce.orderSummary']}
          </Box>
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.orderTotal'})}:
          </Box>
          <Box>RM {orderTotal}</Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.taxTotal'})}:
          </Box>
          <Box>RM {orderTaxTotal}</Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.totalDue'})}:
          </Box>
          <Box>
            RM {(parseFloat(orderTaxTotal) + parseFloat(orderTotal)).toFixed(2)}
          </Box>
        </Box>
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
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.totalPaid'})}:
          </Box>
          <Box>RM {totalPrice}</Box>
        </Box>
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
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.depositPaid'})}:
          </Box>
          <Box>RM {parseFloat(useDeposit).toFixed(2)}</Box>
        </Box>

        <Divider />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            my: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.balanceTotal'})}:
          </Box>
          <Box
            sx={{
              fontWeight: 'bold',
              color: orderBalanceTotal == 0 ? 'black' : 'red',
              // color: orderBalanceTotal < 0.01 ? 'black' : 'red',
            }}
          >
            RM {parseFloat(orderBalanceTotal).toFixed(2)}
          </Box>
        </Box>
      </AppCard>
    </AppAnimate>
  );
};

export default PaymentSummary;

PaymentSummary.propTypes = {
  paymentItems: PropTypes.array,
};