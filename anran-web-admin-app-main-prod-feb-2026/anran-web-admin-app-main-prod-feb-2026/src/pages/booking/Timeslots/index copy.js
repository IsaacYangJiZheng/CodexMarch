import React from 'react';
import {dayjsLocalizer, Views} from 'react-big-calendar';
import events from '../events';
import dayjs from 'dayjs';
import {StyledCalendar} from '../calandar.style';
import {Box, Card, Button} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AppScrollbar from '@anran/core/AppScrollbar';
import {useGetDataApi} from '@anran/utility/APIHooks';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import AddBookingDrawer from '../AddBookingDrawer';
import {Fonts} from 'shared/constants/AppEnums';
import EventItem from './EventItem';

const localizer = dayjsLocalizer(dayjs);

const Timeslots = (props) => {
  const [branch, setBranch] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [room, setRoom] = React.useState('');
  const [filters, setFilters] = React.useState({
    branch: {value: null},
    floor: {value: null},
    room: {value: null},
  });

  const [addDrawerOpen, setAddDrawerOpen] = React.useState(false);

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
    if (branchData?.length > 0) {
      setBranch(branchData[0]._id);
    }
  }, [branchData]);

  React.useEffect(() => {
    if (floorData?.length > 0) {
      setFloor(floorData[0]._id);
    }
  }, [floorData]);

  React.useEffect(() => {
    if (roomData?.length > 0) {
      setRoom(roomData[0]._id);
    }
  }, [roomData]);

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


  const handleBranchChange = (event) => {
    setBranch(event.target.value);
    setFilters((prevState) => ({
      ...prevState,
      branch: event.target.value,
    }));
  };

  const handleFloorChange = (event) => {
    setFloor(event.target.value);
    setFilters((prevState) => ({
      ...prevState,
      floor: event.target.value,
    }));
  };

  const handleRoomChange = (event) => {
    setRoom(event.target.value);
    setFilters((prevState) => ({
      ...prevState,
      room: event.target.value,
    }));
  };

  const handleOpenDrawer = () => {
    setAddDrawerOpen(true);
  };

  console.log('filters', filters);

  return (
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
          Booking: Calendar View
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
          </FormControl>
        )}
        <Box sx={{flex: 1}}></Box>
        <Button
          variant='outlined'
          startIcon={<PostAddOutlinedIcon />}
          onClick={handleOpenDrawer}
        >
          Add Booking
        </Button>
      </Box>

      {room != '' && (
        <AppScrollbar
          sx={{
            mt: 2,
            p: 4,
            borderRadius: 3,
            maxHeight: 580,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StyledCalendar
              {...props}
              events={events}
              localizer={localizer}
              step={60}
              timeslots={1}
              defaultView={Views.WEEK}
              showAllEvents={false}
              views={{month: false, week: true, day: true, agenda: false}}
              defaultDate={new Date(2019, 10, 12)}
              min={new Date(0, 0, 0, 10, 0, 0)}
              max={new Date(0, 0, 0, 22, 0, 0)}
              components={{
                event: (item) => <EventItem key={item.key} item={item.event} />,
              }}
            />
          </Box>
        </AppScrollbar>
      )}
      <AddBookingDrawer
        isAddCardOpen={addDrawerOpen}
        onCloseAddCard={() => setAddDrawerOpen(false)}
      />
    </Card>
  );
};

export default Timeslots;
