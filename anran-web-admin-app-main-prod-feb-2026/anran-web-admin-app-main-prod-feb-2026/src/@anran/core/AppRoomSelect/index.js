import React from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import PropTypes from 'prop-types';
import SelectRoomDropdown from './SelectRoomDropdown';

const AppRoomSelect = (props) => {
  const {roomList, selectedRoom, setSelectedRoom} = props;

  // const selectedRoom = useSelector(
  //   ({classroomList}) => classroomList.selectedRoom,
  // );
  console.log('AppRoomSelect-->roomList:', roomList);
  console.log('AppRoomSelect-->selectedRoom:', selectedRoom);

  const onSelectRoom = (value) => {
    setSelectedRoom(value);
  };

  if (roomList == null) {
    return <></>;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flex: 2,
          alignItems: 'center',
        }}
      >
        <span>
          {' '}
          <Typography
            sx={{
              fontWeight: Fonts.BOLD,
              fontSize: 15,
              mb: 0,
            }}
          >
            {'Class Room : '}
          </Typography>
        </span>
        {roomList.length > 0 ? (
          <SelectRoomDropdown
            items={roomList}
            selectedItem={selectedRoom}
            onSelectRoom={onSelectRoom}
          />
        ) : null}
      </Box>
    </>
  );
};

export default AppRoomSelect;

AppRoomSelect.defaultProps = {
  roomList: [],
};

AppRoomSelect.propTypes = {
  roomList: PropTypes.array,
  selectedRoom: PropTypes.object,
  setSelectedRoom: PropTypes.func,
};
