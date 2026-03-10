import React, {useContext} from 'react';
import {FormContext} from '.';
import {MemberCarts} from './Steps';
import PropTypes from 'prop-types';

function Steps({reCallAPI, setOpenDialog}) {
  const {activeStep} = useContext(FormContext);
  console.log('activeStep', activeStep);
  let stepContent;
  switch (activeStep) {
    case 0:
      stepContent = <MemberCarts reCallAPI={reCallAPI} setOpenDialog={setOpenDialog}/>;
      break;
    default:
      break;
  }

  return stepContent;
}

export default Steps;

Steps.propTypes = {
  reCallAPI: PropTypes.func,
  setOpenDialog: PropTypes.func,
};
