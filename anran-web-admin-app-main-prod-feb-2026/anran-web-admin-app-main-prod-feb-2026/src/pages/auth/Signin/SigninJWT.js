import React from 'react';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import {useIntl} from 'react-intl';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppInfoView from '@anran/core/AppInfoView';

import {useAuthMethod} from '@anran/utility/AuthHooks';
import {Fonts} from 'shared/constants/AppEnums';

const validationSchema = yup.object({
  email: yup
    .string()
    .required(<IntlMessages id='validation.staffCodeRequired' />),
  password: yup
    .string()
    .required(<IntlMessages id='validation.passwordRequired' />),
});

const SigninJWT = () => {
  const {signInUser} = useAuthMethod();
  const {messages} = useIntl();

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', mb: 5}}>
        <Formik
          validateOnChange={true}
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            signInUser({
              email: data.email,
              password: data.password,
            });
            setSubmitting(false);
          }}
        >
          {({isSubmitting}) => (
            <Form style={{textAlign: 'left'}} noValidate autoComplete='off'>
              <Box sx={{mb: {xs: 5, xl: 8}}}>
                <AppTextField
                  placeholder={messages['anran.staffcode']}
                  label={<IntlMessages id='anran.staffcode' />}
                  name='email'
                  variant='outlined'
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input': {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>

              <Box sx={{mb: {xs: 3, xl: 4}}}>
                <AppTextField
                  type='password'
                  placeholder={messages['common.password']}
                  label={<IntlMessages id='common.password' />}
                  name='password'
                  variant='outlined'
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input': {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
              <div>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  disabled={isSubmitting}
                  sx={{
                    minWidth: 160,
                    fontWeight: Fonts.REGULAR,
                    fontSize: 16,
                    textTransform: 'capitalize',
                    padding: '4px 16px 8px',
                  }}
                >
                  <IntlMessages id='common.login' />
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Box>

      <AppInfoView />
    </Box>
  );
};

export default SigninJWT;
