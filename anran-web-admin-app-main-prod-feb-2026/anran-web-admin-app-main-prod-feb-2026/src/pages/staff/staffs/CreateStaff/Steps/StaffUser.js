import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import {Fonts} from 'shared/constants/AppEnums';
import {Formik, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {useIntl} from 'react-intl';

const StaffUser = ({formData, setFormData, activeStep, setActiveStep}) => {
  const {formatMessage} = useIntl();
  const [showPassword, setShowPassword] = React.useState(false);
  console.log('formData', formData);
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        userName: Yup.string().required(
          formatMessage({id: 'staff.validation.usernameRequired'}),
        ),
        loginKey: Yup.string().required(
          formatMessage({id: 'staff.validation.passwordRequired'}),
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
        userName: formData.staffCode,
        loginKey: formData?.loginKey ? formData.loginKey : '',
        statusActive: formData?.statusActive ? formData.statusActive : true,
      }}
      validationSchema={validationSchema}
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
                      {formatMessage({id: 'staff.section.appAccess'})}
                    </Box>
                  }
                />
                <CardContent>
                  <AppGridContainer spacing={5}>
                    {/* Username Field */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.username'})}
                        type='text'
                        variant='outlined'
                        value={values.userName}
                        onChange={(event) => {
                          setFieldValue('userName', event.target.value);
                        }}
                        margin='dense'
                        helperText={
                          <ErrorMessage
                            name='userName'
                            render={(msg) => (
                              <span style={{color: 'red'}}>{msg}</span>
                            )}
                          />
                        }
                        disabled
                      />
                    </Grid>
                    {/* Password Field */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.password'})}
                        type={showPassword ? 'text' : 'password'}
                        variant='outlined'
                        value={values.loginKey}
                        onChange={(event) => {
                          setFieldValue('loginKey', event.target.value);
                        }}
                        margin='dense'
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge='end'
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          ),
                        }}
                        helperText={
                          <ErrorMessage
                            name='loginKey'
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
                      {formatMessage({id: 'staff.section.otherSettings'})}
                    </Box>
                  }
                />
                <CardContent>
                  <AppGridContainer spacing={5}>
                    <Grid size={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          style={{
                            fontWeight: values.statusActive ? 'normal' : 'bold',
                            color: values.statusActive ? 'gray' : 'red',
                          }}
                        >
                          {formatMessage({id: 'staff.status.inactive'})}
                        </Typography>
                        <Switch
                          checked={values.statusActive}
                          onChange={(event) => {
                            setFieldValue('statusActive', event.target.checked);
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                        <Typography
                          style={{
                            fontWeight: values.statusActive ? 'bold' : 'normal',
                            color: values.statusActive ? 'green' : 'gray',
                          }}
                        >
                          {formatMessage({id: 'staff.status.active'})}
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

StaffUser.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
};

export default StaffUser;