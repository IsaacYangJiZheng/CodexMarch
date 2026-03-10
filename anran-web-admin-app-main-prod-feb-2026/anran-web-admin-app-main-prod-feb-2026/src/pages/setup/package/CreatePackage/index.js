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
import {postDataApi} from '@anran/utility/APIHooks';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {Autocomplete} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import {packageSettings} from '../packageSettings';
import {useIntl} from 'react-intl';

const CreatePackage = ({open, onClose, reCallAPI, branchDatabase}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [filteredBranches, setFilteredBranches] = useState(
    branchDatabase || [],
  );
  const validationSchema = Yup.object().shape({
    packageName: Yup.string().required(
      formatMessage({id: 'admin.package.validation.nameRequired'}),
    ),
    packageCode: Yup.string().required(
      formatMessage({id: 'admin.package.validation.codeRequired'}),
    ),
    packagePrice: Yup.number()
      .required(formatMessage({id: 'admin.package.validation.priceRequired'}))
      .positive(formatMessage({id: 'admin.package.validation.pricePositive'})),
    packageCategory: Yup.string().required(
      formatMessage({id: 'admin.package.validation.categoryRequired'}),
    ),
    packageOrder: Yup.number()
      .required(formatMessage({id: 'admin.package.validation.orderRequired'}))
      .positive(formatMessage({id: 'admin.package.validation.orderPositive'})),
    noOfTime: Yup.number().positive(
      formatMessage({id: 'admin.package.validation.noOfTimePositive'}),
    ),
    maxQtyType: Yup.string().required(
      formatMessage({id: 'admin.package.validation.maxQtyTypeRequired'}),
    ),
    maxQty: Yup.string().when('maxQtyType', {
      is: 'limited',
      then: () =>
        Yup.number()
          .positive(formatMessage({id: 'admin.package.validation.maxQtyPositive'}))
          .required(formatMessage({id: 'admin.package.validation.maxQtyRequired'})),
    }),
  });

  const initialValues = {
    packageName: '',
    packageCode: '',
    packagePrice: '',
    packageCategory: '',
    packageOrder: '1',
    packageValidity: '1 Year',
    packageFixedValidityDate1: null,
    packageFixedValidityDate2: null,
    isAlways: true,
    startDate: null,
    endDate: null,
    branchGroup: 'direct branch',
    noOfTime: '',
    isUnlimited: true,
    isTransferable: true,
    imageUrl: '',
    imageData: '',
    isAllBranch: true,
    branch: [],
    publishSwitch: true,
    availabilityMode: true,
    maxQtyType: 'unlimited',
    maxQty: 1,
    isWalkInSaleOnly: false,
    isInstant: false,
  };

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
            title={formatMessage({id: 'admin.package.create.title'})}
          />
        }
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
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
            if (values.isAllBranch === false) {
              formData.append('branchName', JSON.stringify(values.branch));
            }
            formData.append('allBranchStatus', values.isAllBranch);
            formData.append('packagePublishStatus', values.publishSwitch);
            formData.append('packageAvailabilityMode', values.availabilityMode);
            formData.append('maxQtyType', values.maxQtyType);
            formData.append('maxQty', values.maxQty);
            formData.append('isWalkInSaleOnly', values.isWalkInSaleOnly);
            formData.append('isInstant', values.isInstant);

            console.log(values);
            try {
              const response = await postDataApi(
                '/api/package',
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
              setImageUrl(null);
              setImageData(null);
               infoViewActionsContext.showMessage(
                formatMessage({id: 'admin.package.create.success'}),
              );
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({values, setFieldValue}) => {
            useEffect(() => {
              if (values.branchGroup === 'franchise branch') {
                const filtered = branchDatabase.filter(
                  (branch) => branch.isFranchise,
                );
                setFilteredBranches(filtered);
              } else {
                const filtered = branchDatabase.filter(
                  (branch) => !branch.isFranchise,
                );
                setFilteredBranches(filtered);
              }
            }, [values.branchGroup]);

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
                    <Typography variant='h4'>
                      {formatMessage({
                        id: 'admin.package.create.section.info',
                      })}
                    </Typography>
                  </Grid>
                  <Grid spacing={2} container size={{xs: 8}}>
                    <Grid size={12}>
                      <FormControl fullWidth margin='dense'>
                        <InputLabel>
                          {formatMessage({
                            id: 'admin.package.create.category.label',
                          })}
                        </InputLabel>
                        <Select
                          name='packageCategory'
                          label={formatMessage({
                            id: 'admin.package.create.category.label',
                          })}
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          value={values.packageCategory}
                          onChange={handleCategoryChange}
                        >
                           <MenuItem value='Standard'>
                            {formatMessage({
                              id: 'admin.package.create.category.standard',
                            })}
                          </MenuItem>
                          <MenuItem value='Promo'>
                            {formatMessage({
                              id: 'admin.package.create.category.promo',
                            })}
                          </MenuItem>
                        </Select>
                        <ErrorMessage
                          name='packageCategory'
                          component={FormHelperText}
                          error
                        />
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <AppTextField
                        label={formatMessage({
                          id: 'admin.package.create.packageName',
                        })}
                        variant='outlined'
                        fullWidth
                        name='packageName'
                        margin='dense'
                        helperText={<ErrorMessage name='packageName' />}
                      />
                    </Grid>
                    <Grid size={6}>
                      <AppTextField
                        label={formatMessage({
                          id: 'admin.package.create.packageCode',
                        })} 
                        variant='outlined'
                        fullWidth
                        name='packageCode'
                        margin='dense'
                        helperText={<ErrorMessage name='packageCode' />}
                      />
                    </Grid>
                    <Grid size={6}>
                      <AppTextField
                        label={formatMessage({
                          id: 'admin.package.create.price',
                        })}
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
                            setFieldValue('packagePrice', '');
                          } else {
                            setFieldValue('packagePrice', parseFloat(value));
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid size={4}>
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
                           <Typography>
                            {formatMessage({
                              id: 'admin.package.create.dropzone.dropHere',
                            })}
                          </Typography>
                        ) : (
                          <Typography>
                             {formatMessage({
                              id: 'admin.package.create.dropzone.instruction',
                            })}
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
                         <Typography variant='h4'>
                          {formatMessage({
                            id: 'admin.package.create.section.settings',
                          })}
                        </Typography>
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
                                  setFieldValue('isAllBranch', false);
                                  setFieldValue('branch', []);
                                } else {
                                  setFieldValue('isAllBranch', true);
                                  setFieldValue('branch', []);
                                }
                              }}
                            >
                              <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                <FormControlLabel
                                  value='direct branch'
                                  control={<Radio />}
                                   label={formatMessage({
                                    id: 'admin.package.create.branch.direct',
                                  })}
                                />
                                <FormControlLabel
                                  value='franchise branch'
                                  control={<Radio />}
                                   label={formatMessage({
                                    id: 'admin.package.create.branch.franchise',
                                  })}
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
                                  label={formatMessage({
                                    id: 'admin.package.create.branch.all',
                                  })}
                                  disabled={
                                    values.branchGroup === 'franchise branch' ||
                                    values.branchGroup === ''
                                  }
                                />
                                <FormControlLabel
                                  value='individual'
                                  control={<Radio />}
                                  label={formatMessage({
                                    id: 'admin.package.create.branch.individual',
                                  })}
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
                                          option.branchName || ''
                                        }
                                        value={
                                          Array.isArray(values.branch)
                                            ? filteredBranches.filter(
                                                (branch) =>
                                                  values.branch.includes(
                                                    branch._id,
                                                  ),
                                              )
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
                                        onChange={(event, value) => {
                                          const branchIds = value.map(
                                            (branch) => branch._id,
                                          );
                                          setFieldValue('branch', branchIds);
                                        }}
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
                                                ?  formatMessage({
                                                    id: 'admin.package.create.branch.required',
                                                  })
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
                           ? formatMessage({
                                id: 'admin.package.create.branch.note.all',
                              })
                            : formatMessage({
                                id: 'admin.package.create.branch.note.selected',
                              })}
                        </Typography>{' '}
                      </Grid>

                      <Grid size={12}>
                        <FormGroup>
                          <FormControl component='fieldset'>
                            <RadioGroup
                              aria-label='package-setting'
                              name='package-setting'
                              value={values.isUnlimited ? 'unlimited' : 'times'}
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                }}
                              >
                                <FormControlLabel
                                  value='unlimited'
                                  control={<Radio />}
                                   label={formatMessage({
                                    id: 'admin.package.create.usage.unlimited',
                                  })}
                                />
                                <FormControlLabel
                                  value='times'
                                  control={<Radio />}
                                  label={formatMessage({
                                    id: 'admin.package.create.usage.fixed',
                                  })} 
                                />
                                {!values.isUnlimited && (
                                  <Grid size={5.5}>
                                    <AppTextField
                                       label={formatMessage({
                                        id: 'admin.package.create.usage.noOfTimes',
                                      })}
                                      variant='outlined'
                                      fullWidth
                                      name='noOfTime'
                                      type='number'
                                      margin='dense'
                                      helperText={
                                        <ErrorMessage name='noOfTime' />
                                      }
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
                                          setFieldValue('noOfTime', '');
                                        } else {
                                          setFieldValue('noOfTime', value);
                                        }
                                      }}
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
                               {formatMessage({
                                id: 'admin.package.create.transfer.nonTransferable',
                              })}
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
                              {formatMessage({
                                id: 'admin.package.create.transfer.transferable',
                              })}
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
                            ? formatMessage({
                                id: 'admin.package.create.transfer.note.transferable',
                              })
                            : formatMessage({
                                id: 'admin.package.create.transfer.note.nonTransferable',
                              })}
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
                             {formatMessage({
                                id: 'admin.package.create.booking.normalOnly',
                              })}
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
                              {formatMessage({
                                id: 'admin.package.create.booking.instant',
                              })}
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
                          {formatMessage({
                            id: 'admin.package.create.validity.sectionTitle',
                          })}
                        </Typography>
                      </Grid>
                      <Grid size={6} sx={{mt: 4}}>
                        <FormControl
                          fullWidth
                          margin='dense'
                          error={!values.packageValidity}
                        >
                          <InputLabel>
                            {formatMessage({
                              id: 'admin.package.create.validity.label',
                            })}
                          </InputLabel>
                          <Select
                            value={values.packageValidity}
                            onChange={(event) => {
                              setFieldValue(
                                'packageValidity',
                                event.target.value,
                              );
                            }}
                             label={formatMessage({
                              id: 'admin.package.create.validity.label',
                            })}
                            // disabled={
                            //   !!packageSettings[values.packageCategory]
                            //     ?.packageValidity
                            // }
                          >
                             <MenuItem value='Life Time'>
                              {formatMessage({
                                id: 'admin.package.create.validity.lifeTime',
                              })}
                            </MenuItem>
                            <MenuItem value='1 Year'>
                              {formatMessage({
                                id: 'admin.package.create.validity.oneYear',
                              })}
                            </MenuItem>
                            <MenuItem value='fixed'>
                              {formatMessage({
                                id: 'admin.package.create.validity.fixed',
                              })}
                            </MenuItem>
                          </Select>
                          {!values.packageValidity && (
                            <FormHelperText>
                              {formatMessage({
                                id: 'admin.package.create.validity.required',
                              })}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid size={6} sx={{mt: 4}}>
                        {values.packageValidity === 'fixed' && (
                          <DatePicker
                            disablePast
                            sx={{width: '100%'}}
                            variant='outlined'
                             label={formatMessage({
                              id: 'admin.package.create.validity.until',
                            })}
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
                                    ? formatMessage({
                                        id: 'admin.package.create.validity.dateRequired',
                                      })
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
                         {formatMessage({
                          id: 'admin.package.create.maxQty.label',
                        })}
                      </Grid>
                      <Grid size={3} sx={{mt: 4}}>
                        <FormControl
                          fullWidth
                          margin='dense'
                          error={!values.maxQtyType}
                        >
                           <InputLabel>
                            {formatMessage({
                              id: 'admin.package.create.maxQty.type',
                            })}
                          </InputLabel>
                          <Select
                            value={values.maxQtyType}
                            onChange={(event) => {
                              setFieldValue('maxQtyType', event.target.value);
                            }}
                            label='Maximum Quantity Type'
                          >
                            <MenuItem value='unlimited'>
                              {formatMessage({
                                id: 'admin.package.create.maxQty.unlimited',
                              })}
                            </MenuItem>
                            <MenuItem value='limited'>
                              {formatMessage({
                                id: 'admin.package.create.maxQty.limited',
                              })}
                            </MenuItem>
                          </Select>
                          {!values.maxQtyType && (
                             <FormHelperText>
                              {formatMessage({
                                id: 'admin.package.create.maxQty.required',
                              })}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={3} sx={{mt: 4}}>
                        {values.maxQtyType === 'limited' && (
                          <AppTextField
                            label={formatMessage({
                              id: 'admin.package.create.maxQty.quantity',
                            })}
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
                         {formatMessage({
                            id: 'admin.package.create.display.sectionTitle',
                          })}
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
                              {formatMessage({
                                id: 'admin.package.create.display.always',
                              })}
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
                              {formatMessage({
                                id: 'admin.package.create.display.dateRange',
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                        {values.isAlways === true && (
                          <Grid container spacing={2} size={7}>
                            <Grid size={6}>
                              <DatePicker
                                sx={{width: '100%'}}
                                variant='outlined'
                                label={formatMessage({
                                  id: 'admin.package.create.display.fromDate',
                                })}
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
                                        ? formatMessage({
                                            id: 'admin.package.create.display.fromDateRequired',
                                          })
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
                                label={formatMessage({
                                  id: 'admin.package.create.display.endDate',
                                })}
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
                                        ? formatMessage({
                                            id: 'admin.package.create.display.endDateRequired',
                                          })
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
                    <Typography variant='h4'>
                      {formatMessage({
                        id: 'admin.package.create.section.otherSettings',
                      })}
                    </Typography>
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
                          {formatMessage({
                            id: 'admin.package.create.other.walkInOnly',
                          })}
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
                          {formatMessage({
                            id: 'admin.package.create.publish.nonPublish',
                          })}
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
                          {formatMessage({
                            id: 'admin.package.create.publish.publish',
                          })}
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
                          {formatMessage({
                            id: 'admin.package.create.availability.campaignOnly',
                          })}
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
                           {formatMessage({
                            id: 'admin.package.create.availability.alwaysAvailable',
                          })}
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

export default CreatePackage;

CreatePackage.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branchDatabase: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
