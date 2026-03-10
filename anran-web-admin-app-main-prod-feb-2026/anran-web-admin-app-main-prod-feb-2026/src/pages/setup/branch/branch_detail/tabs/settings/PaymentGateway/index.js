import React, {useState} from 'react';
import PropTypes from 'prop-types';
import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  // Checkbox,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
// import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {Form, Formik} from 'formik';
import * as yup from 'yup';
import EditIcon from '@mui/icons-material/Edit';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import {useAuthUser} from '@anran/utility/AuthHooks';
import Alert from '@mui/material/Alert';
import AddGateway from './AddGateway';
import EditGateway from './AddGateway';
import AppInfoView from '@anran/core/AppInfoView';
import {useGetDataApi, putDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import PaymentMethodCard from './PaymentMethodCard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing';
import visa from 'assets/icon/payments/visa.png';
import masterCard from 'assets/icon/payments/masterCard.png';
import unionPay from 'assets/icon/payments/unionPay-my.png';
import cimb from 'assets/icon/payments/cimb-my.png';
import hongleong from 'assets/icon/payments/hong-leong-my.png';
import maybank from 'assets/icon/payments/maybank-my.png';
import rhb from 'assets/icon/payments/rhb-my.png';
import boost from 'assets/icon/payments/boost-my.png';
import grabpay from 'assets/icon/payments/grabpay-my.png';
import maybank2 from 'assets/icon/payments/maybank2-my.png';
import shopeePay from 'assets/icon/payments/shopeePay-my.png';
import touchngo from 'assets/icon/payments/touchngo-my.png';
import IntlMessages from '@anran/utility/IntlMessages';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';

const validationSchema = yup.object({
  provider: yup.string().required(<IntlMessages id='validation.required' />),
  providerKey1: yup
    .string()
    .required(<IntlMessages id='validation.required' />),
  providerKey2: yup
    .string()
    .required(<IntlMessages id='validation.required' />),
});

const PaymentGateway = ({selectedBranch}) => {
  const {user} = useAuthUser();
  const [isEdit, setIsEdit] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAddBranch, setAddBranch] = React.useState(false);
  const [openDeletePaymentGatewayDialog, setOpenDeletePaymentGatewayDialog] = React.useState(false);
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{apiData: gatewayData, loading}, {reCallAPI}] = useGetDataApi(
    `api/gateway/${selectedBranch._id}`,
    undefined,
    {},
    true,
  );

  const handleClickShowPassword = () => {
    if (user.permission.includes(RoutePermittedRole2.admin_branch_update)) {
      setShowPassword((show) => !show);
    }
  };

  const handleClickAdd = () => {
    if (user.permission.includes(RoutePermittedRole2.admin_branch_update)) {
      setAddBranch(true);
    }
  };

  const handleOpenDeletePaymentGatewayDialog = () => {
    setOpenDeletePaymentGatewayDialog(true);
  };

  const handleCloseDeletePaymentGatewayDialog = () => {
    setOpenDeletePaymentGatewayDialog(false);
  }

  const handleClickDelete = () => {
    if (user.permission.includes(RoutePermittedRole2.admin_branch_delete)) {
      putDataApi(
        `/api/gateWay/delete/${gatewayData._id}`,
        infoViewActionsContext,
        false,
        false,
        {
          'Content-Type': 'multipart/form-data',
        },
      )
        .then(() => {
          reCallAPI();
          setOpenDeletePaymentGatewayDialog(false);
          infoViewActionsContext.showMessage('Delete successfully!');
        })
        .catch((error) => {
          console.log(error);

          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  const handleClickUpdate = () => {
    if (user.permission.includes(RoutePermittedRole2.admin_branch_update)) {
      setIsUpdate(true);
      setSelectedData(gatewayData);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
      }}
    >
      {gatewayData && user.permission.includes(RoutePermittedRole2.admin_branch_view) && (
        <Formik
          validateOnChange={true}
          initialValues={{
            provider: gatewayData ? gatewayData.provider : '',
            providerKey1: gatewayData ? gatewayData.providerKey1 : '',
            providerKey2: gatewayData ? gatewayData.providerKey2 : '',
            currency: gatewayData ? gatewayData.currency : '',
            isActive: gatewayData ? gatewayData.isActive : true,
            allowedMethod: gatewayData
              ? JSON.parse(gatewayData.allowedMethod)
              : '',
          }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting, resetForm}) => {
            const found = data.allowedMethod.some((el) => el.enabled === true);
            if (!found) {
              alert('Mush select atleast one payment method');
            } else {
              setSubmitting(true);
              const formData = new FormData();
              for (var key in data) {
                formData.append(key, data[key]);
              }
              formData.set(
                'allowedMethod',
                JSON.stringify(data['allowedMethod']),
              );
              if (user.role == 'management' || user.role == 'admin') {
                putDataApi(
                  `api/gateway/${gatewayData._id}`,
                  infoViewActionsContext,
                  formData,
                  false,
                  false,
                  {
                    'Content-Type': 'multipart/form-data',
                  },
                )
                  .then(() => {
                    setIsEdit(false);
                    setSubmitting(false);
                    resetForm();
                    reCallAPI();
                    infoViewActionsContext.showMessage('Update successfully!');
                  })
                  .catch((error) => {
                    setSubmitting(false);
                    console.log(error);
                    infoViewActionsContext.fetchError(error.message);
                  });
              }
            }
          }}
          // onSubmit={(data, {setSubmitting, resetForm}) => {
          //   setSubmitting(true);
          //   onUpdateSettings('accounting', data);

          //   setIsEdit(false);
          //   setSubmitting(false);
          //   resetForm();
          // }}
        >
          {({values, setFieldValue, resetForm}) => (
            <Form noValidate autoComplete='off'>
              <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Box>
                  <Typography variant='h4'>
                    Payment Gateway Settings{' '}
                    {values.isActive ? (
                      <Box component='span' color='success.main' fontWeight='bold'>
                        (Active)
                      </Box>
                    ) : (
                      <Box component='span' color='error.main'>
                        (Inactive)
                      </Box>
                    )}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{mt: 2, color: 'text.secondary'}}
                  >
                    Manage your online payment settings
                  </Typography>
                </Box>

                {!selectedBranch?.hqStatus && user.permission.includes(RoutePermittedRole2.admin_branch_create) ? (
                  <Box>
                    {gatewayData?.isHQData ? (
                      <Alert
                        sx={{
                          backgroundColor: '#fdeded',
                          mt: 2,
                          fontWeight: 'bold',
                        }}
                        variant='outlined'
                        severity='warning'
                        color='warning'
                        action={
                          <Button
                            color='info'
                            size='small'
                            onClick={handleClickAdd}
                          >
                            SETUP NOW
                          </Button>
                        }
                      >
                        By default this branch following HQ branch Setting. Only
                        management can setup branch level setup
                      </Alert>
                    ) : (
                      <Alert
                        sx={{
                          backgroundColor: '#fdeded',
                          mb: 2,
                          fontWeight: 'bold',
                        }}
                        variant='outlined'
                        severity='warning'
                        color='warning'
                        action={
                          <Box>
                            <Button
                              color='info'
                              size='small'
                              variant='contained'
                              startIcon={<UpdateIcon />}
                              onClick={handleClickUpdate}
                              sx={{mr: 2}}
                            >
                              UPDATE
                            </Button>
                            <Button
                              color='warning'
                              size='small'
                              variant='outlined'
                              startIcon={<DeleteIcon />}
                              onClick={handleOpenDeletePaymentGatewayDialog}
                            >
                              DELETE
                            </Button>
                          </Box>
                        }
                      >
                        This branch following Own branch Setting
                      </Alert>
                    )}
                  </Box>
                ) : user.permission.includes(RoutePermittedRole2.admin_branch_update) ? (
                  <Box>
                    {!isEdit && (
                      <EditIcon
                        sx={{cursor: 'pointer'}}
                        onClick={() => setIsEdit(true)}
                      />
                    )}
                  </Box>
                ) : null}
              </Box>
              <Divider sx={{my: 4}} />
              <AppGridContainer>
                <Grid size={{xs: 12, md: 3}}>
                  <Box>
                    <Typography variant='h5'>Payment Gateway</Typography>
                    <Typography
                      variant='body1'
                      sx={{mt: 1, color: 'text.secondary'}}
                    >
                      Set your online payment setup.
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{xs: 12, md: 9}}>
                  <Box
                    sx={{
                      border: '1px solid #EAECF0',
                      p: 6,
                      borderRadius: 3,
                      boxShadow:
                        '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
                    }}
                  >
                    <AppGridContainer>
                      {/* <Grid item xs={12}>
                      <FormControlLabel
                        value={false}
                        control={
                          <Checkbox
                            checked={values.isEnabled}
                            onChange={(event) => {
                              setFieldValue('isEnabled', event.target.checked);
                            }}
                            name='isEnabled'
                          />
                        }
                        label='Does your center accept online payments?'
                        labelPlacement='start'
                      />
                    </Grid> */}
                      <Grid size={12}>
                        <AppGridContainer>
                          <Grid size={{xs: 12, md: 6}}>
                            <FormControl fullWidth disabled={!isEdit}>
                              <InputLabel id='demo-simple-select-label'>
                                Your Payment Gateway Provider
                              </InputLabel>
                              <Select
                                name='provider'
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                label='Your Payment Gateway Provider'
                                value={values.provider}
                                onChange={(event) => {
                                  setFieldValue('provider', event.target.value);
                                }}
                              >
                                <MenuItem value={'curlec'}>Curlec</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{xs: 12, md: 6}}></Grid>
                          <Grid size={{xs: 12, md: 6}}>
                            <AppTextField
                              name='providerKey1'
                              variant='outlined'
                              sx={{
                                width: '100%',
                                my: 2,
                              }}
                              type={showPassword ? 'text' : 'password'}
                              label='API Key'
                              disabled={!isEdit}
                              InputProps={{
                                readOnly: !isEdit,
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButton
                                      aria-label='toggle password visibility'
                                      onClick={handleClickShowPassword}
                                      edge='end'
                                    >
                                      {showPassword ? (
                                        <VisibilityOff />
                                      ) : (
                                        <Visibility />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid size={{xs: 12, md: 6}}>
                            <AppTextField
                              name='providerKey2'
                              variant='outlined'
                              sx={{
                                width: '100%',
                                my: 2,
                              }}
                              type={showPassword ? 'text' : 'password'}
                              label='Securet Key'
                              disabled={!isEdit}
                              InputProps={{
                                readOnly: !isEdit,
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <IconButton
                                      aria-label='toggle password visibility'
                                      onClick={handleClickShowPassword}
                                      edge='end'
                                    >
                                      {showPassword ? (
                                        <VisibilityOff />
                                      ) : (
                                        <Visibility />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid size={12}>
                            <Typography variant='subtitle2' gutterBottom>
                              Select your preferable payment method:
                            </Typography>
                          </Grid>
                          <Grid size={3}>
                            <PaymentMethodCard
                              isEdit={isEdit}
                              label='Credit Card'
                              icon={<CreditCardIcon />}
                              color='#00FFFF'
                              onSelect={() => {
                                if (isEdit) {
                                  setFieldValue(
                                    `allowedMethod.${0}.enabled`,
                                    !values.allowedMethod[0].enabled,
                                  );
                                }
                              }}
                              selected={values.allowedMethod[0].enabled}
                              title='Supported Cash'
                              items={[
                                {
                                  label: 'Visa',
                                  icon: visa,
                                },
                                {
                                  label: 'Master Card',
                                  icon: masterCard,
                                },
                                {
                                  label: 'UnionPay',
                                  icon: unionPay,
                                },
                                // Add more cash items as needed
                              ]}
                            />
                          </Grid>
                          <Grid size={3}>
                            <PaymentMethodCard
                              isEdit={isEdit}
                              label='Bank Transfer'
                              icon={<AccountBalanceWalletIcon />}
                              color='#00FFFF'
                              onSelect={() => {
                                if (isEdit) {
                                  setFieldValue(
                                    `allowedMethod.${1}.enabled`,
                                    !values.allowedMethod[1].enabled,
                                  );
                                }
                              }}
                              selected={values.allowedMethod[1].enabled}
                              title='Supported Cash'
                              items={[
                                {label: 'cimb', icon: cimb},
                                {label: 'hongleong', icon: hongleong},
                                {label: 'maybank', icon: maybank},
                                {label: 'rhb', icon: rhb},
                                // Add more cash items as needed
                              ]}
                            />
                          </Grid>
                          <Grid size={4}>
                            <PaymentMethodCard
                              isEdit={isEdit}
                              label='E-Wallet'
                              icon={<PhonelinkRingIcon />}
                              color='#00FFFF'
                              onSelect={() => {
                                if (isEdit) {
                                  setFieldValue(
                                    `allowedMethod.${2}.enabled`,
                                    !values.allowedMethod[2].enabled,
                                  );
                                }
                              }}
                              selected={values.allowedMethod[2].enabled}
                              title='Supported E-Wallet'
                              items={[
                                {label: "Touch n' Go", icon: touchngo},
                                {label: 'grab Pay', icon: grabpay},
                                {label: 'maybank2', icon: maybank2},
                                {label: 'shopeePay', icon: shopeePay},
                                {label: 'boost', icon: boost},
                                // Add more e-wallet items as needed
                              ]}
                            />
                          </Grid>
                          {/* <Grid item xs={12}>
                            <AppGridContainer>
                              {values.allowedMethod.length > 0 &&
                                values.allowedMethod?.map((item, i) => {
                                  return (
                                    <Grid item xs={4} key={i}>
                                      <FormControlLabel
                                        value={item.enabled}
                                        disabled={!isEdit}
                                        control={
                                          <Checkbox
                                            checked={item.enabled}
                                            onChange={(event) => {
                                              setFieldValue(
                                                `allowedMethod.${i}.enabled`,
                                                event.target.checked,
                                              );
                                            }}
                                          />
                                        }
                                        label={item.method}
                                        labelPlacement='end'
                                      />
                                    </Grid>
                                  );
                                })}
                            </AppGridContainer>
                          </Grid> */}
                        </AppGridContainer>
                      </Grid>
                    </AppGridContainer>
                  </Box>
                </Grid>
              </AppGridContainer>

              {isEdit && (
                <Stack
                  direction='row'
                  justifyContent='flex-end'
                  spacing={5}
                  sx={{mt: 3}}
                >
                  <Button
                    sx={{color: 'text.secondary'}}
                    onClick={() => {
                      resetForm();
                      setIsEdit(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant='contained' color='primary' type='submit'>
                    Save
                  </Button>
                </Stack>
              )}
            </Form>
          )}
        </Formik>
      )}
      {!loading && !gatewayData && user.permission.includes(RoutePermittedRole2.admin_branch_create) &&(
        <Alert
          sx={{
            backgroundColor: '#fdeded',
            mt: 2,
            fontWeight: 'bold',
            fontSize: '18px',
          }}
          variant='outlined'
          severity='warning'
          color='warning'
          action={
            <Button color='info' size='small' onClick={handleClickAdd}>
              SETUP NOW
            </Button>
          }
        >
          No setting found !
        </Alert>
      )}
      {isAddBranch && user.permission.includes(RoutePermittedRole2.admin_branch_create) && (
        <AddGateway
          isAdd={isAddBranch}
          handleClose={() => setAddBranch(false)}
          reCallAPI={reCallAPI}
          selectedBranch={selectedBranch}
        />
      )}

      {isUpdate && user.permission.includes(RoutePermittedRole2.admin_branch_update) && (
        <EditGateway
          isAdd={isUpdate}
          selectedData={selectedData}
          handleClose={() => setIsUpdate(false)}
          reCallAPI={reCallAPI}
          selectedBranch={selectedBranch}
        />
      )}
      <AppConfirmDialogV2
        dividers
        open={openDeletePaymentGatewayDialog}
        dialogTitle={'Delete Confirmation'}
        title={
          <Typography
            component='h4'
            variant='h4'
            sx={{
              mb: 3,
              fontWeight: Fonts.SEMI_BOLD,
            }}
            id='alert-dialog-title'
          >
            {'Are you sure you want to delete the payment gateway?'}
          </Typography>
        }
        onDeny={handleCloseDeletePaymentGatewayDialog}
        onConfirm={handleClickDelete}
      />
      <AppInfoView />
    </Box>
  );
};
export default PaymentGateway;

PaymentGateway.propTypes = {
  settings: PropTypes.object,
  onUpdateSettings: PropTypes.func,
  selectedBranch: PropTypes.object.isRequired,
};
