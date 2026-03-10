import React, {useState} from 'react';
import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  Box,
  FormHelperText,
  IconButton,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Formik, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import NoImageFound from '@anran/assets/images/empty.png';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {DatePicker} from '@mui/x-date-pickers';
import {MuiTelInput} from 'mui-tel-input';

const CreateStaff = ({
  open,
  onClose,
  reCallAPI,
  branchOptions,
  roleOptions,
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    staff_code: Yup.string().required('Staff Code is required'),
    gender: Yup.string().required('Gender is required'),
    branch: Yup.string().required('Branch is required'),
    roles: Yup.string().required('Role is required'),
    joinDate: Yup.string().required('Joined Date is required'),
    username: Yup.string().required('Username is required'),
    loginkey: Yup.string().required('Password is required'),
  });

  const initialValues = {
    name: '',
    staff_code: '',
    gender: '',
    profileimageurl: '',
    profileimagedata: '',
    branch: '',
    roles: '',
    joinDate: null,
    username: '',
    loginkey: '',
    status_active: true,
    emailaddress: '',
    position_department: '',
    fullname: '',
    nirc: '',
    religion: '',
    mobilenumber: '',
    martialstatus: '',
    currentaddress: '',
    bankname: '',
    bankaccountnumber: '',
    bankepfno: '',
    banksocsono: '',
    bankincometaxno: '',
    emergency_contactname: '',
    emergency_relation: '',
    emergency_contact: '',
  };

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

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={<CardHeader onCloseAddCard={onClose} title={'Create Staff'} />}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            console.log(values);
            console.log(imageData);
            console.log(imageUrl);
            formData.append('image', imageData);
            for (var key in values) {
              formData.append(key, values[key]);
            }
            try {
              const response = await postDataApi(
                '/api/staff',
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              setImageUrl(null);
              setImageData(null);
              infoViewActionsContext.showMessage('Added successfully!');
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant='h4'>Basic Information</Typography>
                </Grid>
                <Grid spacing={2} container size={8}>
                  {/* Name Field */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label='Name'
                      type='text'
                      variant='outlined'
                      value={values.name}
                      onChange={(event) => {
                        setFieldValue('name', event.target.value);
                      }}
                      margin='dense'
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
                      label='Staff Code'
                      type='text'
                      variant='outlined'
                      value={values.staff_code}
                      onChange={(event) => {
                        setFieldValue('staff_code', event.target.value);
                      }}
                      margin='dense'
                      helperText={
                        <ErrorMessage
                          name='staff_code'
                          render={(msg) => (
                            <span style={{color: 'red'}}>{msg}</span>
                          )}
                        />
                      }
                    />
                  </Grid>
                  {/* Gender Field */}
                  <Grid size={12}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name='gender'
                        label='Gender'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.gender}
                        onChange={(event) => {
                          setFieldValue('gender', event.target.value);
                        }}
                      >
                        <MenuItem value='Male'>Male</MenuItem>
                        <MenuItem value='Female'>Female</MenuItem>
                      </Select>
                      <ErrorMessage
                        name='gender'
                        component={FormHelperText}
                        style={{color: 'red'}}
                      />
                    </FormControl>
                  </Grid>
                  {/* Role Field */}
                  <Grid size={6}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel>Role</InputLabel>
                      <Select
                        name='role'
                        label='Role'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.roles}
                        onChange={(event) => {
                          setFieldValue('roles', event.target.value);
                        }}
                      >
                        {roleOptions.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.role}
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage
                        name='roles'
                        component={FormHelperText}
                        style={{color: 'red'}}
                      />
                    </FormControl>
                  </Grid>
                  {/* Branch Field */}
                  <Grid size={6}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel id='branch-select'>Branch</InputLabel>
                      <Select
                        name='branch'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        label='Branch'
                        value={values.branch}
                        onChange={(event) => {
                          setFieldValue('branch', event.target.value);
                        }}
                      >
                        {branchOptions.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.branch}
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage
                        name='branch'
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
                      label='Joined Date'
                      name='joinDate'
                      value={values.joinDate}
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
                    />
                  </Grid>
                </Grid>
                <Grid container size={4}>
                  {/* Image Field */}
                  <Grid size={12}>
                    <Box
                      {...dropzoneProps}
                      sx={{
                        height: '100%',
                        padding: '20px',
                        textAlign: 'center',
                        alignContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#eeeeee' : '#fafafa',
                        overflow: 'hidden',
                      }}
                    >
                      <input {...inputProps} />
                      {imageUrl ? (
                        <Avatar
                          src={imageUrl}
                          alt='Preview'
                          style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : isDragActive ? (
                        <Typography>Drop the image here ...</Typography>
                      ) : (
                        <Avatar
                          src={NoImageFound}
                          alt='Preview'
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='h4'>User Information</Typography>
                </Grid>
                {/* Username Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Username'
                    type='text'
                    variant='outlined'
                    value={values.username}
                    onChange={(event) => {
                      setFieldValue('username', event.target.value);
                    }}
                    margin='dense'
                    helperText={
                      <ErrorMessage
                        name='username'
                        render={(msg) => (
                          <span style={{color: 'red'}}>{msg}</span>
                        )}
                      />
                    }
                  />
                </Grid>
                {/* Password Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    variant='outlined'
                    value={values.loginkey}
                    onChange={(event) => {
                      setFieldValue('loginkey', event.target.value);
                    }}
                    margin='dense'
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
                        name='loginkey'
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
                    label='Email'
                    type='email'
                    variant='outlined'
                    value={values.emailaddress}
                    onChange={(event) => {
                      setFieldValue('emailaddress', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Position Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Position'
                    type='text'
                    variant='outlined'
                    value={values.position_department}
                    onChange={(event) => {
                      setFieldValue('position_department', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='h4'>Staff Details</Typography>
                </Grid>
                {/* Full Name Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Full Name'
                    type='text'
                    variant='outlined'
                    value={values.fullname}
                    onChange={(event) => {
                      setFieldValue('fullname', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* NRIC Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='NRIC'
                    type='text'
                    variant='outlined'
                    value={values.nirc}
                    onChange={(event) => {
                      setFieldValue('nirc', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Mobile Field */}
                <Grid size={5}>
                  <MuiTelInput
                    margin='dense'
                    fullWidth
                    label='Mobile No.'
                    forceCallingCode
                    defaultCountry='MY'
                    onlyCountries={['MY']}
                    disableFormatting
                    value={values.mobilenumber}
                    onChange={(event) => {
                      setFieldValue('mobilenumber', event);
                    }}
                  />
                </Grid>
                {/* Religion Field */}
                <Grid size={3.5}>
                  <TextField
                    fullWidth
                    label='Religion'
                    type='text'
                    variant='outlined'
                    value={values.religion}
                    onChange={(event) => {
                      setFieldValue('religion', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Martial Status Field */}
                <Grid size={3.5}>
                  <TextField
                    fullWidth
                    label='Martial Status'
                    type='text'
                    variant='outlined'
                    value={values.martialstatus}
                    onChange={(event) => {
                      setFieldValue('martialstatus', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Address Field */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label='Address'
                    type='text'
                    multiline
                    rows={3}
                    variant='outlined'
                    value={values.currentaddress}
                    onChange={(event) => {
                      setFieldValue('currentaddress', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='h4'>Financial Details</Typography>
                </Grid>
                {/* Bank Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Bank Name'
                    type='text'
                    variant='outlined'
                    value={values.bankname}
                    onChange={(event) => {
                      setFieldValue('bankname', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Bank Account Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Bank Account No.'
                    type='text'
                    variant='outlined'
                    value={values.bankaccountnumber}
                    onChange={(event) => {
                      setFieldValue('bankaccountnumber', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* EPF Account Field */}
                <Grid size={5}>
                  <TextField
                    fullWidth
                    label='EPF No.'
                    type='text'
                    variant='outlined'
                    value={values.bankepfno}
                    onChange={(event) => {
                      setFieldValue('bankepfno', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* SOCSO Field */}
                <Grid size={3.5}>
                  <TextField
                    fullWidth
                    label='SOCSO No.'
                    type='text'
                    variant='outlined'
                    value={values.banksocsono}
                    onChange={(event) => {
                      setFieldValue('banksocsono', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Income Tax Field */}
                <Grid size={3.5}>
                  <TextField
                    fullWidth
                    label='Income Tax No.'
                    type='text'
                    variant='outlined'
                    value={values.bankincometaxno}
                    onChange={(event) => {
                      setFieldValue('bankincometaxno', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='h4'>Emergency Contact</Typography>
                </Grid>
                {/* Contact Name EC Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Contact Name'
                    type='text'
                    variant='outlined'
                    value={values.emergency_contactname}
                    onChange={(event) => {
                      setFieldValue(
                        'emergency_contactname',
                        event.target.value,
                      );
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Relation EC Field */}
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label='Relation'
                    type='text'
                    variant='outlined'
                    value={values.emergency_relation}
                    onChange={(event) => {
                      setFieldValue('emergency_relation', event.target.value);
                    }}
                    margin='dense'
                  />
                </Grid>
                {/* Contact No. EC Field */}
                <Grid size={12}>
                  <MuiTelInput
                    margin='dense'
                    fullWidth
                    label='Contact No.'
                    forceCallingCode
                    defaultCountry='MY'
                    onlyCountries={['MY']}
                    disableFormatting
                    value={values.emergency_contact}
                    onChange={(event) => {
                      setFieldValue('emergency_contact', event);
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Typography variant='h4'>Other Settings</Typography>
                </Grid>
                {/* Status Field */}
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
                        fontWeight: values.status_active ? 'normal' : 'bold',
                        color: values.status_active ? 'gray' : 'red',
                      }}
                    >
                      Inactive
                    </Typography>
                    <Switch
                      checked={values.status_active}
                      onChange={(event) => {
                        setFieldValue('status_active', event.target.checked);
                      }}
                      inputProps={{'aria-label': 'controlled'}}
                    />
                    <Typography
                      style={{
                        fontWeight: values.status_active ? 'bold' : 'normal',
                        color: values.status_active ? 'green' : 'gray',
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {/* Save Button */}
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
          )}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default CreateStaff;

CreateStaff.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  roleOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      role_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
