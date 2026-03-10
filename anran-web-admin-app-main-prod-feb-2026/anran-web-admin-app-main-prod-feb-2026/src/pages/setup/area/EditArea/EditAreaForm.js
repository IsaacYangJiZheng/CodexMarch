import React from 'react';
import {Box, Button} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';

const AddAreaForm = ({values, errors}) => {
  console.log('values', values, errors);

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 5,
          ml: -6,
          mr: -6,
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
              <IntlMessages id='admin.area.section.info' />
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={{xs: 12, md: 6}}>
              <AppTextField
                name='areaCode'
                fullWidth
                label={<IntlMessages id='anran.areaCode' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <AppTextField
                fullWidth
                name='areaName'
                label={<IntlMessages id='anran.areaName' />}
              />
            </Grid>
          </AppGridContainer>
        </Box>
      </Box>
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
  );
};

export default AddAreaForm;
AddAreaForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  selectedChildren: PropTypes.array,
};
