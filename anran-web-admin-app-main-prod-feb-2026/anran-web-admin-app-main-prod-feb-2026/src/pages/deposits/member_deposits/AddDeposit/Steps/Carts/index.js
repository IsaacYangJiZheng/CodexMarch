import React, {useContext} from 'react';
import {FormContext} from '../..';
import PropTypes from 'prop-types';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddPurchaseForm from './AddPurchaseForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useIntl} from 'react-intl';

const MemberCarts = ({reCallAPI, setOpenDialog}) => {
  const {formatMessage} = useIntl();
  const {formData, setFormData} =
    useContext(FormContext);
  const infoViewActionsContext = useInfoViewActionsContext();
  const {user} = useAuthUser();
  const [selectedMethod, setSelectedMethod] = React.useState([]);
  const validationSchema = React.useMemo(
    () =>
      yup.object({
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
              setSelectedMethod([]);
              reCallAPI();
              setOpenDialog(false);
            })
            .catch((error) => {
              infoViewActionsContext.fetchError(error.message);
            });
        } else {
          alert(formatMessage({id: 'finance.deposits.add.mustSelectMethod'}));
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