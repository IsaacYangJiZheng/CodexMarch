import React, {useContext, useMemo} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  //   FormGroup,
  FormLabel,
  Checkbox,
} from '@mui/material';
import AppGridContainer from '@anran/core/AppGridContainer';
import Grid from '@mui/material/Grid2';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import IntlMessages from '@anran/utility/IntlMessages';
import {Form} from 'formik';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {FormContext} from '../../AddNewMember';
import {Formik, Field} from 'formik';
import * as Yup from 'yup';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {useIntl} from 'react-intl';

const medicalList = [
  {
    name: 'Recent Operation',
    labelId: 'member.medical.condition.recentOperation',
    selected: false,
  },
  {
    name: 'Severe Heart Disease',
    labelId: 'member.medical.condition.severeHeartDisease',
    selected: false,
  },
  {
    name: 'Severe Circulatory Problems',
    labelId: 'member.medical.condition.severeCirculatoryProblems',
    selected: false,
  },
  {
    name: 'Cardiac Pacemaker',
    labelId: 'member.medical.condition.cardiacPacemaker',
    selected: false,
  },
  {
    name: 'Cancer/Cancer Treatment (Chemo/Targeted Therapy)',
    labelId: 'member.medical.condition.cancerTreatment',
    selected: false,
  },
  {
    name: 'Severe High Blood Pressure',
    labelId: 'member.medical.condition.severeHighBloodPressure',
    selected: false,
  },
  {
    name: 'Skin Disease',
    labelId: 'member.medical.condition.skinDisease',
    selected: false,
  },
  {
    name: 'Viral Infection',
    labelId: 'member.medical.condition.viralInfection',
    selected: false,
  },
  {name: 'Fever', labelId: 'member.medical.condition.fever', selected: false},
  {
    name: 'Recent Scars',
    labelId: 'member.medical.condition.recentScars',
    selected: false,
  },
  {
    name: 'Pregnancy',
    labelId: 'member.medical.condition.pregnancy',
    selected: false,
  },
  {
    name: 'During Period',
    labelId: 'member.medical.condition.duringPeriod',
    selected: false,
  },
  {
    name: 'None of the Above',
    labelId: 'member.medical.condition.none',
    selected: false,
  },
];

