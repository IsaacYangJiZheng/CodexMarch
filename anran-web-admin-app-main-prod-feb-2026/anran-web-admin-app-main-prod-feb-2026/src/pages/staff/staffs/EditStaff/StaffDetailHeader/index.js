import React from 'react';
import IntlMessages from '@anran/utility/IntlMessages';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppTooltip from '@anran/core/AppTooltip';
import {styled} from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

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

// Styled Button using StyledTab styles
const StyledButton = styled(Button)(({theme}) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  backgroundColor: 'transparent',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

const StaffDetailHeader = (props) => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  const {
    setSelectedStaff,
    mainTabValue,
    setMainTabValue,
    handleOpenWithdrawStaffDialog,
    refresh,
  } = props;

  const onClickBackButton = () => {
    refresh();
    setSelectedStaff(null);
  };

  const handleChange = (event, newValue) => {
    if (newValue === 2) {
      handleOpenWithdrawStaffDialog();
      return;
    }
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
          <StyledTab label={formatMessage({id: 'staff.tabs.details'})} />
          {user.permission.includes(RoutePermittedRole2.admin_staff_update) && (
            <StyledTab label={formatMessage({id: 'staff.tabs.settings'})} />
          )}

          {user.permission.includes(RoutePermittedRole2.admin_staff_delete) && (
            <StyledButton onClick={handleOpenWithdrawStaffDialog}>
              {formatMessage({id: 'staff.tabs.withdraw'})}
            </StyledButton>
          )}
        </StyledTabs>
      </Box>
    </>
  );
};

export default StaffDetailHeader;

StaffDetailHeader.propTypes = {
  selectedStaff: PropTypes.object.isRequired,
  setSelectedStaff: PropTypes.func,
  mainTabValue: PropTypes.number,
  setMainTabValue: PropTypes.func,
  handleOpenWithdrawStaffDialog: PropTypes.func,
  refresh: PropTypes.func,
};