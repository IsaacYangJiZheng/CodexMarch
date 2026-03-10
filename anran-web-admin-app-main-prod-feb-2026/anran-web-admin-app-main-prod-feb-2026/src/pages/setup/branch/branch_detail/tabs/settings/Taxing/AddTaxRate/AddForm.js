import React from 'react';
import {Box, Button} from '@mui/material';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

const AddDocTypeForm = (props) => {
  const {isSubmitting, setFieldValue, values} = props;

  const handleNameChange = (event) => {
    setFieldValue('taxValue', event.target.value);
  };

  return (
    <Form
      style={{
        width: '100%',
        height: '100%',
      }}
      noValidate
      autoComplete='off'
    >
      <Box
        sx={{
          padding: 5,
          ml: -6,
          mr: -6,
        }}
      >
        <Box
          sx={{
            // pb: 5,
            px: 5,
            mx: -5,
            mb: 0,
            mt: 0,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            component='h6'
            sx={{
              mb: {xs: 4, xl: 6},
              mt: 0,
              px: {xs: 5, lg: 8, xl: 10},
              fontSize: 14,
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            Tax Details
          </Box>
          <Box
            sx={{
              pb: 5,
              px: {xs: 5, lg: 8, xl: 10},
            }}
          >
            <FormControl fullWidth>
              <InputLabel id='demo-simple-select-label'>
                Your Tax Type
              </InputLabel>
              <Select
                name='taxType'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                label='Your Payment Gateway Provider'
                value={values.taxType}
                onChange={(event) => {
                  setFieldValue('taxType', event.target.value);
                }}
              >
                <MenuItem value={'SST'}>SST</MenuItem>
                <MenuItem value={'GST'}>GST</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              pb: 5,
              px: {xs: 5, lg: 8, xl: 10},
            }}
          >
            <AppTextField
              sx={{
                width: '100%',
                mb: {xs: 4, xl: 6},
              }}
              variant='outlined'
              label={'Tax Rate (%)'}
              name='taxValue'
              type='number'
              value={values.taxValue}
              onChange={handleNameChange}
            />
          </Box>
          <Box
            sx={{
              pb: 5,
              px: {xs: 5, lg: 8, xl: 10},
            }}
          >
            <DatePicker
              label='Effective From'
              value={values.effectiveDate}
              onChange={(newValue) => setFieldValue('effectiveDate', newValue)}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          pb: 4,
          mx: -1,
          textAlign: 'right',
        }}
      >
        <Button
          sx={{
            position: 'relative',
            minWidth: 100,
          }}
          disabled={isSubmitting}
          color='primary'
          variant='outlined'
          type='submit'
        >
          <IntlMessages id='common.save' />
        </Button>
      </Box>
    </Form>
  );
};

export default AddDocTypeForm;

AddDocTypeForm.defaultProps = {
  isSubmitting: false,
};

AddDocTypeForm.propTypes = {
  values: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool,
  setFieldValue: PropTypes.func,
};
