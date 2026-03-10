import React from 'react';
import {alpha, Box, Button, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import {Field, Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {useDropzone} from 'react-dropzone';
import CardMedia from '@mui/material/CardMedia';
import {styled} from '@mui/material/styles';
import NoImageFound from '@anran/assets/images/empty.png';
import countries from '@anran/services/db/countries/appCountries';
import {MuiTelInput} from 'mui-tel-input';
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

const AddBranchForm = ({
  values,
  errors,
  setFieldValue,
  setBranchImageUrl,
  setBranchImage,
  branchImage,
  hqStatusError,
}) => {
  const {formatMessage} = useIntl();
  const [{apiData: areaList}] = useGetDataApi('api/area', {}, {}, true);
  const [stateList, setStateList] = React.useState([]);
  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setBranchImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setBranchImage(acceptedFiles[0]);
    },
  });

  React.useEffect(() => {
    setStateList(countries[0].regions);
  }, []);

  const handleHQStatusChange = (event) => {
    setFieldValue('hqStatus', event.target.checked);
  };

  const handleFranchiseStatusChange = (event) => {
    setFieldValue('isFranchise', event.target.checked);
  };

  const handleStatusChange = (event) => {
    setFieldValue('branchStatus', event.target.checked);
  };
  console.log('values', values, errors);

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 5,
          ml: -6,
          mr: -6,
        }}
      >
        <Box
          sx={{
            pb: 5,
            px: 5,
            // mx: -5,
            mb: 5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              component='h6'
              sx={{
                mb: {xs: 4, xl: 6},
                mt: 0,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              <IntlMessages id='admin.branch.section.info' />
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid container size={{xs: 12, md: 12}} spacing={2}>
              <Grid size={{xs: 12, md: 4}}>
                <FormControl
                  error={hqStatusError && values.hqStatus}
                  disabled={values.isFranchise ? true : false}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.hqStatus}
                        onChange={handleHQStatusChange}
                      />
                    }
                    label={formatMessage({id: 'admin.branch.form.isHq'})}
                  />
                  {hqStatusError && values.hqStatus && (
                    <FormHelperText>
                      <Typography color='error' variant='caption'>
                        <IntlMessages id='admin.branch.form.hqExists' />
                      </Typography>
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{xs: 12, md: 4}}>
                <FormControlLabel
                  disabled={values.hqStatus ? true : false}
                  control={
                    <Checkbox
                      checked={values.isFranchise}
                      onChange={handleFranchiseStatusChange}
                    />
                  }
                  label={formatMessage({id: 'admin.branch.form.isFranchise'})}
                />
              </Grid>
              <Grid size={{xs: 12, md: 4}}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.branchStatus}
                      onChange={handleStatusChange}
                    />
                  }
                  label={formatMessage({id: 'admin.branch.form.isOperation'})}
                />
              </Grid>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <AppTextField
                fullWidth
                name='branchName'
                label={<IntlMessages id='anran.branchName' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 3}}>
              <AppTextField
                name='branchCode'
                fullWidth
                label={<IntlMessages id='anran.branchCode' />}
              />
            </Grid>
            <Grid size={3}>
              <AppTextField
                fullWidth
                name='branchMobilePrefix'
                label={<IntlMessages id='admin.branch.form.mobilePrefix' />}
                InputProps={{
                  maxLength: 2,
                  inputProps: {min: 0},
                  type: 'number',
                  sx: {
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                      {
                        display: 'none',
                      },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                  },
                }}
                onInput={(e) => {
                  if (e.target.value.length > 2) {
                    e.target.value = e.target.value.slice(0, 2);
                  }
                }}
                onWheel={(event) => event.currentTarget.blur()}
              />
            </Grid>
            <Grid size={12}>
              <AppTextField
                fullWidth
                name='branchAddress'
                label={<IntlMessages id='anran.branchAddress' />}
              />
            </Grid>
            <Grid size={6}>
              <FormControl
                variant='outlined'
                sx={{
                  width: '100%',
                }}
                error={errors.branchState ? true : false}
              >
                <InputLabel id='label-select-outlined-state'>
                  <IntlMessages id='common.selectState' />
                </InputLabel>
                <Field
                  name='branchState'
                  label={<IntlMessages id='common.selectState' />}
                  labelId='label-select-outlined-state'
                  as={Select}
                  sx={{
                    width: '100%',
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
            </Grid>
            <Grid size={6}>
              <AppTextField
                fullWidth
                name='branchCity'
                label={<IntlMessages id='anran.city' />}
              />
            </Grid>
            <Grid size={6}>
              <AppTextField
                fullWidth
                name='branchPostcode'
                label={<IntlMessages id='anran.postcode' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              {areaList.length > 0 && (
                <FormControl fullWidth error={errors?.areaName}>
                  <InputLabel id='demo-simple-select-label'>
                    <IntlMessages id='admin.branch.form.areaLabel' />
                  </InputLabel>
                  <Select
                    name='area'
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    label={formatMessage({id: 'admin.branch.form.areaLabel'})}
                    value={values.area}
                    onChange={(event) => {
                      setFieldValue('area', event.target.value);
                    }}
                  >
                    {areaList?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id}
                        sx={{
                          padding: 2,
                          cursor: 'pointer',
                          minHeight: 'auto',
                        }}
                      >
                        {item.areaName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid size={6}>
              <AppTextField
                fullWidth
                name='customerCode'
                label={<IntlMessages id='admin.branch.form.customerCode' />}
              />
            </Grid>
            <Grid size={6}>
              <AppTextField
                fullWidth
                name='accountCode'
                label={<IntlMessages id='admin.branch.form.accountCode' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 8}}>
              <AppGridContainer spacing={4}>
                <Grid size={12}>
                  <AppTextField
                    name='googleLink'
                    fullWidth
                    label={<IntlMessages id='common.googleLink' />}
                  />
                </Grid>
                <Grid size={12}>
                  <AppTextField
                    fullWidth
                    name='wazeLink'
                    label={<IntlMessages id='common.wazeLink' />}
                  />
                </Grid>
                <Grid size={12}>
                  <MuiTelInput
                    error={errors?.branchContactNumber}
                    helperText={
                      errors?.branchContactNumber
                        ? formatMessage({
                            id: 'admin.branch.form.contactNumberInvalid',
                          })
                        : ''
                    }
                    label={formatMessage({
                      id: 'admin.branch.form.contactMobileNumber',
                    })}
                    forceCallingCode
                    defaultCountry='MY'
                    onlyCountries={['MY']}
                    disableFormatting
                    value={values.branchContactNumber}
                    onChange={(newValue) => {
                      setFieldValue('branchContactNumber', newValue);
                    }}
                  />
                  {/* <AppTextField
                    fullWidth
                    name='branchContactNumber'
                    label={<IntlMessages id='common.contact' />}
                  /> */}
                </Grid>
              </AppGridContainer>
            </Grid>
            <Grid size={{xs: 12, md: 4}}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: {xs: 5, lg: 6},
                }}
              >
                <AvatarViewWrapper {...getRootProps({className: 'dropzone'})}>
                  <input {...getInputProps()} />
                  <label htmlFor='icon-button-file'>
                    <CardMedia
                      component='img'
                      height='194'
                      image={branchImage ? branchImage : NoImageFound}
                      alt='Paella dish'
                    />
                  </label>
                </AvatarViewWrapper>
              </Box>
            </Grid>
          </AppGridContainer>
          <Box
            component='h6'
            sx={{
              mb: {xs: 4, xl: 6},
              mt: 0,
              fontSize: 14,
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            <IntlMessages id='admin.branch.section.operationHours' />
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={{xs: 12, md: 6}}>
              <TimePicker
                label={<IntlMessages id='anran.branch.openTime' />}
                name='operatingStart'
                onChange={(newValue) =>
                  setFieldValue('operatingStart', newValue)
                }
              />
              {errors.operatingStart && (
                <FormHelperText style={{color: '#f44336'}}>
                  {errors.operatingStart}
                </FormHelperText>
              )}
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <TimePicker
                label={<IntlMessages id='anran.branch.closeTime' />}
                name='operatingEnd'
                onChange={(newValue) => setFieldValue('operatingEnd', newValue)}
              />
              {errors.operatingEnd && (
                <FormHelperText style={{color: '#f44336'}}>
                  {errors.operatingEnd}
                </FormHelperText>
              )}
            </Grid>
          </AppGridContainer>
          {/* <Box
            component='h6'
            sx={{
              mb: {xs: 4, xl: 6},
              mt: 0,
              fontSize: 14,
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            Contact Person:
          </Box>
          <AppGridContainer spacing={4}>
            <Grid item xs={12} md={6}>
              <AppTextField
                name='whatsappNo'
                fullWidth
                label={<IntlMessages id='common.whatsappNo' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AppTextField
                fullWidth
                name='staffName'
                label={<IntlMessages id='common.staffName' />}
              />
            </Grid>
          </AppGridContainer> */}
          {/* <Box
            component='h6'
            sx={{
              mb: {xs: 4, xl: 6},
              mt: 0,
              fontSize: 14,
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            Financial Info:
          </Box>
          <AppGridContainer spacing={4}>
            <Grid item xs={12} md={6}>
              <AppTextField
                name='paymentKey'
                fullWidth
                label={<IntlMessages id='common.paymentKey' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AppTextField
                fullWidth
                name='apiKey'
                label={<IntlMessages id='common.apiKey' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AppTextField
                name='taxStatus'
                fullWidth
                label={<IntlMessages id='common.taxStatus' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AppTextField
                fullWidth
                name='taxPercent'
                label={<IntlMessages id='common.taxPercent' />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AppTextField
                fullWidth
                name='branchPercent'
                label={<IntlMessages id='common.branchPercent' />}
              />
            </Grid>
          </AppGridContainer> */}
        </Box>
      </Box>
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
          disabled={hqStatusError && values.hqStatus}
        >
          <IntlMessages id='common.save' />
        </Button>
      </Box>
    </Form>
  );
};

export default AddBranchForm;
AddBranchForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  hqStatusError: PropTypes.bool,
  branchImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBranchImage: PropTypes.func,
  setBranchImageUrl: PropTypes.func,
};
