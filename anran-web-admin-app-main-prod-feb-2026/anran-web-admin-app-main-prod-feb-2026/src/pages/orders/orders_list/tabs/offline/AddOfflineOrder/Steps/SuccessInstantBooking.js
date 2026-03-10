import React, {useContext} from 'react';
import {FormContext} from '..';
import {
  Typography,
  Autocomplete,
  TextField,
  Box,
  Button,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import {Formik, Form} from 'formik';
import * as yup from 'yup';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {useIntl} from 'react-intl';

dayjs.extend(utc);

const SuccessInstantBooking = () => {
  const {selectedBranch, selectedMember, setMainTabValue, setOpenDialog, reCallAPI, orderNumber, formData} = useContext(FormContext);
  const {formatMessage} = useIntl();
  const validationSchema = yup.object({
    pax: yup
      .number()
      .required(formatMessage({id: 'booking.validation.required'}))
      .min(1, formatMessage({id: 'finance.sales.instantBooking.minPax'}))
      .max(
        formData.carts[0]?.qty,
        formatMessage(
          {id: 'member.booking.error.paxExceeds'},
          {count: formData.carts[0]?.qty},
        ),
      ),
  });
  const infoViewActionsContext = useInfoViewActionsContext();
  // const pkg = "67c00e18eb03f35c0e0f044d";
  // const [selectedFloor, setSelectedFloor] = React.useState(null);
  // const [{apiData: packageList}, {setQueryParams}] = useGetDataApi('api/package/branch/member', {}, {}, false);
  const [{apiData: floorRoomData}] = useGetDataApi(
    `api/floors/rooms/branch/${selectedBranch._id}`,
    {},
    {},
    true,
  );
  const [{apiData: packageData}, {setQueryParams}] = useGetDataApi(
    'api/members/package',
    {},
    {},
    false,
  );
  React.useEffect(() => {
    if (selectedMember?._id) {
      setQueryParams({id: selectedMember._id});
    }
  }, [selectedMember]);
  // React.useEffect(() => {
  //   if (packageData?.length > 0) {
  //     const filteredPackages = packageData.filter((packageItem) => {
  //       const isFranchiseBranch = selectedBranch.isFranchise;
  //       const isNewlyBought = newlyBoughtPackages.includes(packageItem.package._id); // Check if the package was just bought
  
  //       if (!isFranchiseBranch) {
  //         Case when the branch is NOT a franchise
  //         return (
  //           packageItem.package.branchGroup === 'direct branch' &&
  //           (packageItem.package.allBranchStatus ||
  //             packageItem.package.branchName.some(
  //               (branch) => branch === selectedBranch._id,
  //             )) &&
  //           isNewlyBought // Only include newly bought packages
  //         );
  //       } else {
  //         Case when the branch IS a franchise
  //         return (
  //           packageItem.package.branchGroup === 'franchise branch' &&
  //           packageItem.package.branchName.some(
  //             (branch) => branch === selectedBranch._id,
  //           ) &&
  //           isNewlyBought // Only include newly bought packages
  //         );
  //       }
  //     });
  
  //     setPackageList(filteredPackages);
  //   } else {
  //     setSelectedPackage(null);
  //     setPackageList([]);
  //   }
  // }, [packageData, selectedBranch, newlyBoughtPackages]);

  // React.useEffect(() => {
  //   if (selectedBranch && selectedMember) {
  //     setQueryParams({id: selectedMember?._id});
  //   }
  // }, [selectedMember]);

  // console.log('time', pkg, packageData[0]._id);
  console.log(floorRoomData);
  console.log('formData', formData);
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
      }}
    >
      <Stack spacing={2} useFlexGap>
        <Typography variant='h1'>📦</Typography>
        <Typography variant='h5'>
          {formatMessage({id: 'finance.sales.success.title'})}
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          {formatMessage({id: 'finance.sales.success.message'})}
        </Typography>
        <Typography variant='body1' sx={{color: 'text.secondary'}}>
          {formatMessage(
            {id: 'finance.sales.success.orderNumber'},
            {orderNumber},
          )}
        </Typography>
      </Stack>
      <Formik
        validateOnBlur={true}
        initialValues={{
          floor: '',
          room: '',
          pax: 1,
        }}
        validationSchema={validationSchema}
        onSubmit={async (data) => {
          console.log('ssssssssssssssss', data);
          const postBookingData = async () => {
            try {
              const now = dayjs().utc();
              const start = now.startOf('hour');
              const end = start.add(1, 'hour');
              const bookingFormData = new FormData();
              bookingFormData.append('branch', selectedBranch._id);
              bookingFormData.append('members', selectedMember._id);
              bookingFormData.append('package', packageData[0]._id);
              bookingFormData.append('floor', data.floor._id);
              bookingFormData.append('room', data.room._id);
              bookingFormData.append('start', start.toISOString());
              bookingFormData.append('end', end.toISOString());
              bookingFormData.append('pax', data.pax);
              console.log('bookingFormData', bookingFormData);
              const response = await postDataApi(
                '/api/booking/instant-booking',
                infoViewActionsContext,
                bookingFormData,
                false,
                false,
              );
              setOpenDialog(false);
              reCallAPI();
              setMainTabValue(0);
              console.log(response);
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            }
          };
          postBookingData();
        }}
      >
        {({values, errors, setFieldValue}) => {
          console.log(values);
          React.useEffect(() => {
            if (floorRoomData?.length > 0) {
              const defaultFloor = floorRoomData[0];
              const defaultRoom = defaultFloor.rooms?.length > 0 ? defaultFloor.rooms[0] : '';
          
              setFieldValue('floor', defaultFloor);
              setFieldValue('room', defaultRoom);
            }
          }, [floorRoomData]);

          // React.useEffect(() => {
          //   if (timeSlotsData?.times?.length > 0) {
          //     const defaultTime = timeSlotsData.times[0];
          
          //     setFieldValue('timeSlot', defaultTime);
          //   }
          // }, [timeSlotsData]);
          console.log(errors);   
          return (
            <Form noValidate autoComplete='off'>
              <Box
                sx={{
                  padding: 5,
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
                  <AppGridContainer spacing={4}>
                    <Grid size={{xs: 12, md: 12}}>
                      <Typography variant="h2">
                        {formatMessage({id: 'finance.sales.instantBooking.title'})}
                      </Typography>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                      <Autocomplete
                        disabled
                        value={formData.carts[0].packageName}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'finance.sales.instantBooking.selectedPackage',
                            })}
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 12}}>
                      <Autocomplete
                        disabled
                        value={selectedBranch}
                        options={selectedBranch}
                        getOptionLabel={(option) => option.branchName}
                        isOptionEqualToValue={(option, value) =>
                          option.branchName === value.branchName
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'finance.sales.instantBooking.selectedBranch',
                            })}
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 12}}>
                      <Autocomplete
                        disabled
                        value={selectedMember}
                        options={selectedMember}
                        getOptionLabel={(option) => option.combinedLabel}
                        isOptionEqualToValue={(option, value) =>
                          option.combinedLabel === value.combinedLabel
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={formatMessage({
                              id: 'finance.sales.instantBooking.selectedMember',
                            })}
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>
                    {/* <Grid size={{xs: 12, md: 6}}>
                      <Autocomplete
                        value={values.floor}
                        options={floorRoomData}
                        getOptionLabel={(option) => option.floorNo}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        onChange={(event, newValue) => {
                          console.log('safdsfa', newValue);
                          setFieldValue('floor', newValue);
                          setFieldValue('room', null);
                          setSelectedFloor(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select a Floor" variant="outlined" />
                        )}
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                      <Autocomplete
                        disabled={!selectedFloor}
                        value={values.room}
                        options={selectedFloor?.rooms || []}
                        getOptionLabel={(option) => option.room_no}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        onChange={(event, newValue) => {
                          console.log('safdsfa', newValue);
                          setFieldValue('room', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select a Room" variant="outlined" />
                        )}
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                      <Autocomplete
                        value={values.timeSlot}
                        options={timeSlotsData?.times || []}
                        getOptionLabel={(option) => dayjs(option).format("HH:mm")}
                        isOptionEqualToValue={(option, value) => option === value}
                        onChange={(event, newValue) => {
                          console.log('safdsfa', newValue);
                          setFieldValue('timeSlot', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select a Time Slot" variant="outlined" />
                        )}
                      />
                    </Grid> */}
                    <Grid size={{xs: 12, md: 12}}>
                      <AppTextField
                        fullWidth
                        type={'number'}
                        name='pax'
                        value={values.pax}
                        label={formatMessage({
                          id: 'finance.sales.instantBooking.paxLabel',
                        })}
                        error={Boolean(errors.pax)}
                        helperText={errors.pax}
                        InputProps={{
                          type: 'number',
                          inputProps: {min: 1, max: formData.carts[0]?.qty},
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
                          setFieldValue('pax', event.target.value);
                        }}
                        onWheel={(event) => event.currentTarget.blur()}
                      />
                    </Grid>
                  </AppGridContainer>
                </Box>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'row', p: 5}}>
                <Box sx={{flex: '1 1 auto'}} />
                <Button
                  type='submit'
                  variant='contained'
                  endIcon={<ChevronRightRoundedIcon />}
                  sx={{width: {xs: '100%', sm: 'fit-content'}}}
                >
                  {formatMessage({id: 'common.submit'})}
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  )
}

export default SuccessInstantBooking;