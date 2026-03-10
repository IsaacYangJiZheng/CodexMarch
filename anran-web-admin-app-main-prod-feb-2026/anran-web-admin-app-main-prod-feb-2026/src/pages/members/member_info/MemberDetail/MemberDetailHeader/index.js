import React from 'react';
// import {useNavigate} from 'react-router-dom';
import IntlMessages from '@anran/utility/IntlMessages';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
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
// import {useAuthUser} from '@anran/utility/AuthHooks';
// import {Fonts} from 'shared/constants/AppEnums';
// import {useAuthUser} from '@anran/utility/AuthHooks';
// import {RoutePermittedRole2} from 'shared/constants/AppConst';

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
// const StyledButton = styled(Button)(({theme}) => ({
//   textTransform: 'none',
//   fontWeight: theme.typography.fontWeightRegular,
//   fontSize: theme.typography.pxToRem(15),
//   marginRight: theme.spacing(1),
//   color: 'rgba(255, 255, 255, 0.7)',
//   backgroundColor: 'transparent',
//   '&.Mui-selected': {
//     color: '#fff',
//   },
//   '&.Mui-focusVisible': {
//     backgroundColor: 'rgba(100, 95, 228, 0.32)',
//   },
// }));

const MemberDetailHeader = (props) => {
  // const {user} = useAuthUser();
  const {
    setSelectedMember,
    mainTabValue,
    setMainTabValue,
    // handleOpenWithdrawMemberDialog,
  } = props;

  // const navigate = useNavigate();
  // const {user} = useAuthUser();

  const onClickBackButton = () => {
    // navigate(-1);
    setSelectedMember(null);
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
          variant='scrollable'
          scrollButtons={false}
          value={mainTabValue}
          onChange={handleChange}
          aria-label='icon label tabs example'
        >
          <StyledTab label={<IntlMessages id='member.detail.tab.details' />} />
          <StyledTab
            label={<IntlMessages id='member.detail.tab.packageInfo' />}
          />
          <StyledTab
            label={<IntlMessages id='member.detail.tab.voucherInfo' />}
          />
          <StyledTab
            label={<IntlMessages id='member.detail.tab.transferSession' />}
          />
          <StyledTab
            label={<IntlMessages id='member.detail.tab.memberDeposits' />}
          />
          <StyledTab
            label={<IntlMessages id='member.detail.tab.bookingStatus' />}
          />
          {/* {user.permission.includes(RoutePermittedRole2.member_member_delete) && (
            <StyledButton onClick={handleOpenWithdrawMemberDialog}>
              WITHDRAW MEMBER
            </StyledButton>
          )} */}
        </StyledTabs>
      </Box>
    </>
  );
};

export default MemberDetailHeader;

MemberDetailHeader.propTypes = {
  // selectedBranch: PropTypes.object.isRequired,
  setSelectedMember: PropTypes.func,
  mainTabValue: PropTypes.number,
  setMainTabValue: PropTypes.func,
  handleOpenWithdrawMemberDialog: PropTypes.func,
};