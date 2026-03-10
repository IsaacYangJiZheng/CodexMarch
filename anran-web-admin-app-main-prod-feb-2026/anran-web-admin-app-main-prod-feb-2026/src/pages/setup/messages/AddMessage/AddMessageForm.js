import React, {useRef} from 'react';
import {useDropzone} from 'react-dropzone';
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  FormLabel,
  Checkbox,
  Switch,
  Card,
  Radio,
  RadioGroup,
  FormControl,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';

import {Form, ErrorMessage} from 'formik';

import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import {Cropper} from 'react-advanced-cropper';
import {
  getTransformedImageSize,
  retrieveSizeRestrictions,
} from 'advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

import Preview from './Preview';
import TextMsgPreview from './TextMsgPreview';

import {ColorPicker} from 'primereact/colorpicker';
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

  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [minDate, setMinDate] = React.useState(dayjs().add(1, 'day'));
  const cropperRef = useRef(null);
  // const [originalImage, setOriginalImage] = React.useState(null);
  // const [originalImageUrl, setOriginalImageUrl] = React.useState(null);
  const [originalImage, setOriginalImage] = React.useState(
    values.isEdit ? bannerImageUrl : null,
  );
  const [originalImageUrl, setOriginalImageUrl] = React.useState(
    values.isEdit ? bannerImageUrl : null,
  );
  // const [color, setColor] = React.useState(null);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: {'image/*': ['.png', '.jpeg', '.jpg']},
    multiple: false,
    onDrop: (acceptedFiles) => {
      setBannerImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setBannerImage(acceptedFiles[0]);
      setOriginalImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setOriginalImage(acceptedFiles[0]);
    },
  });
  const dropzone = useDropzone({
    accept: {
      'image/png': ['.png', '.jpeg', '.jpg'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      console.log('acceptedFiles', acceptedFiles);
      setUploadedFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  React.useEffect(() => {
    setUploadedFiles(dropzone.acceptedFiles);
  }, [dropzone.acceptedFiles]);

  // const onDeleteUploadFile = (file) => {
  //   dropzone.acceptedFiles.splice(dropzone.acceptedFiles.indexOf(file), 1);
  //   setUploadedFiles([...dropzone.acceptedFiles]);
  // };

  const onChange = (cropper) => {
    console.log(cropper.getCoordinates(), cropper.getCanvas());
    const canvas = cropper?.getCanvas();
    if (canvas) {
      setBannerImageUrl(cropper.getCanvas()?.toDataURL());
      canvas.toBlob((blob) => {
        if (blob) {
          setBannerImage(blob);
        }
      }, 'image/jpeg');
    }
  };

  const percentsRestriction = (state, settings) => {
    const {minWidth, minHeight, maxWidth, maxHeight} =
      retrieveSizeRestrictions(settings);

    const imageSize = getTransformedImageSize(state);

    return {
      minWidth: (minWidth / 100) * imageSize.width,
      minHeight: (minHeight / 100) * imageSize.height,
      maxWidth: (maxWidth / 100) * imageSize.width,
      maxHeight: (maxHeight / 100) * imageSize.height,
    };
  };

  const onRemove = () => {
    setBannerImageUrl(null);
    setBannerImage(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
  };

  console.log('uploadedFiles', uploadedFiles);
  // console.log('TextMessagePreview', color);

  return (
    <Form noValidate autoComplete='off'>
      <Box
        sx={{
          padding: 1,
          ml: -6,
          mr: -6,
        }}
      >
        <Box
          sx={{
            pb: 1,
            px: 5,
            // mx: -5,
            mb: 1,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              component='h6'
              sx={{
                mb: {xs: 2, xl: 4},
                mt: 0,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              {formatMessage({id: 'admin.message.form.detail'})}
            </Box>
          </Box>
          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid size={6}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({id: 'admin.message.form.title'})}
                      variant='outlined'
                      fullWidth
                      name='msgName'
                      margin='dense'
                      type='text'
                      helperText={<ErrorMessage name='msgName' />}
                    />
                  </Grid>
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({id: 'admin.message.form.code'})}
                      variant='outlined'
                      fullWidth
                      name='msgCode'
                      margin='dense'
                      type='text'
                      helperText={<ErrorMessage name='msgCode' />}
                    />
                  </Grid>
                  <Grid size={12}>
                    <FormControl
                      component='fieldset'
                      error={errors.messageType}
                    >
                      <FormLabel component='legend'>
                        {formatMessage({id: 'admin.message.form.type'})}
                      </FormLabel>
                      <RadioGroup
                        row // Display radio buttons horizontally
                        label={<IntlMessages id='member.PaymentMethod' />}
                        value={values.messageType}
                        onChange={(event) =>
                          setFieldValue('messageType', event.target.value)
                        }
                      >
                        <FormControlLabel
                          value='image'
                          control={<Radio />}
                          label={formatMessage({id: 'admin.message.type.image'})}
                        />
                        <FormControlLabel
                          value='text'
                          control={<Radio />}
                          label={formatMessage({id: 'admin.message.type.text'})}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={6}>
                <AppTextField
                  label={formatMessage({id: 'admin.message.form.description'})}
                  variant='outlined'
                  fullWidth
                  name='msg'
                  margin='dense'
                  type='text'
                  rows={5}
                  multiline
                />
              </Grid>

              {values.messageType == 'image' ? (
                <Grid size={12}>
                  <AppGridContainer spacing={4}>
                    <Grid size={6}>
                      <AppGridContainer spacing={4}>
                        <Grid size={12}>
                          {originalImage ? (
                            <Button type='button' onClick={onRemove}>
                              {formatMessage({
                                id: 'admin.message.form.deleteImage',
                              })}
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
                                backgroundColor: isDragActive
                                  ? '#eeeeee'
                                  : '#fafafa',
                              }}
                            >
                              <input {...getInputProps()} />
                              <Typography variant='button'>
                                {formatMessage({
                                  id: 'admin.message.form.upload',
                                })}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        <Grid size={12}>
                          <Cropper
                            ref={cropperRef}
                            src={originalImageUrl}
                            onChange={(e) => onChange(e)}
                            sizeRestrictions={percentsRestriction}
                            // defaultSize={{
                            //   width: 350,
                            //   height: 150,
                            // }}
                            stencilProps={{
                              aspectRatio: 16 / 9,
                              movable: true,
                              resizable: true,
                            }}
                          />
                        </Grid>
                      </AppGridContainer>
                    </Grid>
                    <Grid size={1}>
                      <Divider orientation='vertical' />
                    </Grid>
                    {originalImage ? (
                      <Grid size={5}>
                        <AppGridContainer spacing={4}>
                          <Grid size={12}>
                            {formatMessage({id: 'admin.message.form.preview'})}
                          </Grid>
                          <Grid size={12}>
                            <Preview
                              image={bannerImageUrl}
                              title={values.msgName}
                              desc={values.msg}
                            />
                          </Grid>
                        </AppGridContainer>
                      </Grid>
                    ) : null}
                  </AppGridContainer>
                </Grid>
              ) : (
                <Grid tsize={12}>
                  <AppGridContainer spacing={4}>
                    <Grid size={6}>
                      <AppGridContainer spacing={4}>
                        <Grid size={12}>
                          {formatMessage({
                            id: 'admin.message.form.backgroundColor',
                          })}
                        </Grid>
                        <Grid size={12}>
                          <ColorPicker
                            value={values.msgBgColor}
                            onChange={(e) => {
                              // setColor(e.value);
                              setFieldValue('msgBgColor', e.value);
                            }}
                            inline
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
                          {formatMessage({id: 'admin.message.form.preview'})}
                        </Grid>
                        <Grid size={12}>
                          <TextMsgPreview
                            title={values.msgName}
                            desc={values.msg}
                            color={values.msgBgColor}
                          />
                        </Grid>
                      </AppGridContainer>
                    </Grid>
                  </AppGridContainer>
                </Grid>
              )}
            </AppGridContainer>
          </Card>

          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              component='h6'
              sx={{
                mb: {xs: 4, xl: 6},
                mt: 4,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              {formatMessage({id: 'admin.message.form.settings'})}
            </Box>
          </Box>
          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid size={12}>
                <FormControlLabel
                  sx={{mb: {xs: 4, xl: 6}, ml: 0, mt: -3}}
                  control={
                    <Checkbox
                      checked={values.always}
                      onChange={(event) =>
                        setFieldValue('always', event.target.checked)
                      }
                    />
                  }
                  label={formatMessage({
                    id: 'admin.message.form.alwaysLabel',
                  })}
                />
              </Grid>
              {!values.always && (
                <>
                  <Grid size={6}>
                    <DatePicker
                      disablePast
                      label={formatMessage({
                        id: 'admin.message.form.displayStart',
                      })}
                      value={values.startDate}
                      onChange={(newValue) => {
                        setFieldValue('startDate', newValue);
                        setFieldValue('endDate', dayjs(newValue).add(1, 'day'));
                        setMinDate(dayjs(newValue).add(1, 'day'));
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <DatePicker
                      disablePast
                      minDate={minDate}
                      label={formatMessage({
                        id: 'admin.message.form.displayUntil',
                      })}
                      value={values.endDate}
                      onChange={(newValue) =>
                        setFieldValue('endDate', newValue)
                      }
                    />
                  </Grid>
                </>
              )}
              <Grid size={12}>
                <Grid container spacing={2} alignItems='center'>
                  <Grid size={3}>
                    <Typography>
                      {formatMessage({id: 'admin.message.form.publish'})}
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