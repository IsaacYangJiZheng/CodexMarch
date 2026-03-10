import axios from 'axios';

const jwtAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
jwtAxios.interceptors.request.use(
  function (config) {
    config = setConfigHeader(config);
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

//https://blog.theashishmaurya.me/handling-jwt-access-and-refresh-token-using-axios-in-react-app
// https://medium.com/@tokosbex/auth-token-rotation-node-js-react-part-1-b83a87d7fb4d
// https://medium.com/@aqeel_ahmad/handling-jwt-access-token-refresh-token-using-axios-in-react-react-native-app-2024-f452c96a83fc
// Add a response interceptor
// jwtAxios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error status is 401 and there is no originalRequest._retry flag,
//     // it means the token has expired and we need to refresh it
//     if (error.response && error.response.data.message === 'Invalid Token') {
//       if (!originalRequest._retry) {
//         originalRequest._retry = true;
//         try {
//           const refreshToken = localStorage.getItem('refreshToken');
//           const response = await axios.post('/api/refresh-token', {
//             refreshToken,
//           });
//           const {token} = response.data;

//           localStorage.setItem('token', token);

//           // Retry the original request with the new token
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return axios(originalRequest);
//         } catch (error) {
//           // Handle refresh token error or redirect to login
//         }
//       }
//     }
//     return Promise.reject(error);
//   },
// );

jwtAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.data.message === 'Invalid Token') {
      console.log('Need to logout user');
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  },
);
export const setAuthToken = (token) => {
  if (token) {
    jwtAxios.defaults.headers.common['Authorization'] = token;
    localStorage.setItem('token', token);
  } else {
    delete jwtAxios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const setConfigHeader = (config) => {
  const accessToken = localStorage.getItem('token');
  if (accessToken) {
    config.headers['Authorization'] = accessToken;
  }
  return config;
};

export default jwtAxios;
