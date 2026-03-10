import React from 'react';
import {dayjsLocalizer, Views} from 'react-big-calendar';
import dayjs from 'dayjs';
import {StyledCalendar} from '../calandar.style';
import {Box, Card} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {useGetDataApi} from '@anran/utility/APIHooks';
// import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
// import AddBookingDrawer from '../AddBookingDrawer';
import BookedMembers from './BookedMembers';
import {Fonts} from 'shared/constants/AppEnums';
import EventItem from './EventItem';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import {stringasUTC} from '@anran/services/utils/dateutils';

const localizer = dayjsLocalizer(dayjs);

const Timeslots = (props) => {
  const [branch, setBranch] = React.useState({});
  const [floor, setFloor] = React.useState({});
  const [room, setRoom] = React.useState({});
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedDateRange, setSelectedDateRange] = React.useState(null);
  const [calendarStartDate, setCalendarStartDate] = React.useState(null);
  const [calendarEndDate, setCalendarEndDate] = React.useState(null);
  const [events, setEvents] = React.useState([]);

  // const [addDrawerOpen, setAddDrawerOpen] = React.useState(false);
  const [showMembersDrawerOpen, setShowMembersDrawerOpen] =
    React.useState(false);

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

  const [
    {apiData: eventData, loading: loading2},
    {setQueryParams: setQueryParams2, reCallAPI},
  ] = useGetDataApi('api/booking/get-booking-list', {}, {}, false);

  React.useEffect(() => {
    if (branchData?.length > 0) {
      setBranch(branchData[0]);
    }
  }, [branchData]);

  React.useEffect(() => {
    if (floorData?.length > 0) {
      setFloor(floorData[0]);
    }
  }, [floorData]);

  React.useEffect(() => {
    if (roomData?.length > 0) {
      setRoom(roomData[0]);
    }
  }, [roomData]);

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

  React.useEffect(() => {
    if (branch?._id != '') {
      setQueryParams({id: branch?._id});
    }
  }, [branch]);

  React.useEffect(() => {
    if (branch?._id != '' && floor?._id != '' && room?._id != '') {
      setQueryParams2({
        roomId: room?._id,
        startDate: dayjs(calendarStartDate).format('YYYY-MM-DD'),
        endDate: dayjs(calendarEndDate).format('YYYY-MM-DD'),
      });
    }
  }, [room, calendarStartDate, calendarEndDate]);

  React.useEffect(() => {
    if (branch?._id != '' && floor?._id != '') {
      setQueryParams1({fid: floor._id, bid: branch._id});
    }
  }, [floor]);

  React.useEffect(() => {
    console.log('selectedDateRange', selectedDateRange);
    console.log('calendarEndDate', calendarStartDate, calendarEndDate);
    if (selectedDateRange == null) {
      var curr = new Date(); // get current date
      var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
      var last = first + 6; // last day is the first day + 6

      const firstDay = new Date(curr.setDate(first)).toUTCString();
      const lastDay = new Date(curr.setDate(last)).toUTCString();
      setCalendarStartDate(firstDay);
      setCalendarEndDate(lastDay);
    }
  }, [selectedDateRange]);

  const handleBranchChange = (event) => {
    setBranch(event.target.value);
  };

  const handleFloorChange = (event) => {
    setFloor(event.target.value);
  };

  const handleRoomChange = (event) => {
    setRoom(event.target.value);
  };

  // const handleOpenDrawer = () => {
  //   setAddDrawerOpen(true);
  // };

  const onSelectSlot = (e) => {
    console.log('onSelectSlot', e);
    if (e?.room) {
      setSelectedSlot(e);
    } else {
      e.title = '';
      (e.branch = branch), (e.floor = floor), (e.room = room);
      setSelectedSlot(e);
    }

    setShowMembersDrawerOpen(true);
  };

  const onNavigationChange = (e) => {
    console.log('onNavigationChange', e);
    if (e.length == 7) {
      setSelectedDateRange(e);
      setCalendarStartDate(e[0]);
      setCalendarEndDate(e[6]);
    }
    if (e.length == 1) {
      setSelectedDateRange(e);
      setCalendarStartDate(e[0]);
      setCalendarEndDate(e[0]);
    }
  };

  console.log('selectedSlot', selectedSlot);
  console.log('events', events);
  console.log('hi weekly');

  return (
    <>
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
            Booking: Calendar Weekly View
          </Box>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'row'}}>
          <FormControl sx={{m: 1, minWidth: 120}}>
            <InputLabel id='branch-select-error-label'>Branch</InputLabel>
            <Select
              labelId='branch-select-error-label'
              id='branch-select-error'
              value={branch}
              label='Branch'
              onChange={handleBranchChange}
            >
              {loading ? (
                <MenuItem>
                  <em>None</em>
                </MenuItem>
              ) : (
                branchData?.map((item, index) => (
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
                ))
              )}
            </Select>
          </FormControl>
          {floorData?.length > 0 && (
            <FormControl sx={{m: 1, minWidth: 120}}>
              <InputLabel id='floor-select-error-label'>Floor</InputLabel>
              <Select
                labelId='floor-select-error-label'
                id='floor-select-error'
                value={floor}
                label='Floor'
                onChange={handleFloorChange}
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
          {roomData?.length > 0 && (
            <FormControl sx={{m: 1, minWidth: 120}}>
              <InputLabel id='room-select-error-label'>Room</InputLabel>
              <Select
                labelId='room-select-error-label'
                id='room-select-error'
                value={room}
                label='Room'
                onChange={handleRoomChange}
              >
                {loading ? (
                  <MenuItem>
                    <em>None</em>
                  </MenuItem>
                ) : (
                  roomData?.map((item, index) => (
                    <MenuItem
                      key={index}
                      value={item}
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
            </FormControl>
          )}
          <Box sx={{flex: 1}}></Box>
          {/* <Button
            variant='outlined'
            startIcon={<PostAddOutlinedIcon />}
            onClick={handleOpenDrawer}
          >
            Add Booking
          </Button> */}
        </Box>
        <Box sx={{maxHeight: '500px'}}>{room != '' && <></>}</Box>
        {/* <AddBookingDrawer
          isAddCardOpen={addDrawerOpen}
          onCloseAddCard={() => setAddDrawerOpen(false)}
        /> */}
        {selectedSlot ? (
          <BookedMembers
            isMemberListOpen={showMembersDrawerOpen}
            onCloseList={() => setShowMembersDrawerOpen(false)}
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
          loading={loading2}
          events={events?.length > 0 ? events : []}
          localizer={localizer}
          step={60}
          timeslots={1}
          defaultView={Views.WEEK}
          showAllEvents={false}
          views={{month: false, week: true, day: false, agenda: false}}
          defaultDate={new dayjs()}
          min={new Date(0, 0, 0, 6, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          selectable
          onSelectEvent={(e) => onSelectSlot(e)}
          onSelectSlot={(e) => onSelectSlot(e)}
          onRangeChange={(e) => onNavigationChange(e)}
          onNavigate={(e) => console.log('Naviagte', e)}
          onView={(e) => console.log('onView', e)}
          components={{
            event: (item) => <EventItem key={item.key} item={item.event} />,
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
          }}
          slotPropGetter={() => {
            return {
              className: 'slot',
              style: {
                minHeight: '5vh',
              },
            };
          }}
        />
      </Box>
    </>
  );
};

export default Timeslots;
