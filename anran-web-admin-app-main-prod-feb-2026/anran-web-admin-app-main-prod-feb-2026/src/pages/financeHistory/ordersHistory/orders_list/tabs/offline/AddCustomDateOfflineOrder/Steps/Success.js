import React, {useContext} from 'react';
import {FormContext} from '../../AddCustomDateOfflineOrder';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {useIntl} from 'react-intl';
// import {useGetDataApi} from '@anran/utility/APIHooks';

function Success() {
  const {setMainTabValue, setOpenDialog, formData, orderNumber} =
    useContext(FormContext);
  const {formatMessage} = useIntl();

  const onGotoClick = () => {
    setMainTabValue(0);
    setOpenDialog(false);
  };

  // const [{apiData: ordersData}] = useGetDataApi(
  //   'api/order/walkin/v2',
  //   {},
  //   {},
  //   true,
  // );

  console.log('formData', formData);
  console.log('setOrderNumber', orderNumber);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
      }}
    >
      <Stack spacing={2} useFlexGap>
        <Typography variant='h1'>📦</Typography>
        <Typography variant='h5'>
          {formatMessage({id: 'finance.sales.success.title'})}
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          {formatMessage({id: 'finance.sales.success.message'})}
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          {formatMessage(
            {id: 'finance.sales.success.orderNumber'},
            {orderNumber},
          )}
        </Typography>
        {/* <Typography variant='body1' sx={{color: 'text.secondary'}}>
          We have emailed member order confirmation.
        </Typography> */}
        <Button
          variant='contained'
          sx={{alignSelf: 'start', width: {xs: '100%', sm: 'auto'}}}
          onClick={onGotoClick}
        >
          {formatMessage({id: 'finance.sales.success.goToOrders'})}
        </Button>
      </Stack>
    </Box>
  );
}

export default Success;