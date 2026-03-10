import React from 'react';
import {
  Box,
  TextField,
  // FormGroup,
  // FormControlLabel,
  // Checkbox,
  Button,
  Switch,
  Typography,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  FormHelperText,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PropTypes from 'prop-types';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import PermissionSection from '../PermissionCheckbox';
import CardHeader from './CardHeader';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useIntl} from 'react-intl';

const CreateRole = ({
  open,
  onClose,
  reCallAPI,
  roles,
  // branchDatabase,
  permissions,
  setPermissions,
}) => {
  const {formatMessage} = useIntl();  
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = Yup.object().shape({
    roleName: Yup.string().required(
      formatMessage({id: 'role.validation.nameRequired'}),
    ),
    // branch: Yup.string().when('allBranch', {
    //   is: false,
    //   then: () =>
    //     Yup.string().required(
    //       'Branch is required if All Branch is not checked',
    //     ),
    // }),
  });

  // Initial values for Formik
  const initialValues = {
    roleName: '',
    allBranch: false,
    branch: '',
    active: true,
  };

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={onClose}
            title={<IntlMessages id='role.dialog.createTitle' />}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const roleData = {
              role_name: values.roleName,
              // all_branch: values.allBranch,
              branch: values.allBranch ? null : values.branch,
              status_active: values.active,
              ...permissions,
            };
            console.log(
              'Role data to be saved:',
              JSON.stringify(roleData, null, 2),
            );
            try {
              const response = await postDataApi(
                '/api/roles',
                infoViewActionsContext,
                roleData,
                false,
                {
                  'Content-Type': 'application/json',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              infoViewActionsContext.showMessage('Added successfully!');
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false); // Ensure submitting is set to false after completion
            }
          }}
        >
          {({values, handleChange}) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Field
                    as={TextField}
                    name='roleName'
                    margin='dense'
                    label={formatMessage({id: 'role.form.roleName'})}
                    type='text'
                    fullWidth
                    variant='outlined'
                    error={Boolean(
                      values.roleName && values.roleName.length === 0,
                    )}
                  />
                  <ErrorMessage
                    name='roleName'
                    component={FormHelperText}
                    error
                  />
                </Grid>
                {/* <Grid size={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.allBranch}
                          onChange={(e) => {
                            setFieldValue('allBranch', e.target.checked);
                            if (e.target.checked) {
                              setFieldValue('branch', '');
                            }
                          }}
                        />
                      }
                      label='All Branch'
                    />
                  </FormGroup>
                </Grid> */}
                {/* {!values.allBranch && (
                  <Grid size={12}>
                    <FormControl
                      fullWidth
                      margin='dense'
                      error={!!values.branch && values.branch.length === 0}
                    >
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
                        {branchDatabase.length > 0 ? (
                          branchDatabase.map((row) => (
                            <MenuItem key={row._id} value={row._id}>
                              {row.branchName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value='' disabled>
                            No branches set up yet
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                    <ErrorMessage
                      name='branch'
                      component={FormHelperText}
                      error
                    />
                  </Grid>
                )} */}
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  {/* Other Permissions */}
                  {roles.map(({title, permission}) => (
                    <PermissionSection
                      key={title}
                      title={title}
                      permissions={permission}
                      state={permissions}
                      setState={setPermissions}
                    />
                  ))}
                  {/* Active/InActive */}
                  <Grid container spacing={2} alignItems='center'>
                    <Grid isize={2}>
                      <Typography>
                        <IntlMessages id='role.form.activeInactive' />
                      </Typography>
                    </Grid>
                    <Grid size={2}>
                      <Field
                        as={Switch}
                        name='active'
                        checked={values.active}
                        onChange={handleChange}
                        inputProps={{'aria-label': 'controlled'}}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
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

export default CreateRole;

CreateRole.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      permission: PropTypes.array.isRequired,
    }),
  ).isRequired,
  branchDatabase: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  permissions: PropTypes.object.isRequired,
  setPermissions: PropTypes.func.isRequired,
};
