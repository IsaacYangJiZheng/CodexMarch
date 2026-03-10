import React from 'react';
import {Box, Button, Typography, TextField} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import {useIntl} from 'react-intl';

const StaffWithdraw = ({
  open,
  selectedStaff,
  refresh,
  onClose,
  setSelectedStaff,
}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        withdrawDate: Yup.string().required(
          formatMessage({id: 'staff.withdraw.validation.dateRequired'}),
        ),
      }),
    [formatMessage],
  );

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='sm'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={onClose}
            title={formatMessage({id: 'staff.withdraw.title'})}
          />
        }
      >
        <Formik
          initialValues={{
            withdrawDate: new Date().toISOString().split('T')[0],
            otherReason: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('isDeleted', true);
            formData.append('withdrawDate', values.withdrawDate);
            formData.append('otherReason', values.otherReason);

            try {
              const response = await putDataApi(
                `/api/staff/${selectedStaff._id}`,
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              refresh();
              onClose();
              setSelectedStaff(null);
              infoViewActionsContext.showMessage(
                formatMessage({id: 'staff.message.updated'}),
              );
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant='h3'>
                    {formatMessage(
                      {
                        id: 'staff.withdraw.description',
                      },
                      {name: selectedStaff?.name},
                    )}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={formatMessage({id: 'staff.withdraw.lastDay'})}
                    type='date'
                    variant='outlined'
                    value={values.withdrawDate}
                    onChange={(event) => {
                      setFieldValue('withdrawDate', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={formatMessage({id: 'staff.withdraw.otherReason'})}
                    type='text'
                    multiline
                    rows={3}
                    variant='outlined'
                    value={values.otherReason}
                    onChange={(event) => {
                      setFieldValue('otherReason', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                <Grid size={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      sx={{
                        position: 'relative',
                        minWidth: 100,
                      }}
                      color='error'
                      variant='contained'
                      type='submit'
                    >
                      <IntlMessages id='common.delete' />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default StaffWithdraw;

StaffWithdraw.propTypes = {
  refresh: PropTypes.func,
  setSelectedStaff: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedStaff: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};