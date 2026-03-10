import React from 'react';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import PropTypes from 'prop-types';
import SelectRoomDropdown from './SelectRoomDropdown';

const ClassRoomSelect = (props) => {
  const {rooms, selectedRoom, onSelectRoom, displayLabel} = props;

  const onSelectRoomClick = (value) => {
    console.log('checkedRoom:', selectedRoom, value);
    onSelectRoom(value);
  };

  if (rooms == null) {
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
        {displayLabel ? (
          <span>
            {' '}
            <Typography
              sx={{
                fontWeight: Fonts.BOLD,
                fontSize: 15,
                mb: 0,
              }}
            >
              {' '}
              Viewing Class Room :
            </Typography>{' '}
          </span>
        ) : null}

        {rooms.length > 0 ? (
          <SelectRoomDropdown
            items={rooms}
            selectedItem={selectedRoom}
            onSelectRoom={onSelectRoomClick}
          />
        ) : null}
      </Box>
    </>
  );
};

export default ClassRoomSelect;

ClassRoomSelect.defaultProps = {
  displayLabel: true,
};

ClassRoomSelect.propTypes = {
  selectedRoom: PropTypes.object,
  onSelectRoom: PropTypes.func,
  rooms: PropTypes.array,
  displayLabel: PropTypes.bool,
};
