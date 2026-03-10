import AppContextProvider from '@anran/utility/AppContextProvider';
import AppThemeProvider from '@anran/utility/AppThemeProvider';
// import AppStyleProvider from '@anran/utility/AppStyleProvider';
import AppLocaleProvider from '@anran/utility/AppLocaleProvider';
import {BrowserRouter} from 'react-router-dom';
import JWTAuthProvider from '@anran/services/auth/jwt-auth/JWTAuthProvider';
import AuthRoutes from '@anran/utility/AuthRoutes';
import AuthRole from '@anran/utility/AuthRole';
import CssBaseline from '@mui/material/CssBaseline';
import AppLayout from '@anran/core/AppLayout';

function App() {
  return (
    <AppContextProvider>
      <AppThemeProvider>
        {/* <AppStyleProvider> */}
        <AppLocaleProvider>
          <BrowserRouter>
            <JWTAuthProvider>
              <AuthRoutes>
                <AuthRole>
                  <CssBaseline />
                  <AppLayout />
                </AuthRole>
              </AuthRoutes>
            </JWTAuthProvider>
          </BrowserRouter>
        </AppLocaleProvider>
        {/* </AppStyleProvider> */}
      </AppThemeProvider>
    </AppContextProvider>
  );
}

export default App;
