import React from 'react';
import PropTypes from 'prop-types';
import {
  StaffDetails,
  StaffUser,
  StaffBasic,
  StaffEmergency,
  StaffFinance,
  Success,
} from './Steps';

function Steps({
  filteredStaffDatabase,
  formData,
  setFormData,
  reCallAPI,
  branchOptions,
  roleOptions,
  activeStep,
  setActiveStep,
  onClose,
}) {
  let stepContent;
  switch (activeStep) {
    case 0:
      stepContent = (
        <StaffBasic
          filteredStaffDatabase={filteredStaffDatabase}
          branchOptions={branchOptions}
          roleOptions={roleOptions}
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      );
      break;
    case 1:
      stepContent = (
        <StaffUser
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      );
      break;
    case 2:
      stepContent = (
        <StaffDetails
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      );
      break;
    case 3:
      stepContent = (
        <StaffFinance
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      );
      break;
    case 4:
      stepContent = (
        <StaffEmergency
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      );
      break;
    case 5:
      stepContent = <Success reCallAPI={reCallAPI} onClose={onClose} />;
      break;
    default:
      break;
  }

  return stepContent;
}

export default Steps;

Steps.propTypes = {
  reCallAPI: PropTypes.func,
  branchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      branchName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  roleOptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      role_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
  onClose: PropTypes.func,
};
