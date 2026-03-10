import React from 'react';
import {Box, Button, Typography, Stack} from '@mui/material';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';

function Success({reCallAPI, onClose}) {
  const {formatMessage} = useIntl();
  const handleButtonClick = () => {
    onClose();
    reCallAPI();
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
      <Stack spacing={2} useFlexGap alignItems='center'>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          {formatMessage({id: 'staff.message.registered'})}
        </Typography>
        <Button
          variant='contained'
          sx={{width: {xs: '100%', sm: '50%'}}}
          onClick={handleButtonClick}
        >
          {formatMessage({id: 'common.done'})}
        </Button>
      </Stack>
    </Box>
  );
}

Success.propTypes = {
  reCallAPI: PropTypes.func,
  onClose: PropTypes.func,
};

export default Success;