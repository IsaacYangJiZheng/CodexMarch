import React, {useState} from 'react';
import AppGridContainer from '@anran/core/AppGridContainer';
import IntlMessages from '@anran/utility/IntlMessages';
import {useDropzone} from 'react-dropzone';
import {Form, ErrorMessage} from 'formik';
import {
  alpha,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
  IconButton,
  Card,
  CardContent,
  Avatar,
  FormHelperText,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';
import {MuiTelInput} from 'mui-tel-input';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import PropTypes from 'prop-types';
import {styled} from '@mui/material/styles';
import NoImageFound from '@anran/assets/images/empty.png';
import ImageViewer from '../../../../../widgets/ImageViewer';
import dayjs from 'dayjs';
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

const StaffInfoForm = ({
  errors,
  values,
  setFieldValue,
  isViewOnly,
  setImageUrl,
  setImageData,
  imageUrl,
  onViewOnly,
}) => {
  const {formatMessage} = useIntl();
  console.log('values', values);
  const [showImage, setShowImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Image Dropzone
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setImageData(acceptedFiles[0]);
    },
  });

  const dropzoneProps = getRootProps();
  const inputProps = getInputProps();

  const onCancelClick = () => {
    onViewOnly(true);
  };

  const onImageClick = () => {
    setShowImage(true);
  };

  return (
    <>
      <Form noValidate autoComplete='off'>
        <Card variant='outlined' sx={{mt: 2}}>
          <CardContent>
            <AppGridContainer spacing={4}>
              <Grid size={12}>
                <Typography variant='h4'>
                  {formatMessage({id: 'staff.section.basicInfo'})}
                </Typography>
              </Grid>
              <Grid container spacing={2} size={10}>
                {/* Name Field */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={formatMessage({id: 'staff.field.name'})}
                    type='text'
                    variant='outlined'
                    value={values.name}
                    onChange={(event) => {
                      setFieldValue('name', event.target.value);
                    }}
                    margin='dense'
                    disabled={isViewOnly}
                    helperText={
                      <ErrorMessage
                        name='name'
                        render={(msg) => (
                          <span style={{color: 'red'}}>{msg}</span>
                        )}
                      />
                    }
                  />
                </Grid>
                {/* Staff Code Field */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={formatMessage({id: 'staff.field.staffCode'})}
                    type='text'
                    variant='outlined'
                    value={values.staffCode}
                    onChange={(event) => {
                      setFieldValue(
                        'staffCode',
                        event.target.value.toUpperCase().replace(/\s/g, ''),
                      );
                      setFieldValue(
                        'userName',
                        event.target.value.toUpperCase().replace(/\s/g, ''),
                      );
                    }}
                    margin='dense'
                    disabled
                  />
                </Grid>
                {/* Gender Field */}
                <Grid size={12}>
                  <FormControl fullWidth margin='dense'>
                    <InputLabel>
                      {formatMessage({id: 'staff.field.gender'})}
                    </InputLabel>
                    <Select
                      name='gender'
                      label={formatMessage({id: 'staff.field.gender'})}
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={values.gender}
                      onChange={(event) => {
                        setFieldValue('gender', event.target.value);
                      }}
                      disabled={isViewOnly}
                    >
                      <MenuItem value='Male'>
                        {formatMessage({id: 'staff.gender.male'})}
                      </MenuItem>
                      <MenuItem value='Female'>
                        {formatMessage({id: 'staff.gender.female'})}
                      </MenuItem>
                    </Select>
                    <ErrorMessage
                      name='gender'
                      component={FormHelperText}
                      style={{color: 'red'}}
                    />
                  </FormControl>
                </Grid>
                {/* Date Field */}
                <Grid size={12}>
                  <DatePicker
                    sx={{width: '100%'}}
                    variant='outlined'
                    label={formatMessage({id: 'staff.field.joinDate'})}
                    name='joinDate'
                    value={values.joinDate ? dayjs(values.joinDate) : null}
                    renderInput={(params) => <TextField {...params} />}
                    onChange={(value) => setFieldValue('joinDate', value)}
                    slotProps={{
                      textField: {
                        margin: 'dense',
                        helperText: (
                          <ErrorMessage
                            name='joinDate'
                            render={(msg) => (
                              <span style={{color: 'red'}}>{msg}</span>
                            )}
                          />
                        ),
                      },
                    }}
                    disabled={isViewOnly}
                  />
                </Grid>
              </Grid>
              <Grid container size={2}>
                {/* Image Field */}
                <Grid size={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: {xs: 5, lg: 6},
                    }}
                  >
                    {isViewOnly ? (
                      <Avatar
                        variant='square'
                        src={imageUrl ? imageUrl : NoImageFound}
                        alt={formatMessage({id: 'staff.image.previewAlt'})}
                        style={{
                          height: '135px',
                          width: '105px',
                          objectFit: 'contain',
                        }}
                        onClick={onImageClick}
                      />
                    ) : (
                      <AvatarViewWrapper {...dropzoneProps}>
                        <input {...inputProps} />
                        {imageUrl ? (
                          <Avatar
                            variant='square'
                            src={imageUrl ? imageUrl : NoImageFound}
                            alt={formatMessage({id: 'staff.image.previewAlt'})}
                            style={{
                              height: '135px',
                              width: '105px',
                              objectFit: 'contain',
                            }}
                          />
                        ) : isDragActive ? (
                          <Typography>
                            {formatMessage({id: 'staff.image.dropHere'})}
                          </Typography>
                        ) : (
                          <Avatar
                            variant='square'
                            src={NoImageFound}
                            alt={formatMessage({id: 'staff.image.previewAlt'})}
                            style={{
                              width: '135px',
                              height: '105px',
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </AvatarViewWrapper>
                    )}
                  </Box>
                </Grid>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant='h4'>
                  {formatMessage({id: 'staff.section.userInfo'})}
                </Typography>
              </Grid>
              {/* Username Field */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={formatMessage({id: 'staff.field.username'})}
                  type='text'
                  variant='outlined'
                  value={values.userName}
                  margin='dense'
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
                  disabled={isViewOnly}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge='end'
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
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
                  disabled={isViewOnly}
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
              {/* Position Field */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={formatMessage({id: 'staff.field.position'})}
                  type='text'
                  variant='outlined'
                  value={values.positionDepartment}
                  onChange={(event) => {
                    setFieldValue('positionDepartment', event.target.value);
                  }}
                  margin='dense'
                  disabled={isViewOnly}
                  helperText={
                    <ErrorMessage
                      name='positionDepartment'
                      render={(msg) => (
                        <span style={{color: 'red'}}>{msg}</span>
                      )}
                    />
                  }
                />
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant='h4'>
                  {formatMessage({id: 'staff.section.details'})}
                </Typography>
              </Grid>
              {/* Full Name Field */}
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
                  disabled={isViewOnly}
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
                  disabled={isViewOnly}
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
              <Grid size={5}>
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
                  disabled={isViewOnly}
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
              {/* Religion Field */}
              <Grid size={3.5}>
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
                    disabled={isViewOnly}
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
              <Grid size={3.5}>
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
                      setFieldValue('martialStatus', event.target.value);
                    }}
                    disabled={isViewOnly}
                  >
                    <MenuItem value='Married'>
                      {formatMessage({id: 'staff.marital.married'})}
                    </MenuItem>
                    <MenuItem value='Single'>
                      {formatMessage({id: 'staff.marital.single'})}
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
                  disabled={isViewOnly}
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
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant='h4'>
                  {formatMessage({id: 'staff.section.finance'})}
                </Typography>
              </Grid>
              {/* Bank Field */}
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
                  disabled={isViewOnly}
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
                    setFieldValue('bankAccountNumber', event.target.value);
                  }}
                  margin='dense'
                  disabled={isViewOnly}
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
                  disabled={isViewOnly}
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
                  disabled={isViewOnly}
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
                  disabled={isViewOnly}
                />
              </Grid>
              {/* Over Time Field */}
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
                    disabled={isViewOnly}
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
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant='h4'>
                  {formatMessage({id: 'staff.section.emergency'})}
                </Typography>
              </Grid>
              {/* Contact Name EC Field */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={formatMessage({id: 'staff.field.contactName'})}
                  type='text'
                  variant='outlined'
                  value={values.emergencyContactName}
                  onChange={(event) => {
                    setFieldValue('emergencyContactName', event.target.value);
                  }}
                  margin='dense'
                  disabled={isViewOnly}
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
                    setFieldValue('emergencyRelation', event.target.value);
                  }}
                  margin='dense'
                  disabled={isViewOnly}
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
                  disabled={isViewOnly}
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
        {/* Button */}
        <AppGridContainer spacing={4} sx={{mt: 4}}>
          {isViewOnly ? null : (
            <Grid size={12}>
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
      <ImageViewer
        isOpen={showImage}
        data={{docName: 'image', document: imageUrl}}
        onClose={() => setShowImage(false)}
      />
    </>
  );
};

export default StaffInfoForm;
StaffInfoForm.propTypes = {
  errors: PropTypes.object,
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  isViewOnly: PropTypes.bool,
  imageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setImageData: PropTypes.func,
  setImageUrl: PropTypes.func,
  onViewOnly: PropTypes.func,
  reCallAPI: PropTypes.func,
  staff: PropTypes.object,
};