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

const StaffImport = () => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const MAX_FILE_SIZE_MB = 10;
  const [staffCSV, setStaffCSV] = React.useState(null);
  const [error, setError] = React.useState('');
  const [uploadResults, setUploadResults] = React.useState({});
  const [openStatusDialog, setOpenStatusDialog] = React.useState(false);

  const handleCSVChange = (e) => {
    const selectedFile = e.target.files[0];
    setStaffCSV(selectedFile);

    if (selectedFile) {
      const fileSizeMB = selectedFile.size / (1024 * 1024);

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setError(formatMessage({id: 'staff.import.error.fileSize'}));
        setStaffCSV(null);
      } else {
        setError('');
        setStaffCSV(selectedFile);
        console.log('Selected file:', selectedFile);
      }
    }
  };

  const handleCSVUpload = async () => {
    if (!staffCSV) return;
    const formData = new FormData();
    formData.append('file', staffCSV);

    try {
      const response = await postDataApi(
        'api/staff/import',
        infoViewActionsContext,
        formData,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      );
      console.log('Response', response);
      setUploadResults(response);
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
              {formatMessage({id: 'staff.import.title'})}
            </Typography>
          </Grid>
          <Grid size={{md: 6, xs: 6}}>
            <TextField
              fullWidth
              label={formatMessage({id: 'staff.import.selectFile'})}
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
              disabled={!staffCSV}
              startIcon={<PublishIcon />}
            >
              <Typography variant='button'>
                {formatMessage({id: 'staff.import.action.import'})}
              </Typography>
            </Button>
          </Grid>
          <Grid size={{md: 3, xs: 3}}>
            <Button
              size='large'
              variant='outlined'
              startIcon={<DownloadIcon />}
              href='/assets/anranStaffDataTemplate.xlsx'
              download
            >
              <Typography variant='button'>
                {formatMessage({id: 'staff.import.action.downloadTemplate'})}
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
            title={formatMessage({id: 'staff.import.results.title'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Typography variant='subtitle2'>
              {formatMessage(
                {id: 'staff.import.results.success'},
                {count: uploadResults.successCount},
              )}
            </Typography>
          </Grid>
          {uploadResults.errors && uploadResults.errors.length > 0 && (
            <Grid item xs={12} md={12}>
              <Typography variant='subtitle2'>
                {formatMessage({id: 'staff.import.results.errors'})}
              </Typography>
              <ul>
                {uploadResults.errors.map((error, index) => (
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

export default StaffImport;