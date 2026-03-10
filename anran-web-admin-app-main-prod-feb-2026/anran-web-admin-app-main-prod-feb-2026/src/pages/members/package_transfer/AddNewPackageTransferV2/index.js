import React, {useMemo} from 'react';
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
import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {useIntl} from 'react-intl';

const AddNewPackageTransfer = ({open, onClose, reCallAPI, memberPackage}) => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;
  const infoViewActionsContext = useInfoViewActionsContext();
  const [memberList, setMemberList] = React.useState([]);
  const [selectedFromMember, setSelectedFromMember] = React.useState(null);
  const [selectedToMember, setSelectedToMember] = React.useState(null);
  const [selectedPackage, setSelectedPackage] = React.useState(null);

  const [{apiData: memberDatabase}] = useGetDataApi(
    'api/members',
    {},
    {},
    true,
  );

  const [{apiData: memberPackageList}, {setQueryParams}] = useGetDataApi(
    'api/members/package',
    {},
    {},
    false,
  );

  console.log('addNewPackageTransfer', memberPackage, memberDatabase);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        transferFrom: Yup.string().required(
          formatMessage({id: 'member.transfer.validation.transferFrom'}),
        ),
        package: Yup.string().required(
          formatMessage({id: 'member.transfer.validation.package'}),
        ),
        transferTo: Yup.string().required(
          formatMessage({id: 'member.transfer.validation.transferTo'}),
        ),
        transferedTimes: Yup.number()
          .required(formatMessage({id: 'member.transfer.validation.times'}))
          .positive(formatMessage({id: 'member.transfer.validation.timesPositive'}))
          .when('currentBalance', {
            is: (currentBalance) =>
              currentBalance !== undefined && currentBalance !== '',
            then: (schema) =>
              schema.max(
                Yup.ref('currentBalance'),
                formatMessage({id: 'member.transfer.validation.timesMax'}),
              ),
            otherwise: (schema) => schema,
          }),
      }),
    [formatMessage],
  );

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

  React.useEffect(() => {
    if (selectedFromMember != null) {
      setQueryParams({id: selectedFromMember?._id});
    }
  }, [selectedFromMember]);

  const handleClose = () => {
    setSelectedFromMember(null);
    setSelectedToMember(null);
    setSelectedPackage(null);
    onClose();
  };

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='xs'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleClose}
            title={formatMessage({id: 'member.transfer.dialog.title'})}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
              onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('memberPackageId', values.package);
            formData.append('fromMemberId', values.transferFrom);
            formData.append('toMemberId', values.transferTo);
            formData.append('transferCount', values.transferedTimes);
            if (selectedPackage?.orderItem?.orderNo) {
              formData.append('originalPurchaseInvoice', selectedPackage.orderItem.orderNo);
            }
            try {
              const response = await postDataApi(
                '/api/transfer/web',
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
                formatMessage({id: 'member.transfer.dialog.success'}),
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
              if (selectedPackage != null) {
                setFieldValue('package', selectedPackage._id);
                setFieldValue('currentBalance', selectedPackage.currentBalance);
              }
            }, [selectedPackage]);
            return (
              <Form>
                <Grid container spacing={2}>
                  {/* Transfer From Field */}
                  <Grid size={12}>
                    {memberList.length > 0 && (
                      <Autocomplete
                        value={selectedFromMember}
                        options={memberList}
                        getOptionLabel={(option) => option.combinedLabel}
                        isOptionEqualToValue={(option, value) =>
                          option.combinedLabel === value.combinedLabel
                        }
                        onChange={(event, newInputValue) => {
                          if (newInputValue?._id) {
                            setFieldValue('transferFrom', newInputValue._id);
                            setSelectedFromMember(newInputValue);
                          } else {
                            setFieldValue('transferFrom', newInputValue);
                            setSelectedFromMember(newInputValue);
                          }
                        }}
                        noOptionsText={
                          <Typography>
                            {formatMessage({
                              id: 'member.transfer.dialog.noMembers',
                            })}
                          </Typography>
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'member.transfer.dialog.selectMember',
                            })}
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
                  </Grid>
                  {/* Package Field */}
                  <Grid size={12}>
                    <FormControl fullWidth margin='dense'>
                      <InputLabel>
                        {formatMessage({id: 'member.transfer.dialog.package'})}
                      </InputLabel>
                      <Select
                        name='package'
                        label={formatMessage({id: 'member.transfer.dialog.package'})}
                        labelId='demo-simple-select-label'
                        id='demo-simple-select'
                        value={selectedPackage}
                        onChange={(e) => {
                          // setFieldValue('package', e.target.value);
                          setSelectedPackage(e.target.value);
                        }}
                      >
                        {memberPackageList.length > 0 ? (
                          memberPackageList.map((pkg) => (
                            <MenuItem key={pkg.package._id} value={pkg}>
                              {pkg.package.packageName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            {formatMessage({
                              id: 'member.transfer.dialog.noOptions',
                            })}
                          </MenuItem>
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
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({
                        id: 'member.transfer.dialog.currentBalance',
                      })}
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
                        value={selectedToMember}
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
                            setSelectedToMember(newInputValue);
                          } else {
                            setFieldValue('transferTo', newInputValue);
                            setSelectedToMember(newInputValue);
                          }
                        }}
                        noOptionsText={
                          <Typography>
                            {formatMessage({
                              id: 'member.transfer.dialog.noMembers',
                            })}
                          </Typography>
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'member.transfer.dialog.selectMember',
                            })}
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
                  </Grid>
                  {/* Transfer Times Field */}
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({
                        id: 'member.transfer.dialog.transferTimes',
                      })}
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