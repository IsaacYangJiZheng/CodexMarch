import React from 'react';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import AppCard from '@anran/core/AppCard';
import AppSelect from '@anran/core/AppSelect';
import {useIntl} from 'react-intl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {MeterGroup} from 'primereact/metergroup';

const actData = [
  {
    id: 1,
    label: 'Total Booking',
    value: '10',
    color: 'red',
  },
  {
    id: 2,
    label: 'Packages Sold',
    value: '30',
    color: 'orange',
  },
  {
    id: 3,
    label: 'Staff on Duty',
    value: '5',
    color: 'blue',
  },
  {
    id: 4,
    label: 'Staff on Leave',
    value: '7',
    color: 'yellow',
  },
  {
    id: 5,
    label: 'Serviced Customer',
    value: '1',
    color: 'pink',
  },
];

const ActivitiesCard = ({data}) => {
  const handleSelectionType = (data) => {
    console.log('data: ', data);
  };
  console.log('data: ', data);
  const {messages} = useIntl();
  const [alignment, setAlignment] = React.useState('center');

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <AppCard
      sxStyle={{height: 1}}
      title={messages['dashboard.admin.DailyActivities']}
      titleStyle={{mt: 0}}
      action={
        <AppSelect
          menus={[
            messages['dashboard.today'],
            messages['dashboard.thisWeek'],
            messages['dashboard.thisMonth'],
          ]}
          defaultValue={messages['dashboard.today']}
          onChange={handleSelectionType}
        />
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 1,
        }}
      >
        <ToggleButtonGroup
          color='primary'
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label='Platform'
        >
          <ToggleButton
            sx={{padding: '2px', borderRadius: '0px'}}
            value='center'
          >
            Over All
          </ToggleButton>
          <ToggleButton
            sx={{padding: '2px', borderRadius: '0px'}}
            value='class'
          >
            By Branch
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{flex: 1}}></Box>
      </Box>
      <Box sx={{m: 4}}>
        <MeterGroup
          values={actData}
          labelPosition='start'
          labelOrientation='vertical'
        />
      </Box>
    </AppCard>
  );
};
export default ActivitiesCard;

ActivitiesCard.defaultProps = {
  data: [],
};

ActivitiesCard.propTypes = {
  data: PropTypes.array,
  roomlist: PropTypes.array,
};
