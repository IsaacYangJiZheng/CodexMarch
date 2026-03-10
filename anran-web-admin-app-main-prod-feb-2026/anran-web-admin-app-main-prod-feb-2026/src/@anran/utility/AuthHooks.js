import {getUserFromJwtAuth, setUserProfileImage} from './helper/AuthHelper';
import {
  useJWTAuth,
  useJWTAuthActions,
} from '../services/auth/jwt-auth/JWTAuthProvider';

export const useAuthUser = () => {
  const {auth, user, isAuthenticated, isLoading} = useJWTAuth();
  return {
    auth,
    isLoading,
    isAuthenticated,
    user: getUserFromJwtAuth(user),
  };
};

export const setAuthUser = (image) => {
  const {auth, user, isAuthenticated, isLoading} = useJWTAuth();
  return {
    auth,
    isLoading,
    isAuthenticated,
    user: setUserProfileImage(user, image),
  };
};

export const useAuthMethod = () => {
  const {
    signInUser,
    signUpCognitoUser,
    confirmCognitoUserSignup,
    logout,
    completeNewPassword,
    userPasswordChange,
    cognito_user_refresh,
  } = useJWTAuthActions();

  return {
    signInUser,
    signUpCognitoUser,
    confirmCognitoUserSignup,
    logout,
    completeNewPassword,
    userPasswordChange,
    cognito_user_refresh,
  };
};
