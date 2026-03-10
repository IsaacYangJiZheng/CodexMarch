import React from 'react';
import {dayjsLocalizer, Views} from 'react-big-calendar';
import {
  Box,
  Card,
  Typography,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import dayjs from 'dayjs';

import BookedMembers from './BookedMembers';
import ViewPastBooking from './ViewPastBooking';
import EventItem from './EventItem';
import {StyledCalendar} from './calandar.style';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import {Fonts} from 'shared/constants/AppEnums';
import AppGridContainer from '@anran/core/AppGridContainer';
import {useGetDataApi} from '@anran/utility/APIHooks';
// import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {stringasUTC} from '@anran/services/utils/dateutils';
import {useIntl} from 'react-intl';
const localizer = dayjsLocalizer(dayjs);
const utc = require('dayjs/plugin/utc');
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const Timeslots = (props) => {
  const {formatMessage} = useIntl();
  // const infoViewActionsContext = useInfoViewActionsContext();
  const [branchList, setBranchList] = React.useState([]);
  const [selectedBranch, setSelectedBranch] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [rooms, setRooms] = React.useState([]);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedDateRange, setSelectedDateRange] = React.useState(null);
  const [calendarStartDate, setCalendarStartDate] = React.useState(dayjs());
  const [calendarEndDate, setCalendarEndDate] = React.useState(dayjs());
  const [events, setEvents] = React.useState([]);
  // const [blockedSlots, setBlockedSlots] = React.useState([]);
  const [slotStartTime, setSlotStartTime] = React.useState(
    new Date(0, 0, 0, 7, 0, 0),
  );
  const [slotEndTime, setSlotEndTime] = React.useState(
    new Date(0, 0, 0, 22, 0, 0),
  );
  const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'));

  const [showMembersDrawerOpen, setShowMembersDrawerOpen] =
    React.useState(false);
  const [showPastBookingDrawerOpen, setShowPastBookingDrawerOpen] =
    React.useState(false);

  const [{apiData: branchData, loading}] = useGetDataApi(
    'api/branch/role-based',
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

  const [{apiData: eventData}, {setQueryParams: setQueryParams2, reCallAPI}] =
    useGetDataApi('api/booking/floor/get-booking-list', {}, {}, false);

  React.useEffect(() => {
    if (branchData?.length > 0) {
      let tempArray = [];
      let defaultOption = {
        _id: '',
        branchName: formatMessage({id: 'common.none'}),
      };
      // tempArray.push(defaultOption);
      tempArray = [defaultOption].concat(branchData);
      setBranchList(tempArray);
      setSelectedBranch((prev) => {
        if (prev && prev._id) {
          const match = branchData.find((branch) => branch._id === prev._id);
          return match || prev;
        }
        return tempArray[0];
      });
    }
  }, [branchData, formatMessage]);

  React.useEffect(() => {
    if (floorData?.length > 0) {
      setFloor(floorData[0]);
    } else {
      setFloor('');
    }
  }, [floorData]);

  React.useEffect(() => {
    if (
      selectedBranch?._id != '' &&
      selectedBranch?._id?.length > 0 &&
      selectedBranch?._id != undefined
    ) {
      console.log('booking-view', selectedBranch?._id?.length);
      setQueryParams({id: selectedBranch._id});
      let aa = dayjs(selectedBranch.operatingStart).get('hour');
      let bb = dayjs(selectedBranch.operatingEnd).get('hour');
      setSlotStartTime(new Date(0, 0, 0, aa, 0, 0));
      if (bb == 0) {
        bb = 23;
        setSlotEndTime(new Date(0, 0, 0, bb, 59, 59, 999));
      } else {
        setSlotEndTime(new Date(0, 0, 0, bb, 0, 0));
      }
      // setSlotStartTime(new Date(0, 0, 0, aa, 0, 0));
      // setSlotEndTime(new Date(0, 0, 0, bb, 0, 0));
    } else {
      setQueryParams({id: selectedBranch._id});
      setRooms([]);
      setEvents([]);
    }
  }, [selectedBranch]);

  React.useEffect(() => {
    if (selectedBranch?._id != '' && floor != '') {
      setQueryParams1({fid: floor._id, bid: selectedBranch._id});
    } else {
      setFloor('');
    }
  }, [floor]);

  React.useEffect(() => {
    if (roomData?.length > 0) {
      const adjustedResources = roomData?.map((item) => ({
          Id: item._id,
          Title: formatMessage(
            {id: 'booking.calendar.roomLabel'},
            {room: item.room_no} 
          ),
          Size: item.roomCapacity,
          Gender: item.room_gender,
        }));
      console.log('adjustedResources', adjustedResources);
      setRooms(adjustedResources);
      setQueryParams2({
        floorId: floor._id,
        startDate: dayjs(calendarStartDate).format('YYYY-MM-DD'),
        endDate: dayjs(calendarEndDate).format('YYYY-MM-DD'),
      });
    } else {
      setRooms([]);
      setEvents([]);
    }
  }, [roomData, calendarStartDate, calendarEndDate, formatMessage]);

  React.useEffect(() => {
    if (eventData?.length > 0) {
      const updatedEvents = eventData.map((event) => ({
        ...event,
        start: stringasUTC(event.start),
        end: stringasUTC(event.end),
      }));
      setEvents(updatedEvents);
    } else {
      setEvents([]);
    }
  }, [eventData]);

  // React.useEffect(() => {
  //   console.log('event', events);
  //   const autoCancelBookings = () => {
  //     const now = dayjs();

  //     events.forEach((event) => {
  //       const startTime = dayjs(event.start);
  //       const isPastCheckInWindow = now.isAfter(startTime.add(50, 'minute'));
  //       event.members.forEach((member) => {
  //         if (isPastCheckInWindow && member.bookingstatus === 'Booked') {
  //           console.log('here', event._id, member._id);
  //           const formData = new FormData();

  //           formData.append('id', member?._id);
  //           formData.append('slotId', event?._id);

  //           postDataApi(
  //             `/api/booking/cancel-booking`,
  //             infoViewActionsContext,
  //             formData,
  //             false,
  //             false,
  //             {
  //               'Content-Type': 'multipart/form-data',
  //             },
  //           )
  //             .then(() => {
  //               console.log('banana');
  //               reCallAPI();
  //             })
  //             .catch((error) => {
  //               infoViewActionsContext.fetchError(error.message);
  //             });
  //         }
  //       });
  //     });
  //   };

  //   const interval = setInterval(autoCancelBookings, 1000); // Check every minute
  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, [events, reCallAPI]);

  React.useEffect(() => {
    console.log('selectedDateRange', selectedDateRange);
    console.log('calendarEndDate', calendarStartDate, calendarEndDate);
  }, [selectedDateRange]);

  // React.useEffect(() => {
  //   if (selectedBranch && floor && selectedDate) {
  //     const fetchBlockedSlots = async () => {
  //       const formData = new FormData();
  //       formData.append('branch', selectedBranch._id);
  //       formData.append('floor', floor._id);
  //       formData.append('date', selectedDate);
  //       try {
  //         const response = await postDataApi(
  //           '/api/block-booking/check-blocking-by-date',
  //           infoViewActionsContext,
  //           formData,
  //           false,
  //           false,
  //           {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         );
  //         console.log('response', response);
  //         setBlockedSlots(response?.data || []);
  //       } catch (error) {
  //         infoViewActionsContext.fetchError(error.message);
  //       }
  //     };
  //     fetchBlockedSlots();
  //   }
  // }, [selectedBranch, floor, selectedDate]);

  // console.log('blockedSlots', blockedSlots);

  // const isSlotBlocked = (slotStart, slotEnd, roomId) => {
  //   return blockedSlots.some(block => {
  //     const appliesToRoom = block.isFullBranch || (Array.isArray(block.room) && block.room.map(String).includes(String(roomId)));
  //     const isActive = block.blockingStatus === 'Scheduled';

  //     const slotDate = dayjs(slotStart).format('YYYY-MM-DD');
  //     const blockStartDate = dayjs(block.blockingStart).format('YYYY-MM-DD');
  //     const blockEndDate = dayjs(block.blockingEnd).format('YYYY-MM-DD');
  //     const inDateRange = dayjs(slotDate).isSameOrAfter(blockStartDate) && dayjs(slotDate).isSameOrBefore(blockEndDate);

  //     const slotTimeStr = `${dayjs(slotStart).format('HH:mm')}-${dayjs(slotEnd).format('HH:mm')}`;
  //     const isTimeBlocked = Array.isArray(block.blockTimeSlot) && block.blockTimeSlot.includes(slotTimeStr);

  //     return appliesToRoom && isActive && inDateRange && isTimeBlocked;
  //   });
  // };

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const handleFloorChange = (event) => {
    setFloor(event.target.value);
  };

  const handleDateChange = (newDate) => {
    const formattedDate = newDate.format('YYYY-MM-DD');
    setSelectedDate(formattedDate);
    setCalendarStartDate(newDate);
    setCalendarEndDate(newDate);
  };

  const onNavigationChange = (e) => {
    if (Array.isArray(e)) {
      setSelectedDateRange(e);
      setCalendarStartDate(e[0]);
      setCalendarEndDate(e[e.length - 1]);
    } else {
      const newDate = dayjs(e);
      setSelectedDate(newDate.format('YYYY-MM-DD'));
      setCalendarStartDate(newDate);
      setCalendarEndDate(newDate);
    }
  };

  const handleNavigate = (date) => {
    const newDate = dayjs(date);
    setSelectedDate(newDate.format('YYYY-MM-DD'));
    setCalendarStartDate(newDate);
    setCalendarEndDate(newDate);
  };

  const onSelectSlot = (e) => {
    let currentRoom = rooms.find((x) => x.Id === e.resourceId);
    console.log('onSelectSlot', e, rooms, currentRoom);
    const check = dayjs(e.start).isSameOrAfter(dayjs(), 'day');
    // const dd = dayjs().subtract(4, 'hour');
    // const isAfter4hrs = dayjs(e.start).isAfter(dayjs().subtract(4, 'hour'));
    const isAfter4hrs = dayjs(e.start).isAfter(dayjs().subtract(1, 'hour'));
    console.log('Today123', check, isAfter4hrs);
    if (check && isAfter4hrs) {
      if (e?.room) {
        if (typeof e?.room == 'string') {
          e.title = currentRoom.roomTitle;
          (e.branch = selectedBranch),
            (e.floor = floor),
            (e.room = currentRoom);
          setSelectedSlot(e);
        } else {
          e.title = currentRoom.roomTitle;
          setSelectedSlot(e);
        }
      } else {
        e.title = currentRoom.roomTitle;
        (e.branch = selectedBranch), (e.floor = floor), (e.room = currentRoom);
        setSelectedSlot(e);
      }
      setShowMembersDrawerOpen(true);
    } else {
      if (e.title) {
        setSelectedSlot(e);
        setShowPastBookingDrawerOpen(true);
      }
    }
  };

  console.log(
    'selectedSlot',
    selectedSlot,
    new Date(0, 0, 0, 22, 0, 0),
    slotStartTime,
    slotEndTime,
  );

  console.log('floorBranch', floor, selectedBranch);

  function TimeSlotWrapper({children, resource, value}) {
    // console.log('TimeSlotWrapper', value);
    if (resource === undefined) {
      return children;
    }
    // const tt = dayjs(value);
    // const rr = dayjs(value).isBefore(dayjs().subtract(4, 'hour'));
    const rr = dayjs(value).isBefore(dayjs(), 'hour');
    console.log('TimeSlotWrapper', value, rr);
    if (rr) {
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        className: child.props.className + ' rbc-off-range-bg-1',
      });
    } else {
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        className: child.props.className,
      });
    }
  }

  return (
    <>
      {/* <Card sx={{p: 5}}> */}

      {/* </Card> */}
      <Card sx={{p: 5}}>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <Box
            component='h6'
            sx={{
              mb: 2,
              mt: 0,
              p: 2,
              fontSize: 18,
              fontWeight: Fonts.SEMI_BOLD,
              borderBottom: '1px solid black',
            }}
          >
            {formatMessage({id: 'booking.calendar.dailyTitle'})}
          </Box>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'row'}}>
          <FormControl sx={{m: 1, minWidth: 120}}>
            <InputLabel id='branch-select-error-label'>
              {formatMessage({id: 'booking.calendar.branch'})}
            </InputLabel>
            <Select
              labelId='branch-select-error-label'
              id='branch-select-error'
              value={selectedBranch}
              label={formatMessage({id: 'booking.calendar.branch'})}
              onChange={handleBranchChange}
              // renderValue={(value) => `⚠️  - ${value.branchName}`}
            >
              {loading ? (
                <MenuItem>
                  <em>None</em>
                </MenuItem>
              ) : (
                branchList?.map((item, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item}
                      sx={{
                        padding: 2,
                        cursor: 'pointer',
                        minHeight: 'auto',
                      }}
                    >
                      {item.branchName}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
          {floorData?.length > 0 && (
            <FormControl sx={{m: 1, minWidth: 120}}>
              <InputLabel id='floor-select-error-label'>
                {formatMessage({id: 'booking.calendar.floor'})}
              </InputLabel>
              <Select
                labelId='floor-select-error-label'
                id='floor-select-error'
                value={floor}
                label={formatMessage({id: 'booking.calendar.floor'})}
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
                      value={item}
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
            </FormControl>
          )}
          {selectedBranch && floor && (
            <DatePicker
              sx={{ m: 1, minWidth: 150}}
              label={formatMessage({id: 'booking.calendar.selectDate'})}
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          )}
          <Box sx={{flex: 1}}></Box>
          {/* <Button variant='outlined' onClick={handleCheckCompletion}>
            Check for Completion
          </Button> */}
        </Box>
        {/* <AddBookingDrawer
          isAddCardOpen={addDrawerOpen}
          onCloseAddCard={() => setAddDrawerOpen(false)}
          // reCallAPI={reCallAPI}
        /> */}
        {selectedSlot && showMembersDrawerOpen ? (
          <BookedMembers
            startTime={slotStartTime}
            endTime={slotEndTime}
            isMemberListOpen={showMembersDrawerOpen}
            onCloseList={() => setShowMembersDrawerOpen(false)}
            slot={selectedSlot}
            reCallAPI={reCallAPI}
            selectedBranch={selectedBranch}
          />
        ) : null}
        {selectedSlot && showPastBookingDrawerOpen ? (
          <ViewPastBooking
            isMemberListOpen={showPastBookingDrawerOpen}
            onCloseList={() => setShowPastBookingDrawerOpen(false)}
            slot={selectedSlot}
            reCallAPI={reCallAPI}
          />
        ) : null}
      </Card>
      <Box sx={{p: 2}}></Box>
      <AppGridContainer spacing={4}>
        <Grid size={{xs: 12, md: 8}}></Grid>
        <Grid size={{xs: 12, md: 4}}></Grid>
      </AppGridContainer>
      {rooms?.length > 0 ? (
        <Box
          sx={{
            maxHeight: '600px',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <StyledCalendar
            {...props}
            resourceIdAccessor={'Id'}
            resourceTitleAccessor={'Title'}
            resources={rooms}
            events={events}
            localizer={localizer}
            step={60}
            timeslots={1}
            defaultView={Views.DAY}
            showAllEvents={false}
            views={{month: false, week: false, day: true, agenda: false}}
            date={dayjs(selectedDate).toDate()}
            min={slotStartTime ? slotStartTime : new Date(0, 0, 0, 10, 0, 0)}
            max={slotEndTime ? slotEndTime : new Date(0, 0, 0, 22, 0, 0)}
            scrollToTime={new Date()}
            selectable
            onSelectEvent={(e) => onSelectSlot(e)}
            onSelectSlot={(e) => onSelectSlot(e)}
            // onSelectEvent={(e) => {
            //   if (isSlotBlocked(e.start, e.end, e.resourceId)) return;
            //   onSelectSlot(e);
            // }}
            // onSelectSlot={(e) => {
            //   if (isSlotBlocked(e.start, e.end, e.resourceId)) return;
            //   onSelectSlot(e);
            // }}
            onRangeChange={(e) => onNavigationChange(e)}
            onNavigate={handleNavigate}
            components={{
              event: (item) => <EventItem key={item.key} item={item.event} />,
              timeSlotWrapper: TimeSlotWrapper,
            }}
            eventPropGetter={(event, start, end, isSelected) => {
              console.log('eventPropGetter', event, start, end, isSelected);
              if (event?.availableSlot == 0) {
                var backgroundColor = '#fafafa';
              } else {
                backgroundColor = '#f2edde';
              }

              var style = {
                backgroundColor: backgroundColor,
                borderRadius: '0px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
              };
              return {
                style: style,
              };
              // const blocked = isSlotBlocked(start, end, event.resourceId);
              // let backgroundColor = '#f2edde';
              // if (event?.availableSlot == 0) {
              //   backgroundColor = '#fafafa';
              // }
              // if (blocked) {
              //   backgroundColor = '#e53935';
              // }

              // var style = {
              //   backgroundColor: backgroundColor,
              //   borderRadius: '0px',
              //   opacity: 0.8,
              //   color: 'white',
              //   border: '0px',
              //   display: 'block',
              //   pointerEvents: blocked ? 'none' : 'auto',
              //   cursor: blocked ? 'not-allowed' : 'pointer',
              // };
              // return {
              //   style: style,
              // };
            }}
            dayPropGetter={() => {
              return {
                className: 'day-slot',
                style: {
                  backgroundColor: '#045147',
                },
              };
            }}
            slotPropGetter={() => {
              // console.log('slotPropGetter', date);
              return {
                className: 'slot',
                style: {
                  minHeight: '7vh',
                },
              };
            }}
            // slotPropGetter={(date, resourceId) => {
            //   const slotStart = date;
            //   const slotEnd = dayjs(date).add(60, 'minute').toDate();
            //   const blocked = isSlotBlocked(slotStart, slotEnd, resourceId);
            //   return {
            //     className: 'slot',
            //     style: {
            //       minHeight: '7vh',
            //       backgroundColor: blocked ? '#e53935' : undefined,
            //       pointerEvents: blocked ? 'none' : 'auto',
            //       cursor: blocked ? 'not-allowed' : 'pointer',
            //     },
            //   };
            // }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: '600px',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '20px',
          }}
        >
          <Typography>
            {formatMessage({id: 'booking.calendar.noRooms'})}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Timeslots;