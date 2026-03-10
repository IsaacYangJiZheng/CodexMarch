import React from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import IntlMessages from '@anran/utility/IntlMessages';
import PropTypes from 'prop-types';
import AddGateWayForm from './AddForm';
import AppDialog from '@anran/core/AppDialog';
import CardHeader from './CardHeader';
import {postDataApi, putDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
const validationSchema = yup.object({
  provider: yup.string().required(<IntlMessages id='validation.required' />),
  providerKey1: yup
    .string()
    .required(<IntlMessages id='validation.required' />),
  providerKey2: yup
    .string()
    .required(<IntlMessages id='validation.required' />),
  currency: yup.string().required(<IntlMessages id='validation.required' />),
});

const AddGateWay = (props) => {
  const {isAdd, handleClose, selectedData, selectedBranch, reCallAPI} = props;
  const infoViewActionsContext = useInfoViewActionsContext();

  return (
    <AppDialog
      hideClose
      maxWidth='xs'
      title={
        <CardHeader
          onCloseAddCard={handleClose}
          title={selectedData ? 'Edit Payment GateWay Setup' : 'Payment GateWay Setup'}
        />
      }
      open={isAdd}
    >
      <Formik
        validateOnChange={true}
        initialValues={{
          branch: selectedBranch?._id,
          provider: selectedData ? selectedData.provider : '',
          providerKey1: selectedData ? selectedData.providerKey1 : '',
          providerKey2: selectedData ? selectedData.providerKey2 : '',
          currency: selectedData ? selectedData.currency : '',
          isActive: selectedData ? selectedData.isActive : true,
          allowedMethod: selectedData
            ? JSON.parse(selectedData.allowedMethod)
            : [
                {
                  method: 'Debit and Credit Cards',
                  code: 'card',
                  provider: ['Visa', 'Mastercard'],
                  enabled: true,
                },
                {
                  method: 'FPX',
                  code: 'fpx',
                  provider: [],
                  enabled: true,
                },
                {
                  method: 'Wallets',
                  code: 'wallet',
                  provider: ['TouchnGo', 'GrabPay'],
                  enabled: true,
                },
              ],
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting, resetForm}) => {
          setSubmitting(true);
          if (selectedData) {
            const updateData = new FormData();
            for (var key1 in data) {
              console.log(key1);
              updateData.append(key1, data[key1]);
            }
            updateData.set('branch', data.branch);
            updateData.set('currency', data.currency);
            updateData.set('provider', data.provider);
            updateData.set('providerKey1', data.providerKey1);
            updateData.set('providerKey2', data.providerKey2);
            updateData.set('isActive', data.isActive);
            updateData.set(
              'allowedMethod',
              JSON.stringify(data['allowedMethod']),
            );
            // const updateData = {
            //   id: selectedData.id,
            //   ...data,
            // };
            putDataApi(
              `api/gateway/${selectedData._id}`,
              infoViewActionsContext,
              updateData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                handleClose();
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
            const postData = new FormData();
            for (var key in data) {
              postData.append(key, data[key]);
            }
            postData.set('allowedMethod', JSON.stringify(data.allowedMethod));
            const newData = {
              ...data,
            };
            console.log('newscheduleVariable:', newData);
            postDataApi(
              'api/gateway',
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
                handleClose();
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
        {({values, setFieldValue, errors}) => (
          <AddGateWayForm
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
          />
        )}
      </Formik>
    </AppDialog>
  );
};

export default AddGateWay;

AddGateWay.defaultProps = {
  selectedProgram: null,
};

AddGateWay.propTypes = {
  isAdd: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedData: PropTypes.object,
  selectedBranch: PropTypes.object,
  reCallAPI: PropTypes.func,
};
