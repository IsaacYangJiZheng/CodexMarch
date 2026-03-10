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
      <TableCell sx={{color: 'white', width: '30%'}} align='left'>
        <IntlMessages id='finance.sales.paymentMethod.paidMethod' />
      </TableCell>
      <TableCell sx={{width: '20%'}} align='left'>
        <IntlMessages id='finance.sales.paymentMethod.paidAmount' />
      </TableCell>
      <TableCell sx={{width: '35%'}} align='left'>
        <IntlMessages id='finance.sales.paymentMethod.paymentReference' />
      </TableCell>
      <TableCell sx={{width: '15%'}} align='center'>
        <IntlMessages id='finance.sales.paymentMethod.actions' />
      </TableCell>
    </TableHeaderRow>
  );
};

export default TableHeading;