import React from 'react';
import {Box, Button, Checkbox, Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import { Switch, FormControlLabel } from '@mui/material';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import AppGridContainer from '@anran/core/AppGridContainer';

const AddGateWayForm = (props) => {
  const {setFieldValue, values, errors} = props;

  const handleSwitchChange = (event) => {
    setFieldValue('isActive', event.target.checked);
  };

  console.log('values', values);

  return (
    <Form noValidate autoComplete='off'>
      <AppGridContainer>
        <Grid size={{xs: 12}}>
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
              <Grid size={{xs: 12}}>
                <FormControl fullWidth error={errors.provider ? true : false}>
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
              <Grid size={{xs: 12}}>
                <AppTextField
                  name='providerKey1'
                  variant='outlined'
                  sx={{
                    width: '100%',
                    my: 2,
                  }}
                  label='API Key'
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <AppTextField
                  name='providerKey2'
                  variant='outlined'
                  sx={{
                    width: '100%',
                    my: 2,
                  }}
                  label='Securet Key'
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <FormControl fullWidth error={errors.currency ? true : false}>
                  <InputLabel>Payment Currency</InputLabel>
                  <Select
                    name='currency'
                    label='Payment Currency'
                    value={values.currency}
                    onChange={(event) => {
                      setFieldValue('currency', event.target.value);
                    }}
                  >
                    <MenuItem value={'MYR'}>MYR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{xs: 12}}>
                <Typography variant='subtitle2' gutterBottom>
                  Select your preferable payment method:
                </Typography>
              </Grid>
              <Grid size={{xs: 12}}>
                {values.allowedMethod.map((item, i) => {
                  return (
                    <AppGridContainer key={i}>
                      <Grid size={{xs: 12}}>
                        <FormControlLabel
                          value={item.enabled}
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
                    </AppGridContainer>
                  );
                })}
              </Grid>
              <Grid size={{xs: 12}}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={handleSwitchChange}
                      name="activeSwitch"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </AppGridContainer>
          </Box>
        </Grid>
      </AppGridContainer>

      <Stack direction='row' justifyContent='flex-end' spacing={5} sx={{mt: 3}}>
        <Button variant='contained' color='primary' type='submit'>
          Save
        </Button>
      </Stack>
    </Form>
  );
};

export default AddGateWayForm;

AddGateWayForm.defaultProps = {
  isSubmitting: false,
};

AddGateWayForm.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  isSubmitting: PropTypes.bool,
  setFieldValue: PropTypes.func,
};
