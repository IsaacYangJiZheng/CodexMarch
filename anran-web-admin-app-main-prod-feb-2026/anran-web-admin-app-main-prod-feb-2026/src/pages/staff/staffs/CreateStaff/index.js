import React, {useMemo, useState} from 'react';
import {Divider, Box, Drawer} from '@mui/material';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import AppInfoView from '@anran/core/AppInfoView';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import StepControl from './StepControl';
import {useIntl} from 'react-intl';

const CreateStaff = ({
  filteredStaffDatabase,
  formData,
  setFormData,
  open,
  onClose,
  reCallAPI,
  branchOptions,
  roleOptions,
}) => {
  const {formatMessage} = useIntl();
  const [activeStep, setActiveStep] = useState(0);
  const steps = useMemo(
    () => [
      formatMessage({id: 'staff.steps.basicInfo'}),
      formatMessage({id: 'staff.steps.userInfo'}),
      formatMessage({id: 'staff.steps.details'}),
      formatMessage({id: 'staff.steps.finance'}),
      formatMessage({id: 'staff.steps.emergency'}),
    ],
    [formatMessage],
  );

  return (
    <Box flex={1}>
      <Drawer
        anchor='right'
        open={open}
        PaperProps={{
          sx: {width: '80%', maxWidth: '80%', flex: 1},
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.paper',
          }}
        >
          <CardHeader
            onCloseAddCard={() => {
              onClose();
              setActiveStep(0);
            }}
            title={formatMessage({id: 'staff.dialog.create.title'})}
          />
        </Box>
        <div>
          <Stepper sx={{pt: 5, pl: 0}} activeStep={activeStep}>
            {steps.map((label) => {
              const stepProps = {};
              const labelProps = {};

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>

          <Divider
            sx={{
              mb: {xs: 4, md: 6},
              pt: 2,
            }}
          />

          <StepControl
            filteredStaffDatabase={filteredStaffDatabase}
            formData={formData}
            setFormData={setFormData}
            setActiveStep={setActiveStep}
            activeStep={activeStep}
            onClose={onClose}
            reCallAPI={reCallAPI}
            branchOptions={branchOptions}
            roleOptions={roleOptions}
          />
        </div>
        <AppInfoView />
      </Drawer>
    </Box>
  );
};

export default CreateStaff;

CreateStaff.propTypes = {
  filteredStaffDatabase: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
};