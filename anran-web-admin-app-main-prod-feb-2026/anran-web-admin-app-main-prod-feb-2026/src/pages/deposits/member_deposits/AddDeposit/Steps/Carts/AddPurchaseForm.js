import React, {useContext} from 'react';
import {FormContext} from '../..';
import {Box, Button, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {useGetDataApi} from '@anran/utility/APIHooks';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AppDialog from '@anran/core/AppDialog';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import * as yup from 'yup';
import {MuiTelInput} from 'mui-tel-input';
import IntlMessages from '@anran/utility/IntlMessages';
import PayMethodList from './PayMethodCard';
import PaymentTable from './PaymentTable';
import PaymentSummary from './PaymentSummary';
import {useIntl} from 'react-intl';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const payMethodList = [
  // {
  //   id: 1,
  //   name: 'Credit/Debit Card',
  //   images: [{type: 'card'}],
  //   amount: '',
  // },
  {
    id: 6,
    name: '(VISA) Credit/Debit Card',
    images: [{type: 'visa'}],
    amount: '',
  },
  {
    id: 7,
    name: '(MASTER) Credit/Debit Card',
    images: [{type: 'master'}],
    amount: '',
  },
  {
    id: 2,
    name: 'Online Banking',
    images: [{type: 'bank'}],
    amount: '',
  },
  // {id: 3, name: 'Cash', images: [{type: 'cash'}], amount: ''},
  {id: 4, name: 'e-Wallet', images: [{type: 'wallet'}], amount: ''},
  {
    id: 8,
    name: '(AMEX) Credit/Debit Card',
    images: [{type: 'amex'}],
    amount: '',
  },
];

const AddCartForm = ({
  values,
  errors,
  setFieldValue,
  selectedMethod,
  setSelectedMethod,
}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const {activeStep, setActiveStep} = useContext(FormContext);

  const [selectedMember, setSelectedMember] = React.useState(null);
  const [memberList, setMemberList] = React.useState([]);
  const [fastRegistrationOpen, setFastRegistrationOpen] = React.useState(false);
  const [{apiData: branchList}] = useGetDataApi('api/branch', {}, {}, true);
  const [{apiData: roleBasedBranchList}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );
  const [{apiData: memberData}, {reCallAPI}] = useGetDataApi(
    'api/members/dropdown',
    {},
    {},
    true,
  );

  const [selectedBranch, setSelectedBranch] = React.useState(null);
  console.log(selectedBranch);
  const validationSchema = React.useMemo(
    () =>
      yup.object({
        memberFullName: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
        mobileNumber: yup
          .string()
          .matches(phoneRegExp, formatMessage({id: 'finance.sales.purchase.phoneInvalid'}))
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
        preferredBranch: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
      }),
    [formatMessage],
  );

  const onBranchChange = (value) => {
    setFieldValue('branchName', value);
    setFieldValue('member', '');
    setSelectedMember(null);
    setSelectedBranch(value);
  };

  React.useEffect(() => {
    if (memberData?.length > 0) {
      const updatedMembers = memberData.map((member) => ({
        ...member,
        combinedLabel: `${member.memberFullName} (${member.mobileNumber})`,
      }));
      setMemberList(updatedMembers);
    }
  }, [memberData]);

  const handleFastRegistrationDialogOpen = () => {
    setFastRegistrationOpen(true);
  };

  const handleFastRegistrationDialogClose = () => {
    setFastRegistrationOpen(false);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const localizedPayMethods = React.useMemo(
    () =>
      payMethodList.map((method) => ({
        ...method,
        displayName:
          {
            6: formatMessage({id: 'finance.sales.paymentMethod.visa'}),
            7: formatMessage({id: 'finance.sales.paymentMethod.master'}),
            2: formatMessage({id: 'finance.sales.paymentMethod.onlineBanking'}),
            4: formatMessage({id: 'finance.sales.paymentMethod.ewallet'}),
            8: formatMessage({id: 'finance.sales.paymentMethod.amex'}),
          }[method.id] || method.name,
      })),
    [formatMessage],
  );

  const handleToggle = (value) => {
    if (selectedMethod.some((item) => item.id == value.id)) {
      setSelectedMethod(selectedMethod.filter((item) => item.id !== value.id));
    } else {
      setSelectedMethod(selectedMethod.concat(value));
    }
  };

  const onRemoveItem = (data) => {
    setSelectedMethod(selectedMethod.filter((item) => item.id !== data.id));
  };

  const onChangeAmount = (data, amount) => {
    console.log('onChangeAmount', amount);
    const updatedSelectedMethod = selectedMethod.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          amount: amount > 0 ? amount : '',
        };
      }
      return item;
    });
    // let cartItems = [];
    // cartItems = selectedMethod.map((item) => {
    //   if (item.id === data.id) {
    //     if (amount > 0) {
    //       item.amount = amount;
    //     } else {
    //       item.amount = '';
    //     }
    //   }
    //   return item;
    // });
    setSelectedMethod(updatedSelectedMethod);
    console.log('cartItems', updatedSelectedMethod);
  };

  const onChangeReference = (data, value) => {
    console.log('onChangeReference', value);
    let cartItems = [];
    cartItems = selectedMethod.map((item) => {
      if (item.id === data.id) {
        item.reference = value;
      }
      return item;
    });
    setSelectedMethod(cartItems);
  };

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 5,
        }}
      >
        <Box
          sx={{
            pb: 5,
            px: 5,
            // mx: -5,
            mb: 5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              component='h6'
              sx={{
                mb: {xs: 4, xl: 6},
                mt: 0,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              {formatMessage({id: 'finance.sales.purchase.selectOrCreateMember'})}
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={{xs: 12, md: 6}}>
              {roleBasedBranchList.length > 0 && (
                <FormControl fullWidth error={errors?.branchName}>
                  <InputLabel id='demo-simple-select-label'>
                    {formatMessage({id: 'finance.sales.filter.branch'})}
                  </InputLabel>
                  <Select
                    name='branchName'
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    label={formatMessage({id: 'finance.sales.filter.branch'})}
                    value={values.branchName}
                    onChange={(event) => {
                      onBranchChange(event.target.value);
                    }}
                  >
                    {roleBasedBranchList?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id}
                        sx={{
                          padding: 2,
                          cursor: 'pointer',
                          minHeight: 'auto',
                        }}
                      >
                        {item.branchName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </AppGridContainer>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              component='h6'
              sx={{
                mb: {xs: 4, xl: 6},
                mt: 4,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              {formatMessage({id: 'finance.sales.purchase.selectBranch'})}
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={{xs: 12, md: 6}}>
              {memberList.length > 0 && (
                <Autocomplete
                  value={selectedMember}
                  options={memberList}
                  getOptionLabel={(option) => option.combinedLabel}
                  isOptionEqualToValue={(option, value) =>
                    option.combinedLabel === value.combinedLabel
                  }
                  onChange={(event, newInputValue) => {
                    if (newInputValue?._id) {
                      setFieldValue('member', newInputValue._id);
                      setSelectedMember(newInputValue);
                    } else {
                      setFieldValue('member', newInputValue);
                      setSelectedMember(newInputValue);
                    }
                  }}
                  noOptionsText={
                    <Typography
                      onClick={handleFastRegistrationDialogOpen}
                      style={{cursor: 'pointer'}}
                    >
                      {formatMessage({id: 'finance.sales.purchase.noMembersFound'})}
                    </Typography>
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={formatMessage({id: 'finance.sales.purchase.selectMember'})}
                      variant='outlined'
                      error={errors?.member}
                      // helperText={errors?.member ? 'select member' : ''}
                    />
                  )}
                />
              )}
            </Grid>
            <Grid size={{xs: 12, md: 12}}>
              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                  <Box
                    component='h6'
                    sx={{
                      mb: 2,
                      mt: 0,
                      fontSize: 14,
                      fontWeight: Fonts.SEMI_BOLD,
                    }}
                  >
                    {formatMessage({id: 'finance.deposits.payment.method'})}
                  </Box>
                </Box>
              </Grid>
            <Grid size={{xs: 12, md: 12}}>
              {localizedPayMethods.length > 0 ? (
                <AppGridContainer>
                  {localizedPayMethods?.map((item) => {
                    return (
                      <Grid key={item?.id} size={{xs: 12, md: 3}}>
                        <PayMethodList
                          item={item}
                          onSelect={handleToggle}
                          payMethodList={selectedMethod}
                        />
                      </Grid>
                    );
                  })}
                </AppGridContainer>
              ) : null}
            </Grid>
            <Grid size={{xs: 12, md: 12}}>
              <PaymentTable
                paymentItems={selectedMethod}
                onRemoveItem={onRemoveItem}
                onChangeAmount={onChangeAmount}
                onChangeReference={onChangeReference}
              />
            </Grid>
            <Grid size={{xs: 12, md: 12}}>
              <PaymentSummary paymentItems={selectedMethod} />
            </Grid>
          </AppGridContainer>
        </Box>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'row', p: 5}}>
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
          variant='outlined'
          fullWidth
          sx={{display: {xs: 'flex', sm: 'none'}}}
        >
          {formatMessage({id: 'finance.sales.purchase.previous'})}
        </Button>
        <Box sx={{flex: '1 1 auto'}} />
        <Button
          type='submit'
          variant='contained'
          endIcon={<ChevronRightRoundedIcon />}
          sx={{width: {xs: '100%', sm: 'fit-content'}}}
        >
          {formatMessage({id: 'finance.deposits.submit'})}
        </Button>
      </Box>
      <AppDialog
        dividers
        maxWidth='xs'
        open={fastRegistrationOpen}
        hideClose
        sx={{pt: 0}}
        title={
          <CardHeader
            onCloseAddCard={() => setFastRegistrationOpen(false)}
            title={formatMessage({id: 'finance.sales.purchase.newMember'})}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            memberFullName: '',
            mobileNumber: '',
            preferredBranch: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            console.log('values2', values);
            setSubmitting(true);
            const formData = new FormData();
            formData.append('memberFullName', values.memberFullName);
            formData.append('mobileNumber', values.mobileNumber);
            formData.append('preferredBranch', values.preferredBranch);
            postDataApi(
              '/api/members/web/partial-Register',
              infoViewActionsContext,
              formData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then((data) => {
                reCallAPI();
                if (data.status == 'ok') {
                  setFieldValue('member', data.data[0]._id);
                  (data.data[0]['combinedLabel'] =
                    `${data.data[0].memberFullName} (${data.data[0].mobileNumber})`),
                    setSelectedMember(data.data[0]);
                  handleFastRegistrationDialogClose();
                  infoViewActionsContext.showMessage(
                    formatMessage({id: 'finance.sales.purchase.addedSuccess'}),
                  );
                } else {
                  infoViewActionsContext.fetchError(data.message);
                }
                handleFastRegistrationDialogClose();
                infoViewActionsContext.showMessage(
                  formatMessage({id: 'finance.sales.purchase.addedSuccess'}),
                );
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <Form>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({id: 'finance.sales.purchase.memberFullName'})}
                      variant='outlined'
                      fullWidth
                      name='memberFullName'
                      type='text'
                      margin='dense'
                      helperText={errors.memberFullName}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MuiTelInput
                      error={errors?.mobileNumber}
                      helperText={
                        errors?.mobileNumber
                          ? formatMessage({
                              id: 'finance.sales.purchase.numberInvalid',
                            })
                          : ''
                      }
                      fullWidth
                      label={<IntlMessages id='anran.member.mobileNumber' />}
                      forceCallingCode
                      defaultCountry='MY'
                      onlyCountries={['MY']}
                      disableFormatting
                      margin='dense'
                      value={values.mobileNumber}
                      onChange={(newValue) => {
                        setFieldValue('mobileNumber', newValue);
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    {branchList.length > 0 && (
                      <FormControl fullWidth error={errors?.preferredBranch}>
                        <InputLabel id='demo-simple-select-label'>
                          {formatMessage({
                            id: 'finance.sales.purchase.preferredBranch',
                          })}
                        </InputLabel>
                        <Select
                          name='preferredBranch'
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          label={formatMessage({
                            id: 'finance.sales.purchase.preferredBranch',
                          })}
                          value={values.preferredBranch}
                          onChange={(event) =>
                            setFieldValue('preferredBranch', event.target.value)
                          }
                        >
                          {branchList?.map((item, index) => (
                            <MenuItem
                              key={index}
                              value={item._id}
                              sx={{
                                padding: 2,
                                cursor: 'pointer',
                                minHeight: 'auto',
                              }}
                            >
                              {item.branchName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        sx={{
                          position: 'relative',
                          minWidth: 100,
                        }}
                        color='primary'
                        variant='contained'
                        type='submit'
                      >
                        <IntlMessages id='common.save' />
                      </Button>
                    </Box>
                  </Grid>
                </AppGridContainer>
              </Form>
            );
          }}
        </Formik>
      </AppDialog>
    </Form>
  );
};

export default AddCartForm;
AddCartForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  branchImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBranchImage: PropTypes.func,
  setBranchImageUrl: PropTypes.func,
  setSelectedMethod: PropTypes.func,
  selectedMethod: PropTypes.array,
};