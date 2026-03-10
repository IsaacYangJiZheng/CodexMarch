import React, {useContext, useMemo} from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  FormLabel,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {FormContext} from '../../AddNewMember';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import FormHelperText from '@mui/material/FormHelperText';
import {useIntl} from 'react-intl';

const MemberValidation = () => {
  const {formatMessage} = useIntl();
  const {formData, activeStep, setActiveStep, setFormData} =
    useContext(FormContext);

  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = useMemo(
    () =>
      Yup.object({
        MB_registration_date: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
        MB_status_new: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
        MB_full_name: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
        MB_preferred_branch: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
        MB_mobile_number: Yup.string().when('membershipStatus', {
          is: 'existing',
          then: Yup.string().required(
            formatMessage({id: 'member.validation.existingMobileRequired'}),
          ),
        }),
        MB_payment_method: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
      }),
    [formatMessage],
  );

  // // Handle Membership Status Change
  // const [membershipStatus, setMembershipStatus] = React.useState('new');
  // const handleMembershipStatusChange = (event) => {
  //   setMembershipStatus(event.target.value);
  // };
  // console.log(membershipStatus);

  const isMemberExist = async (phone) => {
    const postData = new FormData();
    postData.append('phone', phone);

    return new Promise((resolve, reject) => {
      postDataApi('/members/check', infoViewActionsContext, postData, false, {
        'Content-Type': 'multipart/form-data',
      })
        .then((data) => {
          return resolve(data.found);
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
          return reject(true);
        });
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Formik
      initialValues={{
        MB_registration_date: formData?.MB_registration_date
          ? formData.MB_registration_date
          : '',
        MB_status_new: formData?.MB_status_new ? formData.MB_status_new : '',
        MB_full_name: formData?.MB_full_name ? formData.MB_full_name : '',
        MB_preferred_branch: formData?.MB_preferred_branch
          ? formData.MB_preferred_branch
          : '',
        MB_mobile_number: formData?.MB_mobile_number
          ? formData.MB_mobile_number
          : '',
        MB_payment_method: formData?.MB_payment_method
          ? formData.MB_payment_method
          : '',
        // registrationDate: formData?.registrationDate ?? '',
        // membershipStatus: formData?.membershipStatus ?? '',
        // name: formData?.name ?? '',
        // branch: formData?.branch ?? '',
        // existingMobileNumber: formData?.existingMobileNumber ?? '',
        // paymentMethod: formData?.paymentMethod ?? '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data) => {
        console.log('***************', data);
        const consolidatedData = {
          ...formData,
          ...data,
        };
        setFormData(consolidatedData);
        if (data['MB_status_new'] == 'existing') {
          let flag = true;
          flag = await isMemberExist(data['MB_mobile_number']);
          if (!flag) {
            setActiveStep(activeStep + 1);
          }
        } else {
          setActiveStep(activeStep + 1);
        }
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
                  <CardContent>
                    <AppGridContainer spacing={4}>
                      <Grid item xs={12} md={6}>
                        <AppTextField
                          name='MB_registration_date'
                          fullWidth
                          type='date'
                          label={formatMessage({
                            id: 'member.RegistrationDate',
                          })}
                          InputLabelProps={{shrink: true}}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <AppTextField
                          name='MB_status_new'
                          fullWidth
                          label={<IntlMessages id='member.MembershipStatus' />}
                          select
                          onChange={(event) =>
                            setFieldValue('MB_status_new', event.target.value)
                          }
                        >
                          <MenuItem value='new'>
                            <IntlMessages id='member.newMember' />
                          </MenuItem>
                          <MenuItem value='existing'>
                            <IntlMessages id='member.existingMember' />
                          </MenuItem>
                        </AppTextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <AppTextField
                          name='MB_full_name'
                          fullWidth
                          label={<IntlMessages id='member.Name' />}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <AppTextField
                          name='MB_preferred_branch'
                          fullWidth
                          label={<IntlMessages id='member.branch' />}
                        />
                      </Grid>
                      {values.MB_status_new === 'existing' && ( // Check within Formik's values
                        <Grid item xs={12} md={6}>
                          <AppTextField
                            name='MB_mobile_number'
                            fullWidth
                            label={
                              <IntlMessages id='member.ExistingMobileNumber' />
                            }
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={12}>
                        <FormControl
                          component='fieldset'
                          error={errors.MB_payment_method}
                        >
                          <FormLabel component='legend'>
                            <IntlMessages id='member.PaymentMethod' />
                          </FormLabel>
                          <RadioGroup
                            row // Display radio buttons horizontally
                            value={values.MB_payment_method}
                            onChange={(event) =>
                              setFieldValue(
                                'MB_payment_method',
                                event.target.value,
                              )
                            }
                          >
                            <FormControlLabel
                              value='One-off'
                              control={<Radio />}
                              label={formatMessage({
                                id: 'member.payment.oneOff',
                              })}
                            />
                            <FormControlLabel
                              value='Installment'
                              control={<Radio />}
                              label={formatMessage({
                                id: 'member.payment.installment',
                              })}
                            />
                          </RadioGroup>
                        </FormControl>
                        {errors.MB_payment_method && (
                          <FormHelperText style={{color: '#f44336'}}>
                            {errors.MB_payment_method}
                          </FormHelperText>
                        )}
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
                <IntlMessages id='common.back' />
              </Button>
              <Box sx={{flex: '1 1 auto'}} />

              <Button type='submit'>
                <IntlMessages id='common.next' />
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default MemberValidation;