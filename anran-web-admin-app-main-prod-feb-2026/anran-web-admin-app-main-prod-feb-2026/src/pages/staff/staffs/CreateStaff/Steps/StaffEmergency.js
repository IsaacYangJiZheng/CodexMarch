import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {Formik, Form, ErrorMessage} from 'formik';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {MuiTelInput} from 'mui-tel-input';
import * as Yup from 'yup';
import {useIntl} from 'react-intl';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const StaffEmergency = ({formData, setFormData, activeStep, setActiveStep}) => {
  const {formatMessage} = useIntl();
  console.log('formData', formData.branch);
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        emergencyContactName: Yup.string().required(
          formatMessage({id: 'staff.validation.contactNameRequired'}),
        ),
        emergencyRelation: Yup.string().required(
          formatMessage({id: 'staff.validation.relationRequired'}),
        ),
        emergencyContact: Yup.string()
          .matches(
            phoneRegExp,
            formatMessage({id: 'staff.validation.contactInvalid'}),
          )
          .required(formatMessage({id: 'staff.validation.contactRequired'})),
      }),
    [formatMessage],
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Formik
      initialValues={{
        emergencyContactName: formData?.emergencyContactName
          ? formData.emergencyContactName
          : '',
        emergencyRelation: formData?.emergencyRelation
          ? formData.emergencyRelation
          : '',
        emergencyContact: formData?.emergencyContact
          ? formData.emergencyContact
          : '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data, {setSubmitting}) => {
        setSubmitting(true);
        console.log('***************', data);
        const postData = new FormData();
        postData.append('image', formData.profileImageData);
        postData.append('name', formData.name);
        postData.append('staffCode', formData.staffCode);
        postData.append('gender', formData.gender);
        postData.append('branch', JSON.stringify(formData.branch));
        postData.append('roles', formData.roles);
        postData.append('joinDate', formData.joinDate);
        postData.append('userName', formData.userName);
        postData.append('loginKey', formData.loginKey);
        postData.append('currentAddress', formData.currentAddress);
        postData.append('emailAddress', formData.emailAddress);
        postData.append('positionDepartment', formData.positionDepartment);
        postData.append('statusActive', formData.statusActive);
        postData.append('fullName', formData.fullName);
        postData.append('nirc', formData.nirc);
        postData.append('religion', formData.religion);
        postData.append('mobileNumber', formData.mobileNumber);
        postData.append('martialStatus', formData.martialStatus);
        postData.append('bankName', formData.bankName);
        postData.append('bankAccountNumber', formData.bankAccountNumber);
        postData.append('bankEPFNo', formData.bankEPFNo);
        postData.append('bankSOCSONo', formData.bankSOCSONo);
        postData.append('bankIncomeTaxNo', formData.bankIncomeTaxNo);
        postData.append('emergencyContactName', data.emergencyContactName);
        postData.append('emergencyRelation', data.emergencyRelation);
        postData.append('emergencyContact', data.emergencyContact);

        const consolidatedData = {
          ...formData,
          ...data,
        };
        setFormData(consolidatedData);
        try {
          const response = await postDataApi(
            'api/staff',
            infoViewActionsContext,
            postData,
            false,
            {
              'Content-Type': 'multipart/form-data',
            },
          );
          console.log('Response from API:', response);
          setFormData(null);
          setActiveStep(activeStep + 1);
          infoViewActionsContext.showMessage(
            formatMessage({id: 'staff.message.added'}),
          );
        } catch (error) {
          infoViewActionsContext.fetchError(error.message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({values, errors, setFieldValue}) => (
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
                      {formatMessage({id: 'staff.section.emergency'})}
                    </Box>
                  }
                ></CardHeader>
                <CardContent>
                  <AppGridContainer spacing={5}>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.contactName'})}
                        type='text'
                        variant='outlined'
                        value={values.emergencyContactName}
                        onChange={(event) => {
                          setFieldValue(
                            'emergencyContactName',
                            event.target.value,
                          );
                        }}
                        margin='dense'
                        helperText={
                          <ErrorMessage
                            name='emergencyContactName'
                            render={(msg) => (
                              <span style={{color: 'red'}}>{msg}</span>
                            )}
                          />
                        }
                      />
                    </Grid>
                    {/* Relation EC Field */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.relation'})}
                        type='text'
                        variant='outlined'
                        value={values.emergencyRelation}
                        onChange={(event) => {
                          setFieldValue(
                            'emergencyRelation',
                            event.target.value,
                          );
                        }}
                        margin='dense'
                        helperText={
                          <ErrorMessage
                            name='emergencyRelation'
                            render={(msg) => (
                              <span style={{color: 'red'}}>{msg}</span>
                            )}
                          />
                        }
                      />
                    </Grid>
                    {/* Contact No. EC Field */}
                    <Grid size={12}>
                      <MuiTelInput
                        margin='dense'
                        fullWidth
                        label={formatMessage({id: 'staff.field.contactNumber'})}
                        forceCallingCode
                        defaultCountry='MY'
                        onlyCountries={['MY']}
                        disableFormatting
                        value={values.emergencyContact}
                        onChange={(event) => {
                          setFieldValue('emergencyContact', event);
                        }}
                        error={errors?.emergencyContact}
                        helperText={
                          <ErrorMessage
                            name='emergencyContact'
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
              {formatMessage({id: 'common.submit'})}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

StaffEmergency.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
};

export default StaffEmergency;