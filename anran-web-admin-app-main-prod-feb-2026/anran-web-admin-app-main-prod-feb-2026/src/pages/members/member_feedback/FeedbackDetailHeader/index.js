import React from 'react';
import IntlMessages from '@anran/utility/IntlMessages';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppTooltip from '@anran/core/AppTooltip';
import {styled} from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

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
const FeedbackDetailHeader = (props) => {
  const {setSelectedMember} = props;

  const onClickBackButton = () => {
    setSelectedMember(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
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
          flexGrow: 1,
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <StyledTabs value={0} sx={{display: 'flex', justifyContent: 'center'}}>
          <StyledTab label='FEEDBACK DETAILS' />
        </StyledTabs>
      </Box>
    </Box>
  );
};

export default FeedbackDetailHeader;

FeedbackDetailHeader.propTypes = {
  setSelectedMember: PropTypes.func.isRequired,
};
