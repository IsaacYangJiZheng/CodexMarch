import React, {useRef} from 'react';
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Switch,
  Card,
} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import IntlMessages from '@anran/utility/IntlMessages';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {useDropzone} from 'react-dropzone';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
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

  // const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [minDate, setMinDate] = React.useState(dayjs().add(1, 'day'));
  const cropperRef = useRef(null);
  const [originalImage, setOriginalImage] = React.useState(null);
  const [originalImageUrl, setOriginalImageUrl] = React.useState(null);
  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    accept: {'image/*': ['.png', '.jpeg', '.jpg']},
    multiple: false,
    onDrop: (acceptedFiles) => {
      console.log('acceptedFiles', acceptedFiles[0]);
      const i = new Image();
      i.addEventListener('load', () => {
        console.log(`${i.width}x${i.height}`);
        let aw = i.width / 256;
        let ah = i.height / 256;
        let ratio = aw / ah;
        console.log(`${aw}x${ah}x${ratio}`);
      });
      i.src = URL.createObjectURL(acceptedFiles[0]);
      // console.log(`${acceptedFiles[0].width}x${acceptedFiles[0].height}`);
      setBannerImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setBannerImage(acceptedFiles[0]);
      setOriginalImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setOriginalImage(acceptedFiles[0]);
    },
  });
  // const dropzone = useDropzone({
  //   accept: {
  //     'image/png': ['.png', '.jpeg', '.jpg'],
  //   },
  //   multiple: false,
  //   onDrop: (acceptedFiles) => {
  //     console.log('acceptedFiles', acceptedFiles);
  //     setUploadedFiles(
  //       acceptedFiles.map((file) =>
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         }),
  //       ),
  //     );
  //   },
  // });

  // React.useEffect(() => {
  //   setUploadedFiles(dropzone.acceptedFiles);
  // }, [dropzone.acceptedFiles]);

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

  const onRemove = () => {
    setBannerImageUrl(null);
    setBannerImage(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
  };

  // console.log('uploadedFiles', uploadedFiles);

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
              <Grid size={6}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    {originalImage ? (
                      <Button type='button' onClick={onRemove}>
                        {formatMessage({id: 'admin.banner.form.delete'})}
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
                        <Button type='button' onClick={open}>
                          {formatMessage({id: 'admin.banner.form.upload'})}
                        </Button>
                      </Box>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Box sx={{aspectRatio: '3 / 4'}}>
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
                    </Box>
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={1}>
                <Divider orientation='vertical' />
              </Grid>
              <Grid size={5}>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    {formatMessage({id: 'admin.banner.form.preview'})}
                  </Grid>
                  <Grid size={12}>
                    {bannerImageUrl ? (
                      <img
                        src={bannerImageUrl}
                        alt='Preview'
                        style={{maxWidth: '100%', maxHeight: '100%'}}
                      />
                    ) : null}
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
                mt: 4,
                fontSize: 14,
                fontWeight: Fonts.SEMI_BOLD,
              }}
            >
              {formatMessage({id: 'admin.banner.form.settingsSection'})}
            </Box>
          </Box>
          <Card variant='outlined'>
            <AppGridContainer spacing={4} sx={{p: 4}}>
              <Grid item xs={12}>
                <AppGridContainer spacing={4}>
                  <Grid size={{xs: 12, md: 12}}>
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
                      <Grid size={{xs: 6, md: 6}}>
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
                      <Grid size={{xs: 6, md: 6}}>
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
                  <Grid size={{xs: 12, md: 12}}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={3}>
                        <Typography>
                          {formatMessage({id: 'admin.banner.form.publish'})}
                        </Typography>
                      </Grid>
                      <Grid item xs={9}>
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
              <Grid size={12}></Grid>
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