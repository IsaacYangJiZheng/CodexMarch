import React from 'react';
import {alpha, Box, Button, FormHelperText, Typography} from '@mui/material';
// import Avatar from '@mui/material/Avatar';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import IntlMessages from '@anran/utility/IntlMessages';
import {useDropzone} from 'react-dropzone';
import {Field, Form} from 'formik';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
// import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import {styled} from '@mui/material/styles';
import {Fonts} from 'shared/constants/AppEnums';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import NoImageFound from '@anran/assets/images/empty.png';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
// import PreviewThumb from '../../../../../widgets/PreviewThumb';
import QRImageViewer from '../../../../../widgets/QRImageViewer';
import ImageViewer from '../../../../../widgets/ImageViewer';
import {TimePicker} from '@mui/x-date-pickers/TimePicker';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {QRCodeSVG} from 'qrcode.react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import countries from '@anran/services/db/countries/appCountries';
import {MuiTelInput} from 'mui-tel-input';

const AvatarViewWrapper = styled('div')(({theme}) => {
  return {
    position: 'relative',
    cursor: 'pointer',
    '& .edit-icon': {
      position: 'absolute',
      bottom: 0,
      right: 0,
      zIndex: 1,
      border: `solid 2px ${theme.palette.background.paper}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      width: 26,
      height: 26,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '&.dropzone': {
      outline: 0,
      '&:hover .edit-icon, &:focus .edit-icon': {
        display: 'flex',
      },
    },
  };
});

const QRViewWrapper = styled('div')(({theme}) => {
  return {
    position: 'relative',
    width: '128px',
    cursor: 'pointer',
    '& .edit-icon': {
      position: 'absolute',
      bottom: 0,
      right: 0,
      zIndex: 1,
      border: `solid 2px ${theme.palette.background.paper}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      width: 26,
      height: 26,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '&.qrzone': {
      outline: 0,
      '&:hover .edit-icon, &:focus .edit-icon': {
        display: 'flex',
      },
    },
  };
});

const BranchInfoForm = ({
  values,
  errors,
  setFieldValue,
  isViewOnly,
  setBranchImageUrl,
  setBranchImage,
  branchImage,
  onViewOnly,
  hqStatusError,
  rawData,
  // areaList,
}) => {
  const [{apiData: areaList}] = useGetDataApi('api/area', {}, {}, true);
  const [selectedArea, setSelectedArea] = React.useState(values.area);
  const [showQR, setShowQR] = React.useState(false);
  const [showImage, setShowImage] = React.useState(false);
  const [stateList, setStateList] = React.useState([]);
  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setBranchImageUrl(URL.createObjectURL(acceptedFiles[0]));
      setBranchImage(acceptedFiles[0]);
    },
  });

  React.useEffect(() => {
    setStateList(countries[0].regions);
  }, []);

  console.log('errors', errors);

  const onCancelClick = () => {
    onViewOnly(true);
  };
  const onQrImageClick = () => {
    setShowQR(true);
  };

  const onImageClick = () => {
    setShowImage(true);
  };

  const handleAreaChange = (event) => {
    setSelectedArea(event.target.value);
    setFieldValue('area', event.target.value);
  };

  const handleHQStatusChange = (event) => {
    setFieldValue('hqStatus', event.target.checked);
  };

  const handleFranchiseStatusChange = (event) => {
    setFieldValue('isFranchise', event.target.checked);
  };

  const handleStatusChange = (event) => {
    setFieldValue('branchStatus', event.target.checked);
  };

  console.log('Personal', values, branchImage);
  console.log('areaList', areaList);

  return (
    <>
      <Form noValidate autoComplete='off'>
        <Card variant='outlined' sx={{mt: 2}}>
          <CardHeader
            sx={{p: 0, mt: 2, ml: 2}}
            title={
              <Box
                component='h6'
                sx={{
                  fontSize: 14,
                  fontWeight: Fonts.SEMI_BOLD,
                  mt: 0,
                  mb: 1,
                }}
              >
                <IntlMessages id='anran.branch.details' />
              </Box>
            }
          ></CardHeader>
          <CardContent>
            <AppGridContainer spacing={4}>
              <Grid size={{xs: 12, md: 9}}>
                <AppGridContainer spacing={4}>
                  <Grid size={3}>
                    {areaList.length > 0 && (
                      <FormControl sx={{width: '100%'}}>
                        <InputLabel htmlFor='grouped-native-select'>
                          Branch Area
                        </InputLabel>
                        <Select
                          native
                          defaultValue=''
                          value={selectedArea}
                          disabled={isViewOnly}
                          id='grouped-native-select'
                          label='Branch Area'
                          onChange={handleAreaChange}
                        >
                          <option aria-label='None' value='' />
                          {areaList?.map((item) => {
                            return (
                              <option key={item.areaName} value={item._id}>
                                {item.areaName}
                              </option>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid size={{xs: 12, md: 2}}>
                    <AppTextField
                      name='branchCode'
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.branchCode' />}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 4}}>
                    <AppTextField
                      fullWidth
                      disabled={isViewOnly}
                      name='branchName'
                      label={<IntlMessages id='anran.branchName' />}
                    />
                  </Grid>
                  <Grid size={3}>
                    <AppTextField
                      fullWidth
                      name='branchMobilePrefix'
                      label='Dummy Mobile Prefix'
                      disabled={isViewOnly}
                      InputProps={{
                        maxLength: 2,
                        inputProps: {min: 0},
                        type: 'number',
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
                      onInput={(e) => {
                        if (e.target.value.length > 2) {
                          e.target.value = e.target.value.slice(0, 2);
                        }
                      }}
                      onWheel={(event) => event.currentTarget.blur()}
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 12}}>
                    <AppTextField
                      fullWidth
                      disabled={isViewOnly}
                      label={<IntlMessages id='anran.branchAddress' />}
                      name='branchAddress'
                    />
                  </Grid>
                  <Grid size={6}>
                    <FormControl
                      variant='outlined'
                      sx={{
                        width: '100%',
                      }}
                      disabled={isViewOnly}
                      error={errors.branchState ? true : false}
                    >
                      <InputLabel id='label-select-outlined-state'>
                        <IntlMessages id='common.selectState' />
                      </InputLabel>
                      <Field
                        name='branchState'
                        label={<IntlMessages id='common.selectState' />}
                        labelId='label-select-outlined-state'
                        as={Select}
                        sx={{
                          width: '100%',
                        }}
                      >
                        {stateList.map((state) => {
                          return (
                            <MenuItem
                              value={state.name}
                              key={state.shortCode}
                              sx={{
                                cursor: 'pointer',
                              }}
                            >
                              {state.name}
                            </MenuItem>
                          );
                        })}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <AppTextField
                      fullWidth
                      name='branchCity'
                      label={<IntlMessages id='anran.city' />}
                      disabled={isViewOnly}
                    />
                  </Grid>
                  <Grid size={6}>
                    <AppTextField
                      fullWidth
                      name='branchPostcode'
                      label={<IntlMessages id='anran.postcode' />}
                      disabled={isViewOnly}
                    />
                  </Grid>
                  <Grid size={6}>
                    <MuiTelInput
                      disabled={isViewOnly}
                      fullWidth
                      error={errors?.branchContactNumber}
                      helperText={
                        errors?.branchContactNumber ? 'Number is invalid' : ''
                      }
                      label={'Contact Mobile Number'}
                      forceCallingCode
                      defaultCountry='MY'
                      onlyCountries={['MY']}
                      disableFormatting
                      value={values.branchContactNumber}
                      onChange={(newValue) => {
                        setFieldValue('branchContactNumber', newValue);
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <AppTextField
                      fullWidth
                      disabled={isViewOnly}
                      name='customerCode'
                      label='Customer Code'
                    />
                  </Grid>
                  <Grid size={6}>
                    <AppTextField
                      fullWidth
                      disabled={isViewOnly}
                      name='accountCode'
                      label='G/L Account Code'
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 6}}>
                    <AppTextField
                      sx={{
                        width: '100%',
                        mb: {xs: 4, xl: 6},
                      }}
                      variant='outlined'
                      disabled={isViewOnly}
                      label={<IntlMessages id='common.googleLink' />}
                      name='googleLink'
                    />
                  </Grid>
                  <Grid size={{xs: 12, md: 6}}>
                    <AppTextField
                      sx={{
                        width: '100%',
                        mb: {xs: 4, xl: 6},
                      }}
                      variant='outlined'
                      disabled={isViewOnly}
                      label={<IntlMessages id='common.wazeLink' />}
                      name='wazeLink'
                    />
                  </Grid>
                  <Grid container size={{xs: 12, md: 12}}>
                    <Grid size={{xs: 12, md: 4}}>
                      <FormControlLabel
                        disabled={
                          isViewOnly ? true : values.isFranchise ? true : false
                        }
                        control={
                          <Checkbox
                            checked={values.hqStatus}
                            onChange={handleHQStatusChange}
                          />
                        }
                        label='Is this HQ branch ?'
                      />
                      {rawData.hqStatus !== true &&
                        hqStatusError &&
                        values.hqStatus && (
                          <FormHelperText>
                            <Typography color='error' variant='caption'>
                              There&apos;s already an HQ
                            </Typography>
                          </FormHelperText>
                        )}
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                      <FormControlLabel
                        disabled={
                          isViewOnly ? true : values.hqStatus ? true : false
                        }
                        control={
                          <Checkbox
                            checked={values.isFranchise}
                            onChange={handleFranchiseStatusChange}
                          />
                        }
                        label='Is Franchise branch?'
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                      <FormControlLabel
                        disabled={isViewOnly ? true : false}
                        control={
                          <Checkbox
                            checked={values.branchStatus}
                            onChange={handleStatusChange}
                          />
                        }
                        label='Is in Operation ?'
                      />
                    </Grid>
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: {xs: 5, lg: 6},
                  }}
                >
                  {isViewOnly ? (
                    <CardMedia
                      component='img'
                      height='194'
                      // image={NoImageFound}
                      image={branchImage ? branchImage : NoImageFound}
                      alt='Paella dish'
                      onClick={onImageClick}
                    />
                  ) : (
                    // <PreviewThumb
                    //   file={NoImageFound}
                    //   // onChangeUploadFile={onChangeUploadFile}
                    // />
                    // <CardMedia
                    //   component='img'
                    //   height='194'
                    //   image={branchImage ? branchImage : {NoImageFound}}
                    //   alt='Paella dish'
                    // />
                    <AvatarViewWrapper
                      {...getRootProps({className: 'dropzone'})}
                    >
                      <input {...getInputProps()} />
                      <label htmlFor='icon-button-file'>
                        <CardMedia
                          component='img'
                          height='194'
                          image={branchImage ? branchImage : NoImageFound}
                          alt='Paella dish'
                        />
                        {/* <PreviewThumb
                          src={NoImageFound}
                          // onChangeUploadFile={onChangeUploadFile}
                        /> */}
                        {/* <Avatar
                          sx={{
                            width: {xs: 50, lg: 64},
                            height: {xs: 50, lg: 64},
                            cursor: 'pointer',
                          }}
                          src={branchImage ? branchImage : ''}
                        /> */}
                        <Box className='edit-icon'>
                          <EditIcon />
                        </Box>
                      </label>
                    </AvatarViewWrapper>
                  )}
                </Box>
              </Grid>
            </AppGridContainer>

            <AppGridContainer spacing={5}></AppGridContainer>
          </CardContent>
        </Card>
        <Card variant='outlined' sx={{mt: 2}}>
          <CardHeader
            sx={{p: 0, mt: 2, ml: 2}}
            title={
              <Box
                component='h6'
                sx={{
                  fontSize: 14,
                  fontWeight: Fonts.SEMI_BOLD,
                  mt: 0,
                  mb: 1,
                }}
              >
                <IntlMessages id='anran.branch.OperationHours' />
              </Box>
            }
          ></CardHeader>
          <CardContent>
            <AppGridContainer spacing={5}>
              <Grid size={{xs: 12, md: 3}}>
                <AppGridContainer spacing={10}>
                  <Grid size={12}>
                    <TimePicker
                      disabled={isViewOnly}
                      value={values.operatingStart}
                      label={<IntlMessages id='anran.branch.openTime' />}
                      name='operatingStart'
                      onChange={(newValue) =>
                        setFieldValue('operatingStart', newValue)
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <TimePicker
                      disabled={isViewOnly}
                      value={values.operatingEnd}
                      label={<IntlMessages id='anran.branch.closeTime' />}
                      name='operatingEnd'
                      onChange={(newValue) =>
                        setFieldValue('operatingEnd', newValue)
                      }
                    />
                  </Grid>
                </AppGridContainer>
              </Grid>
              <Grid size={{xs: 12, md: 4}}>
                <QRViewWrapper className={'qrzone'}>
                  <label htmlFor='icon-button-file'>
                    <QRCodeSVG
                      value='https://reactjs.org/'
                      imageSettings={{
                        src: `/assets/anran_logo.png`,
                        height: 75,
                        width: 75,
                        excavate: false,
                      }}
                    />
                    <Box className='edit-icon' onClick={() => onQrImageClick()}>
                      <ViewIcon />
                    </Box>
                  </label>
                </QRViewWrapper>
              </Grid>
              <Grid size={{xs: 12, md: 3}}></Grid>
            </AppGridContainer>
          </CardContent>
        </Card>

        <AppGridContainer spacing={4} sx={{mt: 4}}>
          {isViewOnly ? null : (
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
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
                  disabled={
                    rawData.hqStatus === false &&
                    hqStatusError &&
                    values.hqStatus !== rawData.hqStatus
                  }
                >
                  <IntlMessages id='common.saveChanges' />
                </Button>
                <Button
                  sx={{
                    position: 'relative',
                    minWidth: 100,
                    ml: 2.5,
                  }}
                  color='primary'
                  variant='outlined'
                  type='button'
                  onClick={onCancelClick}
                >
                  <IntlMessages id='common.cancel' />
                </Button>
              </Box>
            </Grid>
          )}
        </AppGridContainer>
      </Form>
      <QRImageViewer
        isOpen={showQR}
        data={values?.id}
        onClose={() => setShowQR(false)}
      />
      <ImageViewer
        isOpen={showImage}
        data={{docName: 'image', document: branchImage}}
        onClose={() => setShowImage(false)}
      />
      {/* <Modal open={openImage} onClose={() => setOpenImage(false)}>
        <Box sx={ImageModalStyle}>
          <Fade in={openImage} timeout={500}>
            <img src={childImage} alt='asd' style={{maxHeight: '90%'}} />
          </Fade>
        </Box>
      </Modal> */}
    </>
  );
};

export default BranchInfoForm;
BranchInfoForm.propTypes = {
  setFieldValue: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
  isViewOnly: PropTypes.bool,
  branchImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setBranchImage: PropTypes.func,
  setBranchImageUrl: PropTypes.func,
  onViewOnly: PropTypes.func,
  reCallAPI: PropTypes.func,
  branch: PropTypes.object,
  hqStatusError: PropTypes.bool,
  rawData: PropTypes.object,
  // areaList: PropTypes.array,
};
