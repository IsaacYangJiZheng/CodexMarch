import React from 'react';
import {Box, Card, Typography, Button, TextField} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import {useIntl} from 'react-intl';

const OrderImport = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {formatMessage} = useIntl();
  const MAX_FILE_SIZE_MB = 10;
  const [orderCSV, setOrderCSV] = React.useState(null);
  const [error, setError] = React.useState('');
  const [uploadResults, setUploadResults] = React.useState({});
  const [openStatusDialog, setOpenStatusDialog] = React.useState(false);

  const handleCSVChange = (e) => {
    const selectedFile = e.target.files[0];
    setOrderCSV(selectedFile);

    if (selectedFile) {
      const fileSizeMB = selectedFile.size / (1024 * 1024);

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(formatMessage({id: 'finance.import.fileSizeError'}));
        setOrderCSV(null);
      } else {
        setError('');
        setOrderCSV(selectedFile);
        console.log('Selected file:', selectedFile);
      }
    }
  };

  const handleCSVUpload = async () => {
    if (!orderCSV) return;
    const formData = new FormData();
    formData.append('file', orderCSV);

    try {
      // First API call
      const response1 = await postDataApi(
        'api/order/import/order-cancellation',
        infoViewActionsContext,
        formData,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      );

      // Second API call
      const response2 = await postDataApi(
        'api/order/import',
        infoViewActionsContext,
        formData,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      );
      console.log('Order Cancellation Response', response1);
      console.log('Order Import Response', response2);
      setUploadResults({
        orderCancellation: response1,
        orderImport: response2,
      });
      setOpenStatusDialog(true);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  return (
    <Box>
      <Card sx={{p: 5, mb: 5}}>
        <Grid container spacing={2} alignItems='center'>
          <Grid size={{md: 12, xs: 12}}>
            <Typography variant='h1'>
              {formatMessage({id: 'finance.import.title'})}
            </Typography>
          </Grid>
          <Grid size={{md: 6, xs: 6}}>
            <TextField
              fullWidth
              label={formatMessage({id: 'finance.import.fileLabel'})}
              type='file'
              variant='outlined'
              onChange={handleCSVChange}
              margin='dense'
              InputLabelProps={{shrink: true}}
              inputProps={{accept: '.xlsx'}}
            />
            {error && (
              <Typography color='error' variant='body2' sx={{mt: 1}}>
                {error}
              </Typography>
            )}
          </Grid>
          <Grid size={{md: 3, xs: 3}}>
            <Button
              size='large'
              variant='outlined'
              onClick={handleCSVUpload}
              disabled={!orderCSV}
              startIcon={<PublishIcon />}
            >
              <Typography variant='button'>
                {formatMessage({id: 'finance.import.importAction'})}
              </Typography>
            </Button>
          </Grid>
          <Grid size={{md: 3, xs: 3}}>
            <Button
              size='large'
              variant='outlined'
              startIcon={<DownloadIcon />}
              href='/assets/anranOrderImportDataTemplate.xlsx'
              download
            >
              <Typography variant='button'>
                {formatMessage({id: 'finance.import.downloadTemplate'})}
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Card>
      <AppDialog
        dividers
        maxWidth='md'
        open={openStatusDialog}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setOpenStatusDialog(false)}
            title={formatMessage({id: 'finance.import.uploadResults'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant='subtitle2'>
              {formatMessage(
                {id: 'finance.import.cancellationSuccess'},
                {count: uploadResults.orderCancellation?.successCount ?? 0},
              )}
            </Typography>
            <Typography variant='subtitle2'>
              {formatMessage(
                {id: 'finance.import.importSuccess'},
                {count: uploadResults.orderImport?.successCount ?? 0},
              )}
            </Typography>
          </Grid>
          {uploadResults.orderCancellation?.errors &&
            uploadResults.orderCancellation.errors.length > 0 && (
              <Grid size={12}>
                <Typography variant='subtitle2'>
                  {formatMessage({id: 'finance.import.cancellationErrors'})}
                </Typography>
                <ul>
                  {uploadResults.orderCancellation.errors.map((error, index) => (
                    <li key={index}>
                      <Typography variant='subtitle2'>
                        {error.title}
                        <br />
                        {error.error}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Grid>
            )}
          {uploadResults.orderImport?.errors &&
            uploadResults.orderImport.errors.length > 0 && (
              <Grid size={12}>
                <Typography variant='subtitle2'>
                  {formatMessage({id: 'finance.import.importErrors'})}
                </Typography>
                <ul>
                  {uploadResults.orderImport.errors.map((error, index) => (
                    <li key={index}>
                      <Typography variant='subtitle2'>
                        {error.title}
                        <br />
                        {error.error}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Grid>
            )}
        </Grid>
      </AppDialog>
    </Box>
  );
};

export default OrderImport;