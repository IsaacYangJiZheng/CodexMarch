import React from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import IntlMessages from '@anran/utility/IntlMessages';
import PropTypes from 'prop-types';
import AddBookingForm from '../AddBooking/AddBookingForm';
import Drawer from '@mui/material/Drawer';
import CardHeader from '../AddBooking/CardHeader';

const validationSchema = yup.object({
  title: yup.string().required(<IntlMessages id='validation.titleRequired' />),
});

const AddBookingDrawer = (props) => {
  const {isAddCardOpen, onCloseAddCard} = props;

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: {xs: 320, sm: 400, md: 600, lg: 900},
          boxSizing: 'border-box',
        },
      }}
      anchor='right'
      open={isAddCardOpen}
      onClose={(e, r) => {
        console.log(e, r);
        if (r != 'backdropClick') {
          onCloseAddCard();
        }
      }}
      ModalProps={{onBackdropClick: (e) => e.preventDefault()}}
    >
      <CardHeader onCloseAddCard={onCloseAddCard} title={'New Booking'} />
      <Formik
        validateOnBlur={true}
        initialValues={{
          booking_date: '',
          title: '',
          package_name: '',
          room_no: '',
          member: '',
          package: '',
          branch: '',
          floor: '',
          room: '',
          start: false,
          end: true,
          malecount: '',
          femalecount: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting}) => {
          setSubmitting(true);
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
            />
          );
        }}
      </Formik>
    </Drawer>
  );
};

export default AddBookingDrawer;

AddBookingDrawer.propTypes = {
  isAddCardOpen: PropTypes.bool.isRequired,
  onCloseAddCard: PropTypes.func.isRequired,
  board: PropTypes.object,
  list: PropTypes.object,
  selectedCard: PropTypes.object,
};
