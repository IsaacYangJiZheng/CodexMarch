import React, {useState} from 'react';
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

const validationSchema = yup.object({
  branch: yup.string().required('Required'),
  floor: yup.string().required('Required'),
  room: yup.string().required('Required'),
});

const AddBooking = ({isOpen, setOpenDialog, reCallAPI}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchImage, setBranchImage] = useState(null);
  const [branchImageUrl, setBranchImageUrl] = useState(null);

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='xl'
        open={isOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setOpenDialog(false)}
            title={'New Booking'}
          />
        }
      >
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
            const formData = new FormData();
            formData.append('image', branchImage);
            for (var key in data) {
              formData.append(key, data[key]);
            }
            postDataApi(
              '/api/branch',
              infoViewActionsContext,
              formData,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                setBranchImage(null);
                setBranchImageUrl(null);
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
              <AddBookingForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                setBranchImage={setBranchImage}
                setBranchImageUrl={setBranchImageUrl}
                branchImage={branchImageUrl}
              />
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddBooking;

AddBooking.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};
