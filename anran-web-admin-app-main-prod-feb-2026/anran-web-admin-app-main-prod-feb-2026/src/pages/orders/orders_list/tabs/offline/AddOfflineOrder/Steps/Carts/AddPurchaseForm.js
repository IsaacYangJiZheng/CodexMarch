import React, {useContext} from 'react';
import {FormContext} from '../../../AddOfflineOrder';
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
import CartTable from './CartTable';
import PackageCard from './PackageCard';
import OrderSummary from './OrderSummary';
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
import {useIntl} from 'react-intl';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const AddCartForm = ({errors, setFieldValue}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const {
    activeStep,
    setActiveStep,
    cart,
    setCart,
    selectedMember,
    setSelectedMember,
    selectedBranch,
    setSelectedBranch,
  } = useContext(FormContext);

  // ===== Member dropdown (booking-form search logic) =====
  const [memberList, setMemberList] = React.useState([]);
  const [memberSearch, setMemberSearch] = React.useState('');
  const searchTimerRef = React.useRef(null);

  // ===== Fast registration dialog =====
  const [fastRegistrationOpen, setFastRegistrationOpen] = React.useState(false);

  // ===== APIs =====
  const [{apiData: branchList}] = useGetDataApi('api/branch', {}, {}, true);
  const [{apiData: roleBasedBranchList}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  // USE booking-form style: only fetch when searching (>=3 chars)
  const [
    {apiData: memberData},
    {setQueryParams: setMemberQueryParams, reCallAPI: reCallMemberSearchApi},
  ] = useGetDataApi('api/members/newdropdown', {}, {}, false);

  // package api remains same
  const [{apiData: packageList}, {setQueryParams, setData = {setData}}] =
    useGetDataApi('api/package/branch/member', {}, {}, false);

  const validationSchema = React.useMemo(
    () =>
      yup.object({
        memberFullName: yup
          .string()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
        mobileNumber: yup
          .string()
          .matches(
            phoneRegExp,
            formatMessage({id: 'finance.sales.purchase.phoneInvalid'}),
          )
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'})),
      }),
    [formatMessage],
  );

  // ====== handlers ======
  const onBranchChange = (value) => {
    setFieldValue('branchName', value?._id);
    setSelectedBranch(value);
  };

  const onMemberChange = (value) => {
    if (value?._id) {
      setFieldValue('member', value._id);
      setSelectedMember(value);
    } else {
      setFieldValue('member', value);
      setSelectedMember(value);
    }
    setFieldValue('branchName', null);
    setSelectedBranch(null);
    setCart([]);
    setData([]);
  };

  // Retrieve packages after both selected
  React.useEffect(() => {
    if (selectedBranch && selectedMember) {
      setQueryParams({bid: selectedBranch?._id, mid: selectedMember?._id});
    }
  }, [selectedBranch, selectedMember]);

  // booking-form style: map api result -> combinedLabel
  React.useEffect(() => {
    if (memberData?.length > 0) {
      const updatedMembers = memberData.map((member) => ({
        ...member,
        combinedLabel: `${member.memberFullName} (${member.mobileNumber})`,
      }));
      setMemberList(updatedMembers);
    } else {
      setMemberList([]);
    }
  }, [memberData]);

  // booking-form logic: only search when >=3 chars, debounced 300ms
  React.useEffect(() => {
    const q = memberSearch?.trim() || '';
    if (q.length >= 3) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        setMemberQueryParams({search: q});
      }, 300);
      return () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      };
    }
    // if less than 3, clear results (same as booking form)
    setMemberList([]);
  }, [memberSearch]);

  const handleFastRegistrationDialogOpen = () => {
    setFastRegistrationOpen(true);
  };

  const handleFastRegistrationDialogClose = () => {
    setFastRegistrationOpen(false);
  };

  // ===== cart handlers =====
  const handleToggle = (value) => {
    if (cart.some((item) => item._id == value._id)) {
      setCart(cart.filter((item) => item._id !== value._id));
    } else {
      const newItem = {
        ...value,
        packageAmount: value.packagePrice * value.qty,
      };
      setCart(cart.concat(newItem));
    }
  };

  const onRemoveItem = (data) => {
    setCart(cart.filter((item) => item._id !== data._id));
  };

  const onDecrement = (data) => {
    if (data.qty > 1) {
      let cartItems = [];
      cartItems = cart.map((item) => {
        if (item._id === data._id) {
          item.qty = item.qty - 1;
          item.packageAmount = parseFloat(item.qty * item.packagePrice).toFixed(
            2,
          );
        }
        return item;
      });
      setCart(cartItems);
    } else {
      setCart(cart.filter((item) => item._id !== data._id));
    }
  };

  const onIncrement = (data) => {
    if (data.maxQtyType == 'unlimited') {
      let cartItems = [];
      if (cart.some((item) => item._id === data._id)) {
        cartItems = cart.map((item) => {
          if (item._id === data._id) {
            item.qty = item.qty + 1;
            item.packageAmount = parseFloat(
              item.qty * item.packagePrice,
            ).toFixed(2);
          }
          return item;
        });
        setCart(cartItems);
      } else {
        cartItems = data.concat(data);
        setCart(cartItems);
      }
    } else {
      let cartItems = [];
      if (cart.some((item) => item._id === data._id)) {
        cartItems = cart.map((item) => {
          if (item._id === data._id) {
            if (item.qty < data.allowedQty) {
              item.qty = item.qty + 1;
              item.packageAmount = item.qty * item.packagePrice;
            }
          }
          return item;
        });
        setCart(cartItems);
      } else {
        cartItems = data.concat(data);
        setCart(cartItems);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Form noValidate autoComplete='off'>
      <Box sx={{padding: 5}}>
        <Box
          sx={{
            pb: 5,
            px: 5,
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
                <Autocomplete
                  value={selectedMember}
                  options={memberList}
                  getOptionLabel={(option) => option?.combinedLabel || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.combinedLabel === value?.combinedLabel
                  }
                  inputValue={memberSearch}
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'clear') {
                      // keep existing "clear" behavior minimal
                      setMemberSearch('');
                      setFieldValue('member', null);
                      setSelectedMember(null);
                      return;
                    }
                    setMemberSearch(newInputValue || '');
                  }}
                  clearOnBlur={() => {
                    setFieldValue('member', null);
                    setSelectedMember(null);
                  }}
                  onChange={(event, newInputValue) => {
                    onMemberChange(newInputValue);
                  }}
                  // DO NOT disturb this behavior (your requirement)
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
                    />
                  )}
                />
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
              {roleBasedBranchList.length > 0 && (
                <Autocomplete
                  value={selectedBranch}
                  options={roleBasedBranchList}
                  getOptionLabel={(option) => option.branchName}
                  isOptionEqualToValue={(option, value) =>
                    option.branchName === value.branchName
                  }
                  clearOnBlur={() => {
                    setFieldValue('branchName', null);
                    setSelectedBranch(null);
                  }}
                  onChange={(event, newInputValue) => {
                    onBranchChange(newInputValue);
                  }}
                  noOptionsText={
                    <Typography style={{cursor: 'pointer'}}>
                      {formatMessage({id: 'finance.sales.purchase.noBranchFound'})}
                    </Typography>
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={formatMessage({id: 'finance.sales.purchase.selectBranch'})}
                      variant='outlined'
                      error={errors?.member}
                    />
                  )}
                />
              )}
            </Grid>

            <Grid size={{xs: 12, md: 12}}>
              {packageList.length > 0 ? (
                <AppGridContainer spacing={2}>
                  {packageList?.map((item) => {
                    return (
                      <Grid container key={item?.id} size={{xs: 12, md: 4}}>
                        <PackageCard
                          item={item}
                          onSelect={handleToggle}
                          carts={cart}
                        />
                      </Grid>
                    );
                  })}
                </AppGridContainer>
              ) : null}
            </Grid>

            <Grid size={{xs: 12, md: 12}}>
              <CartTable
                cartItems={cart}
                onRemoveItem={onRemoveItem}
                onDecrement={onDecrement}
                onIncrement={onIncrement}
              />
            </Grid>
          </AppGridContainer>

          <OrderSummary cartItems={cart} selectedBranch={selectedBranch} />
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
          {formatMessage({id: 'finance.sales.purchase.next'})}
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
              {'Content-Type': 'multipart/form-data'},
            )
              .then((data) => {
                // refresh member search results (optional but keeps data fresh)
                // if you want to keep old behavior, you can also remove this
                reCallMemberSearchApi?.();

                if (data.status == 'ok') {
                  setFieldValue('member', data.data[0]._id);
                  data.data[0].combinedLabel = `${data.data[0].memberFullName} (${data.data[0].mobileNumber})`;
                  setSelectedMember(data.data[0]);
                  setMemberSearch(data.data[0].combinedLabel);
                  handleFastRegistrationDialogClose();
                  infoViewActionsContext.showMessage(
                    formatMessage({id: 'finance.sales.purchase.addedSuccess'}),
                  );
                } else {
                  infoViewActionsContext.fetchError(data.message);
                }
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <Form>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({
                        id: 'finance.sales.purchase.memberFullName',
                      })}
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
                          ? formatMessage({id: 'finance.sales.purchase.numberInvalid'})
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
                          {formatMessage({id: 'finance.sales.purchase.preferredBranch'})}
                        </InputLabel>
                        <Select
                          name='preferredBranch'
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          label={formatMessage({id: 'finance.sales.purchase.preferredBranch'})}
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
                        sx={{position: 'relative', minWidth: 100}}
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
};