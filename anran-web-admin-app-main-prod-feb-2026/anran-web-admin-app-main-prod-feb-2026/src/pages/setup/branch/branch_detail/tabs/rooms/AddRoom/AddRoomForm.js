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
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {useGetDataApi} from '@anran/utility/APIHooks';

const AddFloorForm = ({values, errors, setFieldValue, selectedBranch}) => {
  const [{apiData: floorList}] = useGetDataApi(
    `api/floors/branch/${selectedBranch._id}`,
    {},
    {},
    true,
  );
  console.log('values', values, errors);
  console.log('AddRoomForm', selectedBranch);

  const handleStatusChange = (event) => {
    setFieldValue('status_active', event.target.checked);
  };

  const handleGenderChange = (event) => {
    setFieldValue('room_gender', event.target.value);
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
              Branch: {selectedBranch?.branchName.toUpperCase()}
            </Box>
          </Box>
          <AppGridContainer spacing={4}>
            <Grid size={12}>
              {floorList.length > 0 && (
                <FormControl fullWidth error={errors?.areaName}>
                  <InputLabel id='demo-simple-select-label'>
                    Select Floor
                  </InputLabel>
                  <Select
                    name='floor'
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    label='Select Floor'
                    value={values.floor}
                    onChange={(event) => {
                      setFieldValue('floor', event.target.value);
                    }}
                  >
                    {floorList?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item._id}
                        sx={{
                          padding: 2,
                          cursor: 'pointer',
                          minHeight: 'auto',
                        }}
                      >
                        {item.floorNo} <span> [{item.floorDetail}] </span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid size={12}>
              <AppTextField
                name='room_no'
                fullWidth
                label={<IntlMessages id='anran.roomNo' />}
              />
            </Grid>
            <Grid size={12}>
              <AppTextField
                fullWidth
                name='roomCapacity'
                label={<IntlMessages id='anran.roomCapacity' />}
              />
            </Grid>
            <Grid size={12}>
              <FormControl error={errors.room_gender ? true : false}>
                <FormLabel id='demo-row-radio-buttons-group-label'>
                  Room Gender
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby='demo-row-radio-buttons-group-label'
                  name='row-radio-buttons-group'
                  value={values.room_gender}
                  onChange={handleGenderChange}
                >
                  <FormControlLabel
                    value='Female'
                    control={<Radio />}
                    label='Female'
                  />
                  <FormControlLabel
                    value='Male'
                    control={<Radio />}
                    label='Male'
                  />
                  <FormControlLabel
                    value='Both'
                    control={<Radio />}
                    label='UniSex'
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <FormControlLabel
                sx={{mb: {xs: 4, xl: 6}, ml: 0, mt: -3}}
                control={
                  <Checkbox
                    checked={values.status_active}
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
