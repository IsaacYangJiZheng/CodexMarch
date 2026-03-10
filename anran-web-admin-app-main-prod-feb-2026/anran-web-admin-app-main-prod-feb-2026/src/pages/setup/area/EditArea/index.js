import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddAreaForm from './EditAreaForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';

const validationSchema = yup.object({
  areaCode: yup.string().required('Required'),
  areaName: yup.string().required('Required'),
});

const EditArea = ({rowData, isOpen, setOpenDialog, reCallAPI}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  // console.log('EditArea', data);

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
            title={<IntlMessages id='admin.area.dialog.editTitle' />}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            areaCode: rowData ? rowData.areaCode : '',
            areaName: rowData ? rowData.areaName : '',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            putDataApi(
              `/api/area/${rowData._id}`,
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
                infoViewActionsContext.showMessage('successfully!');
                setOpenDialog(false);
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

export default EditArea;

EditArea.propTypes = {
  rowData: PropTypes.object.isRequired,
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};
