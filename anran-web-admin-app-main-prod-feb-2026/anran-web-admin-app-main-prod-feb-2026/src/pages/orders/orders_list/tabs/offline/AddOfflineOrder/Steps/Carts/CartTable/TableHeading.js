import React from 'react';
import TableCell from '@mui/material/TableCell';
import {styled} from '@mui/material/styles';
import {Fonts} from 'shared/constants/AppEnums';
import TableRow from '@mui/material/TableRow';
import IntlMessages from '@anran/utility/IntlMessages';

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
        <IntlMessages id='finance.sales.cart.package' />
      </TableCell>
      <TableCell align='left'>
        <IntlMessages id='finance.sales.cart.unitPrice' />
      </TableCell>
      <TableCell align='left'>
        <IntlMessages id='finance.sales.cart.quantity' />
      </TableCell>
      <TableCell align='left'>
        <IntlMessages id='finance.sales.cart.total' />
      </TableCell>
      <TableCell />
    </TableHeaderRow>
  );
};

export default TableHeading;