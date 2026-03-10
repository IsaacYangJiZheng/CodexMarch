import React, {useState, useEffect} from 'react';
import {useDropzone} from 'react-dropzone';
import {
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  Box,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Radio,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {Formik, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {putDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {Autocomplete} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import {packageSettings} from '../packageSettings';

const EditPackage = ({
  open,
  onClose,
  reCallAPI,
  branchDatabase,
  editingPackageId,
  initialValues,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [filteredBranches, setFilteredBranches] = useState(branchDatabase);
  const validationSchema = Yup.object().shape({
    packageName: Yup.string().required('Package name is required'),
    packageCode: Yup.string().required('Package code is required'),
    packagePrice: Yup.number().required('Package price is required').positive(),
    packageCategory: Yup.string().required('Category is required'),
    packageOrder: Yup.number().required('Order is required').positive(),
    maxQtyType: Yup.string().required('It is required'),
    maxQty: Yup.string().when('maxQtyType', {
      is: 'limited',
      then: () =>
        Yup.number()
          .positive('Quantity must be postive')
          .required('It is required'),
    }),
  });

  useEffect(() => {
    if (initialValues.imageUrl) {
      setImageUrl(initialValues.imageUrl);
    }
    if (initialValues.branchGroup === 'franchise branch') {
      const filtered = branchDatabase.filter((branch) => branch.isFranchise);
      setFilteredBranches(filtered);
    } else {
      setFilteredBranches(branchDatabase);
    }
  }, [initialValues.imageUrl, branchDatabase]);

  // Image Dropzone
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setImageData(acceptedFiles[0]);
    },
  });

  const dropzoneProps = getRootProps();
  const inputProps = getInputProps();

  const handleClose = () => {
    setImageUrl(null);
    setImageData(null);
    onClose();
  };

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader onCloseAddCard={handleClose} title={'Edit Package'} />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            console.log(values.branchName);
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', imageData);
            formData.append('packageName', values.packageName);
            formData.append('packageCode', values.packageCode);
            formData.append('packagePrice', values.packagePrice);
            formData.append('packageCategory', values.packageCategory);
            formData.append('packageOrder', values.packageOrder);
            formData.append('packageValidity', values.packageValidity);
            formData.append(
              'packageFixedValidityDate1',
              values.packageFixedValidityDate1,
            );
            formData.append(
              'packageFixedValidityDate2',
              values.packageFixedValidityDate2,
            );
            formData.append('isAlways', values.isAlways);
            if (values.isAlways === true) {
              formData.append('startDate', values.startDate);
              formData.append('endDate', values.endDate);
            }
            formData.append('branchGroup', values.branchGroup);
            formData.append('packageUnlimitedStatus', values.isUnlimited);
            if (values.isUnlimited === false) {
              formData.append('packageUsageLimit', values.noOfTime);
            }
            formData.append('packageTransferableStatus', values.isTransferable);
            formData.append('packageImageURL', values.imageUrl);
            formData.append('packageImageData', values.imageData);
            formData.append('branchName', JSON.stringify(values.branch));
            formData.append('allBranchStatus', values.isAllBranch);
            formData.append('packagePublishStatus', values.publishSwitch);
            formData.append('packageAvailabilityMode', values.availabilityMode);
            formData.append('maxQtyType', values.maxQtyType);
            formData.append('maxQty', values.maxQty);
            formData.append('isWalkInSaleOnly', values.isWalkInSaleOnly);
            formData.append('isInstant', values.isInstant);

            try {
              const response = await putDataApi(
                `/api/package/${editingPackageId}`,
                infoViewActionsContext,
                formData,
                false,
                {
                  'Content-Type': 'multipart/form-data',
                },
              );
              console.log('Response from API:', response);
              reCallAPI();
              onClose();
              setImageUrl(null);
              infoViewActionsContext.showMessage('Updated successfully!');
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => {
            useEffect(() => {
              if (initialValues.isAllbranch === true) {
                setFieldValue('branch', []);
              } else {
                setFieldValue('branch', initialValues.branch || []);
              }
            }, []);
            const handleCategoryChange = (event) => {
              const selectedCategory = event.target.value;
              const settings = packageSettings[selectedCategory] || {};
              setFieldValue('packageCategory', selectedCategory);
              setFieldValue('packageValidity', settings.packageValidity || '');
              setFieldValue('packageFixedValidityDate1', null);
              setFieldValue('packageFixedValidityDate2', null);
            };
            return (
              <Form>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant='h4'>Package Information</Typography>
                  </Grid>
                  <Grid container size={8}>
                    <Grid size={12}>
                      <FormControl fullWidth margin='dense'>
                        <InputLabel>Category</InputLabel>
                        <Select
                          name='packageCategory'
                          label='Category'
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          value={values.packageCategory}
                          onChange={handleCategoryChange}
                        >
                          <MenuItem value=''>
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value='Standard'>Standard</MenuItem>
                          <MenuItem value='Promo'>Promo</MenuItem>
                        </Select>
                        <ErrorMessage
                          name='packageCategory'
                          component='div'
                          style={{color: 'red'}}
                        />
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <AppTextField
                        label='Package Name'
                        variant='outlined'
                        fullWidth
                        name='packageName'
                        margin='dense'
                        helperText={<ErrorMessage name='packageName' />}
                      />
                    </Grid>
                    <Grid size={6}>
                      <AppTextField
                        label='Package Code'
                        variant='outlined'
                        fullWidth
                        name='packageCode'
                        margin='dense'
                        helperText={<ErrorMessage name='packageCode' />}
                      />
                    </Grid>
                    <Grid size={6}>
                      <AppTextField
                        label='Price'
                        variant='outlined'
                        fullWidth
                        name='packagePrice'
                        type='number'
                        margin='dense'
                        helperText={<ErrorMessage name='packagePrice' />}
                        InputProps={{
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
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setFieldValue('packagePrice', ''); // Assuming you want to set it to 0 if empty
                          } else {
                            setFieldValue('packagePrice', parseFloat(value));
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid size={4} container>
                    <Grid size={12}>
                      <Box
                        {...dropzoneProps}
                        sx={{
                          height: '270px',
                          border: '2px dashed #cccccc',
                          borderRadius: '4px',
                          padding: '20px',
                          textAlign: 'center',
                          alignContent: 'center',
                          cursor: 'pointer',
                          backgroundColor: isDragActive ? '#eeeeee' : '#fafafa',
                          overflow: 'hidden',
                        }}
                      >
                        <input {...inputProps} />
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt='Preview'
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : isDragActive ? (
                          <Typography>Drop the image here ...</Typography>
                        ) : (
                          <Typography>
                            Drag &apos;n&apos; drop an image here, or click to
                            select one
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  {values.packageCategory && (
                    <Grid container size={12}>
                      <Grid size={12}>
                        <Divider />
                      </Grid>
                      <Grid size={12}>
                        <Typography variant='h4'>Package Settings</Typography>
                      </Grid>
                      <Grid size={12}>
                        <FormGroup>
                          <FormControl component='fieldset'>
                            <RadioGroup
                              aria-label='branch-setting'
                              name='branch-setting'
                              value={values.branchGroup}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                setFieldValue('branchGroup', selectedValue);
                                if (selectedValue === 'franchise branch') {
                                  const filtered = branchDatabase.filter(
                                    (branch) => branch.isFranchise,
                                  );
                                  setFilteredBranches(filtered);
                                  setFieldValue('isAllBranch', false);
                                  setFieldValue('branch', '');
                                } else {
                                  setFilteredBranches(branchDatabase);
                                }
                              }}
                            >
                              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <FormControlLabel
                                  value='direct branch'
                                  control={<Radio />}
                                  label='Direct Branch'
                                />
                                <FormControlLabel
                                  value='franchise branch'
                                  control={<Radio />}
                                  label='Franchise Branch'
                                />
                              </Box>
                            </RadioGroup>
                          </FormControl>
                        </FormGroup>
                      </Grid>
                      <Grid size={12}>
                        <FormGroup>
                          <FormControl component='fieldset'>
                            <RadioGroup
                              aria-label='branch-selection'
                              name='branch-selection'
                              value={values.isAllBranch ? 'all' : 'individual'}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                setFieldValue(
                                  'isAllBranch',
                                  selectedValue === 'all',
                                );
                                if (selectedValue === 'all') {
                                  setFieldValue('branch', []);
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              >
                                <FormControlLabel
                                  value='all'
                                  control={<Radio />}
                                  label='All Branch'
                                  disabled={
                                    values.branchGroup === 'franchise branch' ||
                                    values.branchGroup === ''
                                  }
                                />
                                <FormControlLabel
                                  value='individual'
                                  control={<Radio />}
                                  label='Individual Branch'
                                  disabled={values.branchGroup === ''}
                                />
                                {!values.isAllBranch &&
                                  filteredBranches.length > 0 && (
                                    <Grid size={6}>
                                      <Autocomplete
                                        multiple
                                        id='branch-autocomplete'
                                        options={filteredBranches}
                                        getOptionLabel={(option) =>
                                          option.branchName
                                        }
                                        value={
                                          Array.isArray(values.branch)
                                            ? values.branch
                                            : []
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                          option._id === value._id
                                        }
                                        filterOptions={(options, params) => {
                                          const filtered = options.filter(
                                            (option) => {
                                              const optionName =
                                                option.branchName || '';
                                              return optionName
                                                .toLowerCase()
                                                .includes(
                                                  params.inputValue.toLowerCase(),
                                                );
                                            },
                                          );
                                          return filtered;
                                        }}
                                        onChange={(event, value) =>
                                          setFieldValue('branch', value)
                                        }
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            variant='outlined'
                                            label={
                                              <IntlMessages id='common.selectBranches' />
                                            }
                                            fullWidth
                                            error={
                                              !!values.branch &&
                                              values.branch.length === 0
                                            }
                                            helperText={
                                              !!values.branch &&
                                              values.branch.length === 0
                                                ? 'Please select at least one branch'
                                                : ''
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                  )}
                              </Box>
                            </RadioGroup>
                          </FormControl>
                        </FormGroup>
                      </Grid>
                      <Grid size={12}>
                        <Typography
                          variant='body2'
                          style={{
                            marginTop: '8px',
                            color: 'gray',
                          }}
                        >
                          {values.isAllBranch
                            ? 'Member can use this package in all branches.'
                            : 'Member can use this package in selected branches.'}
                        </Typography>{' '}
                      </Grid>
                      <Grid size={12}>
                        <FormGroup>
                          <FormControl component='fieldset'>
                            <RadioGroup
                              aria-label='package-setting'
                              name='package-setting'
                              value={
                                values.isUnlimited ? 'unlimited' : 'amount'
                              }
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                setFieldValue(
                                  'isUnlimited',
                                  selectedValue === 'unlimited',
                                );
                                if (selectedValue === 'unlimited') {
                                  setFieldValue('noOfTime', '');
                                }
                              }}
                            >
                              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <FormControlLabel
                                  value='unlimited'
                                  control={<Radio />}
                                  label='Unlimited Usage'
                                />
                                <FormControlLabel
                                  value='amount'
                                  control={<Radio />}
                                  label='Fixed Times Usage'
                                />
                                {!values.isUnlimited && (
                                  <Grid item xs={2} md={2}>
                                    <TextField
                                      fullWidth
                                      label='Number of Times'
                                      type='number'
                                      variant='outlined'
                                      value={values.noOfTime}
                                      onChange={(event) => {
                                        setFieldValue(
                                          'noOfTime',
                                          event.target.value,
                                        );
                                      }}
                                      margin='dense'
                                    />
                                  </Grid>
                                )}
                              </Box>
                            </RadioGroup>
                          </FormControl>
                        </FormGroup>
                      </Grid>
                      <Grid size={12}>
                        <Grid size={5}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              style={{
                                width: '120px',
                                fontWeight: values.isTransferable
                                  ? 'normal'
                                  : 'bold',
                                color: values.isTransferable ? 'gray' : 'red',
                              }}
                            >
                              Non-Transferable
                            </Typography>
                            <Switch
                              checked={values.isTransferable}
                              onChange={(event) => {
                                setFieldValue(
                                  'isTransferable',
                                  event.target.checked,
                                );
                              }}
                              inputProps={{'aria-label': 'controlled'}}
                            />
                            <Typography
                              style={{
                                width: '120px',
                                fontWeight: values.isTransferable
                                  ? 'bold'
                                  : 'normal',
                                color: values.isTransferable ? 'green' : 'gray',
                              }}
                            >
                              Transferable
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Grid size={12}>
                        <Typography
                          variant='body2'
                          style={{marginTop: '8px', color: 'gray'}}
                        >
                          {values.isTransferable
                            ? 'This package can be transferred to others and can also be used by you.'
                            : 'This package is for your own use only and cannot be transferred.'}
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Grid size={5}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              style={{
                                width: '120px',
                                fontWeight: values.isInstant
                                  ? 'normal'
                                  : 'bold',
                                color: values.isInstant ? 'gray' : 'red',
                              }}
                            >
                              Normal Booking Only
                            </Typography>
                            <Switch
                              checked={values.isInstant}
                              onChange={(event) => {
                                setFieldValue(
                                  'isInstant',
                                  event.target.checked,
                                );
                              }}
                              inputProps={{'aria-label': 'controlled'}}
                            />
                            <Typography
                              style={{
                                width: '120px',
                                fontWeight: values.isInstant
                                  ? 'bold'
                                  : 'normal',
                                color: values.isInstant ? 'green' : 'gray',
                              }}
                            >
                              Instant & Normal Booking
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Grid size={12}>
                        <Divider />
                      </Grid>
                      <Grid size={12}>
                        <Typography
                          variant='body'
                          style={{marginTop: '8px', fontWeight: 'bold'}}
                        >
                          Package Validity
                        </Typography>
                      </Grid>
                      <Grid size={6} sx={{mt: 4}}>
                        <FormControl fullWidth margin='dense'>
                          <InputLabel>Package Validity</InputLabel>
                          <Select
                            value={values.packageValidity}
                            onChange={(event) => {
                              setFieldValue(
                                'packageValidity',
                                event.target.value,
                              );
                            }}
                            label='Package Validity'
                            // disabled={
                            //   !!packageSettings[values.packageCategory]
                            //     ?.packageValidity
                            // }
                            helperText={<ErrorMessage name='packageValidity' />}
                          >
                            <MenuItem value='Life Time'>Life Time</MenuItem>
                            <MenuItem value='1 Year'>1 Year</MenuItem>
                            <MenuItem value='fixed'>Fixed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={6} sx={{mt: 4}}>
                        {values.packageValidity === 'fixed' && (
                          <DatePicker
                            disablePast
                            sx={{width: '100%'}}
                            variant='outlined'
                            label='Valid Until'
                            name='packageFixedValidityDate2'
                            value={values.packageFixedValidityDate2}
                            renderInput={(params) => <TextField {...params} />}
                            onChange={(value) => {
                              setFieldValue('packageFixedValidityDate1', value);
                              setFieldValue('packageFixedValidityDate2', value);
                            }}
                            slotProps={{
                              textField: {
                                margin: 'dense',
                                error:
                                  values.packageValidity === 'fixed' &&
                                  !values.packageFixedValidityDate2,
                                helperText:
                                  values.packageValidity === 'fixed' &&
                                  !values.packageFixedValidityDate2
                                    ? 'Validity date is required'
                                    : '',
                              },
                            }}
                            format='DD/MM/YYYY'
                          />
                        )}
                      </Grid>
                      <Grid size={12}>
                        <Divider />
                      </Grid>
                      <Grid size={5} sx={{mt: 8}}>
                        Maximum Allowed Purchase Quantity Per Member:
                      </Grid>
                      <Grid size={3} sx={{mt: 4}}>
                        <FormControl
                          fullWidth
                          margin='dense'
                          error={!values.maxQtyType}
                        >
                          <InputLabel>Maximum Quantity Type</InputLabel>
                          <Select
                            value={values.maxQtyType}
                            onChange={(event) => {
                              setFieldValue('maxQtyType', event.target.value);
                              if (event.target.value === 'unlimited') {
                                setFieldValue('maxQtyType', 99999);
                              } else {
                                setFieldValue('maxQty', '');
                              }
                            }}
                            label='Maximum Quantity Type'
                          >
                            <MenuItem value='unlimited'>Unlimited</MenuItem>
                            <MenuItem value='limited'>Limited</MenuItem>
                          </Select>
                          {!values.maxQtyType && (
                            <FormHelperText>It is required</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={3} sx={{mt: 4}}>
                        {values.maxQtyType === 'limited' && (
                          <AppTextField
                            label='Maximum Quantity'
                            variant='outlined'
                            fullWidth
                            name='maxQty'
                            type='number'
                            margin='dense'
                            helperText={<ErrorMessage name='maxQty' />}
                            InputProps={{
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
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                setFieldValue('maxQty', '');
                              } else {
                                setFieldValue('maxQty', value);
                              }
                            }}
                          />
                        )}
                      </Grid>
                      <Grid size={12}>
                        <Divider />
                      </Grid>
                      <Grid size={12}>
                        <Typography
                          variant='body'
                          style={{marginTop: '8px', fontWeight: 'bold'}}
                        >
                          Scheduled Display Period
                        </Typography>
                      </Grid>
                      <Grid container size={12} sx={{alignItems: 'center'}}>
                        <Grid size={5}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              style={{
                                width: '100px',
                                fontWeight: values.isAlways ? 'normal' : 'bold',
                                color: values.isAlways ? 'gray' : 'red',
                              }}
                            >
                              Always
                            </Typography>
                            <Switch
                              checked={values.isAlways}
                              onChange={(event) => {
                                setFieldValue('isAlways', event.target.checked);
                              }}
                              inputProps={{'aria-label': 'controlled'}}
                            />
                            <Typography
                              style={{
                                width: '100px',
                                fontWeight: values.isAlways ? 'bold' : 'normal',
                                color: values.isAlways ? 'green' : 'gray',
                              }}
                            >
                              Date Range
                            </Typography>
                          </Box>
                        </Grid>
                        {values.isAlways === true && (
                          <Grid container spacing={2} size={7}>
                            <Grid size={6}>
                              <DatePicker
                                sx={{width: '100%'}}
                                variant='outlined'
                                label='From Date'
                                name='fromDate'
                                value={values.startDate}
                                renderInput={(params) => (
                                  <TextField {...params} />
                                )}
                                onChange={(value) =>
                                  setFieldValue('startDate', value)
                                }
                                slotProps={{
                                  textField: {
                                    margin: 'dense',
                                    error:
                                      values.isAlways === true &&
                                      !values.startDate,
                                    helperText:
                                      values.isAlways === true &&
                                      !values.startDate
                                        ? 'From date is required'
                                        : '',
                                  },
                                }}
                                format='DD/MM/YYYY'
                              />
                            </Grid>
                            <Grid size={6}>
                              <DatePicker
                                sx={{width: '100%'}}
                                variant='outlined'
                                label='End Date'
                                name='endDate'
                                value={values.endDate}
                                renderInput={(params) => (
                                  <TextField {...params} />
                                )}
                                onChange={(value) =>
                                  setFieldValue('endDate', value)
                                }
                                slotProps={{
                                  textField: {
                                    margin: 'dense',
                                    error:
                                      values.isAlways === true &&
                                      !values.endDate,
                                    helperText:
                                      values.isAlways === true &&
                                      !values.endDate
                                        ? 'End date is required'
                                        : '',
                                  },
                                }}
                                format='DD/MM/YYYY'
                              />
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  )}
                  <Grid size={12}>
                    <Divider />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant='h4'>Other Settings</Typography>
                  </Grid>
                  <Grid size={5}>
                    <Grid size={7.1}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          style={{
                            width: '120px',
                            fontWeight: values.isWalkInSaleOnly
                              ? 'bold'
                              : 'normal',
                            color: values.isWalkInSaleOnly ? 'red' : 'grey',
                          }}
                        >
                          Walk-In Sale Only
                        </Typography>
                        <Switch
                          checked={values.isWalkInSaleOnly}
                          onChange={(event) => {
                            setFieldValue(
                              'isWalkInSaleOnly',
                              event.target.checked,
                            );
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                      </Box>
                    </Grid>
                    <Grid size={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          style={{
                            width: '120px',
                            fontWeight: values.publishSwitch
                              ? 'normal'
                              : 'bold',
                            color: values.publishSwitch ? 'gray' : 'red',
                          }}
                        >
                          Non-Publish
                        </Typography>
                        <Switch
                          checked={values.publishSwitch}
                          onChange={(event) => {
                            setFieldValue(
                              'publishSwitch',
                              event.target.checked,
                            );
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                        <Typography
                          style={{
                            width: '120px',
                            fontWeight: values.publishSwitch
                              ? 'bold'
                              : 'normal',
                            color: values.publishSwitch ? 'green' : 'gray',
                          }}
                        >
                          Publish
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          style={{
                            width: '120px',
                            fontWeight: values.availabilityMode
                              ? 'normal'
                              : 'bold',
                            color: values.availabilityMode ? 'gray' : 'green',
                          }}
                        >
                          Campaign Only
                        </Typography>
                        <Switch
                          checked={values.availabilityMode}
                          onChange={(event) => {
                            setFieldValue(
                              'availabilityMode',
                              event.target.checked,
                            );
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                        <Typography
                          style={{
                            width: '120px',
                            fontWeight: values.availabilityMode
                              ? 'bold'
                              : 'normal',
                            color: values.availabilityMode ? 'green' : 'gray',
                          }}
                        >
                          Always Available
                        </Typography>
                      </Box>
                    </Grid>
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
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default EditPackage;

EditPackage.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branchDatabase: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  editingPackageId: PropTypes.string.isRequired,
  initialValues: PropTypes.object.isRequired,
};
