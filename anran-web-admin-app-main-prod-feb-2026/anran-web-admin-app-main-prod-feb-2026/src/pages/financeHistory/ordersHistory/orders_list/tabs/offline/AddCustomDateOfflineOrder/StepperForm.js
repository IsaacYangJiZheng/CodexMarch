import React, {useContext} from 'react';
import {FormContext} from '../AddCustomDateOfflineOrder';
import {MemberCarts, MemberPayment, Success} from './Steps';

function Steps() {
  const {activeStep, cart, selectedBranch, selectedMember} = useContext(FormContext);
  console.log('activeStep', activeStep, cart, selectedBranch, selectedMember);
  let stepContent;
  switch (activeStep) {
    case 0:
      stepContent = <MemberCarts />;
      break;
    case 1:
      stepContent = <MemberPayment />;
      break;
    case 2:
      stepContent = <Success />
      break;
    default:
      break;
  }

  return stepContent;
}

export default Steps;
