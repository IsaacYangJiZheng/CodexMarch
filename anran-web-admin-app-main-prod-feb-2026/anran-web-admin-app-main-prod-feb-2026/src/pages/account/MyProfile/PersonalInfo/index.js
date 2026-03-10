import React from 'react';
import {useAuthUser, useAuthMethod} from '@anran/utility/AuthHooks';
import {Formik} from 'formik';
import * as yup from 'yup';
import PersonalInfoForm from './PersonalInfoForm';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';

const validationSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Required'),
});
const PersonalInfo = () => {
  const {user} = useAuthUser();
  const {cognito_user_refresh} = useAuthMethod();
  const infoViewActionsContext = useInfoViewActionsContext();
  console.log('current user', user);
  const [{apiData: userinfo}, {reCallAPI}] = useGetDataApi(
    'api/staff/verify',
    {},
    {},
    true,
  );
  console.log('userinfo', userinfo);

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
      }}
    >
      {userinfo?.user?.profile ? (
        <Formik
          validateOnBlur={true}
          enableReinitialize
          initialValues={{
            firstName: userinfo?.user?.profile.name,
            lastName: userinfo?.user?.profile.name,
            fullName: userinfo?.user?.profile.name,
            email: userinfo?.user?.profile.email,
            phone: userinfo?.user?.profile.phone,
            isPhotoChanged: false,
            photo: null,
            photoURL: user.photoURL
              ? user.photoURL
              : '/assets/images/placeholder.jpg',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting, resetForm}) => {
            // dirty : Returns true if values are not deeply equal from initial values, false otherwise.
            if (data.isPhotoChanged) {
              setSubmitting(true);
              console.log('data: ', data);
              const formData = new FormData();
              formData.set('image', data.photo);
              formData.set('email', data.email);
              postDataApi(
                '/user/picture/update',
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              )
                .then(() => {
                  setSubmitting(false);
                  resetForm();
                  infoViewActionsContext.showMessage('Updated successfully!');
                  cognito_user_refresh();
                  reCallAPI();
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                  setSubmitting(false);
                });
            }
          }}
        >
          {({values, setFieldValue}) => {
            return (
              <PersonalInfoForm
                values={values}
                setFieldValue={setFieldValue}
                userinfo={userinfo}
              />
            );
          }}
        </Formik>
      ) : null}
    </Box>
  );
};

export default PersonalInfo;

PersonalInfo.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.string,
};
