import React, {useContext} from 'react';
import {FormContext} from '.';
import {MemberCarts, Success} from './Steps';
import PropTypes from 'prop-types';

function Steps({reCallAPI}) {
  const {activeStep} = useContext(FormContext);
  console.log('activeStep', activeStep);
  let stepContent;
  switch (activeStep) {
    case 0:
      stepContent = <MemberCarts />;
      break;
    case 1:
      stepContent = <Success reCallAPI={reCallAPI} />;
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
