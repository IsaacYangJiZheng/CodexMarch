import React, {useRef, useMemo} from 'react';
import {useDropzone} from 'react-dropzone';
import {Cropper} from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import {
  Box,
  Button,
  Typography,
  Switch,
  Card,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import {Form, ErrorMessage} from 'formik';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import AppGridContainer from '@anran/core/AppGridContainer';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import Preview from './Preview';

import defaultAlertImage from '../../../../assets/alert.png';
import defaultAnnouncementImage from '../../../../assets/alert.png';
import defaultFeedbackImage from '../../../../assets/feedback.png';
import {useIntl} from 'react-intl';

const AddPopupMessageForm = ({
  values,
  errors,
  setFieldValue,
  setPopupImageUrl,
  setPopupImage,
  popupImageUrl,
  infoViewActionsContext,
}) => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;

  const labels = useMemo(
    () => ({
      messageDetail: formatMessage({id: 'popupMessage.form.section.messageDetail'}),
      messageSetting: formatMessage({id: 'popupMessage.form.section.messageSetting'}),

      messageNo: (n) => formatMessage({id: 'popupMessage.form.messageNumber'}, {number: n}),

      countryLabel: formatMessage({id: 'popupMessage.form.countryLabel'}),
      countrySelect: formatMessage({id: 'popupMessage.form.countrySelectLabel'}),
      optionEn: formatMessage({id: 'popupMessage.form.language.en'}),
      optionCh: formatMessage({id: 'popupMessage.form.language.ch'}),

      messageTitle: formatMessage({id: 'popupMessage.form.field.title'}),
      shortDescription: formatMessage({id: 'popupMessage.form.field.shortDescription'}),
      messageDescription: formatMessage({id: 'popupMessage.form.field.message'}),

      remove: formatMessage({id: 'common.remove'}),
      addTranslation: formatMessage({id: 'popupMessage.form.action.addTranslation'}),

      messageType: formatMessage({id: 'popupMessage.form.field.messageType'}),
      typeAlert: formatMessage({id: 'popupMessage.type.alert'}),
      typeAnnouncement: formatMessage({id: 'popupMessage.type.announcement'}),
      typeFeedback: formatMessage({id: 'popupMessage.type.feedback'}),

      deleteImage: formatMessage({id: 'popupMessage.form.action.deleteImage'}),
      upload: formatMessage({id: 'popupMessage.form.action.upload'}),
      uploadHint: formatMessage({id: 'popupMessage.form.upload.hint'}),
      ratioError: formatMessage({id: 'popupMessage.form.upload.ratioError'}),

      mobilePreview: formatMessage({id: 'popupMessage.form.mobilePreview'}),

      displayStart: formatMessage({id: 'popupMessage.form.field.displayStart'}),
      displayUntil: formatMessage({id: 'popupMessage.form.field.displayUntil'}),

      publishToCustomer: formatMessage({id: 'popupMessage.form.field.publishToCustomer'}),
      ariaSwitch: formatMessage({id: 'popupMessage.form.aria.publishSwitch'}),
    }),
    [formatMessage],
  );

  const [aspectRatioValid, setAspectRatioValid] = React.useState(null);
  const [minDate, setMinDate] = React.useState(dayjs().add(1, 'day'));
  const cropperRef = useRef(null);

  const [originalImage, setOriginalImage] = React.useState(
    values.isEdit ? popupImageUrl : null,
  );
  const [originalImageUrl, setOriginalImageUrl] = React.useState(
    values.isEdit ? popupImageUrl : null,
  );

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    accept: {'image/*': ['.png', '.jpeg', '.jpg']},
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const actualRatio = width / height;
        const expectedRatio = 4 / 3;
        const tolerance = 0.01;

        if (Math.abs(actualRatio - expectedRatio) < tolerance) {
          setAspectRatioValid(true);
          setPopupImageUrl(imageUrl);
          setPopupImage(file);
          setOriginalImageUrl(imageUrl);
          setOriginalImage(file);
        } else {
          setAspectRatioValid(false);
          infoViewActionsContext.fetchError(labels.ratioError);
        }
      };
    },
  });




  const onChange = (cropper) => {
    const canvas = cropper?.getCanvas();
    if (canvas) {
      setPopupImageUrl(cropper.getCanvas()?.toDataURL());
      canvas.toBlob((blob) => {
        if (blob) setPopupImage(blob);
      }, 'image/jpeg');
    }
  };

  React.useEffect(() => {
    let newDefaultImage = null;

    if (!values.isEdit || !originalImageUrl || originalImage === null) {
      if (values.messageContentType === 'alert') {
        newDefaultImage = defaultAlertImage;
      } else if (values.messageContentType === 'announcement') {
        newDefaultImage = defaultAnnouncementImage;
      } else if (values.messageContentType === 'feedback') {
        newDefaultImage = defaultFeedbackImage;
      }

      setPopupImageUrl(newDefaultImage);
      setOriginalImageUrl(newDefaultImage);
      setPopupImage(null);
      setOriginalImage(newDefaultImage);
    }

    if (newDefaultImage) {
      const img = new Image();
      img.src = newDefaultImage;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) setPopupImage(blob);
        }, 'image/jpeg');
      };
    }
  }, [values.messageContentType]); // behavior unchanged

  const onRemove = () => {
    setPopupImageUrl(null);
    setPopupImage(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
  };

  return (
    <Form noValidate autoComplete='off'>
      <Box sx={{padding: 1, ml: -6, mr: -6}}>
        <Box
          sx={{
            pb: 1,
            px: 5,
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
              {labels.messageDetail}
            </Box>
          </Box>

          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              {values.messageDetails.map((detail, index) => {
                const usedCountries = values.messageDetails
                  .map((d) => d.country)
                  .filter((c, i) => i !== index);

                return (
                  <Grid container spacing={2} size={12} key={index}>
                    <Grid size={12}>
                      <Typography variant='subtitle2' sx={{mb: 2}}>
                        {labels.messageNo(index + 1)}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <FormControl fullWidth>
                        <InputLabel id={`country-label-${index}`}>
                          {labels.countryLabel}
                        </InputLabel>
                        <Select
                          name={`messageDetails[${index}].country`}
                          labelId={`country-label-${index}`}
                          id={`country-select-${index}`}
                          label={labels.countryLabel}
                          value={values.messageDetails[index].country}
                          onChange={(e) => {
                            setFieldValue(`messageDetails[${index}].country`, e.target.value);
                          }}
                        >
                          <MenuItem
                            disabled={usedCountries.includes('en')}
                            value='en'
                            sx={{padding: 2, cursor: 'pointer', minHeight: 'auto'}}
                          >
                            {labels.optionEn}
                          </MenuItem>
                          <MenuItem
                            disabled={usedCountries.includes('ch')}
                            value='ch'
                            sx={{padding: 2, cursor: 'pointer', minHeight: 'auto'}}
                          >
                            {labels.optionCh}
                          </MenuItem>
                        </Select>
                        <FormHelperText>
                          <ErrorMessage name={`messageDetails[${index}].country`} />
                        </FormHelperText>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <AppTextField
                        label={labels.messageTitle}
                        variant='outlined'
                        fullWidth
                        name={`messageDetails[${index}].messageTitle`}
                        value={values.messageDetails[index].messageTitle}
                        margin='dense'
                        type='text'
                        helperText={<ErrorMessage name={`messageDetails[${index}].messageTitle`} />}
                        onChange={(e) =>
                          setFieldValue(`messageDetails[${index}].messageTitle`, e.target.value)
                        }
                      />
                    </Grid>

                    <Grid size={12}>
                      <AppTextField
                        label={labels.shortDescription}
                        variant='outlined'
                        fullWidth
                        name={`messageDetails[${index}].messageShortDescription`}
                        value={values.messageDetails[index].messageShortDescription}
                        onChange={(e) =>
                          setFieldValue(
                            `messageDetails[${index}].messageShortDescription`,
                            e.target.value,
                          )
                        }
                        margin='dense'
                        type='text'
                        multiline
                        helperText={
                          <ErrorMessage name={`messageDetails[${index}].messageShortDescription`} />
                        }
                      />
                    </Grid>

                    <Grid size={12}>
                      <AppTextField
                        label={labels.messageDescription}
                        variant='outlined'
                        fullWidth
                        name={`messageDetails[${index}].messageContent`}
                        value={values.messageDetails[index].messageContent}
                        onChange={(e) =>
                          setFieldValue(`messageDetails[${index}].messageContent`, e.target.value)
                        }
                        margin='dense'
                        type='text'
                        rows={5}
                        multiline
                        helperText={<ErrorMessage name={`messageDetails[${index}].messageContent`} />}
                      />
                    </Grid>

                    <Grid size={12}>
                      {values.messageDetails.length > 1 && (
                        <Button
                          startIcon={<DeleteIcon />}
                          variant='outlined'
                          color='secondary'
                          onClick={() => {
                            const newList = [...values.messageDetails];
                            newList.splice(index, 1);
                            setFieldValue('messageDetails', newList);
                          }}
                        >
                          {labels.remove}
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                );
              })}

              <Grid size={12}>
                <Button
                  startIcon={<AddIcon />}
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    setFieldValue('messageDetails', [
                      ...values.messageDetails,
                      {messageTitle: '', messageContent: ''},
                    ]);
                  }}
                >
                  {labels.addTranslation}
                </Button>
              </Grid>

              <Grid size={12}>
                <FormControl component='fieldset' error={Boolean(errors.messageContentType)}>
                  <FormLabel component='legend'>{labels.messageType}</FormLabel>
                  <RadioGroup
                    column
                    value={values.messageContentType}
                    onChange={(event) =>
                      setFieldValue('messageContentType', event.target.value)
                    }
                  >
                    <FormControlLabel value='alert' control={<Radio />} label={labels.typeAlert} />
                    <FormControlLabel
                      value='announcement'
                      control={<Radio />}
                      label={labels.typeAnnouncement}
                    />
                    {/* Feedback currently hidden in original code */}
                    {/* <FormControlLabel value='feedback' control={<Radio />} label={labels.typeFeedback} /> */}
                  </RadioGroup>

                  {errors.messageContentType ? (
                    <FormHelperText>
                      {/* If you want localized Yup errors here, Yup already returns localized strings */}
                      {errors.messageContentType}
                    </FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>

              <Grid size={12}>
                <AppGridContainer spacing={4}>
                  <Grid size={6}>
                    <AppGridContainer spacing={4}>
                      <Grid size={12}>
                        {originalImage ? (
                          <Button type='button' onClick={onRemove}>
                            {labels.deleteImage}
                          </Button>
                        ) : (
                          <Box
                            {...getRootProps({className: 'dropzone'})}
                            sx={{
                              border: `2px dashed ${errors.image ? 'red' : '#cccccc'}`,
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: errors.image
                                ? '#ffe6e6'
                                : isDragActive
                                  ? '#eeeeee'
                                  : '#fafafa',
                            }}
                          >
                            <input {...getInputProps()} />
                            <Typography variant='button'>{labels.upload}</Typography>
                            <em>{labels.uploadHint}</em>
                          </Box>
                        )}

                        {aspectRatioValid === false && (
                          <Typography variant='body2' sx={{color: 'error.main', mt: 1}}>
                            {labels.ratioError}
                          </Typography>
                        )}

                        {errors.image && (
                          <Typography variant='body2' sx={{color: 'error.main', mt: 1}}>
                            {errors.image}
                          </Typography>
                        )}
                      </Grid>

                      <Grid size={12}>
                        <Cropper
                          ref={cropperRef}
                          src={originalImageUrl}
                          onChange={(e) => onChange(e)}
                          stencilProps={{
                            aspectRatio: 4 / 3,
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
                        <Grid size={12}>{labels.mobilePreview}</Grid>
                        <Grid size={12}>
                          <Preview
                            image={popupImageUrl}
                            title={values.messageTitle}
                            desc={values.messageContent}
                          />
                        </Grid>
                      </AppGridContainer>
                    </Grid>
                  ) : null}
                </AppGridContainer>
              </Grid>
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
              {labels.messageSetting}
            </Box>
          </Box>

          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid size={6}>
                <DatePicker
                  disablePast
                  label={labels.displayStart}
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
                  label={labels.displayUntil}
                  value={values.endDate}
                  onChange={(newValue) => setFieldValue('endDate', newValue)}
                />
              </Grid>

              <Grid size={12}>
                <Grid container spacing={2} alignItems='center'>
                  <Grid size={3}>
                    <Typography>{labels.publishToCustomer}</Typography>
                  </Grid>
                  <Grid size={9}>
                    <Switch
                      checked={values.publish}
                      onChange={(event) => setFieldValue('publish', event.target.checked)}
                      inputProps={{'aria-label': labels.ariaSwitch}}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </AppGridContainer>
          </Card>
        </Box>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Button
          sx={{position: 'relative', minWidth: 100}}
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

export default AddPopupMessageForm;

AddPopupMessageForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  selectedChildren: PropTypes.array,
  popupImageUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setPopupImage: PropTypes.func,
  setPopupImageUrl: PropTypes.func,
  infoViewActionsContext: PropTypes.object,
};
