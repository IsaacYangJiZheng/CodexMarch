import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {Formik} from 'formik';
import {useIntl} from 'react-intl';

const StaffFinance = ({formData, setFormData, activeStep, setActiveStep}) => {
  const {formatMessage} = useIntl();
  console.log('formData', formData);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Formik
      initialValues={{
        bankName: formData?.bankName ? formData.bankName : '',
        bankAccountNumber: formData?.bankAccountNumber
          ? formData.bankAccountNumber
          : '',
        bankEPFNo: formData?.bankEPFNo ? formData.bankEPFNo : '',
        bankSOCSONo: formData?.bankSOCSONo ? formData.bankSOCSONo : '',
        bankIncomeTaxNo: formData?.bankIncomeTaxNo
          ? formData.bankIncomeTaxNo
          : '',
        allowOT: formData?.allowOT ? formData.allowOT : false,
      }}
      onSubmit={(data) => {
        console.log('***************', data);
        const consolidatedData = {
          ...formData,
          ...data,
        };
        setFormData(consolidatedData);
        setActiveStep(activeStep + 1);
      }}
    >
      {({values, setFieldValue}) => (
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
                      {formatMessage({id: 'staff.section.finance'})}
                    </Box>
                  }
                ></CardHeader>
                <CardContent>
                  <AppGridContainer spacing={5}>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.bankName'})}
                        type='text'
                        variant='outlined'
                        value={values.bankName}
                        onChange={(event) => {
                          setFieldValue('bankName', event.target.value);
                        }}
                        margin='dense'
                      />
                    </Grid>
                    {/* Bank Account Field */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.bankAccount'})}
                        type='text'
                        variant='outlined'
                        value={values.bankAccountNumber}
                        onChange={(event) => {
                          setFieldValue(
                            'bankAccountNumber',
                            event.target.value,
                          );
                        }}
                        margin='dense'
                      />
                    </Grid>
                    {/* EPF Account Field */}
                    <Grid size={5}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.epf'})}
                        type='text'
                        variant='outlined'
                        value={values.bankEPFNo}
                        onChange={(event) => {
                          setFieldValue('bankEPFNo', event.target.value);
                        }}
                        margin='dense'
                      />
                    </Grid>
                    {/* SOCSO Field */}
                    <Grid size={3.5}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.socso'})}
                        type='text'
                        variant='outlined'
                        value={values.bankSOCSONo}
                        onChange={(event) => {
                          setFieldValue('bankSOCSONo', event.target.value);
                        }}
                        margin='dense'
                      />
                    </Grid>
                    {/* Income Tax Field */}
                    <Grid size={3.5}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.incomeTax'})}
                        type='text'
                        variant='outlined'
                        value={values.bankIncomeTaxNo}
                        onChange={(event) => {
                          setFieldValue('bankIncomeTaxNo', event.target.value);
                        }}
                        margin='dense'
                      />
                    </Grid>
                    {/* Income Tax Field */}
                    <Grid size={3.5}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          style={{
                            fontWeight: values.allowOT ? 'normal' : 'bold',
                            color: values.allowOT ? 'gray' : 'red',
                          }}
                        >
                          {formatMessage({id: 'staff.overtime.disallow'})}
                        </Typography>
                        <Switch
                          checked={values.allowOT}
                          onChange={(event) => {
                            setFieldValue('allowOT', event.target.checked);
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                        <Typography
                          style={{
                            fontWeight: values.allowOT ? 'bold' : 'normal',
                            color: values.allowOT ? 'green' : 'gray',
                          }}
                        >
                          {formatMessage({id: 'staff.overtime.allow'})}
                        </Typography>
                      </Box>
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
      )}
    </Formik>
  );
};

StaffFinance.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
};

export default StaffFinance;