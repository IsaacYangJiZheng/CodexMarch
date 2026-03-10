import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddBranchForm from './AddBranchForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
// import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import AppInfoView from '@anran/core/AppInfoView';
import IntlMessages from '@anran/utility/IntlMessages';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const validationSchema = yup.object({
  branchCode: yup.string().required('Required'),
  branchName: yup.string().required('Required'),
  area: yup.string().required('Required'),
  branchAddress: yup.string().required('Required'),
  branchCity: yup.string().required('Required'),
  branchPostcode: yup.number().required('Required'),
  branchState: yup.string().required('Required'),
  customerCode: yup.string().required('Required'),
  accountCode: yup.string().required('Required'),
  operatingStart: yup.string().required('Required'),
  branchMobilePrefix: yup.string().required('Required'),
  operatingEnd: yup.string().required('Required'),
  // whatsappNo: yup.string().required('Required'),
  // taxStatus: yup.string().required('Required'),
  hqStatus: yup.bool().required('Required'),
  branchContactNumber: yup
    .string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('Required'),
  // branchContactNumber: yup.string().when('branchContactNumber', {
  //   is: (value) => value?.length > 0,
  //   then: yup.string().phone(),
  //   otherwise: yup.string(),
  // }),
});

const AddBranch = ({isOpen, setOpenDialog, reCallAPI, hqStatusError}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchImage, setBranchImage] = useState(null);
  const [branchImageUrl, setBranchImageUrl] = useState(null);

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
            title={<IntlMessages id='admin.branch.dialog.createTitle' />}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            branchCode: '',
            branchName: '',
            area: '',
            branchAddress: '',
            googleLink: '',
            wazeLink: '',
            operatingStart: '',
            operatingEnd: '',
            hqStatus: false,
            isFranchise: false,
            branchStatus: true,
            customerCode: '',
            accountCode: '',
            // whatsappNo: '',
            // staffName: '',
            // paymentKey: '',
            // apiKey: '',
            // taxStatus: '',
            // taxPercent: '',
            // branchPercent: '',
            imageUrl: '',
            imageData: '',
            branchContactNumber: '+60',
            branchMobilePrefix: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (data, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', branchImage);
            for (var key in data) {
              formData.append(key, data[key]);
            }
            try {
              const response = await postDataApi(
                '/api/branch',
                infoViewActionsContext,
                formData,
                false,
                {'Content-Type': 'multipart/form-data'},
              );
              if (response.status === 'ok') {
                reCallAPI();
                setBranchImage(null);
                setBranchImageUrl(null);
                setOpenDialog(false);
                infoViewActionsContext.showMessage('Added successfully!');
              } else {
                infoViewActionsContext.fetchError(response.message); 
              }
            } catch (error) {
              infoViewActionsContext.fetchError(error.response.data.error);
            }
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <AddBranchForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                setBranchImage={setBranchImage}
                setBranchImageUrl={setBranchImageUrl}
                branchImage={branchImageUrl}
                hqStatusError={hqStatusError}
              />
            );
          }}
        </Formik>
      </AppDialog>
      <AppInfoView />
    </Box>
  );
};

export default AddBranch;

AddBranch.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  hqStatusError: PropTypes.bool,
};
