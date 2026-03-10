import React, {useContext} from 'react';
import {FormContext} from '.';
import {
  // MemberValidation,
  MemberPersonal,
  MemberMedical,
  Success,
} from './Steps';
import PropTypes from 'prop-types';

function Steps({reCallAPI}) {
  const {activeStep, programList, interestData, documents} =
    useContext(FormContext);
  console.log('activeStep', activeStep);

  let stepContent;
  switch (activeStep) {
    // case 0:
    //   stepContent = (
    //     <MemberValidation
    //       programsList={programList}
    //       selectedChildren={interestData}
    //     />
    //   );
    //   break;
    case 0:
      stepContent = (
        <MemberPersonal
          programsList={programList}
          selectedChildren={interestData}
          documents={documents}
        />
      );
      break;
    case 1:
      stepContent = <MemberMedical reCallAPI={reCallAPI} />;
      break;
    case 2:
      stepContent = <Success />;
      break;
    default:
      break;
  }

  return stepContent;
}

export default Steps;

Steps.propTypes = {
  reCallAPI: PropTypes.func,
};
// const steps = ['Member Validation', 'Member Personal', 'Member Medical'];

// const AddNewMemberForm = ({ values, errors}) => {
//   const { activeStep, handleNext, handleBack, finalSubmit} = useMemberForm();

//   console.log('activeStep', activeStep);

//   //const isLastStep = activeStep === steps.length - 1;

//   return (
//     <Box
//       sx={{
//         pb: 5,
//         px: 5,
//         mb: 5,
//         pt: 5,
//         borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
//       }}
//     >

//       <Stepper activeStep={activeStep}>
//         {steps.map((label) => (
//           <Step key={label}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {activeStep === 0 && (
//         <MemberValidation
//           onNext={() => handleNext()}
//           onBack={handleBack}
//           values={values}
//           errors={errors}
//         />
//       )}
//       {activeStep === 1 && (
//         <MemberPersonal
//           onNext={() => handleNext()}
//           onBack={handleBack}
//           values={values}
//           errors={errors}
//         />
//       )}
//       {activeStep === 2 && (
//         <MemberMedical
//           onNext={() => finalSubmit()}
//           onBack={handleBack}
//           values={values}
//           errors={errors}
//         />
//       )}
//     </Box>
//   );
// };

// export default AddNewMemberForm;
