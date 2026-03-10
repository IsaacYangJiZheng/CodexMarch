import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import MemberDetailsForm from './MemberDetailsForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;
const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = yup.object({
  memberDate: yup.date().required('Required'),
  memberFullName: yup.string().required('Required'),
  // mobileNumber: yup.string(),
  mobileNumber: yup
    .string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('Required'),
  foreignMobileNumber: yup.string().when('isForeign', {
    is: true,
    then: () => yup.string().required('Required'),
  }),
  // preferredName: yup.string().required('Required'),
  // chineseName: yup.string().required('Required'),
  passport: yup.string().required('Required'),
  age: yup.string().required('Required'),
  dob: yup.date().required('Required'),
  gender: yup.string().required('Required'),
  // address: yup.string().required('Required'),
  city: yup.string().required('Required'),
  postcode: yup.string().required('Required'),
  states: yup.string().required('Required'),
  email: yup
    .string()
    .matches(emailRegExp, 'Invalid email')
    .required('Required'),
  aboutUs: yup.string().required('Required'),
  othersAboutUs: yup.string().when('aboutUs', {
    is: 'Others',
    then: () => yup.string().required('Field is required'),
  }),
  emergencyName: yup.string().required('Required'),
  // emergencyMobile: yup.string().required('Required'),
  emergencyMobile: yup
    .string()
    // .matches(phoneRegExp, 'Phone number is not valid')
    .required('Required'),
  emergencyRelationship: yup.string().required('Required'),
});

const MemberDetails = ({rawData, reCallAPI, setSelectedMember}) => {
  // if (!rawData || !rawData.MB_registration_date) {
  //   return <div>Error: Member data is missing.</div>;
  // }
  console.log('MemberDetails', rawData);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [checked, setChecked] = React.useState([]);
  const [isViewOnly, onViewOnly] = useState(true);
  const [memberImage, setMemberImage] = useState(null);
  const [memberImageUrl, setMemberImageUrl] = useState(
    rawData?.profileImageUrl,
  );

  React.useEffect(() => {
    if (rawData?.suffered) {
      const mm = JSON.parse(rawData?.suffered);
      setChecked(mm);
    }
  }, [rawData]);

  return (
    <>
      <CardHeader
        isViewOnly={isViewOnly}
        onViewOnly={onViewOnly}
        member={rawData}
        setSelectedMember={setSelectedMember}
        reCallAPI={reCallAPI}
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
            memberDate: rawData?.memberDate
              ? dayjs(rawData.memberDate)
              : dayjs(),
            status: rawData?.status ? rawData.status : '',
            memberFullName: rawData?.memberFullName
              ? rawData?.memberFullName
              : '',
            mobileNumber: rawData?.mobileNumber ? rawData.mobileNumber : '',
            preferredBranch: rawData?.preferredBranch
              ? rawData?.preferredBranch._id
              : '',
            preferredName: rawData?.preferredName ? rawData.preferredName : '',
            chineseName: rawData?.chineseName ? rawData.chineseName : '',
            passport: rawData?.passport ? rawData.passport : '',
            dob: rawData?.dob ? dayjs(rawData.dob) : dayjs(),
            age: rawData?.age ? rawData.age : '',
            gender: rawData?.gender ? rawData.gender : '',
            address: rawData?.address,
            city: rawData?.city || '',
            postcode: rawData?.postcode || '',
            states: rawData?.states || '',
            isForeign: rawData?.isForeign || false,
            foreignMobileNumber: rawData?.foreignMobileNumber || '',
            // MB_mobile_number: rawData.MB_mobile_number || '',
            email: rawData?.email || '',
            aboutUs: rawData?.aboutUs || '',
            othersAboutUs: rawData?.othersAboutUs || '',
            medicalHistory: rawData?.medicalHistory || '',
            emergencyName: rawData?.emergencyName || '',
            emergencyMobile: rawData?.emergencyMobile || '',
            emergencyRelationship: rawData?.emergencyRelationship || '',
            packageBalance: rawData?.packageBalance || '',
            isDeleted: rawData?.isDeleted || false,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            for (var key in data) {
              formData.append(key, data[key]);
            }
            formData.append('image', memberImage);
            formData.append('suffered', JSON.stringify(checked));
            if (data.preferredBranch == '') {
              formData.delete('preferredBranch');
            }

            putDataApi(
              `api/members/${rawData._id}`,
              infoViewActionsContext,
              formData,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                onViewOnly(true);
                infoViewActionsContext.showMessage(
                  'Member updated successfully',
                );
                reCallAPI();
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
            setSubmitting(false);
          }}
        >
          {({values, setFieldValue, errors, touched}) => {
            return (
              <MemberDetailsForm
                touched={touched}
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={isViewOnly}
                onViewOnly={onViewOnly}
                reCallAPI={reCallAPI}
                member={rawData}
                checked={checked}
                setChecked={setChecked}
                setMemberImage={setMemberImage}
                setMemberImageUrl={setMemberImageUrl}
                memberImage={memberImageUrl}
              />
            );
          }}
        </Formik>
      </Box>
    </>
  );
};

export default MemberDetails;

MemberDetails.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.string,
  rawData: PropTypes.object,
  reCallAPI: PropTypes.func,
  setSelectedMember: PropTypes.func,
};
