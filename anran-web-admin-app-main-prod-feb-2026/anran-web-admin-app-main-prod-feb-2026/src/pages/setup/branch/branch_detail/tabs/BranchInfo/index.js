import React, {useState} from 'react';
// import {useAuthUser} from '@anran/utility/AuthHooks';
import {Formik} from 'formik';
import * as yup from 'yup';
import BranchInfoForm from './BranchInfoForm';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import CardHeader from './CardHeader';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import AppInfoView from '@anran/core/AppInfoView';

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
  branchMobilePrefix: yup.string().required('Required'),
  operatingStart: yup.string().required('Required'),
  operatingEnd: yup.string().required('Required'),
  // whatsappNo: yup.string().required('Required'),
  // taxStatus: yup.string().required('Required'),
  hqStatus: yup.string().required('Required'),
  branchStatus: yup.string().required('Required'),
  branchContactNumber: yup
    .string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('Required'),
});
const BranchInfo = ({rawData, reCallAPI, hqStatusError, refresh}) => {
  console.log('BranchInfo', rawData);
  const [branchImage, setBranchImage] = useState(null);
  const [branchImageUrl, setBranchImageUrl] = useState(rawData.imageUrl);
  const infoViewActionsContext = useInfoViewActionsContext();

  const [isViewOnly, onViewOnly] = useState(true);

  return (
    <>
      <CardHeader
        // onCloseAddCard={onShowDetail}
        isViewOnly={isViewOnly}
        onViewOnly={onViewOnly}
        branch={rawData}
      />

      <Box
        sx={{
          position: 'relative',
          Width: '100%',
          mt: 5,
        }}
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            id: rawData._id,
            branchCode: rawData.branchCode,
            branchName: rawData.branchName,
            area: rawData.area?._id,
            branchAddress: rawData.branchAddress,
            googleLink: rawData.googleLink,
            wazeLink: rawData.wazeLink,
            operatingStart: dayjs(rawData.operatingStart),
            operatingEnd: dayjs(rawData.operatingEnd),
            hqStatus: rawData.hqStatus,
            isFranchise: rawData.isFranchise,
            branchStatus: rawData.branchStatus,
            branchContactNumber: rawData.branchContactNumber,
            branchMobilePrefix: rawData.branchMobilePrefix,
            customerCode: rawData.customerCode,
            accountCode: rawData.accountCode,
            branchPostcode: rawData.branchPostcode,
            branchCity: rawData.branchCity,
            branchState: rawData.branchState,
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
              const response = await putDataApi(
                `api/branch/${rawData._id}`,
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              )

              if (response.status === 'ok') {
                onViewOnly(true);
                infoViewActionsContext.showMessage('Updated successfully!');
                reCallAPI();
                refresh();
              } else {
                infoViewActionsContext.fetchError(response.message);
              }
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            }
            setSubmitting(false);
          }}
        >
          {({values, setFieldValue, errors}) => {
            return (
              <BranchInfoForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={isViewOnly}
                setBranchImage={setBranchImage}
                setBranchImageUrl={setBranchImageUrl}
                branchImage={branchImageUrl}
                onViewOnly={onViewOnly}
                reCallAPI={reCallAPI}
                branch={rawData}
                hqStatusError={hqStatusError}
                rawData={rawData}
              />
            );
          }}
        </Formik>
        <AppInfoView />
      </Box>
    </>
  );
};

export default BranchInfo;

BranchInfo.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.string,
  rawData: PropTypes.object,
  reCallAPI: PropTypes.func,
  refresh: PropTypes.func,
  hqStatusError: PropTypes.bool,
};
