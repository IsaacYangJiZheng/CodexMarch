import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import EditBookingForm from './EditBookingForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';

const validationSchema = yup.object({
  member: yup.string().required('Required'),
  package: yup.string().required('Required'),
  malecount: yup.number().required('Required'),
  femalecount: yup.number().required('Required'),
});

const EditSlotBooking = ({isOpen, setOpenDialog, reCallAPI, item, slot}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  console.log('EditSlotBooking', slot);
  console.log('EditSlotBooking', item);

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='xs'
        open={isOpen}
        hideClose
        sx={{pt: 0}}
        title={
          <CardHeader
            onCloseAddCard={() => setOpenDialog(false)}
            title={'Edit Booking'}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            booking_date: slot?.start,
            title: 'new booking',
            package_name: '',
            branchId: slot?.branch._id,
            floorId: slot?.floor._id,
            roomId: slot?.room._id,
            member: item?.member[0]._id,
            package: '',
            branch: slot?.branch,
            floor: slot?.floor,
            room: slot?.room,
            start: slot?.start,
            end: slot?.end,
            malecount: slot?.malecount ? slot?.malecount : 0,
            femalecount: slot?.femalecount ? slot?.femalecount : 0,
            availableCount: slot?.availableSlot
              ? slot?.availableSlot
              : slot?.room.roomCapacity,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            console.log('final-data', data, slot);
            const formData = new FormData();
            for (var key in data) {
              formData.append(key, data[key]);
            }
            postDataApi(
              '/api/booking/new-booking',
              infoViewActionsContext,
              formData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                setOpenDialog(false);
                infoViewActionsContext.showMessage('Added successfully!');
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <EditBookingForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                member={item?.member[0]}
                bookedPackage={item?.packages[0]}
              />
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default EditSlotBooking;

EditSlotBooking.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  slot: PropTypes.object,
  item: PropTypes.object,
};
