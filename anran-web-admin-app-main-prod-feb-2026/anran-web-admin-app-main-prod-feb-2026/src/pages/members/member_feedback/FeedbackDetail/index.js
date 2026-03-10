import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Typography,
  Divider,
  Box,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Radio,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {Form, Formik} from 'formik';

import FeedbackDetailHeader from '../FeedbackDetailHeader';

import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import AppInfoView from '@anran/core/AppInfoView';
import AppLoader from '@anran/core/AppLoader';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import {useGetDataApi, putDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

const FeedbackDetail = ({selectedMember, setSelectedMember}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [{apiData: feedbackData, loading}, {setQueryParams, reCallAPI}] =
    useGetDataApi(
      selectedMember && selectedMember._id
        ? `api/feedback/${selectedMember._id}`
        : '',
      undefined,
      {},
      false,
    );

  useEffect(() => {
    if (selectedMember) {
      setQueryParams({id: selectedMember._id});
      reCallAPI();
    }
  }, [selectedMember]);

  const questionLabels = {
    consultant_speed_of_response: 'Speed of Responsiveness',
    consultant_knowledge_of_anran_steaming: 'Knowledge of Anran Steaming',
    consultant_ability_to_advice: 'Ability to Advise',
    consultant_ability_to_consult: 'Ability to Consult',
    consultant_communication: 'Communication Skills',
    consultant_friendliness: 'Friendliness',
    consultant_professionalism: 'Professionalism',
    staff_speed_of_response: 'Speed of Responsiveness',
    staff_knowledge_of_anran_steaming: 'Knowledge of Anran Steaming',
    staff_communication: 'Communication Skills',
    staff_friendliness: 'Friendliness',
    staff_professionalism: 'Professionalism',
  };

  console.log('feedbackData', feedbackData);

  return (
    <Grid container>
      {loading ? (
        <AppLoader />
      ) : (
        <Grid size={{xs: 12}}>
          <AppsHeaderWithImage>
            <FeedbackDetailHeader
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
            />
          </AppsHeaderWithImage>
          <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 12, md: 8}}>
              <Card sx={{mt: 4, p: 4, borderRadius: 3, boxShadow: 3}}>
                <Typography
                  variant='h2'
                  fontWeight={'bold'}
                  gutterBottom
                  align='center'
                >
                  Member Feedback Result
                </Typography>
                <Divider sx={{mb: 3}} />

                <Typography variant='h4' sx={{mt: 2}}>
                  How satisfied were you with the overall service provided by
                  Anran Wellness?
                </Typography>
                <Typography variant='body2' sx={{mb: 2}}>
                  (Please rate from 1 - 5, 5 being Very Satisfied)
                </Typography>
                <RadioGroup
                  row
                  value={feedbackData?.satisfied_rate}
                  sx={{justifyContent: 'center'}}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio disabled />}
                      label={value}
                    />
                  ))}
                </RadioGroup>

                <Typography variant='h4' sx={{mt: 3}}>
                  Which Anran Branch do you visit?
                </Typography>
                <Typography variant='subtitle1' sx={{mb: 3}}>
                  {feedbackData?.branch?.branchName}
                </Typography>
                <Typography variant='h4' sx={{mt: 4, mb: 2}}>
                  Please rate Anran Consultant performance, with regards to the
                  following parameters:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    mr: 5,
                    ml: 95,
                  }}
                >
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    N/A
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Poor
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Satisfactory
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Excellent
                  </Typography>
                </Box>
                {[
                  'consultant_speed_of_response',
                  'consultant_knowledge_of_anran_steaming',
                  'consultant_ability_to_advice',
                  'consultant_ability_to_consult',
                  'consultant_communication',
                  'consultant_friendliness',
                  'consultant_professionalism',
                ].map((field, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant='body1' sx={{flex: 1}}>
                      {questionLabels[field]}
                    </Typography>
                    <RadioGroup row value={feedbackData?.[field] || ''}>
                      {[0, 1, 2, 3].map((value) => (
                        <FormControlLabel
                          key={value}
                          value={value}
                          control={<Radio disabled />}
                          label=''
                          sx={{gap: 4}}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                ))}

                <Typography variant='h4' sx={{mt: 4, mb: 2}}>
                  Please rate Anran Staff performance, with regards to the
                  following parameters:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    mr: 5,
                    ml: 95,
                  }}
                >
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    N/A
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Poor
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Satisfactory
                  </Typography>
                  <Typography variant='p' sx={{flex: 1, textAlign: 'center'}}>
                    Excellent
                  </Typography>
                </Box>
                {[
                  'staff_speed_of_response',
                  'staff_friendliness',
                  'staff_knowledge_of_anran_steaming',
                  'staff_professionalism',
                  'staff_communication',
                ].map((field, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant='body1' sx={{flex: 1}}>
                      {questionLabels[field]}
                    </Typography>
                    <RadioGroup row value={feedbackData?.[field] || ''}>
                      {[0, 1, 2, 3].map((value) => (
                        <FormControlLabel
                          key={value}
                          value={value}
                          control={<Radio disabled />}
                          label=''
                          sx={{gap: 4}}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                ))}

                <Typography variant='h4' sx={{mt: 4}}>
                  How likely is it that you would recommend ANRAN WELLNESS to a
                  friend or family member?
                </Typography>
                <Typography variant='body2' sx={{mb: 2}}>
                  (Please rate from 1 - 5, 5 being Very Likely)
                </Typography>
                <RadioGroup
                  row
                  value={feedbackData?.recommend_rate}
                  sx={{justifyContent: 'center'}}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio disabled />}
                      label={value}
                    />
                  ))}
                </RadioGroup>

                <Typography variant='h4' sx={{mt: 4}}>
                  Do you have any other comments, questions, or concerns?
                </Typography>
                <Typography variant='subtitle1' sx={{mb: 3}}>
                  {feedbackData?.comments || 'No comments available'}
                </Typography>

                <Typography variant='h4' sx={{mt: 4, mb: 2}}>
                  If needed, may we contact you to follow up on these responses?
                </Typography>
                <FormControlLabel
                  control={
                    <Radio checked={feedbackData?.contact_request} disabled />
                  }
                  label='Yes'
                />
                <br />
                <FormControlLabel
                  control={
                    <Radio checked={!feedbackData?.contact_request} disabled />
                  }
                  label='No'
                />
              </Card>
            </Grid>
            <Grid size={{xs: 12, sm: 12, md: 4}}>
              <Formik
                initialValues={{
                  remarks: feedbackData?.internal_remarks || '',
                  summary: feedbackData?.internal_summary || '',
                  followUpStatus: feedbackData?.internal_status || false,
                }}
                onSubmit={(data) => {
                  const formData = new FormData();
                  formData.append('remarks', data.remarks);
                  formData.append('summary', data.summary);
                  formData.append('followUpStatus', data.followUpStatus);
                  putDataApi(
                    `api/feedback/internal/${selectedMember._id}`,
                    infoViewActionsContext,
                    formData,
                    false,
                    false,
                    {
                      'Content-Type': 'multipart/form-data',
                    },
                  )
                    .then(() => {
                      reCallAPI();
                    })
                    .catch((error) => {
                      infoViewActionsContext.fetchError(error.message);
                    });
                }}
              >
                {({values, setFieldValue}) => (
                  <Form noValidate autoComplete='off'>
                    <Card sx={{mt: 4, p: 4, borderRadius: 3, boxShadow: 3}}>
                      <Typography
                        variant='h2'
                        fontWeight={'bold'}
                        gutterBottom
                        align='center'
                      >
                        Internal Feedbacks
                      </Typography>
                      <Divider sx={{mb: 3}} />
                      <FormLabel component='legend'>
                        Follow up Status
                      </FormLabel>
                      <RadioGroup
                        sx={{mb: 2}}
                        row
                        name='followUpStatus'
                        value={values.followUpStatus}
                        onChange={(event) => {
                          setFieldValue('followUpStatus', event.target.value === 'true');
                        }}
                      >
                        <FormControlLabel
                          value='true'
                          control={<Radio />}
                          label='Yes'
                        />
                        <FormControlLabel
                          value='false'
                          control={<Radio />}
                          label='No'
                        />
                      </RadioGroup>
                      <AppTextField
                        sx={{mb: 2}}
                        name='remarks'
                        fullWidth
                        label='Remarks'
                        multiline
                        rows={5}
                      />
                      <AppTextField
                        sx={{mb: 2}}
                        name='summary'
                        fullWidth
                        label='Summary'
                        multiline
                        rows={5}
                      />
                      <Box sx={{textAlign: 'center', mt: 3}}>
                        <Button
                          variant='contained'
                          color='primary'
                          type='submit'
                          sx={{
                            cursor: 'pointer',
                          }}
                        >
                          {feedbackData?.internal_remarks ||
                          feedbackData?.internal_summary ||
                          feedbackData?.internal_status
                            ? 'Update'
                            : 'Submit'}
                        </Button>
                      </Box>
                    </Card>
                  </Form>
                )}
              </Formik>
            </Grid>
            <AppInfoView />
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

FeedbackDetail.propTypes = {
  selectedMember: PropTypes.object,
};

export default FeedbackDetail;

FeedbackDetail.propTypes = {
  selectedMember: PropTypes.object,
  setSelectedMember: PropTypes.func,
};
