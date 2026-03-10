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
// import InfoWidget from './InfoWidget';
import StatsCard from './StatsCard';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
// import PageviewIcon from '@mui/icons-material/Pageview';
// import {useGetMockDataApi} from '@anran/utility/APIHooksMock';
import ClassRoomSelect from '../ClassRoomSelect';
import staffData from '@anran/services/db/dashboard/staff';

const AttendanceCard = ({roomlist}) => {
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [dashboardData, setDashboardData] = React.useState(null);

  // const [{apiData: dashboardData}, {setQueryParams}] = useGetMockDataApi(
  //   '/dashboard/staff/quick',
  //   {},
  //   {},
  //   false,
  // );

  // console.log('dashboardData', dashboardData);

  useEffect(() => {
    if (selectedRoom) {
      // setQueryParams({id: selectedRoom?.id});
      const response = staffData.find(
        (data) => data.id === parseInt(selectedRoom?.id),
      );
      setDashboardData(response);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (roomlist) {
      if (roomlist.length > 0) {
        setSelectedRoom(roomlist[0]);
      } else {
        setSelectedRoom(null);
      }
    }
  }, [roomlist]);

  const handlePeriodType = (data) => {
    console.log('data: ', data);
  };

  const {messages} = useIntl();
  const [alignment, setAlignment] = React.useState('center');

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  return (
    <>
      {dashboardData?.data && (
        <AppCard
          sxStyle={{height: 1}}
          title={'Attendance'}
          titleStyle={{mt: 0}}
          action={
            <AppSelect
              menus={[
                messages['dashboard.today'],
                messages['dashboard.thisWeek'],
                messages['dashboard.thisMonth'],
              ]}
              defaultValue={messages['dashboard.today']}
              onChange={handlePeriodType}
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
            <Grid size={12}>
              <StatsCard
                icon={
                  <EventAvailableIcon sx={{fontSize: 28, color: '#49BD65'}} />
                }
                data={dashboardData?.data.attendanceState[0]}
                heading={dashboardData?.data.attendanceState[0].type}
                bgColor={'#49BD65'}
              />
            </Grid>
            <Grid size={12}>
              <StatsCard
                icon={<EventBusyIcon sx={{fontSize: 28, color: '#f13d05'}} />}
                data={dashboardData?.data.attendanceState[1]}
                heading={dashboardData?.data.attendanceState[1].type}
                bgColor={'#f13d05'}
              />
            </Grid>
            <Grid size={12}>
              <StatsCard
                icon={
                  <SentimentVeryDissatisfiedIcon
                    sx={{fontSize: 28, color: '#f17205'}}
                  />
                }
                data={dashboardData?.data.attendanceState[2]}
                heading={dashboardData?.data.attendanceState[2].type}
                bgColor={'#f17205'}
              />
            </Grid>
          </AppGridContainer>
        </AppCard>
      )}
    </>
  );
};
export default AttendanceCard;

AttendanceCard.defaultProps = {
  data: [],
};

AttendanceCard.propTypes = {
  data: PropTypes.array,
  roomlist: PropTypes.array,
};
