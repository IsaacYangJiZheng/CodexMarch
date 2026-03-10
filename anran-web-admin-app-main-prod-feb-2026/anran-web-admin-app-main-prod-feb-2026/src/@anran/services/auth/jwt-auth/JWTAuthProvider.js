import React, {createContext, useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import jwtAxios, {setAuthToken} from './index';

const JWTAuthContext = createContext();
const JWTAuthActionsContext = createContext();

export const useJWTAuth = () => useContext(JWTAuthContext);

export const useJWTAuthActions = () => useContext(JWTAuthActionsContext);

const JWTAuthAuthProvider = ({children}) => {
  const [jwtData, setJWTAuthData] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const infoViewActionsContext = useInfoViewActionsContext();

  useEffect(() => {
    console.log('JWTAuthAuthProvider');
    const getAuthUser = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setJWTAuthData({
          user: undefined,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }
      setAuthToken(token);
      // setJWTAuthData({
      //   user: 'data',
      //   isLoading: false,
      //   isAuthenticated: true,
      // });
      jwtAxios
        .get('api/staff/verify')
        .then(({data}) =>
          setJWTAuthData({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          }),
        )
        .catch(() =>
          setJWTAuthData({
            user: undefined,
            isLoading: false,
            isAuthenticated: false,
          }),
        );
    };

    getAuthUser();
  }, []);

  const signInUser = async ({email, password}) => {
    infoViewActionsContext.fetchStart();
    try {
      const {data} = await jwtAxios.post('login/authenticate', {
        username: email,
        password: password,
      });
      if (data.status) {
        console.log('token', data.token);
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        // const res = await jwtAxios.get('/auth');
        setJWTAuthData({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        infoViewActionsContext.fetchSuccess();
      } else {
        setJWTAuthData({
          ...jwtData,
          isAuthenticated: false,
          isLoading: false,
        });
        infoViewActionsContext.fetchError(
          data?.message || 'Something went wrong',
        );
      }
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticated: false,
        isLoading: false,
      });
      infoViewActionsContext.fetchError(
        error?.response?.data?.error || 'Something went wrong',
      );
    }
  };

  const signUpUser = async ({name, email, password}) => {
    infoViewActionsContext.fetchStart();
    try {
      const {data} = await jwtAxios.post('users', {name, email, password});
      localStorage.setItem('token', data.token);
      setAuthToken(data.token);
      const res = await jwtAxios.get('/auth');
      setJWTAuthData({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
      infoViewActionsContext.fetchSuccess();
    } catch (error) {
      setJWTAuthData({
        ...jwtData,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log('error:', error.response.data.error);
      infoViewActionsContext.fetchError(
        error?.response?.data?.error || 'Something went wrong',
      );
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setAuthToken();
    setJWTAuthData({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <JWTAuthContext.Provider
      value={{
        ...jwtData,
      }}
    >
      <JWTAuthActionsContext.Provider
        value={{
          signUpUser,
          signInUser,
          logout,
        }}
      >
        {children}
      </JWTAuthActionsContext.Provider>
    </JWTAuthContext.Provider>
  );
};
export default JWTAuthAuthProvider;

JWTAuthAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
