import React from 'react';
import {dayjsLocalizer, Views} from 'react-big-calendar';
import events from '../events';
import dayjs from 'dayjs';
import {Box} from '@mui/material';
import {Calendar} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppScrollbar from '@anran/core/AppScrollbar';

const localizer = dayjsLocalizer(dayjs);

const Timeslots = (props) => {
  return (
    <>
      <AppScrollbar
        sx={{
          mt: 2,
          p: 4,
          borderRadius: 3,
          maxHeight: 580,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{maxHeight: '900px'}}>
          <Calendar
            {...props}
            defaultDate={new Date(2018, 0, 29)}
            defaultView={Views.DAY}
            events={events}
            localizer={localizer}
            step={30}
            timeslots={1}
            min={new Date(0, 0, 0, 10, 0, 0)}
            max={new Date(0, 0, 0, 23, 0, 0)}
            views={['day', 'work_week']}
          />
        </Box>
      </AppScrollbar>
    </>
  );
};

export default Timeslots;
