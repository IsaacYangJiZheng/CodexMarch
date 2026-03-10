import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddBookingForm from './AddBookingForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import {useIntl} from 'react-intl';

const validationSchema = yup.object({
  branchId: yup.string().required('Required'),
  floorId: yup.string().required('Required'),
  roomId: yup.string().required('Required'),
  member: yup.string().required('Required'),
  package: yup.string().required('Required'),
});

const AddSlotBooking = ({
  isOpen,
  setOpenDialog,
  reCallAPI,
  slot,
  onClose,
  selectedBranch,
}) => {
    const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  console.log('AddSlotBooking', slot);

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='xs'
        open={isOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setOpenDialog(false)}
            title={formatMessage({id: 'booking.floorView.newBooking'})}
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
            roomId: slot?.room.Id,
            member: '',
            package: '',
            branch: slot?.branch,
            floor: slot?.floor,
            room: slot?.room,
            start: slot?.start,
            end: slot?.end,
            malecount: slot?.malecount ? slot?.malecount : 0,
            femalecount: slot?.femalecount ? slot?.femalecount : 0,
            totalPax: 0,
            availableCount: slot?.availableSlot
              ? slot?.availableSlot
              : slot?.room.Size,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            for (var key in data) {
              formData.append(key, data[key]);
            }
            postDataApi(
              '/api/booking/new-booking/web',
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
                onClose();
                setOpenDialog(false);
                infoViewActionsContext.showMessage(
                  formatMessage({id: 'booking.floorView.addSuccess'}),
                );
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <AddBookingForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                selectedBranch={selectedBranch}
              />
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddSlotBooking;

AddSlotBooking.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  slot: PropTypes.object,
  onClose: PropTypes.func,
  selectedBranch: PropTypes.object,
};
