import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddAreaForm from './AddAreaForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';

const validationSchema = yup.object({
  areaCode: yup.string().required('Required'),
  areaName: yup.string().required('Required'),
});

const AddArea = ({isOpen, setOpenDialog, reCallAPI}) => {
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
            title={<IntlMessages id='admin.area.dialog.createTitle' />}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            areaCode: '',
            areaName: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            postDataApi(
              '/api/area',
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
              <AddAreaForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
              />
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddArea;

AddArea.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};
