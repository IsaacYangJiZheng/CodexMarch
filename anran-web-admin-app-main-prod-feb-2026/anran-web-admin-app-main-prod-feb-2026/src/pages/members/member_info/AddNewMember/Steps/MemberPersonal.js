import React, {useContext, useMemo} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Field, Form} from 'formik';
// import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {FormContext} from '../../AddNewMember'; // Assuming the context is defined
import {Formik} from 'formik';
import * as Yup from 'yup';
import {DatePicker} from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import countries from '@anran/services/db/countries/appCountries';
import {MuiTelInput} from 'mui-tel-input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import postcodeMapping from '../../../../../data/postcodeMapping';
import {useIntl} from 'react-intl';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;
const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const icValidation = (value, formatMessage) => {
  const icRegExp = /^\d{6}-?\d{2}-?\d{4}$/;
  if (!icRegExp.test(value)) {
    return formatMessage({id: 'member.identity.error.invalidFormat'});
  }

  const datePart = value.replace(/-/g, '').substring(0, 6);
  const year = parseInt(datePart.substring(0, 2), 10);
  const month = parseInt(datePart.substring(2, 4), 10);
  const day = parseInt(datePart.substring(4, 6), 10);

  if (month < 1 || month > 12) {
    return formatMessage({id: 'member.identity.error.invalidMonth'});
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return formatMessage({id: 'member.identity.error.invalidDay'});
  }

  return true;
};

const postCodeValidation = (value, formatMessage) => {
  if (!value) {
    return formatMessage({id: 'common.required'});
  }
  // Check if the postcode is a valid number and has 5 digits
  const postCodeRegExp = /^\d{5}$/;
  if (!postCodeRegExp.test(value)) {
    return formatMessage({id: 'member.postcode.error.invalidFormat'});
  }

  // Check if the postcode exists in the postcodeMapping
  const location = postcodeMapping.find(
    (entry) => entry.Postcode === parseInt(value, 10)
  );

  if (!location) {
    return formatMessage({id: 'member.postcode.error.noState'});
  }

  // If valid, return true
  return true;
};

