import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddFloorForm from './AddFloorForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';

const validationSchema = yup.object({
  floorNo: yup.string().required('Required'),
  floorDetail: yup.string().required('Required'),
});

const AddFloor = ({isOpen, setOpenDialog, reCallAPI, selectedBranch}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={isOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setOpenDialog(false)}
            title={'Add Floor'}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            floorNo: '',
            floorDetail: '',
            floorImage: '',
            floorStatus: true,
            branchName: selectedBranch._id,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            postDataApi(
              '/api/floors',
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
                setOpenDialog(false);
                infoViewActionsContext.showMessage('successfully!');
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
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

export default AddFloor;

AddFloor.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  selectedBranch: PropTypes.object.isRequired,
};
