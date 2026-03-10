import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Box} from '@mui/material';
import Grid from '@mui/material/Grid2';
// import StatGraphs from './StatGraphs';
import AppCard from '@anran/core/AppCard';
import AppSelect from '@anran/core/AppSelect';
import {useIntl} from 'react-intl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AppGridContainer from '@anran/core/AppGridContainer';
import InfoWidget from './InfoWidget';
import InfoWidgetWithIcon from './InfoWidgetWithIcon';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WifiCalling3Icon from '@mui/icons-material/WifiCalling3';
import ChatIcon from '@mui/icons-material/Chat';
import ClassRoomSelect from '../ClassRoomSelect';

const EnrollmentCard = ({data, roomlist}) => {
  const handleSelectionType = (data) => {
    console.log('data: ', data);
  };
  console.log('data: ', data);
  const {messages} = useIntl();
  const [alignment, setAlignment] = React.useState('center');
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const infoData = [
    {
      label: 'New Enquires',
      value: '10',
      color: '#000000de',
    },
    {
      label: 'Follow Up',
      value: '20',
      color: '#000000de',
    },
    {
      label: 'Overdue follow Up',
      value: '30',
      color: '#000000de',
    },
    {
      label: 'Enrolled',
      value: '50',
      color: '#000000de',
    },
  ];
  const infoData1 = [
    {
      label: 'Calls',
      value: '10',
      color: '#000000de',
      icon: <WifiCalling3Icon sx={{fontSize: 25, color: '#f13d05'}} />,
    },
    {
      label: 'Visit',
      value: '20',
      color: '#000000de',
      icon: <VisibilityIcon sx={{fontSize: 25, color: '#f13d05'}} />,
    },
    {
      label: 'Message',
      value: '30',
      color: '#000000de',
      icon: <ChatIcon sx={{fontSize: 25, color: '#f13d05'}} />,
    },
  ];

  useEffect(() => {
    if (roomlist) {
      if (roomlist.length > 0) {
        setSelectedRoom(roomlist[0]);
      } else {
        setSelectedRoom(null);
      }
    }
  }, [roomlist]);

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  return (
    <AppCard
      sxStyle={{height: 1}}
      title={'Enrollments'}
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
        {alignment != 'center' && (
          <ClassRoomSelect
            rooms={roomlist}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            displayLabel={false}
          />
        )}
        <Box sx={{flex: 1}}></Box>
      </Box>
      <AppGridContainer>
        {infoData.map((data, index) => (
          <Grid size={{xs: 12, sm: 6, md: 6}} key={'grid-' + index}>
            <InfoWidget data={data} />
          </Grid>
        ))}
        {infoData1.map((data, index) => (
          <Grid size={{xs: 12, sm: 6, md: 6}} key={'grid-' + index}>
            <InfoWidgetWithIcon data={data} />
          </Grid>
        ))}
        {/* <Grid item xs={12} md={6} xl={6}>
          <InfoWidget />
        </Grid> */}
      </AppGridContainer>
      {/* <Box sx={{m: 4}}></Box> */}
      {/* <StatGraphs data={sampleData} /> */}
    </AppCard>
  );
};
export default EnrollmentCard;

EnrollmentCard.defaultProps = {
  data: [],
};

EnrollmentCard.propTypes = {
  data: PropTypes.array,
  roomlist: PropTypes.array,
};
