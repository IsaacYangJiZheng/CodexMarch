import React, {useContext} from 'react';
import {FormContext} from '../../../AddCustomDateOfflineOrder';
import PropTypes from 'prop-types';
import {Formik, Form} from 'formik';
import {Box, Button, Card, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import {Fonts} from 'shared/constants/AppEnums';
import DepositCard from './DepositCard';
import DepositDialog from './DepositDialog';
import PaymentTable from './PaymentTable';
import PaymentSummary from './PaymentSummary';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import PackageCard from './PackageCard';
import {useAuthUser} from '@anran/utility/AuthHooks';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique identifiers
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import {useIntl} from 'react-intl';

const defaultPayMethodList = [
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
  {id: 4, name: 'e-Wallet', images: [{type: 'wallet'}], amount: '',},
  {
    id: 8,
    name: '(AMEX) Credit/Debit Card',
    images: [{type: 'amex'}],
    amount: '',
  },
  {
    id: 9,
    name: 'Others',
    images: [{type: 'bank'}],
    amount: '',
  }
];

const MemberPayments = () => {
  const {formatMessage} = useIntl();
  const {
    activeStep,
    setActiveStep,
    formData,
    setFormData,
    orderTotal,
    orderBalanceTotal,
    orderTaxTotal,
    taxCode,
    taxValue,
    selectedMember,
    selectedBranch,
    setOrderNumber,
    setUseDeposit,
  } = useContext(FormContext);
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [selectedMethod, setSelectedMethod] = React.useState([]);
  const [{apiData: depositData}] = useGetDataApi(
    `api/memberDeposit/${selectedMember._id}`,
    {},
    {},
    true,
  );
  const [openDepositDialog, setOpenDepositDialog] = React.useState(false);
  const [payMethodList, setPayMethodList] = React.useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handlePlaceOrder = async () => {
    setOpenConfirmDialog(false);
    if (selectedMethod.length > 0) {
      const consolidatedData = {
        ...formData,
        payments: selectedMethod,
        orderTotal: orderTotal,
        totalTax: orderTaxTotal,
        taxValue: taxValue,
        taxCode: taxCode,
        totalDiscount: 0,
      };
      const hasDeposit = selectedMethod.some((method) => method.id === 5);
      setFormData(consolidatedData);
      const postOrderData = async () => {
        try {
          const response = await postDataApi(
            '/api/order/custom-date-offline-order',
            infoViewActionsContext,
            consolidatedData,
            false,
            false,
          );
          const orderNumber = response;
          setSelectedMethod([]);
          setOrderNumber(orderNumber);
          setActiveStep(activeStep + 1);
          if (hasDeposit) {
            const depositMethod = selectedMethod.find(
              (method) => method.id === 5,
            );
            const depositFormData = new FormData();
            depositFormData.append('orderNumber', orderNumber);
            depositFormData.append('payAmount', depositMethod.amount);
            depositFormData.append('reference', depositMethod.reference);
            depositFormData.append('branch', selectedBranch._id);
            depositFormData.append('payer', selectedMember._id);
            depositFormData.append('createdBy', user.uid);

            await postDataApi(
              '/api/memberDeposit/useDeposits',
              infoViewActionsContext,
              depositFormData,
              false,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            );
          }
        } catch (error) {
          infoViewActionsContext.fetchError(error.message);
        }
      };
      postOrderData();
    } else {
      alert(formatMessage({id: 'finance.sales.payment.mustSelectMethod'}));
    }
  };

  const payMethodLabels = React.useMemo(
    () => ({
      6: formatMessage({id: 'finance.sales.paymentMethod.visa'}),
      7: formatMessage({id: 'finance.sales.paymentMethod.master'}),
      2: formatMessage({id: 'finance.sales.paymentMethod.onlineBanking'}),
      4: formatMessage({id: 'finance.sales.paymentMethod.ewallet'}),
      8: formatMessage({id: 'finance.sales.paymentMethod.amex'}),
      9: formatMessage({id: 'finance.sales.paymentMethod.others'}),
    }),
    [formatMessage],
  );

  React.useEffect(() => {
    let clonedArray = JSON.parse(JSON.stringify(defaultPayMethodList));
    const localizedMethods = clonedArray.map((method) => ({
      ...method,
      displayName: payMethodLabels[method.id] || method.name,
    }));
    setPayMethodList(localizedMethods);
    setSelectedMethod([
      {
        id: null,
        name: '',
        amount: '',
        reference: selectedBranch?.branchName || '',
        uuid: uuidv4(),
      },
    ]); // Set default reference to branchName
  }, [payMethodLabels, selectedBranch?.branchName]);

  const handleBack = () => {
    setPayMethodList([]);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleToggle = (value, rowIndex) => {
    const defaultAmount = (parseFloat(orderTaxTotal) + parseFloat(orderTotal)).toFixed(2);
    const updatedMethod = {
      ...value,
      amount: rowIndex === 0 ? defaultAmount : '',
      reference: selectedBranch?.branchName || '',
      uuid: selectedMethod[rowIndex]?.uuid || uuidv4(),
    };

    const updatedMethods = selectedMethod.map((method, index) =>
      index === rowIndex ? updatedMethod : method
    );

    setSelectedMethod(updatedMethods);
  };

  const addNewPaymentRow = () => {
    setSelectedMethod([...selectedMethod, { id: null, name: '', amount: '', reference: '', uuid: uuidv4() }]); // Add uuid to new rows
  };

  const onRemoveItem = (uuid) => {
    const itemToRemove = selectedMethod.find((item) => item.uuid === uuid);
    if (itemToRemove?.id === 5) {
      setUseDeposit(0);
    }
    setSelectedMethod(selectedMethod.filter((item) => item.uuid !== uuid));
  };

  const onChangeAmount = (uuid, amount) => {
    console.log('onChangeAmount', amount);
    const updatedMethods = selectedMethod.map((item) => {
      if (item.uuid === uuid) {
        return {
          ...item,
          amount: amount > 0 ? amount : '',
        };
      }
      return item;
    });
    setSelectedMethod(updatedMethods);
  };

  const onChangeReference = (data, value) => {
    const updatedMethods = selectedMethod.map((item) => {
      if (item.uuid === data.uuid) {
        return {
          ...item,
          reference: value || data.name,
        };
      }
      return item;
    });
    setSelectedMethod(updatedMethods);
  };

  const handleOpenDepositDialog = () => {
    setOpenDepositDialog(true);
  };

  const handleCloseDepositDialog = () => {
    setOpenDepositDialog(false);
  };
  console.log('sdfsdfs', orderBalanceTotal);

  return (
    <Formik
      validateOnBlur={true}
      initialValues={{
        orderDate: formData?.orderDate ? formData?.orderDate : '',
        branchName: formData?.branchName ? formData?.branchName : '',
        member: formData?.member ? formData?.member : '',
      }}
      onSubmit={async (data) => {
        console.log('ssssssssssssssss', data);
        if (selectedMethod.length > 0) {
          const consolidatedData = {
            ...formData,
            payments: selectedMethod,
            orderTotal: orderTotal,
            totalTax: orderTaxTotal,
            taxValue: taxValue,
            taxCode: taxCode,
            totalDiscount: 0,
          };
          const hasDeposit = selectedMethod.some((method) => method.id === 5);
          setFormData(consolidatedData);
          const postOrderData = async () => {
            try {
              const response = await postDataApi(
                '/api/order/custom-date-offline-order',
                infoViewActionsContext,
                consolidatedData,
                false,
                false,
              );
              const orderNumber = response;
              setSelectedMethod([]);
              setOrderNumber(orderNumber);
              setActiveStep(activeStep + 1);
              if (hasDeposit) {
                const depositMethod = selectedMethod.find(
                  (method) => method.id === 5,
                );
                const depositFormData = new FormData();
                depositFormData.append('orderNumber', orderNumber);
                depositFormData.append('payAmount', depositMethod.amount);
                depositFormData.append('reference', depositMethod.reference);
                depositFormData.append('branch', selectedBranch._id);
                depositFormData.append('payer', selectedMember._id);
                depositFormData.append('createdBy', user.uid);

                await postDataApi(
                  '/api/memberDeposit/useDeposits',
                  infoViewActionsContext,
                  depositFormData,
                  false,
                  false,
                  {
                    'Content-Type': 'multipart/form-data',
                  },
                );
              }
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            }
          };
          postOrderData();
        } else {
          alert(formatMessage({id: 'finance.sales.payment.mustSelectMethod'}));
        }
      }}
    >
      {() => {
        return (
          <Form noValidate autoComplete='off'>
            <Box
              sx={{
                pb: 5,
                px: 5,
                // mx: -5,
                mb: 5,
                //   borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Card sx={{p: 2}}>
                <AppGridContainer spacing={4} sx={{p: 5}}>
                  <Grid size={{xs: 12, md: 6}}>
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
                        {formatMessage({id: 'finance.sales.payment.memberLabel'})}{' '}
                        {selectedMember?.combinedLabel}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{xs: 12, md: 6}}>
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
                        {formatMessage({id: 'finance.sales.payment.branchLabel'})}{' '}
                        {selectedBranch?.branchName}
                      </Box>
                    </Box>
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
                        {formatMessage({id: 'finance.sales.payment.selectedPackages'})}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{xs: 12, md: 12}}>
                    {formData?.carts.length > 0 ? (
                      <AppGridContainer spacing={2}>
                        {formData?.carts?.map((item) => {
                          return (
                            <Grid
                              container
                              key={item?.id}
                              size={{xs: 12, md: 4}}
                            >
                              <PackageCard item={item} />
                            </Grid>
                          );
                        })}
                      </AppGridContainer>
                    ) : null}
                  </Grid>
                </AppGridContainer>
              </Card>
            </Box>
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
                  //   borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <AppGridContainer spacing={4}>
                  {/* <Grid size={{xs: 12, md: 12}}>
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
                        Payment Method:
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{xs: 12, md: 12}}>
                    {payMethodList.length > 0 ? (
                      <AppGridContainer>
                        <Grid container spacing={1} size={{xs: 12, md: 12}}>
                          {payMethodList?.map((item) => {
                            return (
                              <PayMethodList
                                key={item?.id}
                                item={item}
                                onSelect={handleToggle}
                                payMethodList={selectedMethod}
                              />
                            );
                          })}
                        </Grid>
                      </AppGridContainer>
                    ) : null}
                  </Grid> */}
                  <Grid size={{xs: 12, md: 12}}>
                    <PaymentTable
                      paymentItems={selectedMethod}
                      onRemoveItem={onRemoveItem}
                      onChangeAmount={onChangeAmount}
                      onChangeReference={onChangeReference}
                      payMethodList={payMethodList}
                      onAddRow={addNewPaymentRow}
                      onSelectPayMethod={handleToggle}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 12}}>
                    {depositData.totalAmount > 0 ? (
                      <DepositCard
                        depositAmount={depositData.totalAmount}
                        handleOpenDepositDialog={handleOpenDepositDialog}
                      />
                    ) : null}
                    <DepositDialog
                      openDepositDialog={openDepositDialog}
                      handleCloseDepositDialog={handleCloseDepositDialog}
                      selectedMethod={selectedMethod}
                      setSelectedMethod={setSelectedMethod}
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
              >
                {formatMessage({id: 'finance.sales.purchase.previous'})}
              </Button>
              <Box sx={{flex: 1}} />
              <Button
                type="button"
                variant="contained"
                disabled={orderBalanceTotal != 0}
                endIcon={<ChevronRightRoundedIcon />}
                onClick={handleOpenConfirmDialog} // Open confirmation dialog
              >
                {formatMessage({id: 'finance.sales.payment.placeOrder'})}
              </Button>
            </Box>
            <AppDialog
              dividers
              maxWidth='md'
              open={openConfirmDialog}
              hideClose
              title={
                <CardHeader
                  onCloseAddCard={handleCloseConfirmDialog}
                  title={formatMessage({
                    id: 'finance.sales.payment.confirmOrderTitle',
                  })}
                />
              }
            >
              <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 12}}>
                  <Typography variant="h6" gutterBottom>
                    {formatMessage({id: 'finance.sales.payment.reviewPackages'})}
                  </Typography>
                </Grid>
                <Grid size={{xs: 12, md: 12}}>
                  {formData?.carts.length > 0 ? (
                    <AppGridContainer spacing={2}>
                      {formData?.carts?.map((item) => {
                        return (
                          <Grid
                            container
                            key={item?.id}
                            size={{xs: 12, md: 4}}
                          >
                            <PackageCard item={item} />
                          </Grid>
                        );
                      })}
                    </AppGridContainer>
                  ) : null}
                </Grid>
              </Grid>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button onClick={handleCloseConfirmDialog} color="primary" variant="outlined">
                  {formatMessage({id: 'common.cancel'})}
                </Button>
                <Button onClick={handlePlaceOrder} color="primary" variant="contained">
                  {formatMessage({id: 'finance.sales.payment.placeOrder'})}
                </Button>
              </Box>
            </AppDialog>
          </Form>
        );
      }}
    </Formik>
  );
};

export default MemberPayments;

MemberPayments.propTypes = {
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};