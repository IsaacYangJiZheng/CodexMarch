import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormHelperText,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  Avatar,
  CardHeader,
  CardContent,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import IntlMessages from '@anran/utility/IntlMessages';
import AppGridContainer from '@anran/core/AppGridContainer';
import {Fonts} from 'shared/constants/AppEnums';
import {useDropzone} from 'react-dropzone';
import {Form, Formik, ErrorMessage} from 'formik';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import NoImageFound from '@anran/assets/images/empty.png';
import {DatePicker} from '@mui/x-date-pickers';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useIntl} from 'react-intl';

const StaffBasic = ({
  branchOptions,
  roleOptions,
  formData,
  setFormData,
  activeStep,
  setActiveStep,
}) => {
  const {formatMessage} = useIntl();
  console.log(branchOptions);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [imageUrl, setImageUrl] = React.useState(
    formData?.profileImageUrl || null,
  );
  const [imageData, setImageData] = React.useState(
    formData?.profileImageData || null,
  );
  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        name: Yup.string().required(
          formatMessage({id: 'staff.validation.nameRequired'}),
        ),
        staffCode: Yup.string().required(
          formatMessage({id: 'staff.validation.staffCodeRequired'}),
        ),
        gender: Yup.string().required(
          formatMessage({id: 'staff.validation.genderRequired'}),
        ),
        branch: Yup.array().required(
          formatMessage({id: 'staff.validation.branchRequired'}),
        ),
        roles: Yup.string().required(
          formatMessage({id: 'staff.validation.roleRequired'}),
        ),
        joinDate: Yup.string().required(
          formatMessage({id: 'staff.validation.joinDateRequired'}),
        ),
        positionDepartment: Yup.string().required(
          formatMessage({id: 'staff.validation.positionRequired'}),
        ),
      }),
    [formatMessage],
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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

  const isStaffCodeinUse = async (code) => {
    const postData = new FormData();
    postData.append('code', code);

    return postDataApi(
      'api/staff/checkStaffCodeExist',
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
  };

  return (
    <Formik
      initialValues={{
        name: formData?.name ? formData.name : '',
        staffCode: formData?.staffCode ? formData.staffCode : '',
        gender: formData?.gender ? formData.gender : '',
        profileImageUrl: formData?.profileImageUrl
          ? formData.profileImageUrl
          : '',
        profileImageData: formData?.profileImageData
          ? formData.profileImageData
          : '',
        branch: formData?.branch ? formData.branch : [],
        roles: formData?.roles ? formData.roles : '',
        positionDepartment: formData?.positionDepartment
          ? formData.positionDepartment
          : '',
        joinDate: formData?.joinDate ? formData.joinDate : null,
      }}
      validationSchema={validationSchema}
      onSubmit={async (data, {setFieldError}) => {
        console.log('***************', data);
        let flag = true;
        flag = await isStaffCodeinUse(data.staffCode)
          .then((result) => {
            return result;
          })
          .catch(() => {
            return false;
          });
        if (!flag) {
          const consolidatedData = {
            ...data,
            profileImageUrl: imageUrl,
            profileImageData: imageData,
          };
          setFormData(consolidatedData);
          setActiveStep(activeStep + 1);
        } else {
          setFieldError(
            'staffCode',
            formatMessage({id: 'staff.validation.staffCodeExists'}),
          );
          return;
        }
      }}
    >
      {({values, setFieldValue}) => (
        <Form autoComplete='off'>
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
                      {formatMessage({id: 'staff.section.basicInfo'})}
                    </Box>
                  }
                />
                <CardContent>
                  <AppGridContainer spacing={2}>
                    <Grid container size={9}>
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
                              event.target.value
                                .toUpperCase()
                                .replace(/\s/g, ''),
                            );
                          }}
                          margin='dense'
                          helperText={
                            <ErrorMessage
                              name='staffCode'
                              render={(msg) => (
                                <span style={{color: 'red'}}>{msg}</span>
                              )}
                            />
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid container size={3}>
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
                            backgroundColor: isDragActive
                              ? '#eeeeee'
                              : '#fafafa',
                            overflow: 'hidden',
                          }}
                        >
                          <input {...inputProps} />
                          {imageUrl ? (
                            <Avatar
                              variant='square'
                              src={imageUrl}
                              alt={formatMessage({id: 'staff.image.previewAlt'})}
                              style={{
                                height: '100px',
                                width: '100%',
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
                                height: '100px',
                                width: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                    {/* Gender Field */}
                    <Grid size={6}>
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
                    <Grid size={6}>
                      <DatePicker
                        sx={{width: '100%'}}
                        variant='outlined'
                        label={formatMessage({id: 'staff.field.joinDate'})}
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
                    {/* Role Field */}
                    <Grid size={6}>
                      <FormControl fullWidth margin='dense'>
                        <InputLabel>
                          {formatMessage({id: 'staff.field.role'})}
                        </InputLabel>
                        <Select
                          name='role'
                          label={formatMessage({id: 'staff.field.role'})}
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
                    {/* Position Field */}
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label={formatMessage({id: 'staff.field.position'})}
                        type='text'
                        variant='outlined'
                        value={values.positionDepartment}
                        onChange={(event) => {
                          setFieldValue(
                            'positionDepartment',
                            event.target.value,
                          );
                        }}
                        margin='dense'
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
                    {/* Branch Field */}
                    <Grid size={12}>
                      <FormControl fullWidth margin='dense'>
                        <Autocomplete
                          multiple
                          id='branch-autocomplete'
                          options={branchOptions}
                          getOptionLabel={(option) => option.branch || ''}
                          value={
                            Array.isArray(values.branch)
                              ? branchOptions.filter((branch) =>
                                  values.branch.includes(branch._id),
                                )
                              : []
                          }
                          isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                          }
                          filterOptions={(options, params) => {
                            const filtered = options.filter((option) => {
                              const optionName = option.branch || '';
                              return optionName
                                .toLowerCase()
                                .includes(params.inputValue.toLowerCase());
                            });
                            return filtered;
                          }}
                          onChange={(event, value) => {
                            const branchIds = value.map((branch) => branch._id);
                            setFieldValue('branch', branchIds);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant='outlined'
                              label={
                                <IntlMessages id='common.selectBranches' />
                              }
                              fullWidth
                            />
                          )}
                        />
                        <ErrorMessage
                          name='branch'
                          component={FormHelperText}
                          style={{color: 'red'}}
                        />
                      </FormControl>
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
      )}
    </Formik>
  );
};

StaffBasic.propTypes = {
  filteredStaffDatabase: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
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

export default StaffBasic;