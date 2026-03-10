import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Box, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {Toast} from 'primereact/toast';
import {useGetDataApi} from '@anran/utility/APIHooks';
import AppAnimate from '@anran/core/AppAnimate';
import AppScrollbar from '@anran/core/AppScrollbar';
import dayjs from 'dayjs';
import TransferIn from './tabs/transferIn';
import TransferOut from './tabs/transferOut';
import IntlMessages from '@anran/utility/IntlMessages';

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
    backgroundColor: '#004d40',
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({theme}) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: '#004d40',
    borderRadius: theme.shape.borderRadius,
    '&.Mui-selected': {
      color: '#fff',
      backgroundColor: '#004d40',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 77, 64, 0.1)',
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'rgba(0, 77, 64, 0.2)',
    },
  }),
);

export default function TransferSession({selectedMember}) {
  const toast = useRef(null);
  const [transferSessionTabValue, setTransferSessionTabValue] =
    React.useState(0);

  const [{apiData: transferData, loading}] = useGetDataApi(
    `/api/transfer/transferSessions/${selectedMember._id}`,
    {},
    {},
    true,
  );

  const onTransferSessionTabsChange = (event, newValue) => {
    setTransferSessionTabValue(newValue);
  };

  const dateBodyTemplate = (rowData) => {
    return (
      <Typography>
        {dayjs(rowData.transferDate).format('DD-MM-YYYY')}
      </Typography>
    );
  };

  return (
    <Box>
      <Toast ref={toast} />
      <StyledTabs
        value={transferSessionTabValue}
        onChange={onTransferSessionTabsChange}
        aria-label='icon label tabs example'
      >
        <StyledTab label={<IntlMessages id='member.transfer.in' />} />
        <StyledTab label={<IntlMessages id='member.transfer.out' />} />
      </StyledTabs>
      <AppScrollbar
        sx={{
          height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
        }}
      >
        <AppAnimate animation='transition.slideUpIn' delay={200}>
          {transferSessionTabValue === 0 && (
            <Box sx={{mt: 7}}>
              <TransferIn
                transferData={transferData}
                loading={loading}
                dateBodyTemplate={dateBodyTemplate}
              />
            </Box>
          )}
          {transferSessionTabValue === 1 && (
            <Box sx={{mt: 7}}>
              <TransferOut
                transferData={transferData}
                loading={loading}
                dateBodyTemplate={dateBodyTemplate}
              />
            </Box>
          )}
        </AppAnimate>
      </AppScrollbar>
    </Box>
  );
}

TransferSession.propTypes = {
  selectedMember: PropTypes.object,
};