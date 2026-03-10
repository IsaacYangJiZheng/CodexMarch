import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {Formik, Form, ErrorMessage} from 'formik';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import AppGridContainer from '@anran/core/AppGridContainer';
// import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import PropTypes from 'prop-types';
import {putDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';

const ChangeDialog = ({
  item,
  slot,
  startTime,
  endTime,
  handleCloseChangeDialog,
  openChangeDialog,
  reCallAPI,
}) => {
  console.log('here', item, slot, reCallAPI);
  const infoViewActionsContext = useInfoViewActionsContext();

  const initialValues = {
    start: dayjs(slot?.start),
    end: dayjs(slot?.end),
    slot: (() => {
      const startHour = slot.start.getHours();
      const endHour = startHour + 1; // Assuming the slot is always 1 hour long
      const formatHour = (hour) => {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Handle 12 PM and 12 AM correctly
        const period = hour < 12 ? 'am' : 'pm'; // Determine am/pm
        return `${formattedHour}:00${period}`;
      };
      return `${formatHour(startHour)} - ${formatHour(endHour)}`;
    })(),
  };

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const start = new Date(startTime);
    const end = new Date(endTime);
    for (let time = start; time < end; time.setHours(time.getHours() + 1)) {
      const nextHour = new Date(time);
      nextHour.setHours(nextHour.getHours() + 1);
      const formattedSlot = `${time.getHours() % 12 || 12}:00${time.getHours() < 12 ? 'am' : 'pm'} - ${nextHour.getHours() % 12 || 12}:00${nextHour.getHours() < 12 ? 'am' : 'pm'}`;
      slots.push(formattedSlot);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(startTime, endTime);

  console.log('initial', initialValues);

  return (
    <AppDialog
      dividers
      maxWidth='xs'
      open={openChangeDialog}
      hideClose
      title={
        <CardHeader
          onCloseAddCard={handleCloseChangeDialog}
          title={'Edit Booking Time'}
        />
      }
    >
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, {setSubmitting}) => {
          setSubmitting(true);
          const formData = new FormData();
          const selectedSlot = values.slot.split(' - ');
          const startDate = new Date(values.start);
          // Function to parse the hour correctly
          const parseHour = (slotTime) => {
            const hour = parseInt(slotTime.split(':')[0]);
            const isPM = slotTime.includes('pm');
            // Adjust hour based on AM/PM
            return (isPM && hour !== 12 ? hour + 12 : (hour === 12 ? 12 : hour)); // 12 PM stays 12, 12 AM becomes 0
          };

          const startHour = parseHour(selectedSlot[0]);
          const endHour = parseHour(selectedSlot[1]);

          const newStartDate = new Date(startDate);
          newStartDate.setHours(startHour);

          const newEndDate = new Date(startDate);
          newEndDate.setHours(endHour);

          formData.append('branchId', slot.branch._id);
          formData.append('floorId', slot.floor._id);
          formData.append('roomId', slot.room.Id);
          formData.append('start', newStartDate.toString());
          formData.append('end', newEndDate.toString());

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
            handleCloseChangeDialog();
            infoViewActionsContext.showMessage('Changed successfully!');
          } catch (error) {
            infoViewActionsContext.fetchError(error.message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({values, setFieldValue}) => {
          return (
            <Form>
              <AppGridContainer spacing={2} sx={{p: 4}}>
                <Grid size={6}>
                  <DatePicker
                    disablePast
                    minDate={dayjs()}
                    label='Booking Date'
                    value={values.start}
                    onChange={(newValue) => setFieldValue('start', newValue)}
                  />
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth margin='dense'>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name='packageCategory'
                      label='Category'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={values.slot}
                      onChange={(e) => setFieldValue('slot', e.target.value)}
                    >
                      {timeSlots.map((slot, index) => (
                        <MenuItem key={index} value={slot}>
                          {slot}
                        </MenuItem>
                      ))}
                    </Select>
                    <ErrorMessage
                      name='packageCategory'
                      component='div'
                      style={{color: 'red'}}
                    />
                  </FormControl>
                </Grid>
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

export default ChangeDialog;

ChangeDialog.propTypes = {
  item: PropTypes.object,
  slot: PropTypes.object,
  startTime: PropTypes.object,
  endTime: PropTypes.object,
  handleCloseChangeDialog: PropTypes.func.isRequired,
  openChangeDialog: PropTypes.bool.isRequired,
  reCallAPI: PropTypes.func,
};
