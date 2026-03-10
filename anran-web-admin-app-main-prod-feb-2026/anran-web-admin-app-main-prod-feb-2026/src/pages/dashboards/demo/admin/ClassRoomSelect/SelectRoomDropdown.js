import React, {useState} from 'react';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {StyledSelect} from './index.style';

const SelectRoomDropdown = ({items, selectedItem, onSelectRoom}) => {
  const [selectedRoomId, setSelectedRoomId] = useState(selectedItem.id);

  const onChangeSelectValue = (event) => {
    setSelectedRoomId(event.target.value);
    const filteredItem = items.filter((item) => item.id == event.target.value);

    onSelectRoom(filteredItem[0]);
  };

  return (
    <Box
      sx={{
        mr: {xs: 2, xl: 4},
      }}
      component='span'
    >
      <StyledSelect value={selectedRoomId} onChange={onChangeSelectValue}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <MenuItem
              key={index}
              value={item.id}
              sx={{
                padding: 2,
                cursor: 'pointer',
                minHeight: 'auto',
              }}
            >
              {item.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem
            key={0}
            value={0}
            sx={{
              padding: 2,
              cursor: 'pointer',
              minHeight: 'auto',
            }}
          >
            No Room
          </MenuItem>
        )}
      </StyledSelect>
    </Box>
  );
};

export default SelectRoomDropdown;

SelectRoomDropdown.propTypes = {
  onSelectRoom: PropTypes.func,
  items: PropTypes.array,
  selectedItem: PropTypes.object,
};