const MemberPersonal = () => {
  const {formatMessage} = useIntl();
  const validationSchema = useMemo(
    () =>
      Yup.object({
        memberFullName: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
  // chineseName: Yup.string().required('Required'),
        passport: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ), // Keep only the required validation here
        dob: Yup.date().required(formatMessage({id: 'common.required'})),
  // age: Yup.number().required('Required'),
        gender: Yup.string().required(formatMessage({id: 'common.required'})),
  // address: Yup.string().required('Required'),
  // city: Yup.string().required('Required'),
        postcode: Yup.string().required(formatMessage({id: 'common.required'})),
  // states: Yup.string().required('Required'),
  // mobileNumber: Yup.string().required('Required'),
        mobileNumber: Yup.string()
          .matches(
            phoneRegExp,
            formatMessage({id: 'member.mobile.error.invalid'}),
          )
          .required(formatMessage({id: 'common.required'})),
        foreignMobileNumber: Yup.string().when('isForeign', {
          is: true,
          then: () => Yup.string().required(formatMessage({id: 'common.required'})),
        }),
        email: Yup.string()
          .matches(emailRegExp, formatMessage({id: 'member.email.error.invalid'}))
          .required(formatMessage({id: 'common.required'})),
        emergencyName: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
  // emergencyMobile: Yup.string().required('Required'),
        emergencyMobile: Yup.string()
          // .matches(phoneRegExp, 'Phone number is not valid')
          .required(formatMessage({id: 'common.required'})),
        emergencyRelationship: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
        aboutUs: Yup.string().required(formatMessage({id: 'common.required'})),
        othersAboutUs: Yup.string().when('aboutUs', {
          is: 'Others',
          then: () =>
            Yup.string().required(formatMessage({id: 'common.required'})),
        }),
        preferredBranch: Yup.string().required(
          formatMessage({id: 'common.required'}),
        ),
      }),
    [formatMessage],
  );
  const {formData, activeStep, setActiveStep, setFormData} = useContext(FormContext);
  const [stateList, setStateList] = React.useState([]);
  const [passportError, setPassportError] = React.useState(''); // Use React.useState for passport error
  const [postcodeError, setPostcodeError] = React.useState('');
  const [{apiData: branchList}] = useGetDataApi('api/branch/web', {}, {}, true);
  const infoViewActionsContext = useInfoViewActionsContext();
  // const [howDidYouHearAboutUs, setHowDidYouHearAboutUs] = React.useState('new');
  // const handleHowDidYouHearAboutUs = (event) => {
  //   setHowDidYouHearAboutUs(event.target.value);
  // };
  // console.log(howDidYouHearAboutUs);

  React.useEffect(() => {
    setStateList(countries[0].regions);
  }, []);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const extractDOBFromIC = (icNumber) => {
    if (!/^\d{12}$/.test(icNumber)) return null;

    const year = parseInt(icNumber.substring(0, 2), 10);
    const month = icNumber.substring(2, 4);
    const day = icNumber.substring(4, 6);

    const fullYear = year < 20 ? `20${year.toString().padStart(2, '0')}` : `19${year}`;

    const dobString = `${fullYear}-${month}-${day}`;

    return dayjs(dobString).isValid() ? dayjs(dobString) : null;
  };

  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const isMemberExist = async (phone) => {
    const postData = new FormData();
    postData.append('mobileNumber', phone.replace('+', ''));

    return postDataApi(
      'api/members/checkmobileExist',
      infoViewActionsContext,
      postData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then((data) => {
        if (data.status == 'Failed') {
          infoViewActionsContext.fetchError(data.message);
          return true;
        }
        return false;
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
        return true;
      });

    // return new Promise((resolve, reject) => {
    //   postDataApi(
    //     'api/members/checkmobileExist',
    //     infoViewActionsContext,
    //     postData,
    //     false,
    //     false,
    //     {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   )
    //     .then((data) => {
    //       if (data.status == 'Failed') {
    //         return reject(true);
    //       }
    //       return resolve(false);
    //     })
    //     .catch((error) => {
    //       infoViewActionsContext.fetchError(error.message);
    //       return reject(true);
    //     });
    // });
  };

  const stateShortToFull = {
    PLS: 'Perlis',
    KDH: 'Kedah',
    PNG: 'Pulau Pinang',
    PRK: 'Perak',
    SGR: 'Selangor',
    KUL: 'Wilayah Persekutuan (Kuala Lumpur)',
    NSN: 'Negeri Sembilan',
    MLK: 'Melaka',
    JHR: 'Johor',
    PHG: 'Pahang',
    TRG: 'Terengganu',
    KTN: 'Kelantan',
    SBH: 'Sabah',
    SRW: 'Sarawak',
    LBN: 'Wilayah Persekutuan (Labuan)',
    PJY: 'Wilayah Persekutuan (Putrajaya)',
  };

  return (
    <Formik
      initialValues={{
        memberFullName: formData?.memberFullName ? formData.memberFullName : '',
        preferredName: formData?.preferredName ? formData.preferredName : '',
        chineseName: formData?.chineseName ? formData.chineseName : '',
        passport: formData?.passport ? formData.passport : '',
        dob: formData?.dob ? formData.dob : dayjs(),
        age: formData?.age ? formData.age : '',
        identityType: formData?.identityType ? formData.identityType : 'IC',
        gender: formData?.gender ? formData.gender : '',
        address: formData?.address ? formData.address : '',
        city: formData?.city ? formData.city : '',
        postcode: formData?.postcode ? formData.postcode : '',
        states: formData?.states ? formData.states : '',
        mobileNumber: formData?.mobileNumber ? formData.mobileNumber : '',
        email: formData?.email ? formData.email : '',
        isForeign: formData?.isForeign ? formData.isForeign : false,
        foreignMobileNumber: formData?.foreignMobileNumber ? formData.foreignMobileNumber : '',
        emergencyName: formData?.emergencyName ? formData.emergencyName : '',
        emergencyMobile: formData?.emergencyMobile
          ? formData.emergencyMobile
          : '',
        emergencyRelationship: formData?.emergencyRelationship
          ? formData.emergencyRelationship
          : '',
        aboutUs: formData?.aboutUs ? formData.aboutUs : '',
        preferredBranch: formData?.preferredBranch
          ? formData.preferredBranch
          : '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data, {setFieldError}) => {
        console.log('***************', data);
        const consolidatedData = {
          ...formData,
          ...data,
        };
        let flag = true;
        flag = await isMemberExist(data.mobileNumber)
          .then((result) => {
            return result;
          })
          .catch(() => {
            return false;
          });
        if (!flag) {
          setFormData(consolidatedData);
          setActiveStep(activeStep + 1);
        } else {
          setFieldError(
            'mobileNumber',
            formatMessage({id: 'member.mobile.error.exists'}),
          );
          return;
        }
      }}
    >
      {({values, errors, setFieldValue}) => {
        const handleGenerateMobileNumber = async () => {
          const postData = new FormData();
          postData.append('branch', values.preferredBranch);

          return postDataApi(
            'api/branch/generate-dummy-local-number',
            infoViewActionsContext,
            postData,
            false,
            false,
            {
              'Content-Type': 'multipart/form-data',
            },
          )
            .then((data) => {
              setFieldValue('mobileNumber', data.mobileNumber);
            })
            .catch((error) => {
              infoViewActionsContext.fetchError(error.message);
            });
        };

        const handlePassportChange = (e) => {
          const value = e.target.value;
          setFieldValue("passport", value);

          if (values.identityType === "IC") {
            const validationResult = icValidation(value, formatMessage);
            if (validationResult === true) {
              setPassportError("");
              const dob = extractDOBFromIC(value);
              if (dob) {
                setFieldValue("dob", dob.toISOString());
                const age = getAge(dob.toDate());
                setFieldValue("age", age);
              }
            } else {
              setPassportError(validationResult);
            }
          } else {
            // For Passport, just clear error (or add custom validation if needed)
            setPassportError("");
          }
        };

        const handlePostcodeChange = (e) => {
          const value = e.target.value;
          setFieldValue('postcode', value);

          const validationResult = postCodeValidation(value, formatMessage);
          if (validationResult === true) {
            setPostcodeError('');
            const location = postcodeMapping.find(
              (entry) => entry.Postcode === parseInt(value, 10)
            );
            if (location) {
              setFieldValue('city', location.City);
              const fullStateName = stateShortToFull[location.State];
              setFieldValue('states', fullStateName || '');
            } else {
              setFieldValue('city', '');
              setFieldValue('states', '');
            }
          } else {
            setPostcodeError(validationResult); // Set the error message
            setFieldValue('city', '');
            setFieldValue('states', '');
          }
        };

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
                        <IntlMessages id='anran.member.PersonalDetails' />
                      </Box>
                    }
                  />
                  <CardContent>
                    <AppGridContainer spacing={5}>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='memberFullName'
                          fullWidth
                          label={<IntlMessages id='anran.member.fullName' />}
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='preferredName'
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.preferredName' />
                          }
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='chineseName'
                          fullWidth
                          label={<IntlMessages id='anran.member.chineseName' />}
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='gender'
                          fullWidth
                          label={<IntlMessages id='anran.member.gender' />}
                          select
                        >
                          <MenuItem value='Female'>
                            <IntlMessages id='anran.gender.female' />
                          </MenuItem>
                          <MenuItem value='Male'>
                            <IntlMessages id='anran.gender.male' />
                          </MenuItem>
                          <MenuItem value='Others'>
                            <IntlMessages id='anran.gender.others' />
                          </MenuItem>
                        </AppTextField>
                        {/* <AppTextField
                        name='gender'
                        fullWidth
                        label={<IntlMessages id='anran.member.gender' />}
                      /> */}
                      </Grid>
                      <Grid size={{xs: 12, md: 12}}>
                        <Typography variant='h4'>
                          <IntlMessages id='member.identity.type' />
                        </Typography>
                        <RadioGroup
                          row
                          name="identityType"
                          value={values.identityType}
                          onChange={(e) => {
                            setFieldValue("identityType", e.target.value);
                            setFieldValue("passport", "");
                          }}
                        >
                          <FormControlLabel
                            value="IC"
                            control={<Radio />}
                            label={formatMessage({id: 'member.identity.ic'})}
                          />
                          <FormControlLabel
                            value="Passport"
                            control={<Radio />}
                            label={formatMessage({id: 'member.identity.passport'})}
                          />
                        </RadioGroup>
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <TextField
                          name="passport"
                          fullWidth
                          label={
                            values.identityType === "IC"
                              ? formatMessage({id: 'member.identity.nric'})
                              : formatMessage({id: 'member.identity.passport'})
                          }
                          value={values.passport}
                          onChange={handlePassportChange}
                          error={Boolean(errors.passport || passportError)}
                          helperText={errors.passport || passportError || ''}
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 3}}>
                        <DatePicker
                          // disabled={viewMode == 'Read' ? true : false}
                          sx={{width: '100%'}}
                          disabled={values.identityType === "IC"}
                          disableFuture
                          autoOk
                          format='YYYY/MM/DD'
                          variant='inline'
                          inputVariant='outlined'
                          label={<IntlMessages id='anran.member.dateOfBirth' />}
                          name='dob'
                          value={dayjs(values.dob)} // Ensure value is a Dayjs object
                          slotProps={{
                            textField: {
                              error: errors.dob ? true : false,
                              helperText:
                                errors.dob && formatMessage({id: 'common.required'}),
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                          onChange={(value) => {
                            const dayjsValue = dayjs(value); // Convert to Dayjs object
                            setFieldValue('dob', dayjsValue.toISOString());
                            const age = getAge(dayjsValue.toDate());
                            setFieldValue('age', age);
                          }}
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 3}}>
                        <AppTextField
                          disabled
                          name='age'
                          fullWidth
                          label={<IntlMessages id='anran.member.age' />}
                          type='number'
                        />
                      </Grid>
                      {/* <Grid size={{xs: 12}}>
                        <AppTextField
                          name='address'
                          fullWidth
                          label={<IntlMessages id='anran.member.address' />}
                          multiline
                          rows={3}
                        />
                      </Grid> */}
                      <Grid size={{xs: 12, md: 5}}>
                        <TextField
                          name="postcode"
                          fullWidth
                          label={<IntlMessages id="anran.member.postcode" />}
                          onChange={handlePostcodeChange}
                          error={Boolean(postcodeError)}
                          helperText={postcodeError}
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 3.5}}>
                        <AppTextField
                          name="city"
                          fullWidth
                          label={<IntlMessages id="anran.member.city" />}
                          disabled
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 3.5}}>
                        <FormControl
                          variant="outlined"
                          sx={{
                            width: '100%',
                          }}
                          // error={errors.states ? true : false}
                        >
                          <InputLabel id="label-select-outlined-state">
                            <IntlMessages id="common.selectState" />
                          </InputLabel>
                          <Field
                            name="states"
                            label={<IntlMessages id="common.selectState" />}
                            labelId="label-select-outlined-state"
                            as={Select}
                            sx={{
                              width: '100%',
                              mb: { xs: 4, xl: 6 },
                            }}
                            disabled
                          >
                            {stateList.map((state) => {
                              return (
                                <MenuItem
                                  value={state.name}
                                  key={state.shortCode}
                                  sx={{
                                    cursor: 'pointer',
                                  }}
                                >
                                  {state.name}
                                </MenuItem>
                              );
                            })}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid size={{xs: 12, md: 12}}>
                        <Typography variant='h4'>
                          <IntlMessages id='member.type.title' />
                        </Typography>
                        <RadioGroup
                          row
                          name="mobileSelection"
                          value={values.isForeign ? "foreign" : "local"}
                          onChange={(e) => {
                            const selection = e.target.value;
                            setFieldValue('isForeign', selection === "foreign");
                            if (selection === "local") {
                              setFieldValue('foreignMobileNumber', '');
                              setFieldValue('mobileNumber', '');
                            } else {
                              setFieldValue('mobileNumber', '');
                            }
                          }}
                        >
                          <FormControlLabel
                            value="local"
                            control={<Radio />}
                            label={formatMessage({id: 'member.type.local'})}
                          />
                          <FormControlLabel
                            value="foreign"
                            control={<Radio />}
                            label={formatMessage({id: 'member.type.foreign'})}
                          />
                        </RadioGroup>
                      </Grid>

                      {/* Mobile Number Field for Local */}
                      {!values.isForeign && (
                        <Grid container size={12} alignItems='center'>
                          <Grid size={{xs: 12, md: 6}}>
                            {branchList.length > 0 && (
                              <FormControl
                                fullWidth
                                error={errors?.preferredBranch}
                              >
                                <InputLabel id='demo-simple-select-label'>
                                  <IntlMessages id='member.preferredBranch' />
                                </InputLabel>
                                <Field
                                  name='preferredBranch'
                                  label={formatMessage({
                                    id: 'member.preferredBranch',
                                  })}
                                  labelId='label-select-outlined-state'
                                  as={Select}
                                  sx={{
                                    width: '100%',
                                    mb: {xs: 4, xl: 6},
                                  }}
                                >
                                  {branchList?.map((item, index) => (
                                    <MenuItem
                                      key={index}
                                      value={item._id}
                                      sx={{
                                        padding: 2,
                                        cursor: 'pointer',
                                        minHeight: 'auto',
                                      }}
                                    >
                                      {item.branchName}
                                    </MenuItem>
                                  ))}
                                </Field>
                              </FormControl>
                            )}
                          </Grid>
                          <Grid size={{xs: 12, md: 6}}>
                            <MuiTelInput
                              error={errors?.mobileNumber}
                              helperText={errors?.mobileNumber ? errors?.mobileNumber : ''}
                              fullWidth
                              label={<IntlMessages id='anran.member.mobileNumber' />}
                              forceCallingCode
                              defaultCountry="MY"
                              onlyCountries={['MY']}
                              disableFormatting
                              value={values.mobileNumber}
                              onChange={(newValue) => setFieldValue('mobileNumber', newValue)}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {values.isForeign && (
                        <Grid container size={12} alignItems='center'>
                          <Grid size={{xs: 12, md: 12}}>
                            {branchList.length > 0 && (
                              <FormControl
                                fullWidth
                                error={errors?.preferredBranch}
                              >
                                <InputLabel id='demo-simple-select-label'>
                                  <IntlMessages id='member.preferredBranch' />
                                </InputLabel>
                                <Field
                                  name='preferredBranch'
                                  label={formatMessage({
                                    id: 'member.preferredBranch',
                                  })}
                                  labelId='label-select-outlined-state'
                                  as={Select}
                                  sx={{
                                    width: '100%',
                                    mb: {xs: 4, xl: 6},
                                  }}
                                >
                                  {branchList?.map((item, index) => (
                                    <MenuItem
                                      key={index}
                                      value={item._id}
                                      sx={{
                                        padding: 2,
                                        cursor: 'pointer',
                                        minHeight: 'auto',
                                      }}
                                    >
                                      {item.branchName}
                                    </MenuItem>
                                  ))}
                                </Field>
                              </FormControl>
                            )}
                          </Grid>
                          <Grid size={{xs: 12, md: 5.5}}>
                            <MuiTelInput
                              error={Boolean(errors?.foreignMobileNumber)}
                              helperText={errors?.foreignMobileNumber || ''}
                              fullWidth
                              label={<IntlMessages id='anran.member.foreignMobileNumber' />}
                              forceCallingCode
                              defaultCountry="SG"
                              onlyCountries={['BN', 'ID', 'PH', 'SG', 'TH', 'CN']}
                              disableFormatting
                              value={values.foreignMobileNumber}
                              onChange={(newValue) => setFieldValue('foreignMobileNumber', newValue)}
                            />
                          </Grid>
                          <Grid size={{xs: 12, md: 5.5}}>
                            <MuiTelInput
                              error={errors?.mobileNumber}
                              helperText={
                                errors?.mobileNumber
                                  ? formatMessage({
                                      id: 'member.mobile.error.virtualRequired',
                                    })
                                  : ''
                              }
                              fullWidth
                              label={formatMessage({
                                id: 'member.mobile.virtualLocal',
                              })}
                              forceCallingCode
                              defaultCountry="MY"
                              onlyCountries={['MY']}
                              disableFormatting
                              disabled
                              value={values.mobileNumber}
                            />
                          </Grid>
                          {/* Button to generate dummy local mobile number */}
                          <Grid size={{xs: 12, md: 1}} display='flex'>
                            <Tooltip
                              title={formatMessage({
                                id: 'member.mobile.generateVirtual',
                              })}
                              arrow
                            >
                              <IconButton
                                color="primary"
                                onClick={handleGenerateMobileNumber}
                              >
                                <RefreshOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      )}
                      {/* <Grid size={{xs: 12, md: 6}}>
                        <MuiTelInput
                          error={errors?.mobileNumber}
                          helperText={
                            errors?.mobileNumber ? errors?.mobileNumber : ''
                          }
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.mobileNumber' />
                          }
                          forceCallingCode
                          defaultCountry='MY'
                          onlyCountries={['MY']}
                          disableFormatting
                          value={values.mobileNumber}
                          onChange={(newValue) => {
                            setFieldValue('mobileNumber', newValue);
                          }}
                        /> */}
                        {/* <AppTextField
                        name='mobileNumber'
                        fullWidth
                        label={<IntlMessages id='anran.member.mobileNumber' />}
                      /> */}
                      {/* </Grid>
                      {values.isForeign && (
                        <Grid size={{xs: 12, md: 6}}>
                          <MuiTelInput
                            error={Boolean(errors?.foreignMobileNumber)} // Check if there’s an error
                            helperText={errors?.foreignMobileNumber || ''} // Show error message if exists
                            fullWidth
                            label={<IntlMessages id='anran.member.foreignMobileNumber' />}
                            forceCallingCode
                            defaultCountry='SG' // No default country for foreign numbers
                            onlyCountries={['BN', 'ID', 'PH', 'SG', 'TH', 'CN']} // No country restriction for foreign numbers
                            disableFormatting
                            value={values.foreignMobileNumber}
                            onChange={(newValue) => {
                              setFieldValue('foreignMobileNumber', newValue);
                            }}
                          />
                        </Grid>
                      )}
                      <Grid size={{xs: 12, md: 6}}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.isForeign}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setFieldValue('isForeign', isChecked);
                                if(!isChecked) {
                                  setFieldValue('foreignMobileNumber', '');
                                }
                              }}
                              color="primary"
                            />
                          }
                          label={<IntlMessages id='anran.member.isForeign' />}
                        />
                      </Grid> */}
                      <Grid size={{xs: 12, md: 12}}>
                        <AppTextField
                          name='email'
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.emailAddress' />
                          }
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='aboutUs'
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.howDidYouHearAboutUs' />
                          }
                          select
                        >
                          <MenuItem value='Family'>
                            <IntlMessages id='anran.member.family' />
                          </MenuItem>
                          <MenuItem value='Friend'>
                            <IntlMessages id='anran.member.friend' />
                          </MenuItem>
                          <MenuItem value='Facebook'>
                            <IntlMessages id='anran.member.facebook' />
                          </MenuItem>
                          <MenuItem value='Advertisement'>
                            <IntlMessages id='anran.member.advertisement' />
                          </MenuItem>
                          <MenuItem value='Anran Outlet'>
                            <IntlMessages id='anran.member.anranOutlet' />
                          </MenuItem>
                          <MenuItem value='Others'>
                            <IntlMessages id='anran.member.others' />
                          </MenuItem>
                        </AppTextField>
                      </Grid>
                      {values.aboutUs == 'Others' && (
                        <Grid size={{xs: 12, md: 6}}>
                          <AppTextField
                            name='othersAboutUs'
                            fullWidth
                            label={
                              <IntlMessages id='member.aboutUs.othersSpecify' />
                            }
                          />
                        </Grid>
                      )}
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
                        <IntlMessages id='anran.member.PersonalDetails' />
                      </Box>
                    }
                  />
                  <CardContent>
                    <AppGridContainer spacing={5}>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='emergencyName'
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.emergencyContactName' />
                          }
                        />
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <MuiTelInput
                          error={errors?.emergencyMobile}
                          helperText={
                            errors?.emergencyMobile
                              ? formatMessage({
                                  id: 'member.mobile.error.invalid',
                                })
                              : ''
                          }
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.emergencyContactMobileNumber' />
                          }
                          forceCallingCode
                          defaultCountry='MY'
                          onlyCountries={['BN', 'ID', 'MY', 'PH', 'SG', 'TH', 'CN']}
                          disableFormatting
                          value={values.emergencyMobile}
                          onChange={(newValue) => {
                            setFieldValue('emergencyMobile', newValue);
                          }}
                        />
                        {/* <AppTextField
                        name='emergencyMobile'
                        fullWidth
                        label={
                          <IntlMessages id='anran.member.emergencyContactMobileNumber' />
                        }
                      /> */}
                      </Grid>
                      <Grid size={{xs: 12, md: 6}}>
                        <AppTextField
                          name='emergencyRelationship'
                          fullWidth
                          label={
                            <IntlMessages id='anran.member.emergencyContactRelationship' />
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

export default MemberPersonal;