const MemberMedical = ({reCallAPI}) => {
  const {formatMessage} = useIntl();
  const {formData, activeStep, setActiveStep, setFormData} =
    useContext(FormContext);
  console.log('formData', formData);
  const [checked, setChecked] = React.useState(medicalList);
  const infoViewActionsContext = useInfoViewActionsContext();
  const validationSchema = useMemo(
    () =>
      Yup.object({
        // conditions: Yup.array().required(formatMessage({id: 'common.required'})),
        agree: Yup.boolean().required(formatMessage({id: 'common.required'})),
      }),
    [formatMessage],
  );
  // const [selectedConditions, setSelectedConditions] = React.useState([]);
  // const [understandAboveInformation, setUnderstandAboveInformation] = React.useState(false);

  // // Handle Checkbox Change for Conditions
  // const handleCheckboxChange = (e) => {
  // const { name } = e.target;
  //   if (selectedConditions.includes(name)) {
  //     setSelectedConditions(
  //       selectedConditions.filter((condition) => condition !== name)
  //     );
  //   } else {
  //     setSelectedConditions([...selectedConditions, name]);
  //   }
  // };

  // const conditionsList = [
  //     "Recent Operation",
  //     "Severe Heart Disease",
  //     "Severe Circulatory Problems",
  //     "Cardiac Pacemaker",
  //     "Cancer/Cancer Treatment (Chemo/Targeted Therapy)",
  //     "Severe High Blood Pressure",
  //     "Skin Disease",
  //     "Viral Infection",
  //     "Fever",
  //     "Recent Scars",
  //     "Pregnancy",
  //     "During Period",
  //     "None of the Above"
  //   ];

  const handleToggle = (value) => () => {
    console.log('handleToggle', value);
    const updatedMembers = medicalList.map((member) => {
        if (value.name === 'None of the Above') {
            // If "None of the Above" is toggled, uncheck all others
            member.selected = member.name === 'None of the Above' ? !member.selected : false;
        } else if (member.name === 'None of the Above') {
            // If any other condition is toggled, uncheck "None of the Above"
            member.selected = false;
        } else if (member.name === value.name) {
            // Toggle the selected condition
            member.selected = !member.selected;
        }
        return member;
    });
    console.log('updatedMembers', updatedMembers);
    setChecked(updatedMembers);
};

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Formik
      initialValues={{
        medicalHistory: formData?.medicalHistory ? formData.medicalHistory : '',
        agree: formData?.agree ? formData.agree : true,
      }}
      validationSchema={validationSchema}
      onSubmit={(data, {setErrors}) => {
        console.log('***************', data);
        const noneSelected = checked.find(
          (item) => item.name === 'None of the Above' && item.selected,
        );
        const found = checked.some((el) => el.selected === true);

        if (!found) {
          infoViewActionsContext.fetchError(
            formatMessage({id: 'member.medical.error.selectOne'}),
          );
        } else if (!noneSelected && !data.medicalHistory.trim()) {
          setErrors({
            medicalHistory: formatMessage({
              id: 'member.medical.error.medicalHistoryRequired',
            }),
          });
        } else {
          const consolidatedData = {
            ...formData,
            ...data,
            suffered: JSON.stringify(checked),
          };
          setFormData(consolidatedData);
          postDataApi(
            'api/members/full-Register',
            infoViewActionsContext,
            consolidatedData,
            false,
            false,
            {
              'Content-Type': 'multipart/form-data',
            },
          )
            .then(() => {
              reCallAPI();
              // setOpenDialog(false);
              setFormData(null);
              setActiveStep(activeStep + 1);
            })
            .catch((error) => {
              infoViewActionsContext.fetchError(error.message);
            });
        }
      }}
    >
      {({values, errors, touched}) => (
        <Form noValidate autoComplete='off'>
          <Box sx={{padding: 5, ml: -6, mr: -6}}>
            <Box
              sx={{
                pb: 5,
                px: 5,
                mb: 5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
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
                      <IntlMessages id='anran.member.MedicalDetails' />
                    </Box>
                  }
                ></CardHeader>
                <CardContent>
                  <AppGridContainer spacing={5}>
                    <Grid size={{xs: 12, md: 12}}>
                      <Box sx={{display: 'flex', flexDirectoin: 'collumn'}}>
                        <Grid size={{xs: 12, md: 12}}>
                          <FormLabel component='legend' sx={{mb: 5}}>
                            <IntlMessages id='member.medical.question' />
                          </FormLabel>
                          <Grid size={{xs: 12, md: 12}}>
                            <List
                              sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                              }}
                            >
                              {checked.map((value) => {
                                const labelId = `checkbox-list-label-${value.name}`;

                                return (
                                  <ListItem key={value.name} disablePadding>
                                    <ListItemButton
                                      role={undefined}
                                      onClick={handleToggle(value)}
                                      dense
                                    >
                                      <ListItemIcon>
                                        <Checkbox
                                          edge='start'
                                          checked={value.selected}
                                          tabIndex={-1}
                                          disableRipple
                                          inputProps={{
                                            'aria-labelledby': labelId,
                                          }}
                                        />
                                      </ListItemIcon>
                                      <ListItemText
                                        sx={{fontWeight: 'bold'}}
                                        id={labelId}
                                        primary={
                                          <Typography variant='h4'>
                                            {formatMessage({id: value.labelId})}
                                          </Typography>
                                        }
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid size={{xs: 12, md: 12}}>
                      <AppTextField
                        name='medicalHistory'
                        fullWidth
                        label={
                          <IntlMessages id='anran.member.medicalHistory' />
                        }
                        multiline
                        rows={5}
                        error={touched.medicalHistory && Boolean(errors.medicalHistory)}
                        helperText={touched.medicalHistory && errors.medicalHistory}
                      />
                    </Grid>
                    <Grid size={{xs: 12, md: 12}}>
                      <FormLabel component='legend' sx={{mb: 5}}>
                        <IntlMessages id='anran.member.understandAboveInformation' />
                      </FormLabel>
                      <FormControlLabel
                        control={
                          <Field
                            type='checkbox'
                            as={Checkbox}
                            name='agree'
                            checked={values.agree} // Bind to Formik
                          />
                        }
                        label={<IntlMessages id='anran.member.agree' />}
                      />
                    </Grid>
                  </AppGridContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
            <Button
              color='inherit'
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{mr: 1}}
            >
              <IntlMessages id='common.back' />
            </Button>
            <Box sx={{flex: '1 1 auto'}} />

            <Button type='submit'>
              <IntlMessages id='common.next' />
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

MemberMedical.propTypes = {
  reCallAPI: PropTypes.func,
  values: PropTypes.object,
  errors: PropTypes.object,
};

export default MemberMedical;