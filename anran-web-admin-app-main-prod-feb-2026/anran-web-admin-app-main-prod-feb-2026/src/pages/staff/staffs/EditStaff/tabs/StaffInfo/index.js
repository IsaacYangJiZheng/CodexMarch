import React, {useState, useEffect} from 'react';
import {Formik} from 'formik';
import StaffInfoForm from './StaffInfoForm';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import CardHeader from './CardHeader';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import * as Yup from 'yup';
const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const StaffInfo = ({rawData, reCallAPI}) => {
  const [imageData, setImageData] = useState(null);
  const [imageUrl, setImageUrl] = useState(rawData.profileImageUrl);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [isViewOnly, onViewOnly] = useState(true);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    staffCode: Yup.string().required('Staff Code is required'),
    gender: Yup.string().required('Gender is required'),
    joinDate: Yup.string().required('Joined Date is required'),
    positionDepartment: Yup.string().required('Position is required'),
    userName: Yup.string().required('Username is required'),
    loginKey: Yup.string().required('Password is required'),
    mobileNumber: Yup.string()
      .matches(phoneRegExp, 'Phone number is not valid')
      .required('Mobile Number is required'),
    fullName: Yup.string().required('Full Name is required'),
    nirc: Yup.string().required('NIRC is required'),
    emailAddress: Yup.string().required('Email is required'),
    religion: Yup.string().required('Religion is required'),
    martialStatus: Yup.string().required('Martial Status is required'),
    currentAddress: Yup.string().required('Address is required'),
    emergencyContactName: Yup.string().required('Name is required'),
    emergencyRelation: Yup.string().required('Relation is required'),
    emergencyContact: Yup.string()
      .matches(phoneRegExp, 'Contact number is not valid')
      .required('Contact Number is required'),
  });

  useEffect(() => {
    if (rawData.profileImageUrl) {
      setImageUrl(rawData.profileImageUrl);
    }
  }, [rawData.profileImageUrl]);

  return (
    <>
      <CardHeader
        isViewOnly={isViewOnly}
        onViewOnly={onViewOnly}
        staff={rawData}
      />

      <Box
        sx={{
          position: 'relative',
          Width: '100%',
          mt: 5,
        }}
      >
        <Formik
          enableReinitialize={true}
          validateOnBlur={true}
          initialValues={{
            name: rawData.name || '',
            staffCode: rawData.staffCode || '',
            gender: rawData.gender || '',
            profileImageUrl: rawData.profileImageUrl || '',
            profileImageData: rawData.profileImageData || '',
            joinDate: rawData.joinDate || null,
            userName: rawData.userName || '',
            loginKey: rawData.loginKey || '',
            emailAddress: rawData.emailAddress || '',
            positionDepartment: rawData.positionDepartment || '',
            fullName: rawData.fullName || '',
            nirc: rawData.nirc || '',
            religion: rawData.religion || '',
            mobileNumber: rawData.mobileNumber || '',
            martialStatus: rawData.martialStatus || '',
            currentAddress: rawData.currentAddress || '',
            bankName: rawData.bankName || '',
            bankAccountNumber: rawData.bankAccountNumber || '',
            bankEPFNo: rawData.bankEPFNo || '',
            bankSOCSONo: rawData.bankSOCSONo || '',
            bankIncomeTaxNo: rawData.bankIncomeTaxNo || '',
            allowOT: rawData.allowOT ?? false,
            emergencyContactName: rawData.emergencyContactName || '',
            emergencyRelation: rawData.emergencyRelation || '',
            emergencyContact: rawData.emergencyContact || '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', imageData);
            for (var key in values) {
              formData.append(key, values[key]);
            }
            try {
              const response = await putDataApi(
                `/api/staff/${rawData._id}`,
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              setImageUrl(null);
              setImageData(null);
              onViewOnly(true);
              infoViewActionsContext.showMessage('Updated successfully!');
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <StaffInfoForm
                errors={errors}
                values={values}
                setFieldValue={setFieldValue}
                isViewOnly={isViewOnly}
                setImageData={setImageData}
                setImageUrl={setImageUrl}
                imageUrl={imageUrl}
                onViewOnly={onViewOnly}
                reCallAPI={reCallAPI}
                staff={rawData}
              />
            );
          }}
        </Formik>
      </Box>
    </>
  );
};

export default StaffInfo;

StaffInfo.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.string,
  rawData: PropTypes.object,
  reCallAPI: PropTypes.func,
};
