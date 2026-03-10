import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableHeader from '@anran/core/AppTable/TableHeader';
import {Fonts} from 'shared/constants/AppEnums';

const TableHeading = () => {
  return (
    <TableHeader>
      <TableCell sx={{fontWeight: Fonts.BOLD, backgroundColor: '#959ca9'}}>
        #
      </TableCell>
      <TableCell
        align='left'
        sx={{fontWeight: Fonts.BOLD, backgroundColor: '#959ca9'}}
      >
        Fee Description
      </TableCell>
      <TableCell
        align='left'
        sx={{fontWeight: Fonts.BOLD, backgroundColor: '#959ca9'}}
      ></TableCell>
      <TableCell
        align='left'
        sx={{fontWeight: Fonts.BOLD, backgroundColor: '#959ca9'}}
      >
        Amount{' '}
      </TableCell>
    </TableHeader>
  );
};

export default TableHeading;
