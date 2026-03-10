import React from 'react';
import {Box, Button, TextField, Autocomplete, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Formik, Form} from 'formik';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import PropTypes from 'prop-types';
import {putDataApi, useGetDataApi} from '@anran/utility/APIHooks';

const EditDialog = ({
  item,
  slot,
  handleCloseEditDialog,
  openEditDialog,
  reCallAPI,
  onClose,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [packageList, setPackageList] = React.useState([]);
  const [selectedPackage, setSelectedPackage] = React.useState('');
  const [selectedPackageBalance, setSelectedPackageBalance] = React.useState(0);
  const [maxPax, setMaxPax] = React.useState(0);
  const [totalPax, setTotalPax] = React.useState(0);
  const [paxError, setPaxError] = React.useState(false);
  const [sessionError, setSessionError] = React.useState(false);

  const initialValues = {
    branchId: slot?.branch._id,
    floorId: slot?.floor._id,
    roomId: slot?.room.Id,
    member: item?.member._id,
    package: selectedPackage,
    branch: slot?.branch,
    floor: slot?.floor,
    room: slot?.room,
    malecount: item?.malePax,
    femalecount: item?.femalPax,
    totalPax: item?.malePax + item?.femalPax,
    availableCount:
      slot?.availableSlot != null ? slot?.availableSlot : slot?.room.Size,
  };

  console.log('initial', initialValues);

  const [{apiData: packageData}, {setQueryParams}] = useGetDataApi(
    'api/members/package',
    {},
    {},
    false,
  );

  console.log('selectedPackage', selectedPackage);

  React.useEffect(() => {
    if (totalPax > maxPax) {
      console.log('error');
      setPaxError(true);
    } else {
      setPaxError(false);
    }
  }, [totalPax, maxPax]);

  React.useEffect(() => {
    if (item.member?._id) {
      setQueryParams({id: item.member._id});
    } else {
      setSelectedPackage(null);
      setPackageList([]);
    }
  }, [item]);

  React.useEffect(() => {
    if (packageData?.length > 0) {
      setPackageList(packageData);
      setSelectedPackage(
        packageData.find((data) => data._id === item.memberPackage),
      );
    } else {
      setSelectedPackage(null);
      setPackageList([]);
    }
  }, [packageData]);

  return (
    <AppDialog
      dividers
      maxWidth='xs'
      open={openEditDialog}
      hideClose
      title={
        <CardHeader
          onCloseAddCard={() => {
            reCallAPI();
            setPackageList([]);

            // setSelectedPackage('');
            // setSelectedPackageBalance(0);
            handleCloseEditDialog();
          }}
          title={'Edit Package & Pax'}
        />
      }
    >
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, {setSubmitting}) => {
          setSubmitting(true);
          const formData = new FormData();
          formData.append('bookingId', slot._id);
          formData.append('roomSize', slot.room.Size);
          formData.append('id', item._id);
          formData.append('memberPackage', selectedPackage._id);
          if (slot.room.Gender === 'Both') {
            formData.append('malePax', values.malecount);
            formData.append('femalPax', values.femalecount);
          } else if (slot.room.Gender === 'Male') {
            formData.append('malePax', values.malecount);
            formData.append('femalPax', 0);
          } else if (slot.room.Gender === 'Female') {
            formData.append('malePax', 0);
            formData.append('femalPax', values.femalecount);
          } else {
            console.error('Unexpected room.gender value:', values.room.Gender);
          }

          try {
            const response = await putDataApi(
              `/api/booking/edit-booking/${item._id}`,
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
            setPackageList([]);
            setSelectedPackage('');
            setSelectedPackageBalance(0);
            handleCloseEditDialog();
            onClose();
            infoViewActionsContext.showMessage('Updated successfully!');
          } catch (error) {
            infoViewActionsContext.fetchError(error.message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({values, setFieldValue}) => {
          React.useEffect(() => {
            let total = values?.malecount + values?.femalecount;
            setTotalPax(total);
          }, [values]);

          React.useEffect(() => {
            if (selectedPackage) {
              if (item.memberPackage == selectedPackage._id) {
                let temp_currentBalance =
                  selectedPackage.currentBalance + values?.totalPax;
                setSelectedPackageBalance(temp_currentBalance);
                let temp_total = values?.availableCount + values?.totalPax;
                if (temp_currentBalance > temp_total) {
                  setMaxPax(temp_total);
                  setSessionError(false);
                } else {
                  setMaxPax(temp_currentBalance);
                  setSessionError(false);
                }
              } else {
                setSelectedPackageBalance(selectedPackage.currentBalance);
                // let temp_max = values?.room.size;
                // let booked_pax = item?.malePax + item?.femalPax;
                // let availableCount = temp_max - booked_pax;
                if (selectedPackage.currentBalance >= values?.availableCount) {
                  setMaxPax(values?.availableCount + values?.totalPax);
                } else {
                  if (selectedPackage.currentBalance == 0) {
                    if (item.memberPackage != selectedPackage._id) {
                      setSessionError(true);
                    } else {
                      setMaxPax(selectedPackage.currentBalance);
                    }
                  } else {
                    setMaxPax(selectedPackage.currentBalance);
                  }
                }
              }
            }
          }, [selectedPackage]);

          return (
            <Form>
              <AppGridContainer spacing={2} sx={{p: 4}}>
                <Grid size={12}>
                  {packageList?.length > 0 ? (
                    <Autocomplete
                      value={selectedPackage}
                      options={packageList}
                      getOptionLabel={(option) =>
                        `${option?.package?.packageName}(${option?.originalBalance == 99999 ? 'Unlimited' : `Balance: ${option?.currentBalance}`})`
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.package._id === value?.package
                      }
                      onChange={(event, newInputValue) => {
                        if (newInputValue?._id) {
                          setFieldValue('package', newInputValue._id);
                          setSelectedPackage(newInputValue);
                          setSessionError(false);
                        } else {
                          setFieldValue('package', newInputValue);
                          setSelectedPackage(null);
                          setSessionError(false);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label='Select a Package' />
                      )}
                    />
                  ) : null}
                </Grid>
                <Grid size={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                    }}
                  >
                    {values.availableCount === 0 ? (
                      <Box>{'Slot is full booked!'}</Box>
                    ) : (
                      <Box>
                        {'Slot is available for '}
                        {values.availableCount + values.totalPax}
                        {' more persons'}
                      </Box>
                    )}
                    <Box>
                      {'Type:'}
                      {values.room.Gender}
                    </Box>
                  </Box>
                </Grid>
                {selectedPackageBalance > 0 ? (
                  <Grid
                    item
                    xs={12}
                  >{`Balance available session: ${selectedPackageBalance}`}</Grid>
                ) : null}
                {selectedPackageBalance > 0 ? (
                  <Grid size={12}>
                    {values.room.Gender == 'Both' ? (
                      <AppGridContainer spacing={4}>
                        <Grid size={6}>
                          <AppTextField
                            fullWidth
                            type={'number'}
                            name='malecount'
                            value={values.malecount}
                            label={<IntlMessages id='anran.male.noofPax' />}
                            InputProps={{
                              type: 'number',
                              inputProps: {min: 0, max: {maxPax}},
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
                            onChange={(event) => {
                              setFieldValue('malecount', event.target.value);
                            }}
                            onWheel={(event) => event.currentTarget.blur()}
                          />
                        </Grid>
                        <Grid size={6}>
                          <AppTextField
                            fullWidth
                            type={'number'}
                            name='femalecount'
                            value={values.femalecount}
                            label={<IntlMessages id='anran.female.noofPax' />}
                            InputProps={{
                              type: 'number',
                              inputProps: {min: 0, max: {maxPax}},
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
                            onChange={(event) => {
                              setFieldValue('femalecount', event.target.value);
                            }}
                            onWheel={(event) => event.currentTarget.blur()}
                          />
                        </Grid>
                      </AppGridContainer>
                    ) : (
                      <Grid size={12}>
                        {values.room.Gender == 'Male' ? (
                          <AppTextField
                            fullWidth
                            type={'number'}
                            name='malecount'
                            value={values.malecount}
                            label={<IntlMessages id='anran.male.noofPax' />}
                            InputProps={{
                              type: 'number',
                              inputProps: {min: 0, max: {maxPax}},
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
                            onChange={(event) => {
                              setFieldValue('malecount', event.target.value);
                            }}
                          />
                        ) : (
                          <AppTextField
                            fullWidth
                            type={'number'}
                            name='femalecount'
                            value={values.femalecount}
                            label={<IntlMessages id='anran.female.noofPax' />}
                            InputProps={{
                              type: 'number',
                              inputProps: {min: 0, max: {maxPax}},
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
                            onChange={(event) => {
                              setFieldValue('femalecount', event.target.value);
                            }}
                            onWheel={(event) => event.currentTarget.blur()}
                          />
                        )}
                      </Grid>
                    )}
                  </Grid>
                ) : null}
                {sessionError ? (
                  <Typography sx={{color: 'red', ml: 4}}>
                    No more available session for the Selected package.
                  </Typography>
                ) : null}
                {paxError ? (
                  <Typography sx={{color: 'red', ml: 4}}>
                    Exceed the allowed booking slot.
                  </Typography>
                ) : null}
              </AppGridContainer>
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
                  disabled={
                    paxError
                      ? true
                      : sessionError
                        ? true
                        : totalPax <= 0
                          ? true
                          : false
                  }
                >
                  <IntlMessages id='common.save' />
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </AppDialog>
  );
};

export default EditDialog;

EditDialog.propTypes = {
  item: PropTypes.object,
  slot: PropTypes.object,
  handleCloseEditDialog: PropTypes.func.isRequired,
  openEditDialog: PropTypes.bool.isRequired,
  reCallAPI: PropTypes.func,
  onClose: PropTypes.func,
};
