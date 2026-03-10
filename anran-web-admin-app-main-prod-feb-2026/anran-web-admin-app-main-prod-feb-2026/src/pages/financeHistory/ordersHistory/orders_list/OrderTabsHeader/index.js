import React from 'react';
import {Box, Tabs, Tab, Button} from '@mui/material';
import PropTypes from 'prop-types';
import {styled} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
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
    maxWidth: 160,
    width: '100%',
    backgroundColor: 'white',
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({theme}) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(20),
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
  const {formatMessage} = useIntl();
  const {mainTabValue, setMainTabValue, onCustomDateSaleClick} = props;

  const handleChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  return (
    <>
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
          <StyledTab label={formatMessage({id: 'finance.sales.walkInTab'})} />
          <StyledTab label={formatMessage({id: 'finance.sales.onlineTab'})} />
        </StyledTabs>
      </Box>
      {user.permission.includes(RoutePermittedRole2.finance_sales_create) && (
        <Box
          component='span'
          sx={{
            marginLeft: 'auto',
            display: {xs: 'none', sm: 'block'},
          }}
        >
          {mainTabValue === 0 && (
            <Button
              variant='outlined'
              size='large'
              startIcon={<AddIcon />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={onCustomDateSaleClick}
            >
              {formatMessage({id: 'finance.sales.action.walkInSale'})}
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default BranchDetailHeader;

BranchDetailHeader.propTypes = {
  // selectedBranch: PropTypes.object.isRequired,
  setSelectedBranch: PropTypes.func,
  mainTabValue: PropTypes.number,
  setMainTabValue: PropTypes.func,
  onCustomDateSaleClick: PropTypes.func,
};
