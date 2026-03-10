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
import BillStatics from './BillStatics';
import ClassRoomSelect from '../ClassRoomSelect';

const BillingCard = ({data, roomlist}) => {
  const handleSelectionType = (data) => {
    console.log('data: ', data);
  };
  console.log('data: ', data);
  const {messages} = useIntl();
  const [alignment, setAlignment] = React.useState('center');
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const infoData = [
    {
      label: 'Amount Pending',
      value: 'RM15,000',
      color: 'red',
    },
    {
      label: 'Collected',
      value: 'RM8,000',
      color: 'green',
    },
    {
      label: 'Total',
      value: 'RM23,000',
      color: 'orange',
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
      title={'Invoices & Payments'}
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
          <Grid size={{xs: 12, sm: 4, md: 4}} key={'grid-' + index}>
            <InfoWidget data={data} />
          </Grid>
        ))}
        {/* <Grid item xs={12} md={6} xl={6}>
          <InfoWidget />
        </Grid> */}
      </AppGridContainer>
      {/* <Box sx={{m: 4}}></Box> */}
      {/* <StatGraphs data={data} /> */}
      <BillStatics />
    </AppCard>
  );
};
export default BillingCard;

BillingCard.defaultProps = {
  data: [],
};

BillingCard.propTypes = {
  data: PropTypes.array,
  roomlist: PropTypes.array,
};
