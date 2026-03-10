import React, {useContext} from 'react';
import {FormContext} from '..';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

function Success({reCallAPI}) {
  const {setMainTabValue, setOpenDialog} = useContext(FormContext);

  const onGotoClick = () => {
    reCallAPI();
    setMainTabValue(1);
    setOpenDialog(false);
  };

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
        <Typography variant='h5'>Thank you !</Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          Member Deposit has been registered
          <strong>&nbsp;successfully</strong>
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          Your deposit number is
          <strong>&nbsp;#140396</strong>.
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          We have emailed member order confirmation.
        </Typography>
        <Button
          variant='contained'
          sx={{alignSelf: 'start', width: {xs: '100%', sm: 'auto'}}}
          onClick={onGotoClick}
        >
          Go to Deposit Listing
        </Button>
      </Stack>
    </Box>
  );
}

export default Success;

Success.propTypes = {
  reCallAPI: PropTypes.func,
};
