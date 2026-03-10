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
import {useIntl} from 'react-intl';

export const FormContext = createContext();

const AddPurchase = ({isOpen, setOpenDialog, reCallAPI, setMainTabValue}) => {
  const {formatMessage} = useIntl();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [{apiData: branchList}] = useGetDataApi('api/branch', {}, {}, true);
  const [{apiData: roleBasedBranchList}] = useGetDataApi('api/branch/role-based', {}, {}, true);
  const [cart, setCart] = React.useState([]);
  const [orderTotal, setOrderTotal] = React.useState(0);
  const [orderBalanceTotal, setOrderBalanceTotal] = React.useState(0);
  const [orderTaxTotal, setOrderTaxTotal] = React.useState(0);
  const [taxValue, setTaxValue] = React.useState(0);
  const [useDeposit, setUseDeposit] = React.useState(0);
  const [taxCode, setTaxCode] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [selectedBranch, setSelectedBranch] = React.useState(null);
  const [orderNumber, setOrderNumber] = React.useState(null);
  const steps = [
    formatMessage({id: 'finance.sales.step.packageSelection'}),
    formatMessage({id: 'finance.sales.step.payments'}),
  ];

  return (
    <Box flex={1}>
      <Drawer
        PaperProps={{
          sx: {width: '80%', maxWidth: '80%', flex: 1},
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
        <CardHeader
          onCloseAddCard={setOpenDialog}
          title={formatMessage({id: 'finance.sales.customDate.title'})}
          reCallAPI={reCallAPI}
        />
        <FormContext.Provider
          value={{
            activeStep,
            setActiveStep,
            formData,
            setFormData,
            setOpenDialog,
            reCallAPI,
            setMainTabValue,
            branchList,
            roleBasedBranchList,
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
            useDeposit,
            setUseDeposit,
            selectedMember,
            setSelectedMember,
            selectedBranch,
            setSelectedBranch,
            orderNumber,
            setOrderNumber,
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

export default AddPurchase;

AddPurchase.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  setMainTabValue: PropTypes.func,
};