import React, {useContext} from 'react';
import {FormContext} from '../../AddOfflineOrder';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {useIntl} from 'react-intl';

function Success() {
  const {setMainTabValue, setOpenDialog, formData, reCallAPI, orderNumber} =
    useContext(FormContext);
  const navigate = useNavigate();
  const {formatMessage} = useIntl();

  const onGotoClick = () => {
    reCallAPI();
    setMainTabValue(0);
    setOpenDialog(false);
  };

  const handleNextClick = () => {
    navigate('/floor/timeslots');
  };
  console.log('formData', formData);
  console.log('setOrderNumber', orderNumber);

  return (
    <Box
      sx={{
        width: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
        backgroundColor: '#f9f9f9',
        padding: 4,
        margin: 2,
        borderRadius: 2,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Stack spacing={2} useFlexGap>
        <Typography variant='h1' sx={{ justifyContent: 'center', color: 'text.primary', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 64 }}>📦</span>
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
        <Button 
          onClick={handleNextClick} 
          variant="contained" 
          color="primary" 
          sx={{ paddingX: 4, paddingY: 1.5 }}
        >
          {formatMessage({id: 'sidebar.booking'})}
        </Button>
        <Button
          variant="outlined" 
          color="secondary" 
          sx={{ paddingX: 4, paddingY: 1.5 }}
          onClick={onGotoClick}
        >
          {formatMessage({id: 'common.done'})}
        </Button>
      </Stack>
    </Box>
  );
}

export default Success;

Success.propTypes = {
  reCallAPI: PropTypes.func,
};