import React, {useContext} from 'react';
import {FormContext} from '../../..';
import AppCard from '@anran/core/AppCard';
import {Box} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import Divider from '@mui/material/Divider';
import {useIntl} from 'react-intl';
import AppAnimate from '@anran/core/AppAnimate';
import PropTypes from 'prop-types';
import {useGetDataApi} from '@anran/utility/APIHooks';

const getTotalPrice = (cartItems) => {
  let total = 0;
  cartItems.map((data) => {
    let amount = parseFloat(data.packagePrice * data.qty);
    total = parseFloat(total) + parseFloat(amount);
    return data;
  });
  return parseFloat(total).toFixed(2);
};

const getTotalTax = (cartItems, branchTax) => {
  let total = 0;
  let taxAmount = 0;
  if (branchTax?.taxRate) {
    const taxRate = branchTax.taxRate;
    cartItems.map((data) => {
      let amount = parseFloat(data.packagePrice * data.qty);
      total = parseFloat(total) + parseFloat(amount);
      return data;
    });
    taxAmount = parseFloat(total) * taxRate;
    return parseFloat(taxAmount).toFixed(2);
  }
  return taxAmount;
};

const OrderSummary = ({cartItems, selectedBranch}) => {
  const {setOrderTotal, setOrderTaxTotal, setTaxValue, setTaxCode} =
    useContext(FormContext);
  const {messages, formatMessage} = useIntl();
  const [{apiData: branchTax}, {setQueryParams}] = useGetDataApi(
    'api/branch/branchTax',
    {},
    {},
    false,
  );

  console.log('branchTax', branchTax);

  React.useEffect(() => {
    if (selectedBranch) {
      setQueryParams({id: selectedBranch});
    }
  }, [selectedBranch]);

  React.useEffect(() => {
    if (branchTax?.taxValue) {
      const taxValue = branchTax.taxValue;
      setTaxValue(taxValue);
      const taxCode = branchTax.taxCode;
      setTaxCode(taxCode);
    }
  }, [branchTax]);

  const totalPrice = getTotalPrice(cartItems);
  const totalTax = getTotalTax(cartItems, branchTax);
  setOrderTotal(totalPrice);
  setOrderTaxTotal(totalTax);

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
            mt: 2,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>
            {formatMessage({id: 'finance.sales.paymentSummary.orderTotal'})}:
          </Box>
          <Box>RM {totalPrice}</Box>
        </Box>
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            fontWeight: Fonts.MEDIUM,
            mb: 4,
          }}
        >
          <Box sx={{color: 'text.secondary'}}>Discount: </Box>
          <Box>RM 0</Box>
        </Box> */}
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
            {formatMessage({id: 'finance.sales.cart.estimatedTax'})}:
          </Box>
          <Box>RM {totalTax}</Box>
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
            {formatMessage({id: 'finance.sales.paymentSummary.totalDue'})}:
          </Box>
          <Box>
            RM {(parseFloat(totalPrice) + parseFloat(totalTax)).toFixed(2)}
          </Box>
        </Box>
      </AppCard>
    </AppAnimate>
  );
};

export default OrderSummary;

OrderSummary.propTypes = {
  cartItems: PropTypes.array,
  selectedBranch: PropTypes.object,
};