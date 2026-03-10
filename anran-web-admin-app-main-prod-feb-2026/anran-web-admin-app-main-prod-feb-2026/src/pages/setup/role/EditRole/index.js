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
import CardHeader from './CardHeader';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import PermissionSection from '../PermissionCheckbox';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useIntl} from 'react-intl'; 

const EditRole = ({
  open,
  onClose,
  reCallAPI,
  roles,
  // branchDatabase,
  editingRoleId,
  initialValues,
  setPermissions,
  permissions,
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
            title={<IntlMessages id='role.dialog.editTitle' />}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            console.log('testing');
            setSubmitting(true);
            const updatedRoleData = {
              role_name: values.roleName,
              // all_branch: values.allBranch,
              // branch: values.allBranch ? null : values.branch,
              status_active: values.status_active,
              ...permissions,
            };

            console.log(
              'Role data to be updated:',
              JSON.stringify(updatedRoleData, null, 2),
            );

            try {
              const response = await putDataApi(
                `/api/roles/${editingRoleId}`,
                infoViewActionsContext,
                updatedRoleData,
                false,
                {
                  'Content-Type': 'application/json', // Headers if needed
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              infoViewActionsContext.showMessage('Updated successfully!');
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
                      <Field
                        as={Select}
                        labelId='branch-select'
                        id='branch-select'
                        name='branch'
                        label='Branch'
                        value={values.branch}
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
                      </Field>
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
                  {roles.map(({title, permission}) => {
                    return (
                      <PermissionSection
                        key={title}
                        title={title}
                        permissions={permission}
                        state={permissions}
                        setState={setPermissions}
                      />
                    );
                  })}
                  {/* Active/InActive */}
                  <Grid container spacing={2} alignItems='center'>
                    <Grid size={2}>
                      <Typography>
                        <IntlMessages id='role.form.activeInactive' />
                      </Typography>
                    </Grid>
                    <Grid size={2}>
                      <Field
                        as={Switch}
                        name='active'
                        checked={values.status_active}
                        onChange={(e) =>
                          setFieldValue('status_active', e.target.checked)
                        }
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

EditRole.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  showSnackbar: PropTypes.func.isRequired,
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
  editingRoleId: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
};

export default EditRole;
