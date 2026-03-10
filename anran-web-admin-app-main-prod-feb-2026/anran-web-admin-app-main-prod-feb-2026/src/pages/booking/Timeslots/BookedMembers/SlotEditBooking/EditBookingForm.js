import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {useGetDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const AddSlotBookingForm = ({
  values,
  setFieldValue,
  errors,
  member,
  bookedPackage,
}) => {
  // const [branch, setBranch] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [packageList, setPackageList] = React.useState([]);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [maxPax, setMaxPax] = React.useState([]);
  const [totalPax, setTotalPax] = React.useState([]);
  const [paxError, setPaxError] = React.useState(false);
  const [sessionError, setSessionError] = React.useState(false);
  // const [{apiData: branchData, loading}] = useGetDataApi(
  //   'api/branch',
  //   {},
  //   {},
  //   true,
  // );

  // const [{apiData: memberData}] = useGetDataApi('api/members/', {}, {}, true);
  const [{apiData: packageData}, {setQueryParams}] = useGetDataApi(
    'api/members/package',
    {},
    {},
    false,
  );
  console.log('selectedMember', selectedMember);
  console.log('selectedPackage', selectedPackage);
  console.log('packageList', packageList);

  React.useEffect(() => {
    let total = values?.malecount + values?.femalecount;
    setTotalPax(total);
  }, [values]);

  React.useEffect(() => {
    if (totalPax > maxPax) {
      console.log('error');
      setPaxError(true);
    } else {
      setPaxError(false);
    }
  }, [totalPax]);

  React.useEffect(() => {
    if (member?._id) {
      member['combinedLabel'] =
        `${member.memberFullName} (${member.mobileNumber})`;
      setSelectedMember(member);
    }
  }, [member]);

  React.useEffect(() => {
    if (bookedPackage?._id) {
      setSelectedPackage(bookedPackage);
    }
  }, [bookedPackage]);

  React.useEffect(() => {
    if (selectedMember?._id) {
      setQueryParams({id: selectedMember._id});
    }
  }, [selectedMember]);

  React.useEffect(() => {
    if (packageData?.length > 0) {
      setPackageList(packageData);
    }
  }, [packageData]);

  React.useEffect(() => {
    if (selectedPackage) {
      if (selectedPackage.currentBalance >= values?.availableCount) {
        setMaxPax(values?.availableCount);
      } else {
        if (selectedPackage.currentBalance == 0) {
          setSessionError(true);
        } else {
          setMaxPax(selectedPackage.currentBalance);
        }
      }
    }
  }, [selectedPackage]);

  // const handleBranchChange = (event) => {
  //   setBranch(event.target.value);
  // };

  console.log('values', values, errors);
  console.log('values', values);

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 2,
          ml: -6,
          mr: -6,
        }}
      >
        <Box
          sx={{
            pb: 5,
            px: 5,
            // mx: -5,
            mb: 1,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <AppGridContainer spacing={4}>
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                }}
              >
                <Box>
                  {'Branch:  '}
                  {values.branch.branchName}
                </Box>
                <Box>
                  {'Floor:  '}
                  {values.floor.floorNo}
                </Box>
                <Box>
                  {'Room:  '}
                  {values.room?.room_no}
                </Box>
              </Box>
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
                <Box>
                  {'Date:  '}
                  {dayjs(values.start).format('MMMM D, YYYY')}
                </Box>
                <Box>
                  {'Slot:  '}
                  {dayjs(values.start).format('h:mm A')}
                  {' - '}
                  {dayjs(values.end).format('h:mm A')}
                </Box>
              </Box>
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
                <Box>
                  {'Slot is available for'}
                  {values.availableCount}
                  {' more persons'}
                </Box>
                <Box>
                  {'Type:'}
                  {values.room.room_gender}
                </Box>
              </Box>
            </Grid>

            <Grid size={12}>{`Member: ${selectedMember?.memberFullName}`}</Grid>
            <Grid size={12}>
              <Autocomplete
                // freeSolo
                // id='free-solo-2-demo'
                // disableClearable
                value={selectedPackage}
                options={packageList}
                getOptionLabel={(option) => option?.package?.packageName}
                isOptionEqualToValue={(option, value) =>
                  option.package.packageName === value?.package?.packageName
                }
                onChange={(event, newInputValue) => {
                  if (newInputValue?._id) {
                    setFieldValue('package', newInputValue._id);
                    setSelectedPackage(newInputValue);
                  } else {
                    setFieldValue('package', newInputValue);
                    setSelectedPackage(null);
                    setSessionError(false);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Select a Package'
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        type: 'search',
                      },
                    }}
                  />
                )}
              />
            </Grid>
            {selectedPackage?.currentBalance > 0 ? (
              <Grid
                item
                xs={12}
              >{`Balance available session: ${selectedPackage?.currentBalance}`}</Grid>
            ) : null}

            {/* <Grid size={12}>
              <FormControl fullWidth error={errors?.branch}>
                <InputLabel id='branch-select-error-label'>Member</InputLabel>
                <Select
                  labelId='branch-select-error-label'
                  id='branch-select-error'
                  value={branch}
                  label='Member'
                  onChange={handleBranchChange}
                  // renderValue={(value) => `⚠️  - ${value.branchName}`}
                >
                  {loading ? (
                    <MenuItem>
                      <em>None</em>
                    </MenuItem>
                  ) : (
                    branchData?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id}
                        sx={{
                          padding: 2,
                          cursor: 'pointer',
                          minHeight: 'auto',
                        }}
                      >
                        {item.branchName}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>
                  {errors?.branch ? 'select a branch' : ''}
                </FormHelperText>
              </FormControl>
            </Grid> */}
            {/* <Grid size={12}>
              <FormControl fullWidth error={errors?.branch}>
                <InputLabel id='branch-select-error-label'>Package</InputLabel>
                <Select
                  labelId='branch-select-error-label'
                  id='branch-select-error'
                  value={branch}
                  label='Package'
                  onChange={handleBranchChange}
                  // renderValue={(value) => `⚠️  - ${value.branchName}`}
                >
                  {loading ? (
                    <MenuItem>
                      <em>None</em>
                    </MenuItem>
                  ) : (
                    branchData?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id}
                        sx={{
                          padding: 2,
                          cursor: 'pointer',
                          minHeight: 'auto',
                        }}
                      >
                        {item.branchName}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>
                  {errors?.branch ? 'select a branch' : ''}
                </FormHelperText>
              </FormControl>
            </Grid> */}
            {selectedPackage?.currentBalance > 0 ? (
              <Grid size={12}>
                {values.room.room_gender == 'Both' ? (
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
                          inputProps: {min: 1, max: {maxPax}},
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
                          inputProps: {min: 1, max: {maxPax}},
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
                    {values.room.room_gender == 'Male' ? (
                      <AppTextField
                        fullWidth
                        type={'number'}
                        name='malecount'
                        value={values.malecount}
                        label={<IntlMessages id='anran.male.noofPax' />}
                        InputProps={{
                          type: 'number',
                          inputProps: {min: 1, max: {maxPax}},
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
                          inputProps: {min: 1, max: {maxPax}},
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
        </Box>
      </Box>
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
          disabled={paxError ? true : sessionError ? true : false}
        >
          <IntlMessages id='anran.confirm.Booking' />
        </Button>
      </Box>
    </Form>
  );
};

export default AddSlotBookingForm;
AddSlotBookingForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  branchImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBranchImage: PropTypes.func,
  setBranchImageUrl: PropTypes.func,
  member: PropTypes.object,
  bookedPackage: PropTypes.object,
};

{
  /* <Grid size={12}>
              <AppGrid
                delay={200}
                responsive={{
                  xs: 1,
                  sm: 2,
                  xl: 3,
                }}
                data={[
                  {id: 1, slot: '1 AM -2 AM', full: true, balance: 1},
                  {id: 2, slot: '2 AM - 3 AM', full: false, balance: 1},
                  {id: 3, slot: '3 AM - 4 AM', full: true, balance: 1},
                  {id: 4, slot: '4 AM - 5 AM', full: false, balance: 1},
                ]}
                renderRow={(item) => (
                  <TimeSlotCell
                    selected={selectedTimeSlot}
                    data={item}
                    key={item.id}
                    onChange={onSelectTimeSlot}
                  />
                )}
                ListEmptyComponent={
                  <ListEmptyResult
                    content='No product found'
                    loading={loading}
                  />
                }
              />
            </Grid> */
}

{
  /* <Grid size={12}>
              <Autocomplete
                sx={{width: '100%'}}
                multiple
                id='tags-outlined'
                options={toParentList}
                autoHighlight
                getOptionLabel={(option) => option.name}
                value={selectedParents}
                onChange={(event, value) => {
                  setParentsList(value);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <Box
                    component='li'
                    sx={{display: 'flex', alignItems: 'center'}}
                    {...props}
                  >
                    {option.profileImage ? (
                      <Avatar src={option.profileImage} />
                    ) : (
                      <Avatar>{option?.name?.toUpperCase()}</Avatar>
                    )}
                    <Box ml={4}>{option?.name}</Box>
                  </Box>
                )}
                filterSelectedOptions
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    console.log('option', option);
                    return (
                      <ReceiptOptionList
                        key={index}
                        option={option}
                        handleDeleteOption={handleDeleteParentOption}
                        handleCheckedState={handleCheckedState}
                        {...getTagProps({index})}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    className='ccBccTextField'
                    {...params}
                    variant='outlined'
                    margin='normal'
                    label={'To'}
                    fullWidth
                    placeholder='search by child name'
                  />
                )}
              />
            </Grid> */
}
