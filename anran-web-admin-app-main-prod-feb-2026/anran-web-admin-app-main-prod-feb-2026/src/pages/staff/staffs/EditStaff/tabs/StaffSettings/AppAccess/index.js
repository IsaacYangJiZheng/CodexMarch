import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  Autocomplete,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import AppGridContainer from '@anran/core/AppGridContainer';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import {Formik, Form, ErrorMessage} from 'formik';
import IntlMessages from '@anran/utility/IntlMessages';
import * as Yup from 'yup';
import {useIntl} from 'react-intl';

const AppAccess = ({rawData, roleOptions, branchOptions, reCallAPI}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [isEdit, setIsEdit] = useState(false);
  const initialValues = {
    roles: rawData.roles._id,
    branch: rawData.branch.map((branch) => branch._id),
    statusActive: rawData.statusActive,
  };
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        branch: Yup.array().required(
          formatMessage({id: 'staff.validation.branchRequired'}),
        ),
        roles: Yup.string().required(
          formatMessage({id: 'staff.validation.roleRequired'}),
        ),
      }),
    [formatMessage],
  );

  return (
    <Box
      sx={{
        mb: 2,
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Box>
          <Typography variant='h4'>
            {formatMessage({id: 'staff.settings.title'})}
          </Typography>
          <Typography variant='body1' sx={{mt: 2, color: 'text.secondary'}}>
            {formatMessage({id: 'staff.settings.subtitle'})}
          </Typography>
        </Box>
        <Box>
          {!isEdit && (
            <EditIcon
              sx={{cursor: 'pointer'}}
              onClick={() => setIsEdit(true)}
            />
          )}
        </Box>
      </Box>
      <Divider sx={{my: 4}} />
      <Formik
        enableReinitialize={true}
        validateOnBlur={true}
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={async (values, {setSubmitting}) => {
          setSubmitting(true);
          const formData = new FormData();
          formData.append('roles', values.roles);
          formData.append('branch', JSON.stringify(values.branch));
          formData.append('statusActive', values.statusActive);
          try {
            const response = await putDataApi(
              `/api/staff/${rawData._id}`,
              infoViewActionsContext,
              formData,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            );
            console.log('Response from API:', response);
            reCallAPI();
            setIsEdit(false);
            infoViewActionsContext.showMessage(
              formatMessage({id: 'staff.message.updated'}),
            );
          } catch (error) {
            infoViewActionsContext.fetchError(error.message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({values, setFieldValue, resetForm}) => {
          return (
            <Form>
              <AppGridContainer>
                {/* Roles Field */}
                <Grid size={12}>
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
                      disabled={!isEdit}
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role._id} value={role._id}>
                          {role.role}
                        </MenuItem>
                      ))}
                    </Select>
                    <ErrorMessage
                      name='branch'
                      component={FormHelperText}
                      error
                    />
                  </FormControl>
                </Grid>
                {/* Branch Field */}
                <Grid size={12}>
                  <FormControl fullWidth margin='dense'>
                    <Autocomplete
                      disabled={!isEdit}
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
                          label={<IntlMessages id='common.selectBranches' />}
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
                      disabled={!isEdit}
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
              {isEdit && (
                <Stack
                  direction='row'
                  justifyContent='flex-end'
                  spacing={5}
                  sx={{mt: 3}}
                >
                  <Button
                    sx={{color: 'text.secondary'}}
                    onClick={() => {
                      setIsEdit(false);
                      resetForm();
                    }}
                  >
                    {formatMessage({id: 'common.cancel'})}
                  </Button>
                  <Button variant='contained' color='primary' type='submit'>
                    {formatMessage({id: 'common.save'})}
                  </Button>
                </Stack>
              )}
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};
export default AppAccess;

AppAccess.propTypes = {
  rawData: PropTypes.object,
  branchOptions: PropTypes.array,
  roleOptions: PropTypes.array,
  reCallAPI: PropTypes.func,
};