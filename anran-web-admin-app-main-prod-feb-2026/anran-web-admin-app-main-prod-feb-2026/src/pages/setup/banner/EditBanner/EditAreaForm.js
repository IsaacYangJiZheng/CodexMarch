import React, {useRef} from 'react';
import {useDropzone} from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Switch,
  Card,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import AppGridContainer from '@anran/core/AppGridContainer';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';

import {Form} from 'formik';

import {Cropper} from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import {useIntl} from 'react-intl';

const AddAreaForm = ({
  values,
  errors,
  setFieldValue,
  setBannerImageUrl,
  setBannerImage,
  bannerImageUrl,
}) => {
  const {formatMessage} = useIntl();
  console.log('values', values, errors);
  const [minDate, setMinDate] = React.useState(dayjs().add(1, 'day'));
  const cropperRef = useRef(null);
  const [originalImage, setOriginalImage] = React.useState(bannerImageUrl);
  const [originalImageUrl, setOriginalImageUrl] =
    React.useState(bannerImageUrl);

  const handleImageUpload = async (acceptedFiles) => {
    // Creating image URL from the accepted file (works synchronously)
    const newImageUrl = URL.createObjectURL(acceptedFiles[0]);

    // Update state immediately
    setBannerImageUrl(newImageUrl);
    setBannerImage(acceptedFiles[0]);
    setOriginalImageUrl(newImageUrl);
    setOriginalImage(acceptedFiles[0]);
  };

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      handleImageUpload(acceptedFiles);
    },
  });

  const onChange = (cropper) => {
    console.log(cropper.getCoordinates(), cropper.getCanvas());
    const canvas = cropper?.getCanvas();
    if (canvas) {
      const newBannerImageUrl = cropper.getCanvas()?.toDataURL();
      setBannerImageUrl(newBannerImageUrl);
      canvas.toBlob((blob) => {
        if (blob) {
          setBannerImage(blob);
        }
      }, 'image/jpeg');
    }
  };

  const onRemove = () => {
    setBannerImageUrl(null);
    setBannerImage(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
  };

  console.log('Original Image:', originalImage);
  console.log('Original Image URL:', originalImageUrl);

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
              {formatMessage({id: 'admin.banner.form.imageSection'})}
            </Box>
          </Box>
          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid size={5}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    {originalImage ? (
                      <Button type='button' onClick={onRemove}>
                         {formatMessage({id: 'admin.banner.form.changeImage'})}
                      </Button>
                    ) : (
                      <Box
                        {...getRootProps({className: 'dropzone'})}
                        sx={{
                          border: '2px dashed #cccccc',
                          borderRadius: '4px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: isDragActive ? '#eeeeee' : '#fafafa',
                        }}
                      >
                        <input {...getInputProps()} />
                        <Typography variant='button'>
                          {formatMessage({id: 'admin.banner.form.upload'})}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Cropper
                      ref={cropperRef}
                      src={originalImageUrl}
                      onChange={(e) => onChange(e)}
                      // stencilSize={{
                      //   width: 600,
                      //   height: 600,
                      // }}
                      stencilProps={{
                        aspectRatio: 3 / 4,
                        // aspectRatio: {
                        //   minimum: 16 / 8,
                        //   maximum: 4 / 8,
                        // },
                        // handlers: false,
                        // lines: false,
                        movable: true,
                        resizable: true,
                      }}
                      // imageRestriction={ImageRestriction.stencil}
                    />
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={1}>
                <Divider orientation='vertical' />
              </Grid>
              <Grid size={5}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <Button type='button'>
                      {formatMessage({id: 'admin.banner.form.preview'})}
                    </Button>
                  </Grid>
                  <Grid size={12}>
                    <img
                      src={bannerImageUrl}
                      alt='Preview'
                      style={{
                        maxWidth: '100%',
                        Height: '600',
                        minWidth: '320px',
                      }}
                    />
                  </Grid>
                </AppGridContainer>
              </Grid>
            </AppGridContainer>
          </Card>
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
              {formatMessage({id: 'admin.banner.form.settingsSection'})}
            </Box>
          </Box>
          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid size={12}></Grid>
              <Grid size={12}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <FormControlLabel
                      sx={{mb: {xs: 4, xl: 6}, ml: 0, mt: -3}}
                      disabled={values.isFranchise ? true : false}
                      control={
                        <Checkbox
                          checked={values.always}
                          onChange={(event) =>
                            setFieldValue('always', event.target.checked)
                          }
                        />
                      }
                      label={formatMessage({
                        id: 'admin.banner.form.alwaysLabel',
                      })}
                    />
                  </Grid>
                  {!values.always && (
                    <>
                      <Grid size={6}>
                        <DatePicker
                          disablePast
                          label={formatMessage({
                            id: 'admin.banner.form.displayStart',
                          })}
                          value={values.startdate}
                          onChange={(newValue) => {
                            setFieldValue('startdate', newValue);
                            setFieldValue(
                              'enddate',
                              dayjs(newValue).add(1, 'day'),
                            );
                            setMinDate(dayjs(newValue).add(1, 'day'));
                          }}
                        />
                        {/* <TextField
                    InputLabelProps={{shrink: true}}
                    onChange={(e) => setDialogDisplaystartdate(e.target.value)}
                    margin='dense'
                    label='Display From'
                    type='date'
                    fullWidth
                    variant='outlined'
                    value={dialogDisplaystartdate}
                  /> */}
                      </Grid>
                      <Grid size={6}>
                        <DatePicker
                          disablePast
                          minDate={minDate}
                          label={formatMessage({
                            id: 'admin.banner.form.displayUntil',
                          })}
                          value={values.enddate}
                          onChange={(newValue) =>
                            setFieldValue('enddate', newValue)
                          }
                        />
                        {/* <TextField
                    InputLabelProps={{shrink: true}}
                    onChange={(e) => setDialogDisplayenddate(e.target.value)}
                    margin='dense'
                    label='Display Until'
                    type='date'
                    fullWidth
                    variant='outlined'
                    value={dialogDisplayenddate}
                  /> */}
                      </Grid>
                    </>
                  )}
                  <Grid item size={12}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid size={3}>
                        <Typography>
                          {formatMessage({id: 'admin.banner.form.publish'})}
                        </Typography>
                      </Grid>
                      <Grid size={9}>
                        <Switch
                          checked={values.publish}
                          onChange={(event) =>
                            setFieldValue('publish', event.target.checked)
                          }
                          inputProps={{'aria-label': 'controlled'}}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </AppGridContainer>
              </Grid>
            </AppGridContainer>
          </Card>
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
  bannerImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  bannerImageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBannerImage: PropTypes.func,
  setBannerImageUrl: PropTypes.func,
};
