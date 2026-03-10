import React, {useContext} from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import {FormContext} from '../../AddNewMember';
import { useNavigate } from 'react-router-dom';
import IntlMessages from '@anran/utility/IntlMessages';

const Success = () => {
  const {setOpenDialog, setFormData} = useContext(FormContext);
  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate('/orders', { state: { openAddOfflineOrder: true } });
  };

  const handleCloseClick = () => {
    setOpenDialog(false);
    setFormData(null);
  }

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
      <Stack spacing={3} useFlexGap>
        <Typography variant='h1' sx={{ justifyContent: 'center', color: 'text.primary', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 64 }}>🎉</span>
          <IntlMessages id='member.success.title' />
        </Typography>
        <Typography variant='body1' sx={{ color: 'text.secondary', textAlign: 'center' }}>
          <IntlMessages id='member.success.subtitle' />
        </Typography>
        <Button 
          onClick={handleNextClick} 
          variant="contained" 
          color="primary" 
          sx={{ paddingX: 4, paddingY: 1.5 }}
        >
          <IntlMessages id='member.success.purchasePackage' />
        </Button>
        <Button 
          onClick={handleCloseClick} 
          variant="outlined" 
          color="secondary" 
          sx={{ paddingX: 4, paddingY: 1.5 }}
        >
          <IntlMessages id='common.done' />
        </Button>
      </Stack>
    </Box>
  );
}

export default Success;