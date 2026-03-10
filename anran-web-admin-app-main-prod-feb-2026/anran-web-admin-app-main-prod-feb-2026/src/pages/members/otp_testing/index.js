import React, {useMemo, useState, useEffect} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import {useIntl} from 'react-intl';

const WORD_LIMIT = 30;

const countWords = (message) => {
  if (!message) return 0;
  return message.trim().split(/\s+/).filter(Boolean).length;
};

const OtpTesting = () => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;

  const infoViewActionsContext = useInfoViewActionsContext();
  const [formValues, setFormValues] = useState({
    customerName: '',
    phoneNumber: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [resultMessage, setResultMessage] = useState('');

  const [{apiData: otpLogs = []}] = useGetDataApi(
    '/otp-testing/result',
    [],
    {},
    true,
  );

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (Array.isArray(otpLogs)) {
      setLogs(otpLogs);
    }
  }, [otpLogs]);

  const wordCount = useMemo(
    () => countWords(formValues.message),
    [formValues.message],
  );

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = useMemo(() => {
    // Memoize the validator factory so it re-computes when locale changes.
    return () => {
      const errors = {};

      if (!formValues.customerName.trim()) {
        errors.customerName = formatMessage({id: 'otpTesting.error.customerNameRequired'});
      }

      if (!formValues.phoneNumber.trim()) {
        errors.phoneNumber = formatMessage({id: 'otpTesting.error.phoneNumberRequired'});
      }

      if (!formValues.message.trim()) {
        errors.message = formatMessage({id: 'otpTesting.error.messageRequired'});
      } else if (wordCount > WORD_LIMIT) {
        errors.message = formatMessage(
          {id: 'otpTesting.error.messageWordLimit'},
          {limit: WORD_LIMIT},
        );
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
  }, [formValues.customerName, formValues.phoneNumber, formValues.message, wordCount, formatMessage]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await postDataApi(
        '/otp-testing',
        infoViewActionsContext,
        {
          customerName: formValues.customerName.trim(),
          phoneNumber: formValues.phoneNumber.trim(),
          message: formValues.message.trim(),
        },
      );

      setResultMessage(response?.result || formatMessage({id: 'otpTesting.result.defaultSuccess'}));

      if (response?.log) {
        setLogs((prev) => [response.log, ...prev].slice(0, 100));
      }
    } catch (error) {
      setResultMessage(error?.message || formatMessage({id: 'otpTesting.result.failed'}));
    }
  };

  const messageHelperText = formErrors.message
    ? formErrors.message
    : formatMessage(
        {id: 'otpTesting.message.wordCount'},
        {count: wordCount, limit: WORD_LIMIT},
      );

  const sentAtTemplate = (rowData) =>
    rowData?.sentAt ? dayjs(rowData.sentAt).format('DD-MM-YYYY HH:mm') : '-';

  // If you later switch to dynamically generated columns (e.g. for visibility),
  // keep column defs in a useMemo with formatMessage in deps to avoid stale headers.
  const tableHeaders = useMemo(() => {
    return {
      customerName: formatMessage({id: 'otpTesting.logs.column.customerName'}),
      phoneNumber: formatMessage({id: 'otpTesting.logs.column.phoneNumber'}),
      message: formatMessage({id: 'otpTesting.logs.column.message'}),
      timeSent: formatMessage({id: 'otpTesting.logs.column.timeSent'}),
      result: formatMessage({id: 'otpTesting.logs.column.result'}),
    };
  }, [formatMessage]);

  return (
    <Box sx={{p: 4}}>
      <Card sx={{mb: 4}}>
        <CardContent>
          <Typography variant='h2' sx={{mb: 1}}>
            {formatMessage({id: 'otpTesting.title'})}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{mb: 3}}>
            {formatMessage({id: 'otpTesting.subtitle'})}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label={formatMessage({id: 'otpTesting.field.customerName'})}
                value={formValues.customerName}
                onChange={handleChange('customerName')}
                error={Boolean(formErrors.customerName)}
                helperText={formErrors.customerName}
              />
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label={formatMessage({id: 'otpTesting.field.phoneNumber'})}
                value={formValues.phoneNumber}
                onChange={handleChange('phoneNumber')}
                error={Boolean(formErrors.phoneNumber)}
                helperText={formErrors.phoneNumber}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={formatMessage({id: 'otpTesting.field.smsMessage'})}
                value={formValues.message}
                onChange={handleChange('message')}
                error={Boolean(formErrors.message)}
                helperText={messageHelperText}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                <Button variant='contained' color='primary' onClick={handleSubmit}>
                  {formatMessage({id: 'otpTesting.action.send'})}
                </Button>

                {resultMessage ? (
                  <Typography variant='body2' color='text.secondary'>
                    {formatMessage({id: 'otpTesting.result.prefix'})}: {resultMessage}
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant='h3' sx={{mb: 2}}>
            {formatMessage({id: 'otpTesting.logs.title'})}
          </Typography>
          <Divider sx={{mb: 2}} />

          <DataTable value={logs} paginator rows={10} stripedRows>
            <Column field='customerName' header={tableHeaders.customerName} />
            <Column field='phoneNumber' header={tableHeaders.phoneNumber} />
            <Column field='message' header={tableHeaders.message} />
            <Column header={tableHeaders.timeSent} body={sentAtTemplate} />
            <Column field='result' header={tableHeaders.result} />
          </DataTable>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OtpTesting;
