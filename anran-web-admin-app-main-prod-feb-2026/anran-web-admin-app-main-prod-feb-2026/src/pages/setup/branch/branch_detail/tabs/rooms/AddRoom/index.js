import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddFloorForm from './AddRoomForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, putDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';

const validationSchema = yup.object({
  room_no: yup.string().required('Required'),
  roomCapacity: yup.string().required('Required'),
  room_gender: yup.string().required('Required'),
});

const AddFloorRoom = ({
  isOpen,
  setOpenDialog,
  reCallAPI,
  selectedBranch,
  isEdit,
  roomData,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

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
            title={isEdit ? 'Edit Room' : 'Add Room'}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            room_no: isEdit ? roomData.room_no : '',
            roomCapacity: isEdit ? roomData.roomCapacity : '',
            room_gender: isEdit ? roomData.room_gender : '',
            room_floor_url: isEdit ? roomData.room_floor_url : '',
            status_active: isEdit ? roomData.status_active : true,
            branchName: selectedBranch?._id,
            branch: selectedBranch?._id,
            floor: isEdit ? roomData.floor._id : '',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            if (isEdit) {
              putDataApi(
                `/api/rooms/${roomData._id}`,
                infoViewActionsContext,
                data,
                false,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              )
                .then(() => {
                  reCallAPI();
                  setOpenDialog();
                  infoViewActionsContext.showMessage('successfully!');
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            } else {
              postDataApi(
                '/api/rooms',
                infoViewActionsContext,
                data,
                false,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              )
                .then(() => {
                  reCallAPI();
                  setOpenDialog();
                  infoViewActionsContext.showMessage('successfully!');
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            }

            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <AddFloorForm
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

export default AddFloorRoom;

AddFloorRoom.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  selectedBranch: PropTypes.object.isRequired,
  isEdit: PropTypes.bool,
  roomData: PropTypes.object,
};
