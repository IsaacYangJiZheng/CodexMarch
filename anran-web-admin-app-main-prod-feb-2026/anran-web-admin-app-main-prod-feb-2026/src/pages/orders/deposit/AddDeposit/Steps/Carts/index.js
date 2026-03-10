import React, {useContext} from 'react';
import {FormContext} from '../..';
import PropTypes from 'prop-types';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddPurchaseForm from './AddPurchaseForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';

const validationSchema = yup.object({
  branchName: yup.string().required('Required'),
  member: yup.string().required('Required'),
});

const MemberCarts = () => {
  const {activeStep, setActiveStep, formData, setFormData} =
    useContext(FormContext);
  const infoViewActionsContext = useInfoViewActionsContext();
  const {user} = useAuthUser();
  const [selectedMethod, setSelectedMethod] = React.useState([]);
  return (
    <Formik
      validateOnBlur={true}
      initialValues={{
        branchName: formData?.branchName ? formData?.branchName : '',
        member: formData?.member ? formData?.member : '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data) => {
        console.log('ssssssssssssssss', data, selectedMethod);
        if (selectedMethod.length > 0) {
          const form = {
            branch: data.branchName,
            payer: data.member,
            payMethod: selectedMethod,
            createdBy: user.uid,
          };
          setFormData(form);
          postDataApi(
            '/api/memberDeposit/deposits',
            infoViewActionsContext,
            form,
            false,
            false,
          )
            .then(() => {
              setActiveStep(activeStep + 1);
              setSelectedMethod([]);
            })
            .catch((error) => {
              infoViewActionsContext.fetchError(error.message);
            });
        } else {
          alert('Must select at least one payment method');
        }
      }}
    >
      {({values, errors, setFieldValue}) => {
        return (
          <AddPurchaseForm
            values={values}
            errors={errors}
            setFieldValue={setFieldValue}
            isViewOnly={false}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        );
      }}
    </Formik>
  );
};

export default MemberCarts;

MemberCarts.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};
