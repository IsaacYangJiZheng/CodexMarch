import React from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import IntlMessages from '@anran/utility/IntlMessages';
import PropTypes from 'prop-types';
import AddForm from './AddForm';
import AppDialog from '@anran/core/AppDialog';
import CardHeader from './CardHeader';
import {postDataApi, putDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import dayjs from 'dayjs';
const validationSchema = yup.object({
  taxType: yup.string().required(<IntlMessages id='validation.nameRequired' />),
  taxValue: yup
    .number()
    .required(<IntlMessages id='validation.nameRequired' />),
  effectiveDate: yup
    .date()
    .required(<IntlMessages id='validation.nameRequired' />),
});

const AddDocType = (props) => {
  const {
    isAddTaxType,
    handleAddTaxTypeClose,
    selectedTaxType,
    selectedBranch,
    reCallAPI,
  } = props;
  const infoViewActionsContext = useInfoViewActionsContext();

  return (
    <AppDialog
      hideClose
      maxWidth='xs'
      title={
        <CardHeader
          onCloseAddCard={handleAddTaxTypeClose}
          title={selectedTaxType ? 'Edit Tax Rate' : 'Add Tax Rate'}
        />
      }
      open={isAddTaxType}
    >
      <Formik
        validateOnChange={true}
        initialValues={{
          branch: selectedBranch._id,
          category: 'SST',
          taxType: selectedTaxType ? selectedTaxType.taxType : '',
          taxValue: selectedTaxType ? selectedTaxType.taxValue : '',
          effectiveDate: selectedTaxType
            ? dayjs(selectedTaxType.effectiveDate)
            : dayjs(),
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting, resetForm}) => {
          setSubmitting(true);
          if (selectedTaxType) {
            let formattedDate = dayjs(data.effectiveDate).format('YYYY-MM-DD');
            const postData = new FormData();
            for (var key1 in data) {
              postData.append(key1, data[key1]);
            }
            postData.set('effectiveDate', formattedDate);
            putDataApi(
              `api/tax/${selectedTaxType._id}`,
              infoViewActionsContext,
              postData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                handleAddTaxTypeClose();
                resetForm();
                setSubmitting(false);
                infoViewActionsContext.showMessage('Updated successfully!');
              })
              .catch((error) => {
                console.log(error);
                setSubmitting(false);
                infoViewActionsContext.fetchError(error.message);
              });
          } else {
            let formattedDate = dayjs(data.effectiveDate).format('YYYY-MM-DD');
            const postData = new FormData();
            for (var key in data) {
              postData.append(key, data[key]);
            }
            postData.set('effectiveDate', formattedDate);
            postDataApi(
              'api/tax/',
              infoViewActionsContext,
              postData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                handleAddTaxTypeClose();
                resetForm();
                setSubmitting(false);
                infoViewActionsContext.showMessage('Added successfully!');
              })
              .catch((error) => {
                console.log(error);
                setSubmitting(false);
                infoViewActionsContext.fetchError(error.message);
              });
          }
        }}
      >
        {({isSubmitting, values, setFieldValue}) => (
          <AddForm
            isSubmitting={isSubmitting}
            setFieldValue={setFieldValue}
            values={values}
          />
        )}
      </Formik>
    </AppDialog>
  );
};

export default AddDocType;

AddDocType.defaultProps = {
  selectedProgram: null,
};

AddDocType.propTypes = {
  isAddTaxType: PropTypes.bool.isRequired,
  handleAddTaxTypeClose: PropTypes.func.isRequired,
  selectedTaxType: PropTypes.object,
  selectedBranch: PropTypes.object,
  reCallAPI: PropTypes.func,
};
