import React from 'react';
import TableCell from '@mui/material/TableCell';
import {styled} from '@mui/material/styles';
import {Fonts} from 'shared/constants/AppEnums';
import TableRow from '@mui/material/TableRow';

const TableHeaderRow = styled(TableRow)(() => {
  return {
    '& th': {
      fontSize: 14,
      padding: 8,
      fontWeight: Fonts.SEMI_BOLD,
      color: 'white',
      '&:first-of-type': {
        paddingLeft: 20,
      },
      '&:last-of-type': {
        paddingRight: 20,
      },
    },
  };
});

const TableHeading = () => {
  return (
    <TableHeaderRow>
      <TableCell sx={{color: 'white'}} align='left'>
        Paid Method
      </TableCell>
      <TableCell align='left'>Paid Amount</TableCell>
      <TableCell align='left'>Payment Reference</TableCell>
      <TableCell />
    </TableHeaderRow>
  );
};

export default TableHeading;
