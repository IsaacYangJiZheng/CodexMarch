import React from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  MenuItem,
  FormHelperText,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PropTypes from 'prop-types';
import {Formik, Form, ErrorMessage} from 'formik';
import {MuiTelInput} from 'mui-tel-input';
import AppGridContainer from '@anran/core/AppGridContainer';
import {Fonts} from 'shared/constants/AppEnums';
import * as Yup from 'yup';
import {useIntl} from 'react-intl';
const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const StaffDetails = ({formData, setFormData, activeStep, setActiveStep}) => {
  const {formatMessage} = useIntl();
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        fullName: Yup.string().required(
          formatMessage({id: 'staff.validation.fullNameRequired'}),
        ),
        nirc: Yup.string().required(
          formatMessage({id: 'staff.validation.nricRequired'}),
        ),
        mobileNumber: Yup.string()
          .matches(
            phoneRegExp,
            formatMessage({id: 'staff.validation.phoneInvalid'}),
          )
          .required(formatMessage({id: 'staff.validation.mobileRequired'})),
        emailAddress: Yup.string().required(
          formatMessage({id: 'staff.validation.emailRequired'}),
        ),
        religion: Yup.string().required(
          formatMessage({id: 'staff.validation.religionRequired'}),
        ),
        martialStatus: Yup.string().required(
          formatMessage({id: 'staff.validation.maritalStatusRequired'}),
        ),
        currentAddress: Yup.string().required(
          formatMessage({id: 'staff.validation.addressRequired'}),
        ),
      }),
    [formatMessage],
  );
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Formik
      initialValues={{
        fullName: formData?.fullName ? formData.fullName : '',
        nirc: formData?.nirc ? formData.nirc : '',
        mobileNumber: formData?.mobileNumber ? formData.mobileNumber : '',
        emailAddress: formData?.emailAddress ? formData.emailAddress : '',
        religion: formData?.religion ? formData.religion : '',
        martialStatus: formData?.martialStatus ? formData.martialStatus : '',
        currentAddress: formData?.currentAddress ? formData.currentAddress : '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data) => {
        console.log('***************', data);
        const consolidatedData = {
          ...formData,
          ...data,
        };
        setFormData(consolidatedData);
        setActiveStep(activeStep + 1);
      }}
    >
      {({values, errors, setFieldValue}) => {
        console.log('***************', values, errors);
        return (
          <Form noValidate autoComplete='off'>
            <Box sx={{padding: 5, ml: -6, mr: -6}}>
              <Box
                sx={{
                  pb: 5,
                  px: 5,
                  mb: 5,
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Card variant='outlined' sx={{mt: 2}}>
                  <CardHeader
                    sx={{p: 0, mt: 2, ml: 2}}
                    title={
                      <Box
                        component='h6'
                        sx={{
                          fontSize: 14,
                          fontWeight: Fonts.SEMI_BOLD,
                          mt: 0,
                          mb: 1,
                        }}
                      >
                        {formatMessage({id: 'staff.section.details'})}
                      </Box>
                    }
                  />
                  <CardContent>
                    <AppGridContainer spacing={5}>
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          label={formatMessage({id: 'staff.field.fullName'})}
                          type='text'
                          variant='outlined'
                          value={values.fullName}
                          onChange={(event) => {
                            setFieldValue('fullName', event.target.value);
                          }}
                          margin='dense'
                          helperText={
                            <ErrorMessage
                              name='fullName'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                      {/* NRIC Field */}
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          label={formatMessage({id: 'staff.field.nric'})}
                          type='text'
                          variant='outlined'
                          value={values.nirc}
                          onChange={(event) => {
                            setFieldValue('nirc', event.target.value);
                          }}
                          margin='dense'
                          helperText={
                            <ErrorMessage
                              name='nirc'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                      {/* Mobile Field */}
                      <Grid size={6}>
                        <MuiTelInput
                          margin='dense'
                          fullWidth
                          label={formatMessage({id: 'staff.field.mobile'})}
                          forceCallingCode
                          defaultCountry='MY'
                          onlyCountries={['MY']}
                          disableFormatting
                          value={values.mobileNumber}
                          onChange={(event) => {
                            setFieldValue('mobileNumber', event);
                          }}
                          error={errors?.mobileNumber}
                          helperText={
                            <ErrorMessage
                              name='mobileNumber'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                      {/* Email Field */}
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          label={formatMessage({id: 'staff.field.email'})}
                          type='email'
                          variant='outlined'
                          value={values.emailAddress}
                          onChange={(event) => {
                            setFieldValue('emailAddress', event.target.value);
                          }}
                          margin='dense'
                          helperText={
                            <ErrorMessage
                              name='emailAddress'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                      {/* Religion Field */}
                      <Grid size={6}>
                        <FormControl fullWidth margin='dense'>
                          <InputLabel>
                            {formatMessage({id: 'staff.field.religion'})}
                          </InputLabel>
                          <Select
                            name='religion'
                            label={formatMessage({id: 'staff.field.religion'})}
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            value={values.religion}
                            onChange={(event) => {
                              setFieldValue('religion', event.target.value);
                            }}
                          >
                            <MenuItem value='Buddhist '>
                              {formatMessage({id: 'staff.religion.buddhist'})}
                            </MenuItem>
                            <MenuItem value='Christian '>
                              {formatMessage({id: 'staff.religion.christian'})}
                            </MenuItem>
                            <MenuItem value='Hindu '>
                              {formatMessage({id: 'staff.religion.hindu'})}
                            </MenuItem>
                            <MenuItem value='Islam'>
                              {formatMessage({id: 'staff.religion.islam'})}
                            </MenuItem>
                          </Select>
                          <ErrorMessage
                            name='religion'
                            component={FormHelperText}
                            style={{color: 'red'}}
                          />
                        </FormControl>
                      </Grid>
                      {/* Martial Status Field */}
                      <Grid size={6}>
                        <FormControl fullWidth margin='dense'>
                          <InputLabel>
                            {formatMessage({id: 'staff.field.maritalStatus'})}
                          </InputLabel>
                          <Select
                            name='martialStatus'
                            label={formatMessage({id: 'staff.field.maritalStatus'})}
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            value={values.martialStatus}
                            onChange={(event) => {
                              setFieldValue(
                                'martialStatus',
                                event.target.value,
                              );
                            }}
                          >
                            <MenuItem value='Married'>
                              {formatMessage({id: 'staff.marital.married'})}
                            </MenuItem>
                            <MenuItem value='Single'>
                              {formatMessage({id: 'staff.marital.single'})}
                            </MenuItem>
                            <MenuItem value='Divorced'>
                              {formatMessage({id: 'staff.marital.divorced'})}
                            </MenuItem>
                          </Select>
                          <ErrorMessage
                            name='martialStatus'
                            component={FormHelperText}
                            style={{color: 'red'}}
                          />
                        </FormControl>
                      </Grid>
                      {/* Address Field */}
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label={formatMessage({id: 'common.address'})}
                          type='text'
                          multiline
                          rows={3}
                          variant='outlined'
                          value={values.currentAddress}
                          onChange={(event) => {
                            setFieldValue('currentAddress', event.target.value);
                          }}
                          margin='dense'
                          helperText={
                            <ErrorMessage
                              name='currentAddress'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                    </AppGridContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
            <Button
              color='inherit'
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{mr: 1}}
            >
              {formatMessage({id: 'common.back'})}
            </Button>
            <Box sx={{flex: '1 1 auto'}} />

              <Button type='submit'>
                {formatMessage({id: 'common.next'})}
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

StaffDetails.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
};

export default StaffDetails;