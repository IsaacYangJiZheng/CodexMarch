import React from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Autocomplete,
  Typography,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Formik, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';

const AddNewPackageTransfer = ({
  open,
  onClose,
  reCallAPI,
  memberPackage,
  memberDatabase,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [filteredPackages, setFilteredPackages] = React.useState([]);
  const [memberList, setMemberList] = React.useState([]);

  console.log('addNewPackageTransfer', memberPackage, memberDatabase);

  const validationSchema = Yup.object().shape({
    transferFrom: Yup.string().required('Transfer From is required'),
    package: Yup.string().required('Package is required'),
    transferTo: Yup.string().required('Transfer To is required'),
    transferedTimes: Yup.number()
      .required('Transfer Times is required')
      .positive('Transfer Times must be positive')
      .when('currentBalance', {
        is: (currentBalance) =>
          currentBalance !== undefined && currentBalance !== '',
        then: (schema) =>
          schema.max(
            Yup.ref('currentBalance'),
            'Transfer Times cannot exceed Current Balance',
          ),
        otherwise: (schema) => schema,
      }),
  });

  const initialValues = {
    transferFrom: '',
    package: '',
    transferTo: '',
    transferedTimes: 1,
    currentBalance: '',
  };

  React.useEffect(() => {
    if (memberDatabase?.length > 0) {
      const updatedMembers = memberDatabase
        .filter((member) => member.fullRegister === true)
        .map((member) => ({
          ...member,
          combinedLabel: `${member.memberFullName} (${member.mobileNumber})`,
        }));
      setMemberList(updatedMembers);
    }
  }, [memberDatabase]);

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader onCloseAddCard={onClose} title={'Transfer Session'} />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const selectedMemberPackage = memberPackage.find(
              (member) =>
                member.member._id === values.transferFrom &&
                member.package._id === values.package,
            );
            const purchaseBranch = selectedMemberPackage
              ? selectedMemberPackage.purchaseBranch
              : '';
            const selectedMemberCurrentBalance = selectedMemberPackage
              ? selectedMemberPackage.currentBalance
              : '';
            const selectedMemberTransferedTimes = selectedMemberPackage
              ? selectedMemberPackage.transferedTimes
              : '';
            const transferFromPackage = memberPackage.find(
              (pkg) => pkg.member._id === values.transferFrom,
            );

            const formData = new FormData();
            formData.append('selectedMemberId', selectedMemberPackage._id);
            formData.append(
              'selectedMemberCurrentBalance',
              selectedMemberCurrentBalance - values.transferedTimes,
            );
            formData.append(
              'selectedMemberTransferedTimes',
              selectedMemberTransferedTimes + values.transferedTimes,
            );
            formData.append('purchaseBranch', purchaseBranch);
            formData.append('member', values.transferTo);
            formData.append('package', values.package);
            formData.append('transferFrom', transferFromPackage._id);
            formData.append('transferedTimes', values.transferedTimes);
            try {
              const response = await postDataApi(
                '/api/memberpackage/transferpackage',
                infoViewActionsContext,
                formData,
                false,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              infoViewActionsContext.showMessage(
                'Transfer Session created successfully!',
              );
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue, errors}) => {
            React.useEffect(() => {
              const filtered = memberPackage.filter(
                (member) =>
                  member.member._id === values.transferFrom &&
                  !member.package.packageUnlimitedStatus &&
                  member.package.packageTransferableStatus,
              );
              const uniquePackages = Array.from(
                new Map(filtered.map((pkg) => [pkg.package._id, pkg])).values(),
              );
              setFilteredPackages(uniquePackages);

              const matchedPackage = memberPackage.find(
                (pkg) =>
                  pkg.member._id === values.transferFrom &&
                  pkg.package._id === values.package,
              );
              setFieldValue(
                'currentBalance',
                matchedPackage?.currentBalance || '',
              );
            }, [values.transferFrom, values.package]);
            return (
              <Form>
                <Grid container spacing={2}>
                  {/* Transfer From Field */}
                  <Grid size={12}>
                    {memberList.length > 0 && (
                      <Autocomplete
                        value={values.transferFrom}
                        options={memberList}
                        getOptionLabel={(option) => option.combinedLabel}
                        isOptionEqualToValue={(option, value) =>
                          option.combinedLabel === value.combinedLabel
                        }
                        onChange={(event, newInputValue) => {
                          if (newInputValue?._id) {
                            setFieldValue('transferFrom', newInputValue._id);
                          } else {
                            setFieldValue('transferFrom', newInputValue);
                          }
                        }}
                        noOptionsText={
                          <Typography>No members found.</Typography>
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Select a Member'
                            variant='outlined'
                            error={errors?.transferFrom}
                            helperText={
                              <ErrorMessage
                                name='transferFrom'
                                render={(msg) => (
                                  <span style={{color: 'red'}}>{msg}</span>
                                )}
                              />
                            }
                          />
                        )}
                      />
                    )}
                    {/* <FormControl fullWidth margin='dense'>
                      <InputLabel>Transfer From</InputLabel>
                      <Select
                        name='transferFrom'
                        label='Transfer From'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.transferFrom}
                        onChange={(e) =>
                          setFieldValue('transferFrom', e.target.value)
                        }
                      >
                        {memberDatabase
                          .filter((members) => members.fullRegister === true)
                          .map((members) => (
                            <MenuItem key={members._id} value={members._id}>
                              {members.memberFullName}
                            </MenuItem>
                          ))}
                      </Select>
                      <ErrorMessage
                        name='transferFrom'
                        component={FormHelperText}
                        error
                      />
                    </FormControl> */}
                  </Grid>
                  {/* Package Field */}
                  <Grid size={7}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel>Package</InputLabel>
                      <Select
                        name='package'
                        label='Package'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.package}
                        onChange={(e) =>
                          setFieldValue('package', e.target.value)
                        }
                      >
                        {filteredPackages.length > 0 ? (
                          filteredPackages.map((pkg) => (
                            <MenuItem
                              key={pkg.package._id}
                              value={pkg.package._id}
                            >
                              {pkg.package.packageName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No Options</MenuItem>
                        )}
                      </Select>
                      <ErrorMessage
                        name='package'
                        component={FormHelperText}
                        error
                      />
                    </FormControl>
                  </Grid>
                  {/* Current Balance Field */}
                  <Grid size={5}>
                    <AppTextField
                      label='Current Balance'
                      variant='outlined'
                      fullWidth
                      name='currentBalance'
                      type='number'
                      margin='dense'
                      value={values.currentBalance}
                      InputProps={{
                        readOnly: true,
                        sx: {
                          pointerEvents: 'none',
                          '& input': {
                            cursor: 'default',
                          },
                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                            {
                              display: 'none',
                            },
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                        },
                      }}
                    />
                  </Grid>
                  {/* Transfer To Field */}
                  <Grid size={12}>
                    {memberList.length > 0 && (
                      <Autocomplete
                        value={values.transferTo}
                        options={memberList.filter(
                          (member) => member._id !== values.transferFrom,
                        )}
                        getOptionLabel={(option) => option.combinedLabel}
                        isOptionEqualToValue={(option, value) =>
                          option.combinedLabel === value.combinedLabel
                        }
                        onChange={(event, newInputValue) => {
                          if (newInputValue?._id) {
                            setFieldValue('transferTo', newInputValue._id);
                          } else {
                            setFieldValue('transferTo', newInputValue);
                          }
                        }}
                        noOptionsText={
                          <Typography>No members found.</Typography>
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Select a Member'
                            variant='outlined'
                            error={errors?.transferTo}
                            helperText={
                              <ErrorMessage
                                name='transferTo'
                                render={(msg) => (
                                  <span style={{color: 'red'}}>{msg}</span>
                                )}
                              />
                            }
                          />
                        )}
                      />
                    )}
                    {/* <FormControl fullWidth margin='dense'>
                      <InputLabel>Transfer To</InputLabel>
                      <Select
                        name='transferTo'
                        label='Transfer To'
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={values.transferTo}
                        onChange={(e) =>
                          setFieldValue('transferTo', e.target.value)
                        }
                      >
                        {memberDatabase
                          .filter((members) => members.fullRegister === true)
                          .map((members) => (
                            <MenuItem
                              key={members._id}
                              value={members._id}
                              disabled={members._id === values.transferFrom}
                            >
                              {members.memberFullName}
                            </MenuItem>
                          ))}
                      </Select>
                      <ErrorMessage
                        name='transferTo'
                        component={FormHelperText}
                        error
                      />
                    </FormControl> */}
                  </Grid>
                  {/* Transfer Times Field */}
                  <Grid size={7}>
                    <AppTextField
                      label='Transfer Times'
                      variant='outlined'
                      fullWidth
                      name='transferedTimes'
                      type='number'
                      margin='dense'
                      helperText={<ErrorMessage name='transferedTimes' />}
                      InputProps={{
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
                      onFocus={(e) =>
                        e.target.addEventListener(
                          'wheel',
                          function (e) {
                            e.preventDefault();
                          },
                          {passive: false},
                        )
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setFieldValue('transferedTimes', '');
                        } else {
                          setFieldValue('transferedTimes', value);
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                {/* Button */}
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
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddNewPackageTransfer;

AddNewPackageTransfer.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  memberPackage: PropTypes.array.isRequired,
  memberDatabase: PropTypes.array,
};
