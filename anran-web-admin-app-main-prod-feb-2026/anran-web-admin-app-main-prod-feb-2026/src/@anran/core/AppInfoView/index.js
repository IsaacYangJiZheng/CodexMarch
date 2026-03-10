import React from 'react';
import AppMessageView from '@anran/core/AppMessageView';
import AppLoader from '@anran/core/AppLoader';
import {useInfoViewContext} from '../../utility/AppContextProvider/InfoViewContextProvider';
import {useNavigate} from 'react-router-dom';
import {useAuthMethod} from '@anran/utility/AuthHooks';

const AppInfoView = () => {
  const {
    error,
    loading,
    logout: exist,
    displayMessage: message,
  } = useInfoViewContext();
  const navigate = useNavigate();
  const {logout} = useAuthMethod();

  const showMessage = () => {
    return <AppMessageView variant='success' message={message.toString()} />;
  };

  const showError = () => {
    return <AppMessageView variant='error' message={error.toString()} />;
  };
  const gotoLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <>
      {loading && <AppLoader page={'AppInfoView'} />}

      {message && showMessage()}
      {error && showError()}
      {exist && gotoLogout()}
    </>
  );
};

export default AppInfoView;
