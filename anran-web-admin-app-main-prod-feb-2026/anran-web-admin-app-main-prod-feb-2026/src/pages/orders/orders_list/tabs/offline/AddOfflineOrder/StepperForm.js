import React, {useContext} from 'react';
import {FormContext} from '../AddOfflineOrder';
import {MemberCarts, MemberPayment, Success, SuccessInstantBooking} from './Steps';
import PropTypes from 'prop-types';

function Steps({reCallAPI}) {
  const {activeStep, cart, selectedBranch, selectedMember} = useContext(FormContext);
  console.log('activeStep', activeStep, cart, selectedBranch, selectedMember);
  const hasSpecialPackage = cart.some((item) => item.isInstant);
  let stepContent;
  switch (activeStep) {
    case 0:
      stepContent = <MemberCarts />;
      break;
    case 1:
      stepContent = <MemberPayment />;
      break;
    case 2:
      if (hasSpecialPackage) {
        stepContent = <SuccessInstantBooking />;
      } else {
        stepContent = <Success reCallAPI={reCallAPI} />;
      }
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
