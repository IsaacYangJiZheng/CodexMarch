import React, {useContext} from 'react';
import {FormContext} from '../../../AddCustomDateOfflineOrder';
import PropTypes from 'prop-types';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddPurchaseForm from './AddPurchaseForm';
import {useIntl} from 'react-intl';

const MemberCarts = () => {
  const {formatMessage} = useIntl();
  const {activeStep, setActiveStep, formData, setFormData, cart} =
    useContext(FormContext);
  const validationSchema = React.useMemo(
    () =>
      yup.object({
        orderDate: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
        branchName: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
        member: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
      }),
    [formatMessage],
  );

  return (
    <Formik
      validateOnBlur={true}
      initialValues={{
        orderDate: formData?.orderDate ? formData?.orderDate : '',
        branchName: formData?.branchName ? formData?.branchName : '',
        member: formData?.member ? formData?.member : '',
      }}
      validationSchema={validationSchema}
      onSubmit={async (data) => {
        console.log('ssssssssssssssss', data);
        if (cart.length > 0) {
          const consolidatedData = {
            ...formData,
            ...data,
            carts: cart,
          };
          console.log('consolidatedData', consolidatedData);
          setFormData(consolidatedData);
          setActiveStep(activeStep + 1);
        } else {
          alert(formatMessage({id: 'finance.sales.purchase.mustSelectPackage'}));
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
          />
        );
      }}
    </Formik>
  );
};

export default MemberCarts;

MemberCarts.propTypes = {
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};