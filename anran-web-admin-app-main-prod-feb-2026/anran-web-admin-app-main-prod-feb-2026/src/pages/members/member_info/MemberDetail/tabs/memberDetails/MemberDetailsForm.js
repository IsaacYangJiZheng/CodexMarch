import React from 'react';
import {
  alpha,
  Box,
  FormLabel,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
  // Tooltip,
  // IconButton,
} from '@mui/material';
import {useDropzone} from 'react-dropzone';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import IntlMessages from '@anran/utility/IntlMessages';
import {Field, Form} from 'formik';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';

import {Fonts} from 'shared/constants/AppEnums';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// import {useGetDataApi} from '@anran/utility/APIHooks';
import MenuItem from '@mui/material/MenuItem';
// import {Field} from 'formik';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {DatePicker} from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import {styled} from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import countries from '@anran/services/db/countries/appCountries';
import {MuiTelInput} from 'mui-tel-input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import {useGetDataApi} from '@anran/utility/APIHooks';
// import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
// import {postDataApi} from '@anran/utility/APIHooks';
// import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import postcodeMapping from '../../../../../../data/postcodeMapping.json';
import {useIntl} from 'react-intl';

const AvatarViewWrapper = styled('div')(({theme}) => {
  return {
    position: 'relative',
    cursor: 'pointer',
    '& .edit-icon': {
      position: 'absolute',
      bottom: 0,
      right: 0,
      zIndex: 1,
      border: `solid 2px ${theme.palette.background.paper}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      width: 26,
      height: 26,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '&.dropzone': {
      outline: 0,
      '&:hover .edit-icon, &:focus .edit-icon': {
        display: 'flex',
      },
    },
  };
});

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

const MemberDetailsForm = ({
  touched,
  values,
  errors,
  setFieldValue,
  isViewOnly,
  onViewOnly,
  checked,
  setChecked,
  setMemberImageUrl,
  setMemberImage,
  memberImage,
}) => {
  const {formatMessage} = useIntl();
  console.log('values', values, errors);
  // const infoViewActionsContext = useInfoViewActionsContext();
  const [stateList, setStateList] = React.useState([]);
  const [{apiData: branchList}] = useGetDataApi('api/branch/web', {}, {}, true);
  const [postcodeError, setPostcodeError] = React.useState('');
  const medicalLabelMap = {
    'Recent Operation': 'member.medical.condition.recentOperation',
    'Severe Heart Disease': 'member.medical.condition.severeHeartDisease',
    'Severe Circulatory Problems':
      'member.medical.condition.severeCirculatoryProblems',
    'Cardiac Pacemaker': 'member.medical.condition.cardiacPacemaker',
    'Cancer/Cancer Treatment (Chemo/Targeted Therapy)':
      'member.medical.condition.cancerTreatment',
    'Severe High Blood Pressure':
      'member.medical.condition.severeHighBloodPressure',
    'Skin Disease': 'member.medical.condition.skinDisease',
    'Viral Infection': 'member.medical.condition.viralInfection',
    Fever: 'member.medical.condition.fever',
    'Recent Scars': 'member.medical.condition.recentScars',
    Pregnancy: 'member.medical.condition.pregnancy',
    'During Period': 'member.medical.condition.duringPeriod',
    'None of the Above': 'member.medical.condition.none',
  };

  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setMemberImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setMemberImage(acceptedFiles[0]);
    },
  });

  React.useEffect(() => {
    setStateList(countries[0].regions);
  }, []);

  const onCancelClick = () => {
    onViewOnly(true);
  };

  const handleToggle = (value) => () => {
    console.log('handleToggle', value);
    const updatedMembers = checked.map((member) => {
        if (value.name === 'None of the Above') {
            // If "None of the Above" is toggled, uncheck all others
            member.selected = member.name === 'None of the Above' ? !member.selected : false;
        } else if (member.name === 'None of the Above') {
            // If any other condition is toggled, uncheck "None of the Above"
            member.selected = false;
        } else if (member.name === value.name) {
            // Toggle the selected condition
            member.selected = !member.selected;
        }
        return member;
    });
    setChecked(updatedMembers);
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

  // const handleGenerateMobileNumber = async () => {
  //   const postData = new FormData();
  //   postData.append('branch', values.preferredBranch);

  //   return postDataApi(
  //     'api/branch/generate-dummy-local-number',
  //     infoViewActionsContext,
  //     postData,
  //     false,
  //     false,
  //     {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   )
  //     .then((data) => {
  //       setFieldValue('mobileNumber', data.mobileNumber);
  //     })
  //     .catch((error) => {
  //       infoViewActionsContext.fetchError(error.message);
  //     });
  // };

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
    <>
      <Form noValidate autoComplete='off'>
        <AppGridContainer spacing={4}>
          <Grid size={{xs: 12, md: 6}}>
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
              ></CardHeader>
              <CardContent>
                <AppGridContainer spacing={4}>
                  <Grid size={{xs: 12, md: 10}}>
                    <AppTextField
                      name='memberFullName'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.fullName' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 2}}>
                    {isViewOnly ? (
                      <Avatar
                        sx={{
                          width: {xs: 50, lg: 64},
                          height: {xs: 50, lg: 64},
                          cursor: 'pointer',
                        }}
                        src={memberImage ? memberImage : ''}
                      />
                    ) : (
                      <AvatarViewWrapper
                        {...getRootProps({className: 'dropzone'})}
                      >
                        <input {...getInputProps()} />
                        <label htmlFor='icon-button-file'>
                          <Avatar
                            sx={{
                              width: {xs: 50, lg: 64},
                              height: {xs: 50, lg: 64},
                              cursor: 'pointer',
                            }}
                            src={memberImage ? memberImage : ''}
                          />
                          <Box className='edit-icon'>
                            <EditIcon />
                          </Box>
                        </label>
                      </AvatarViewWrapper>
                    )}
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='preferredName'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.preferredName' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='chineseName'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.chineseName' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='passport'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.nricPassport' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 5}}>
                    <DatePicker
                      disabled={isViewOnly}
                      autoOk
                      format='YYYY/MM/DD'
                      variant='inline'
                      inputVariant='outlined'
                      label={<IntlMessages id='anran.member.dateOfBirth' />}
                      name='dob'
                      value={values.dob}
                      renderInput={(params) => <TextField {...params} />}
                      onChange={(value) => {
                        setFieldValue('dob', value);
                        let age = getAge(value);
                        setFieldValue('age', age);
                      }}
                        slotProps={{
                          textField: {
                            error: errors.dob ? true : false,
                            helperText:
                              errors.dob && formatMessage({id: 'common.required'}),
                          },
                        }}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 4}}>
                    <AppTextField
                      name='age'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.age' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='gender'
                      fullWidth
                      disabled={isViewOnly}
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
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.gender' />}
                    /> */}
                  </Grid>
                  {/* <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='address'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.address' />}
                    />
                  </Grid> */}
                  <Grid size={{xs: 12, md: 9}}>
                    <TextField
                      name='postcode'
                      value={values.postcode}
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.postcode' />}
                      onChange={handlePostcodeChange}
                      error={Boolean(postcodeError)}
                      helperText={postcodeError}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='city'
                      fullWidth
                      disabled
                      label={<IntlMessages id='anran.member.city' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <FormControl
                      variant='outlined'
                      sx={{
                        width: '100%',
                      }}
                      disabled
                      error={errors.states ? true : false}
                    >
                      <InputLabel id='label-select-outlined-state'>
                        <IntlMessages id='common.selectState' />
                      </InputLabel>
                      <Field
                        name='states'
                        label={<IntlMessages id='common.selectState' />}
                        labelId='label-select-outlined-state'
                        as={Select}
                        sx={{
                          width: '100%',
                          mb: {xs: 4, xl: 6},
                        }}
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
                    {/* <AppTextField
                      name='states'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.states' />}
                    /> */}
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
                        disabled={isViewOnly}
                        value="local"
                        control={<Radio />}
                        label={formatMessage({id: 'member.type.local'})}
                      />
                      <FormControlLabel
                        disabled={isViewOnly}
                        value="foreign"
                        control={<Radio />}
                        label={formatMessage({id: 'member.type.foreign'})}
                      />
                    </RadioGroup>
                  </Grid>

                  {/* Mobile Number Field for Local */}
                  {!values.isForeign && (
                    <Grid container size={12} alignItems='center'>
                      <Grid size={{xs: 12, md: 12}}>
                        {branchList.length > 0 && (
                          <FormControl
                            disabled={isViewOnly}
                            fullWidth
                            error={errors?.preferredBranch}
                          >
                            <InputLabel id='demo-simple-select-label'>
                              <IntlMessages id='member.preferredBranch' />
                            </InputLabel>
                            <Field
                              name='preferredBranch'
                              label={formatMessage({id: 'member.preferredBranch'})}
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
                      <Grid size={{xs: 12, md: 12}}>
                        <MuiTelInput
                          disabled={isViewOnly}
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
                            disabled={isViewOnly}
                            fullWidth
                            error={errors?.preferredBranch}
                          >
                            <InputLabel id='demo-simple-select-label'>
                              <IntlMessages id='member.preferredBranch' />
                            </InputLabel>
                            <Field
                              name='preferredBranch'
                              label={formatMessage({id: 'member.preferredBranch'})}
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
                      <Grid size={{xs: 12, md: 12}}>
                        <MuiTelInput
                          disabled={isViewOnly}
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
                      <Grid size={{xs: 12, md: 12}}>
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
                          label={formatMessage({id: 'member.mobile.virtualLocal'})}
                          forceCallingCode
                          defaultCountry="MY"
                          onlyCountries={['MY']}
                          disableFormatting
                          disabled
                          value={values.mobileNumber}
                        />
                      </Grid>
                      {/* Button to generate dummy local mobile number */}
                      {/* <Grid size={{xs: 12, md: 1}} display='flex'>
                        <Tooltip title="Generate Dummy Local Mobile Number" arrow>
                          <IconButton
                            color="primary"
                            onClick={handleGenerateMobileNumber}
                          >
                            <RefreshOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid> */}
                    </Grid>
                  )}
                  {/* <Grid size={{xs: 12, md: 9}}>
                    <MuiTelInput
                      disabled={true}
                      error={errors?.mobileNumber}
                      helperText={
                        errors?.mobileNumber ? 'Number is invalid' : ''
                      }
                      fullWidth
                      label={<IntlMessages id='anran.member.mobileNumber' />}
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
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.mobileNumber' />}
                    /> */}
                  {/* </Grid>
                  {values.isForeign && (
                    <Grid size={{xs: 12, md: 6}}>
                      <MuiTelInput
                        disabled={isViewOnly}
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
                      disabled={isViewOnly}
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
                          color='primary'
                        />
                      }
                      label={<IntlMessages id='anran.member.isForeign' />}
                    />
                  </Grid> */}
                  <Grid size={{xs: 12, md: 12}}>
                    <Typography variant='h4'>
                      <IntlMessages id='member.status.title' />
                    </Typography>
                    <RadioGroup
                      row
                      name="memberStatus"
                      value={values.isDeleted ? "Deactivated" : "Active"}
                      onChange={(e) => {
                        const selection = e.target.value === "Deactivated";
                        setFieldValue('isDeleted', selection);
                      }}
                    >
                      <FormControlLabel
                        disabled={isViewOnly}
                        value="Active"
                        control={<Radio />}
                        label={formatMessage({id: 'member.status.active'})}
                      />
                      <FormControlLabel
                        disabled={isViewOnly}
                        value="Deactivated"
                        control={<Radio />}
                        label={formatMessage({id: 'member.status.deactivate'})}
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='email'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.emailAddress' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='aboutUs'
                      fullWidth
                      disabled={isViewOnly}
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
                    <Grid size={{xs: 12, md: 9}}>
                      <AppTextField
                        disabled={isViewOnly}
                        name='othersAboutUs'
                        fullWidth
                        label={
                          <IntlMessages id='member.aboutUs.othersSpecify' />
                        }
                      />
                    </Grid>
                  )}
                  <Grid size={{xs: 12, md: 9}}>
                    {branchList.length > 0 && (
                      <FormControl
                        fullWidth
                        error={errors?.preferredBranch}
                        disabled={isViewOnly}
                      >
                        <InputLabel id='demo-simple-select-label'>
                          <IntlMessages id='member.preferredBranch' />
                        </InputLabel>
                        <Field
                          name='preferredBranch'
                          label={formatMessage({id: 'member.preferredBranch'})}
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
                  <Grid size={{xs: 12, md: 9}}>
                    <DatePicker
                      sx={{width: '100%'}}
                      disabled={isViewOnly}
                      autoOk
                      format='YYYY/MM/DD'
                      variant='inline'
                      inputVariant='outlined'
                      label={
                        <IntlMessages id='anran.member.RegistrationDate' />
                      }
                      name='memberDate'
                      value={values.memberDate}
                      renderInput={(params) => <TextField {...params} />}
                      onChange={(value) => setFieldValue('memberDate', value)}
                      slotProps={{
                        textField: {
                          error: errors.memberDate ? true : false,
                          helperText:
                            errors.memberDate &&
                            formatMessage({id: 'common.required'}),
                        },
                      }}
                    />
                  </Grid>
                </AppGridContainer>
              </CardContent>
            </Card>
            {values.packageBalance ? (
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
                      <IntlMessages id='member.package.balance' />
                    </Box>
                  }
                ></CardHeader>
                <CardContent>
                  <AppGridContainer spacing={4}>
                    <Grid size={{xs: 12, md: 9}}>
                      <AppTextField
                        name='packageBalance'
                        fullWidth
                        disabled
                        label={formatMessage({id: 'member.package.balance'})}
                      />
                    </Grid>
                  </AppGridContainer>
                </CardContent>
              </Card>
            ) : null}
          </Grid>
          <Grid size={{xs: 12, md: 6}}>
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
                    <IntlMessages id='anran.member.MedicalDetails' />
                  </Box>
                }
              ></CardHeader>
              <CardContent>
                <AppGridContainer spacing={4}>
                  <Grid size={{xs: 12, md: 9}}>
                    <Box sx={{display: 'flex', flexDirectoin: 'collumn'}}>
                      <Grid size={{xs: 12, md: 12}}>
                        <FormLabel component='legend' sx={{mb: 5}}>
                          <IntlMessages id='member.medical.question' />
                        </FormLabel>
                        <Grid size={{xs: 12, md: 12}}>
                          <List
                            sx={{
                              width: '100%',
                              maxWidth: 360,
                              bgcolor: 'background.paper',
                            }}
                          >
                            {checked.map((value) => {
                              const labelId = `checkbox-list-label-${value.name}`;

                              return (
                                <ListItem key={value.name} disablePadding>
                                  <ListItemButton
                                    role={undefined}
                                    onClick={handleToggle(value)}
                                    dense
                                    disabled={isViewOnly}
                                  >
                                    <ListItemIcon>
                                      <Checkbox
                                        edge='start'
                                        checked={value.selected}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{
                                          'aria-labelledby': labelId,
                                        }}
                                      />
                                    </ListItemIcon>
                                    <ListItemText
                                      sx={{fontWeight: 'bold'}}
                                      id={labelId}
                                      // primary={`${value.name}`}
                                      primary={
                                        <Typography variant='h4' gutterBottom>
                                          {formatMessage({
                                            id:
                                              medicalLabelMap[value.name] ||
                                              value.name,
                                          })}
                                        </Typography>
                                      }
                                    />
                                  </ListItemButton>
                                </ListItem>
                              );
                            })}
                          </List>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='medicalHistory'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.member.medicalHistory' />}
                      multiline
                      rows={5}
                      error={touched.medicalHistory && Boolean(errors.medicalHistory)}
                      helperText={touched.medicalHistory && errors.medicalHistory}
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
                    <IntlMessages id='anran.member.EmergencyDetails' />
                  </Box>
                }
              ></CardHeader>
              <CardContent>
                <AppGridContainer spacing={4}>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='emergencyName'
                      fullWidth
                      disabled={isViewOnly}
                      label={
                        <IntlMessages id='anran.member.emergencyContactName' />
                      }
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <MuiTelInput
                      disabled={isViewOnly}
                      error={errors?.emergencyMobile}
                      helperText={
                        errors?.emergencyMobile
                          ? formatMessage({id: 'member.mobile.error.invalid'})
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
                      disabled={isViewOnly}
                      label={
                        <IntlMessages id='anran.member.emergencyContactMobileNumber' />
                      }
                    /> */}
                  </Grid>
                  <Grid size={{xs: 12, md: 9}}>
                    <AppTextField
                      name='emergencyRelationship'
                      fullWidth
                      disabled={isViewOnly}
                      label={
                        <IntlMessages id='anran.member.emergencyContactRelationship' />
                      }
                    />
                  </Grid>
                </AppGridContainer>
              </CardContent>
            </Card>
          </Grid>
        </AppGridContainer>
        <AppGridContainer spacing={4} sx={{mt: 4}}>
          {isViewOnly ? null : (
            <Grid size={{xs: 12, md: 12}}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
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
                  <IntlMessages id='common.saveChanges' />
                </Button>
                <Button
                  sx={{
                    position: 'relative',
                    minWidth: 100,
                    ml: 2.5,
                  }}
                  color='primary'
                  variant='outlined'
                  type='button'
                  onClick={onCancelClick}
                >
                  <IntlMessages id='common.cancel' />
                </Button>
              </Box>
            </Grid>
          )}
        </AppGridContainer>
      </Form>
    </>
  );
};

export default MemberDetailsForm;

MemberDetailsForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  touched: PropTypes.object,
  isViewOnly: PropTypes.bool,
  onViewOnly: PropTypes.func,
  reCallAPI: PropTypes.func,
  member: PropTypes.object,
  checked: PropTypes.array,
  setChecked: PropTypes.func,
  memberImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setMemberImage: PropTypes.func,
  setMemberImageUrl: PropTypes.func,
};