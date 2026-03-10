import React from 'react';
// import {useNavigate} from 'react-router-dom';
import IntlMessages from '@anran/utility/IntlMessages';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
// import AppsDeleteIcon from '@anran/core/AppsDeleteIcon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
// import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AppTooltip from '@anran/core/AppTooltip';
import {styled} from '@mui/material/styles';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{children: <span className='MuiTabs-indicatorSpan' />}}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: 'white',
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({theme}) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-selected': {
      color: '#fff',
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'rgba(100, 95, 228, 0.32)',
    },
  }),
);

const BranchDetailHeader = (props) => {
  const {user} = useAuthUser();
  const {setSelectedBranch, mainTabValue, setMainTabValue} = props;

  // const navigate = useNavigate();
  // const {user} = useAuthUser();

  const onClickBackButton = () => {
    // navigate(-1);
    setSelectedBranch(null);
  };

  const handleChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          cursor: 'pointer',
        }}
        component='span'
        mr={{xs: 2, sm: 4}}
        onClick={onClickBackButton}
      >
        <AppTooltip title={<IntlMessages id='common.back' />}>
          <ArrowBackIcon
            sx={{
              color: (theme) => theme.palette.primary.contrastText,
            }}
          />
        </AppTooltip>
      </Box>

      <Box
        component='span'
        sx={{
          display: {xs: 'none', sm: 'block'},
        }}
      >
        <StyledTabs
          value={mainTabValue}
          onChange={handleChange}
          aria-label='icon label tabs example'
        >
          <StyledTab label='DETAILS' />
          <StyledTab label='FLOORS' />
          {user.permission.includes(RoutePermittedRole2.admin_room_view) && (
            <StyledTab label='ROOMS' />
          )}
          {user.permission.includes(
            RoutePermittedRole2.finance_payments_update,
          ) && <StyledTab label='SETTINGS' />}
        </StyledTabs>
      </Box>
    </>
  );
};

export default BranchDetailHeader;

BranchDetailHeader.propTypes = {
  // selectedBranch: PropTypes.object.isRequired,
  setSelectedBranch: PropTypes.func,
  mainTabValue: PropTypes.number,
  setMainTabValue: PropTypes.func,
};
