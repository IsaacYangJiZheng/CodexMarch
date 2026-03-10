import React, {useContext} from 'react';
import {Box, Button, Typography} from '@mui/material';
import {FormContext} from '../../../AddCustomDateOfflineOrder';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import AppDialog from '@anran/core/AppDialog';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import * as yup from 'yup';
import IntlMessages from '@anran/utility/IntlMessages';
import InputAdornment from '@mui/material/InputAdornment';
import {useIntl} from 'react-intl';

const DepositDialog = ({
  openDepositDialog,
  handleCloseDepositDialog,
  setSelectedMethod,
}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const {selectedMember, orderBalanceTotal, setUseDeposit} =
    useContext(FormContext);
  const [{apiData: depositData}] = useGetDataApi(
    `api/memberDeposit/${selectedMember._id}`,
    {},
    {},
    true,
  );
  const validationSchema = React.useMemo(
    () =>
      yup.object({
        amount: yup
          .number()
          .required(formatMessage({id: 'finance.sales.purchase.validation.required'}))
          .positive(formatMessage({id: 'finance.sales.deposit.amountPositive'}))
          .max(
            Math.min(
              parseFloat(orderBalanceTotal).toFixed(2),
              parseFloat(depositData?.totalAmount).toFixed(2),
            ),
            formatMessage(
              {id: 'finance.sales.deposit.amountExceed'},
              {
                depositBalance: parseFloat(depositData?.totalAmount).toFixed(2),
                totalDue: parseFloat(orderBalanceTotal).toFixed(2),
              },
            ),
          ),
      }),
    [depositData?.totalAmount, formatMessage, orderBalanceTotal],
  );

  const onChangeDeposit = (values) => {
    console.log('onChangeDeposit', values.amount);

    const depositMethod = {
      id: 5,
      name: 'Deposit',
      images: [{ type: 'deposit' }],
      amount: Number(values.amount).toFixed(2),
      reference: formatMessage({id: 'finance.sales.deposit.balanceLabel'}),
    };

    setSelectedMethod((prevMethods) => {
      const existingDeposit = prevMethods.find((method) => method.id === 5);
      if (existingDeposit) {
        return prevMethods.map((method) =>
          method.id === 5 ? { ...method, amount: depositMethod.amount } : method
        );
      }
      return [...prevMethods, depositMethod];
    });
  };

  return (
    <AppDialog
      dividers
      maxWidth='xs'
      open={openDepositDialog}
      hideClose
      sx={{pt: 0}}
      title={
        <CardHeader
          onCloseAddCard={handleCloseDepositDialog}
          title={formatMessage({id: 'finance.sales.deposit.amountTitle'})}
        />
      }
    >
      <Formik
        validateOnBlur={true}
        initialValues={{
          amount: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, {setSubmitting}) => {
          console.log('values2', values);
          setSubmitting(true);
          handleCloseDepositDialog();
          setUseDeposit(Number(values.amount).toFixed(2));
          onChangeDeposit(values);
          infoViewActionsContext.showMessage(
            formatMessage({id: 'finance.sales.deposit.appliedSuccess'}),
          );
          setSubmitting(false);
        }}
      >
        {({errors}) => {
          return (
            <Form>
              <AppGridContainer spacing={4}>
                <Grid size={12}>
                  <Typography variant='h4'>
                    {formatMessage({id: 'finance.sales.deposit.balanceLabel'})}{' '}
                    RM{' '}
                    {parseFloat(depositData.totalAmount).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <AppTextField
                    label={formatMessage({id: 'finance.sales.deposit.useAmount'})}
                    variant='outlined'
                    fullWidth
                    name='amount'
                    type='number'
                    margin='dense'
                    helperText={errors.amount}
                    InputProps={{
                      type: 'number',
                      startAdornment: (
                        <InputAdornment position='start'>RM</InputAdornment>
                      ),
                      sx: {
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                          {
                            display: 'none',
                          },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      },
                    }}
                    onFocus={(e) =>
                      e.target.addEventListener(
                        'wheel',
                        function (e) {
                          e.preventDefault();
                        },
                        {passive: false},
                      )
                    }
                  />
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
  );
};

export default DepositDialog;

DepositDialog.propTypes = {
  setSelectedMethod: PropTypes.func,
  handleCloseDepositDialog: PropTypes.func,
  openDepositDialog: PropTypes.bool,
};