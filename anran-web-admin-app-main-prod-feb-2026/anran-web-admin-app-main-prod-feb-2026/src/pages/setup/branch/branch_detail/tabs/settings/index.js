import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// import IntlMessages from '@anran/utility/IntlMessages';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import RoomPreferencesOutlinedIcon from '@mui/icons-material/RoomPreferencesOutlined';
import StaffTabsWrapper from './StaffTabsWrapper';
import BranchPayment from './PaymentGateway';
import BranchTax from './Taxing';
import AppAnimate from '@anran/core/AppAnimate';
// import {MailDetailSkeleton} from '@anran/core/AppSkeleton/MailDetailSkeleton';
import {useAuthUser} from '@anran/utility/AuthHooks';
// import {useGetDataApi} from '@anran/utility/APIHooks';
import AppInfoView from '@anran/core/AppInfoView';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const setUptabs = [
  {
    id: 1,
    icon: <ManageAccountsOutlinedIcon />,
    name: 'Tax Setting',
  },
  {
    id: 2,
    icon: <RoomPreferencesOutlinedIcon />,
    name: 'Payment Gateway',
  },
  // {
  //   id: 2,
  //   icon: <LocalPoliceOutlinedIcon />,
  //   name: <IntlMessages id='common.role' />,
  // },
  // {
  //   id: 3,
  //   icon: <RoomPreferencesOutlinedIcon />,
  //   name: <IntlMessages id='common.classroom' />,
  // },
];

const BranchSettings = ({selectedBranch}) => {
  const {user} = useAuthUser();
  console.log('useAuthUser:', user);
  console.log('selectedStaff', selectedBranch);

  const [value, setValue] = React.useState(0);

  // const [{apiData: staffData}, {setQueryParams}] = useGetDataApi(
  //   'api/branch/full',
  //   undefined,
  //   {id: selectedBranch.id},
  //   true,
  // );

  // useEffect(() => {
  //   if (selectedBranch) {
  //     setQueryParams({id: selectedBranch.id});
  //   }
  // }, [selectedBranch]);

  const onTabsChange = (event, newValue) => {
    setValue(newValue);
  };

  // if (!staffData) {
  //   return <MailDetailSkeleton />;
  // }

  return (
    <>
      <AppAnimate animation='transition.slideUpIn' delay={200}>
        <StaffTabsWrapper>
          <Tabs
            className='staff-tabs'
            value={value}
            onChange={onTabsChange}
            aria-label='basic tabs example'
            orientation='vertical'
            sx={{borderRight: 1, borderColor: 'divider'}}
          >
            {/* <StaffProfile data={selectedStaff.info} /> */}
            {setUptabs.map((tab, index) => (
              <Tab
                className='staff-tab'
                label={tab.name}
                icon={tab.icon}
                key={index}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
          <Box className='staff-tabs-content'>
            {value === 0 && <BranchTax selectedBranch={selectedBranch} />}
            {value === 1 && <BranchPayment selectedBranch={selectedBranch} />}
          </Box>
        </StaffTabsWrapper>
      </AppAnimate>
      <AppInfoView />
    </>
  );
};

export default BranchSettings;

BranchSettings.propTypes = {
  selectedBranch: PropTypes.object,
};
