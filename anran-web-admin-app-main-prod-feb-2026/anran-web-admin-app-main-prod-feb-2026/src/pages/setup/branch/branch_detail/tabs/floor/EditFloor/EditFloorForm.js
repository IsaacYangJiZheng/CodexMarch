import React from 'react';
import {Box, Button} from '@mui/material';
// import {Avatar, Box, Button, Typography} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
// import {Form, Field} from 'formik';
import {Form} from 'formik';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';

const AddFloorForm = ({values, errors, setFieldValue, selectedBranch}) => {
  //   const inputLabel = React.useRef(null);
  //   const [selectedReason, setSelectedReason] = React.useState('');
  console.log('values', values, errors);
  console.log('AddFloorForm', selectedBranch);

  //   const onReasonSelect = (event) => {
  //     setFieldValue('reason', event.target.value.name);
  //     setSelectedReason(event.target.value);
  //   };

  const handleStatusChange = (event) => {
    setFieldValue('floorStatus', event.target.checked);
  };

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
              Branch: {selectedBranch?.branchName}
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={{xs: 12, md: 6}}>
              <AppTextField
                name='floorNo'
                fullWidth
                label={<IntlMessages id='anran.floor.no' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <AppTextField
                fullWidth
                name='floorDetail'
                label={<IntlMessages id='anran.floor.name' />}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <FormControlLabel
                sx={{mb: {xs: 4, xl: 6}, ml: 0, mt: -3}}
                control={
                  <Checkbox
                    checked={values.floorStatus}
                    onChange={handleStatusChange}
                  />
                }
                label='Is in Operation ?'
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

export default AddFloorForm;
AddFloorForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  selectedBranch: PropTypes.object.isRequired,
};
