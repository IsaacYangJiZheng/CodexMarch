import React, {useEffect} from 'react';
import {
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import {useIntl} from 'react-intl';
var duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

const EditAttendance = ({
  open,
  onClose,
  reCallAPI,
  editingAttendanceId,
  initialValues,
  staffOptions,
  branchOptions,
}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        checkIn: Yup.string().required(
          formatMessage({id: 'attendance.validation.checkInRequired'}),
        ),
        checkOut: Yup.string().required(
          formatMessage({id: 'attendance.validation.checkOutRequired'}),
        ),
      }),
    [formatMessage],
  );

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={onClose}
            title={formatMessage({id: 'attendance.dialog.edit.title'})}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('staff', values.staff);
            formData.append('branch', values.branch);
            formData.append('checkIn', values.checkIn);
            formData.append('checkOut', values.checkOut);
            formData.append('duration', values.duration);

            try {
              const response = await putDataApi(
                `/api/attendance/${editingAttendanceId}`,
                infoViewActionsContext,
                formData,
                false,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              infoViewActionsContext.showMessage(
                formatMessage({id: 'attendance.message.updated'}),
              );
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => {
            useEffect(() => {
              if (values.checkIn && values.checkOut) {
                const checkInDate = dayjs(values.checkIn);
                const checkOutDate = dayjs(values.checkOut);
                const diffInMs = checkOutDate.diff(checkInDate);
                const diffInHours = dayjs
                  .duration(diffInMs)
                  .format('H [hours] : m [minutes]');
                setFieldValue('duration', diffInHours);
                console.log('duration');
              } else {
                setFieldValue('duration', 0);
              }
            }, [values.checkIn, values.checkOut, setFieldValue]);
            return (
              <Form>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h4'>
                      {formatMessage({id: 'attendance.section.info'})}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel>
                        {formatMessage({id: 'common.branch'})}
                      </InputLabel>
                      <Select
                        name='branch'
                        label={formatMessage({id: 'common.branch'})}
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.branch}
                        onChange={(event) => {
                          setFieldValue('branch', event.target.value);
                        }}
                        disabled
                      >
                        {branchOptions.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={3}>
                    <FormControl fullWidth margin='dense'>
                      <Autocomplete
                        options={staffOptions}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({id: 'attendance.field.staff'})}
                          />
                        )}
                        value={
                          staffOptions.find(
                            (option) => option._id === values.staff,
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          if (newValue) {
                            setFieldValue('staff', newValue._id);
                            setFieldValue('staffCode', newValue.staffCode);
                          } else {
                            setFieldValue('staff', '');
                            setFieldValue('staffCode', '');
                          }
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={3}>
                    <FormControl fullWidth margin='dense'>
                      <Autocomplete
                        options={staffOptions}
                        getOptionLabel={(option) => option.staffCode}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'attendance.field.staffCode',
                            })}
                          />
                        )}
                        value={
                          staffOptions.find(
                            (option) => option._id === values.staff,
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          if (newValue) {
                            setFieldValue('staff', newValue._id);
                            setFieldValue('staffCode', newValue.staffCode);
                          } else {
                            setFieldValue('staff', '');
                            setFieldValue('staffCode', '');
                          }
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        disabled
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={4.5}>
                    <DateTimePicker
                      sx={{width: '100%'}}
                      label={formatMessage({id: 'attendance.field.checkIn'})}
                      value={values.checkIn ? dayjs(values.checkIn) : null}
                      onChange={(newValue) =>
                        setFieldValue('checkIn', newValue)
                      }
                      slotProps={{
                        textField: {
                          margin: 'dense',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={4.5}>
                    <DateTimePicker
                      sx={{width: '100%'}}
                      label={formatMessage({id: 'attendance.field.checkOut'})}
                      value={values.checkOut ? dayjs(values.checkOut) : null}
                      onChange={(newValue) =>
                        setFieldValue('checkOut', newValue)
                      }
                      slotProps={{
                        textField: {
                          margin: 'dense',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={3}>
                    <AppTextField
                      label={formatMessage({id: 'attendance.field.duration'})}
                      variant='outlined'
                      fullWidth
                      name='duration'
                      margin='dense'
                      disabled
                      value={values.duration}
                    />
                  </Grid>
                </Grid>
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
                    color='primary'
                    variant='contained'
                    type='submit'
                  >
                    <IntlMessages id='common.save' />
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default EditAttendance;

EditAttendance.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingAttendanceId: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
  branchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  staffOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};