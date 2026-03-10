import React from 'react';
import {
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  InputAdornment,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Formik, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {useIntl} from 'react-intl';

const EditVoucher = ({
  open,
  onClose,
  reCallAPI,
  editingVoucherId,
  initialValues,
}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();

  const validationSchema = Yup.object().shape({
    voucherType: Yup.string().required(
      formatMessage({id: 'admin.voucher.validation.typeRequired'}),
    ),
    voucherCode: Yup.string().required(
      formatMessage({id: 'admin.voucher.validation.codeRequired'}),
    ),
    rewardType: Yup.string().required(
      formatMessage({id: 'admin.voucher.validation.rewardTypeRequired'}),
    ),
    rewardValue: Yup.number()
      .required(formatMessage({id: 'admin.voucher.validation.rewardRequired'}))
      .positive(),
    validityType: Yup.string().required(
      formatMessage({id: 'admin.voucher.validation.validityTypeRequired'}),
    ),
    validityValue: Yup.number()
      .required(formatMessage({id: 'admin.voucher.validation.validityRequired'}))
      .positive(),
  });

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={onClose}
            title={formatMessage({id: 'admin.voucher.edit.title'})}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('voucherType', values.voucherType);
            formData.append('voucherCode', values.voucherCode);
            formData.append('voucherDescription', values.voucherDescription);
            formData.append('rewardType', values.rewardType);
            formData.append('rewardValue', values.rewardValue);
            formData.append('validityType', values.validityType);
            formData.append('validityValue', values.validityValue);
            formData.append('isActive', values.isActive);

            try {
              const response = await putDataApi(
                `/api/voucher/${editingVoucherId}`,
                infoViewActionsContext,
                formData,
                false,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              infoViewActionsContext.showMessage(
                formatMessage({id: 'admin.voucher.edit.success'}),
              );
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant='h4'>
                    {formatMessage({id: 'admin.voucher.form.section.info'})}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth margin='dense'>
                    <InputLabel>
                      {formatMessage({id: 'admin.voucher.form.type'})}
                    </InputLabel>
                    <Select
                      name='voucherType'
                      label={formatMessage({id: 'admin.voucher.form.type'})}
                      labelId='demo-simple-select-type'
                      id='demo-voucher-select'
                      value={values.voucherType}
                      onChange={(event) => {
                        setFieldValue('voucherType', event.target.value);
                      }}
                    >
                      <MenuItem value='New Member'>
                        {formatMessage({id: 'admin.voucher.type.newMember'})}
                      </MenuItem>
                      <MenuItem value='Birthday'>
                        {formatMessage({id: 'admin.voucher.type.birthday'})}
                      </MenuItem>
                      <MenuItem value='Milestone'>
                        {formatMessage({id: 'admin.voucher.type.milestone'})}
                      </MenuItem>
                      <MenuItem value='Referral'>
                        {formatMessage({id: 'admin.voucher.type.referral'})}
                      </MenuItem>
                      <MenuItem value='Inactivity'>
                        {formatMessage({id: 'admin.voucher.type.inactivity'})}
                      </MenuItem>
                      <MenuItem value='Anniversary'>
                        {formatMessage({id: 'admin.voucher.type.anniversary'})}
                      </MenuItem>
                    </Select>
                    <ErrorMessage
                      name='voucherType'
                      component='div'
                      style={{color: 'red'}}
                    />
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <AppTextField
                    label={formatMessage({id: 'admin.voucher.form.code'})}
                    variant='outlined'
                    fullWidth
                    name='voucherCode'
                    margin='dense'
                    type='text'
                    helperText={<ErrorMessage name='voucherCode' />}
                  />
                </Grid>
                <Grid size={12}>
                  <AppTextField
                    label={formatMessage({id: 'admin.voucher.form.description'})}
                    variant='outlined'
                    fullWidth
                    name='voucherDescription'
                    margin='dense'
                    type='text'
                    rows={5}
                    multiline
                  />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth margin='dense'>
                    <InputLabel>
                      {formatMessage({id: 'admin.voucher.form.rewardType'})}
                    </InputLabel>
                    <Select
                      name='rewardType'
                      label={formatMessage({id: 'admin.voucher.form.rewardType'})}
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={values.rewardType}
                      onChange={(event) => {
                        setFieldValue('rewardType', event.target.value);
                      }}
                    >
                      <MenuItem value='Percentage'>
                        {formatMessage({id: 'admin.voucher.rewardType.percentage'})}
                      </MenuItem>
                      <MenuItem value='Amount'>
                        {formatMessage({id: 'admin.voucher.rewardType.amount'})}
                      </MenuItem>
                    </Select>
                    <ErrorMessage
                      name='rewardType'
                      component='div'
                      style={{color: 'red'}}
                    />
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <AppTextField
                    label={formatMessage({id: 'admin.voucher.form.rewardValue'})}
                    variant='outlined'
                    fullWidth
                    name='rewardValue'
                    margin='dense'
                    type='number'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          {values.rewardType === 'Percentage' ? '%' : 'RM'}
                        </InputAdornment>
                      ),
                    }}
                    helperText={<ErrorMessage name='rewardValue' />}
                  />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth margin='dense'>
                    <InputLabel>
                      {formatMessage({id: 'admin.voucher.form.validityType'})}
                    </InputLabel>
                    <Select
                      name='validityType'
                      label={formatMessage({
                        id: 'admin.voucher.form.validityType',
                      })}
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={values.validityType}
                      onChange={(event) => {
                        setFieldValue('validityType', event.target.value);
                      }}
                    >
                      <MenuItem value='Day'>
                        {formatMessage({id: 'admin.voucher.validityType.day'})}
                      </MenuItem>
                      <MenuItem value='Week'>
                        {formatMessage({id: 'admin.voucher.validityType.week'})}
                      </MenuItem>
                      <MenuItem value='Month'>
                        {formatMessage({id: 'admin.voucher.validityType.month'})}
                      </MenuItem>
                      <MenuItem value='Year'>
                        {formatMessage({id: 'admin.voucher.validityType.year'})}
                      </MenuItem>
                    </Select>
                    <ErrorMessage
                      name='validityType'
                      component='div'
                      style={{color: 'red'}}
                    />
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <AppTextField
                    label={formatMessage({id: 'admin.voucher.form.validityValue'})}
                    variant='outlined'
                    fullWidth
                    name='validityValue'
                    margin='dense'
                    type='number'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          {values.validityType ? values.validityType : ''}
                        </InputAdornment>
                      ),
                    }}
                    helperText={<ErrorMessage name='validityValue' />}
                  />
                </Grid>
                <Grid size={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      style={{
                        fontWeight: values.isActive ? 'normal' : 'bold',
                        color: values.isActive ? 'gray' : 'red',
                      }}
                    >
                      {formatMessage({id: 'admin.voucher.status.inactive'})}
                    </Typography>
                    <Switch
                      checked={values.isActive}
                      onChange={(event) => {
                        setFieldValue('isActive', event.target.checked);
                      }}
                      inputProps={{'aria-label': 'controlled'}}
                    />
                    <Typography
                      style={{
                        fontWeight: values.isActive ? 'bold' : 'normal',
                        color: values.isActive ? 'green' : 'gray',
                      }}
                    >
                      {formatMessage({id: 'admin.voucher.status.active'})}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
            </Form>
          )}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default EditVoucher;

EditVoucher.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingVoucherId: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
};