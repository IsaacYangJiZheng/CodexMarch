import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Tabs, Tab, Box} from '@mui/material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import StaffTabsWrapper from './StaffTabsWrapper';
import AppAccess from './AppAccess';
import AppAnimate from '@anran/core/AppAnimate';
import {useAuthUser} from '@anran/utility/AuthHooks';
import AppInfoView from '@anran/core/AppInfoView';
import {useIntl} from 'react-intl';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const StaffSettings = ({rawData, reCallAPI, roleOptions, branchOptions}) => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  console.log('useAuthUser:', user);

  const [value, setValue] = useState(0);
  const setUptabs = [
    {
      id: 1,
      icon: <ManageAccountsOutlinedIcon />,
      name: formatMessage({id: 'staff.settings.tabs.appAccess'}),
    },
  ];

  const onTabsChange = (event, newValue) => {
    setValue(newValue);
  };

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
            {value === 0 && (
              <AppAccess
                rawData={rawData}
                roleOptions={roleOptions}
                branchOptions={branchOptions}
                reCallAPI={reCallAPI}
              />
            )}
          </Box>
        </StaffTabsWrapper>
      </AppAnimate>
      <AppInfoView />
    </>
  );
};

export default StaffSettings;

StaffSettings.propTypes = {
  rawData: PropTypes.object,
  branchOptions: PropTypes.array,
  roleOptions: PropTypes.array,
  reCallAPI: PropTypes.func,
};