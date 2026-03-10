import React, {useState, createContext} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import StepperForm from './StepperForm';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import {useGetDataApi} from '@anran/utility/APIHooks';

export const FormContext = createContext();
const steps = ['Deposit Payment'];

const AddDeposit = ({isOpen, setOpenDialog, setMainTabValue, reCallAPI}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [{apiData: branchList}] = useGetDataApi('api/branch', {}, {}, true);
  const [cart, setCart] = React.useState([]);
  const [orderTotal, setOrderTotal] = React.useState(0);
  const [orderBalanceTotal, setOrderBalanceTotal] = React.useState(0);
  const [orderTaxTotal, setOrderTaxTotal] = React.useState(0);
  const [taxValue, setTaxValue] = React.useState(0);
  const [taxCode, setTaxCode] = React.useState('');

  return (
    <Box flex={1}>
      <Drawer
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: {xs: 320, sm: 400, md: 600, lg: 900},
            boxSizing: 'border-box',
          },
        }}
        anchor='right'
        open={isOpen}
        onClose={(e, r) => {
          console.log(e, r);
          if (r != 'backdropClick') {
            setOpenDialog(false);
          }
        }}
        ModalProps={{onBackdropClick: (e) => e.preventDefault()}}
      >
        <CardHeader onCloseAddCard={setOpenDialog} title={'Deposit'} />
        <FormContext.Provider
          value={{
            activeStep,
            setActiveStep,
            formData,
            setFormData,
            setOpenDialog,
            setMainTabValue,
            branchList,
            cart,
            setCart,
            orderTotal,
            setOrderTotal,
            orderBalanceTotal,
            setOrderBalanceTotal,
            orderTaxTotal,
            setOrderTaxTotal,
            taxValue,
            setTaxValue,
            taxCode,
            setTaxCode,
          }}
        >
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
            <StepperForm reCallAPI={reCallAPI} />
          </div>
        </FormContext.Provider>
      </Drawer>
    </Box>
  );
};

export default AddDeposit;

AddDeposit.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  setMainTabValue: PropTypes.func,
};
