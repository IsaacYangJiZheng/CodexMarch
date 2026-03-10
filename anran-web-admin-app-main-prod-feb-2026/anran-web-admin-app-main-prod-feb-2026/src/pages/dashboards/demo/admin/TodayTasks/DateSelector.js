import React from 'react';
import DatePickerWrapper from './DatePickerWrapper';
// import TextField from '@mui/material/TextField';
// import {StaticDatePicker} from '@mui/x-date-pickers';
// import {CalendarPicker} from '@mui/x-date-pickers/CalendarPicker';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

const DateSelector = () => {
  const [value, setValue] = React.useState(new dayjs());

  return (
    <DatePickerWrapper>
      <DateCalendar value={value} onChange={(newValue) => setValue(newValue)} />
      {/* <StaticDatePicker
        orientation='portrait'
        openTo='day'
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
      /> */}
    </DatePickerWrapper>
  );
};

export default DateSelector;
