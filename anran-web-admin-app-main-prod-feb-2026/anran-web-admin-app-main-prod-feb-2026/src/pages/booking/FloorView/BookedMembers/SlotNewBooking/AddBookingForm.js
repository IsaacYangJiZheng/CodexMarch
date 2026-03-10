import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
// import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import {Form} from 'formik';
import PropTypes from 'prop-types';
// import {Fonts} from 'shared/constants/AppEnums';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {useGetDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import AppInfoView from '@anran/core/AppInfoView';
import VirtualizedListbox from '../../../components/VirtualizedListbox';
import {useIntl} from 'react-intl';


const AddSlotBookingForm = ({
  values,
  setFieldValue,
  errors,
  selectedBranch,
}) => {
  const {formatMessage} = useIntl();
  const [memberList, setMemberList] = React.useState([]);
  const [memberSearch, setMemberSearch] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [packageList, setPackageList] = React.useState([]);
  const [selectedPackage, setSelectedPackage] = React.useState('');
  const [maxPax, setMaxPax] = React.useState([]);
  const [totalPax, setTotalPax] = React.useState([]);
  const [paxError, setPaxError] = React.useState(false);
  const [sessionError, setSessionError] = React.useState(false);

  const [
    {apiData: memberData},
    {setQueryParams: setMemberQueryParams},
  ] = useGetDataApi('api/members/newdropdown', {}, {}, false);

  const [{apiData: packageData}, {setQueryParams}] = useGetDataApi(
    'api/members/package',
    {},
    {},
    false,
  );

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
    if (memberData?.length > 0) {
      const updatedMembers = memberData
        // .filter((member) => member.fullRegister)
        .map((member) => ({
          ...member,
          combinedLabel: `${member.memberFullName} (${member.mobileNumber})`,
        }));
      setMemberList(updatedMembers);
      } else {
      setMemberList([]);
    }
  }, [memberData]);

  React.useEffect(() => {
    if (memberSearch?.trim()?.length >= 3) {
      const debounceTimeout = setTimeout(() => {
        setMemberQueryParams({search: memberSearch.trim()});
      }, 300);
      return () => clearTimeout(debounceTimeout);
    }
    setMemberList([]);
  }, [memberSearch]);

  React.useEffect(() => {
    if (selectedMember?._id) {
      setQueryParams({id: selectedMember._id});
    } else {
      setSelectedPackage(null);
      setPackageList([]);
    }
  }, [selectedMember]);

  React.useEffect(() => {
    if (packageData?.length > 0) {
      const filteredPackages = packageData.filter((packageItem) => {
        const isFranchiseBranch = selectedBranch.isFranchise;
        const isWithinValidity =
          packageItem.packageValidity === 'fixed'
            ? values.booking_date <= new Date(packageItem.validDate)
            : true;
        if (!isWithinValidity || packageItem.currentBalance <= 0) {
          return false;
        }

        if (!isFranchiseBranch) {
          // Case when the branch is NOT a franchise
          return (
            packageItem.package.branchGroup === 'direct branch' &&
            (packageItem.package.allBranchStatus ||
              packageItem.package.branchName.some(
                (branch) => branch === selectedBranch._id,
              ))
          );
        } else {
          // Case when the branch IS a franchise
          return (
            packageItem.package.branchGroup === 'franchise branch' &&
            packageItem.package.branchName.some(
              (branch) => branch === selectedBranch._id,
            )
          );
        }
      });
      setPackageList(filteredPackages);
    } else {
      setSelectedPackage(null);
      setPackageList([]);
    }
  }, [packageData, selectedBranch, values.booking_date]);

  React.useEffect(() => {
    if (selectedPackage) {
      if (selectedPackage.currentBalance >= values?.availableCount) {
        setMaxPax(values?.availableCount);
        setSessionError(false);
      } else {
        if (selectedPackage.currentBalance == 0) {
          setSessionError(true);
        } else {
          setMaxPax(selectedPackage.currentBalance);
        }
      }
    }
  }, [selectedPackage]);

  console.log('values', values, errors);

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 5,
          ml: -6,
          mr: -6,
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
                  {formatMessage({id: 'booking.floorView.branchLabel'})}{' '}
                  {values.branch.branchName}
                </Box>
                <Box>
                  {formatMessage({id: 'booking.floorView.floorLabel'})}{' '}
                  {values.floor.floorNo}
                </Box>
                <Box>{values.room.Title}</Box>
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
                  {formatMessage({id: 'booking.floorView.dateLabel'})}{' '}
                  {dayjs(values.start).format('MMMM D, YYYY')}
                </Box>
                <Box>
                  {formatMessage({id: 'booking.floorView.slotLabel'})}{' '}
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
                 {formatMessage(
                    {id: 'booking.floorView.availableSlot'},
                    {count: values.availableCount},
                  )}
                </Box>
                <Box>
                  {formatMessage(
                    {id: 'booking.floorView.typeLabel'},
                    {type: values.room.Gender},
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid size={12}>
              <Autocomplete
                disableListWrap
                ListboxComponent={VirtualizedListbox}
                value={selectedMember}
                options={memberList}
                getOptionLabel={(option) => option.combinedLabel}
                isOptionEqualToValue={(option, value) =>
                  option.combinedLabel === value.combinedLabel
                }
                inputValue={memberSearch}
                noOptionsText={
                  memberSearch.trim().length === 0
                    ? 'Type to search for members'
                    : 'Member not found'
                }
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'clear') {
                    setMemberSearch('');
                    setSelectedMember(null);
                    setSelectedPackage(null);
                    setSessionError(false);
                    setFieldValue('member', '');
                    return;
                  }
                  setMemberSearch(newInputValue || '');
                }}
                onChange={(event, newInputValue) => {
                  if (newInputValue?._id) {
                    setFieldValue('member', newInputValue._id);
                    setSelectedMember(newInputValue);
                  } else {
                    setFieldValue('member', newInputValue);
                    setSelectedMember(newInputValue);
                    setSelectedPackage(null);
                    setSessionError(false);
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography component='span' noWrap>
                      {option.combinedLabel}
                    </Typography>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={formatMessage({id: 'booking.floorView.selectMember'})}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              {packageList?.length > 0 ? (
                <Autocomplete
                  // freeSolo
                  // id='free-solo-2-demo'
                  // disableClearable
                  value={selectedPackage}
                  options={packageList}
                  getOptionLabel={(option) => {
                    const balanceText =
                      option?.originalBalance == 99999
                        ? formatMessage({id: 'booking.floorView.unlimited'})
                        : formatMessage(
                            {id: 'booking.floorView.balanceLabel'},
                            {count: option?.currentBalance},
                          );
                    return `${option?.package?.packageName}(${balanceText})`;
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.package.packageName === value?.package?.packageName
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
                     <TextField
                      {...params}
                      label={formatMessage({
                        id: 'booking.floorView.selectPackage',
                      })}
                    />
                  )}
                />
              ) : null}
            </Grid>
            {selectedPackage?.currentBalance > 0 ? (
              <Grid
                item
                xs={12}
               >
                {formatMessage(
                  {id: 'booking.floorView.balanceAvailableSession'},
                  {
                    count:
                      selectedPackage?.originalBalance == 99999
                        ? formatMessage({id: 'booking.floorView.unlimited'})
                        : selectedPackage?.currentBalance,
                  },
                )}
              </Grid>
            ) : null}
            {selectedPackage?.currentBalance > 0 ? (
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
                    {values.room.Gender == 'Male' ? (
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
                {formatMessage({id: 'booking.floorView.sessionUnavailable'})}
              </Typography>
            ) : null}
            {paxError ? (
              <Typography sx={{color: 'red', ml: 4}}>
                {formatMessage({id: 'booking.floorView.exceedSlot'})}
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
          disabled={
            paxError ? true : sessionError ? true : totalPax <= 0 ? true : false
          }
        >
          <IntlMessages id='anran.confirm.Booking' />
        </Button>
      </Box>
      <AppInfoView />
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
  selectedBranch: PropTypes.object,
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
