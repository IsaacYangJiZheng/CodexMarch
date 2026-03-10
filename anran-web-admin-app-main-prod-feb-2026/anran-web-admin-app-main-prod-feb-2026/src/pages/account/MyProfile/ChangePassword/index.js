import React from 'react';
import {Box, Typography} from '@mui/material';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import ChangePasswordForm from './ChangePasswordForm';
import {Formik} from 'formik';
import * as yup from 'yup';
import {useAuthUser, useAuthMethod} from '@anran/utility/AuthHooks';

const validationSchema = yup.object({
  oldPassword: yup
    .string()
    .required('No password provided.')
    .min(8, 'Must be 8 characters or more')
    .matches(/[a-z]+/, 'One lowercase character')
    .matches(/[A-Z]+/, 'One uppercase character')
    .matches(/[@$!%*#?&]+/, 'One special character')
    .matches(/\d+/, 'One number'),
  newPassword: yup
    .string()
    .required('Required')
    .min(8, 'Must be 8 characters or more')
    .matches(/[a-z]+/, 'One lowercase character')
    .matches(/[A-Z]+/, 'One uppercase character')
    .matches(/[@$!%*#?&]+/, 'One special character')
    .matches(/\d+/, 'One number'),
  retypeNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

const ChangePassword = () => {
  const {user} = useAuthUser();
  const {userPasswordChange} = useAuthMethod();
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
      }}
    >
      <Typography
        component='h3'
        sx={{
          fontSize: 16,
          fontWeight: Fonts.BOLD,
          mb: {xs: 3, lg: 5},
        }}
      >
        <IntlMessages id='common.changePassword' />
      </Typography>
      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{
          oldPassword: '',
          newPassword: null,
          retypeNewPassword: 'us',
        }}
        validationSchema={validationSchema}
        onSubmit={(data, {setSubmitting}) => {
          setSubmitting(true);
          console.log('data: ', data);
          if (data.newPassword === data.retypeNewPassword) {
            userPasswordChange({
              username: user.email,
              oldPassword: data.oldPassword,
              newPassword: data.newPassword,
            });
            setSubmitting(false);
          }
        }}
      >
        <ChangePasswordForm />
      </Formik>
    </Box>
  );
};

export default ChangePassword;
