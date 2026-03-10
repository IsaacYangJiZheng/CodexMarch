import React from 'react';
import {Box, Button, Card, CardContent} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import IntlMessages from '@anran/utility/IntlMessages';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {useGetDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import Divider from '@mui/material/Divider';

import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {styled} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
  '.MuiToggleButton-root.Mui-selected': {
    backgroundColor: 'green',
    color: 'white',
  },
  '.MuiToggleButton-root:hover': {
    backgroundColor: 'green',
    color: 'white',
  },

  '& .MuiToggleButtonGroup-grouped': {
    margin: '10px',
    border: 0,
    backgroundColor: 'aliceblue',
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
      marginLeft: '20px',
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
      marginLeft: '20px',
    },
  },
}));

const AddBookingForm = ({values, errors}) => {
  const [branch, setBranch] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [room, setRoom] = React.useState('');
  const [slot, setSlot] = React.useState([]);
  const [bookingDate, setBookingDate] = React.useState(dayjs());
  const [topic, setTopic] = React.useState(null);
  var GoogleCalenderAppointments = null;

  const [{apiData: branchData, loading}] = useGetDataApi(
    'api/branch',
    {},
    {},
    true,
  );
  const [{apiData: floorData}, {setQueryParams}] = useGetDataApi(
    'api/floors/by/branch',
    {},
    {},
    false,
  );
  const [{apiData: roomData}, {setQueryParams: setQueryParams1}] =
    useGetDataApi('api/rooms/by/floor', {}, {}, false);

  React.useEffect(() => {
    if (branch != '') {
      setQueryParams({id: branch});
    }
  }, [branch]);

  React.useEffect(() => {
    if (branch != '' && floor != '') {
      setQueryParams1({fid: floor, bid: branch});
    }
  }, [floor]);

  React.useEffect(() => {
    // var message = '';
    if (room != '') {
      setSlot(getTimeSlotsForDay());
      // getTimeSlotsForDay();
      // message +=
      //   getTimeSlotsForDay()
      //     .map(function (it) {
      //       return it.toTimeString();
      //     })
      //     .join(',\n') + '\n';
      // console.log('message', message);
    }
  }, [room]);

  function getTimeSlotsForDay() {
    var date = new Date();
    var timeSlots = [];
    var timeSlots1 = [];
    var dayStart = new Date(date);
    var dayEnd = new Date(date);

    switch (date.getDay()) {
      case 0: //Sunday
        return timeSlots;
      case 6: //Saturday
        dayStart.setHours(10, 0, 0, 0);
        dayEnd.setHours(20, 0, 0, 0);
        break;
      default:
        dayStart.setHours(13, 0, 0, 0);
        dayEnd.setHours(20, 0, 0, 0);
    }
    do {
      if (!checkGoogleCalendarConflict(dayStart)) {
        timeSlots.push(new Date(dayStart));
        var endTime = dayjs(dayStart).add(60, 'minutes').format('h:mm A');
        var tt = dayjs(dayStart).format('h:mm A') + '--' + endTime;
        // timeSlots1.push(dayjs(dayStart).format('h:mm A'));
        timeSlots1.push(tt);
      }
      dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 60);
    } while (dayStart < dayEnd);
    console.log('timeSlots1', timeSlots1);
    return timeSlots1;
  }

  function checkGoogleCalendarConflict(date) {
    console.log(date);
    var hasConflict = false;
    if (!GoogleCalenderAppointments) {
      //logic to get scheduled appointments
    }

    //iterate through relevant scheduled appointments
    //if argument `date` has conflict, return true
    //else, return false

    return hasConflict;
  }

  const handleBranchChange = (event) => {
    setBranch(event.target.value);
  };

  const handleFloorChange = (event) => {
    setFloor(event.target.value);
  };

  const handleRoomChange = (event) => {
    setRoom(event.target.value);
  };

  // const onSelectTimeSlot = (id) => {
  //   if (selectedTimeSlot.some((item) => item === id)) {
  //     setSelectedTimeSlot(selectedTimeSlot.filter((item) => item !== id));
  //   } else {
  //     setSelectedTimeSlot(selectedTimeSlot.concat(id));
  //   }
  // };
  console.log('values', values, errors);
  console.log('slot', slot);

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
            <Grid size={5}>
              <AppGridContainer spacing={4}>
                <Grid size={12}>
                  <Card variant='outlined' sx={{p: 0}}>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant='h4'
                        sx={{fontWeight: Fonts.SEMI_BOLD, mt: 4}}
                      >
                        Booking Date:{' '}
                        {dayjs(bookingDate).format('MMMM D, YYYY')}
                      </Typography>
                      <DateCalendar
                        sx={{
                          '.MuiDayCalendar-root': {
                            color: '#1565c0',
                            borderRadius: '5px',
                            borderWidth: '0px',
                            borderColor: '#2196f3',
                            border: '0px solid',
                            backgroundColor: '#90caf9',
                          },
                        }}
                        value={bookingDate}
                        onChange={(newValue) => setBookingDate(newValue)}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant='h5'
                        sx={{fontWeight: Fonts.SEMI_BOLD, mb: 10}}
                      >
                        Location Selection:
                      </Typography>
                      <AppGridContainer spacing={4}>
                        <Grid size={12}>
                          <FormControl fullWidth error={errors?.branch}>
                            <InputLabel id='branch-select-error-label'>
                              Branch
                            </InputLabel>
                            <Select
                              labelId='branch-select-error-label'
                              id='branch-select-error'
                              value={branch}
                              label='Branch'
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
                        </Grid>
                        <Grid size={12}>
                          {floorData?.length > 0 && (
                            <FormControl fullWidth error={errors?.floor}>
                              <InputLabel id='floor-select-error-label'>
                                Floor
                              </InputLabel>
                              <Select
                                labelId='floor-select-error-label'
                                id='floor-select-error'
                                value={floor}
                                label='Floor'
                                onChange={handleFloorChange}
                                // renderValue={(value) => `⚠️  - ${value}`}
                              >
                                {loading ? (
                                  <MenuItem>
                                    <em>None</em>
                                  </MenuItem>
                                ) : (
                                  floorData?.map((item, index) => (
                                    <MenuItem
                                      key={index}
                                      value={item._id}
                                      sx={{
                                        padding: 2,
                                        cursor: 'pointer',
                                        minHeight: 'auto',
                                      }}
                                    >
                                      {item.floorNo}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              <FormHelperText>
                                {errors?.floor ? 'select a floor' : ''}
                              </FormHelperText>
                            </FormControl>
                          )}
                        </Grid>
                        <Grid size={12}>
                          {roomData?.length > 0 && (
                            <FormControl fullWidth error={errors?.room}>
                              <InputLabel id='room-select-error-label'>
                                Room
                              </InputLabel>
                              <Select
                                labelId='room-select-error-label'
                                id='room-select-error'
                                value={room}
                                label='Room'
                                onChange={handleRoomChange}
                                // renderValue={(value) => `⚠️  - ${value}`}
                              >
                                {loading ? (
                                  <MenuItem>
                                    <em>None</em>
                                  </MenuItem>
                                ) : (
                                  roomData?.map((item, index) => (
                                    <MenuItem
                                      key={index}
                                      value={item._id}
                                      sx={{
                                        padding: 2,
                                        cursor: 'pointer',
                                        minHeight: 'auto',
                                      }}
                                    >
                                      {item.room_no}
                                    </MenuItem>
                                  ))
                                )}
                              </Select>
                              <FormHelperText>
                                {errors?.room ? 'select a room' : ''}
                              </FormHelperText>
                            </FormControl>
                          )}
                        </Grid>
                      </AppGridContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </AppGridContainer>
            </Grid>
            <Grid size={7}>
              <Card variant='outlined' sx={{p: 0}}>
                <CardContent>
                  <AppGridContainer spacing={4}>
                    <Grid size={12}>
                      {room ? (
                        <AppGridContainer spacing={4}>
                          <Grid size={12}>
                            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                              <Box
                                component='h6'
                                sx={{
                                  mb: 2,
                                  mt: 4,
                                  fontSize: 14,
                                  fontWeight: Fonts.SEMI_BOLD,
                                }}
                              >
                                Time Slots (60 minutes):{' '}
                                {bookingDate
                                  ? dayjs(bookingDate).format('MMMM D, YYYY')
                                  : ''}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={12}>
                            <Paper
                              elevation={0}
                              sx={{
                                display: 'flex',
                                // border: (theme) => `1px solid ${theme.palette.divider}`,
                                flexWrap: 'wrap',
                              }}
                            >
                              <StyledToggleButtonGroup
                                size='small'
                                value={topic}
                                exclusive
                                onChange={(event, newType) => {
                                  setTopic(newType);
                                  // setFieldValue('topic', newType);
                                }}
                                aria-label='text formatting'
                                sx={{display: 'inline'}}
                              >
                                {slot?.map((item) => {
                                  return (
                                    <ToggleButton
                                      value={item}
                                      key={item}
                                      aria-label='bold'
                                    >
                                      {item}
                                    </ToggleButton>
                                  );
                                })}
                              </StyledToggleButtonGroup>
                            </Paper>
                          </Grid>
                          <Grid size={12}>
                            <Divider />
                          </Grid>
                        </AppGridContainer>
                      ) : (
                        <Box
                          component='h6'
                          sx={{
                            mb: {xs: 4, xl: 6},
                            mt: 0,
                            fontSize: 14,
                            fontWeight: Fonts.SEMI_BOLD,
                          }}
                        >
                          Please select date & Location to see available
                          timeslots for booking
                        </Box>
                      )}
                    </Grid>
                    <Grid size={12}>
                      {room ? (
                        <AppGridContainer spacing={5}>
                          <Grid size={12}>
                            <Box
                              sx={{display: 'flex', flexDirection: 'column'}}
                            >
                              <Box
                                component='h6'
                                sx={{
                                  mb: 2,
                                  mt: 4,
                                  fontSize: 14,
                                  fontWeight: Fonts.SEMI_BOLD,
                                }}
                              >
                                Slots Details: {topic}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={12}>
                            {room && topic && (
                              <Table
                                sx={{maxWidth: 350}}
                                size='small'
                                aria-label='a dense table'
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Description</TableCell>
                                    <TableCell align='right'>Booked</TableCell>
                                    <TableCell align='right'>
                                      Available
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell
                                      component='th'
                                      scope='row'
                                      sx={{borderBottom: 0}}
                                    >
                                      {'Male or Female'}
                                    </TableCell>
                                    <TableCell
                                      sx={{borderBottom: 0}}
                                      align='right'
                                    >
                                      {'5 persons'}
                                    </TableCell>
                                    <TableCell
                                      sx={{borderBottom: 0}}
                                      align='right'
                                    >
                                      {'2 persons'}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            )}
                          </Grid>
                          <Grid size={12}>
                            <Divider />
                          </Grid>
                          <Grid size={12}>
                            <Box
                              sx={{display: 'flex', flexDirection: 'column'}}
                            >
                              <Box
                                component='h6'
                                sx={{
                                  mb: 4,
                                  mt: 4,
                                  fontSize: 14,
                                  fontWeight: Fonts.SEMI_BOLD,
                                }}
                              >
                                Member & Package Selection: {topic}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={12}>
                            <FormControl fullWidth error={errors?.member}>
                              <InputLabel id='branch-select-error-label'>
                                Member
                              </InputLabel>
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
                                {errors?.member ? 'select a member' : ''}
                              </FormHelperText>
                            </FormControl>
                          </Grid>
                          <Grid size={12}>
                            <FormControl fullWidth error={errors?.package}>
                              <InputLabel id='branch-select-error-label'>
                                Package
                              </InputLabel>
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
                                {errors?.package ? 'select a package' : ''}
                              </FormHelperText>
                            </FormControl>
                          </Grid>
                        </AppGridContainer>
                      ) : null}
                    </Grid>
                  </AppGridContainer>
                </CardContent>
              </Card>
            </Grid>
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
        >
          <IntlMessages id='anran.confirm.Booking' />
        </Button>
      </Box>
    </Form>
  );
};

export default AddBookingForm;
AddBookingForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  branchImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBranchImage: PropTypes.func,
  setBranchImageUrl: PropTypes.func,
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
