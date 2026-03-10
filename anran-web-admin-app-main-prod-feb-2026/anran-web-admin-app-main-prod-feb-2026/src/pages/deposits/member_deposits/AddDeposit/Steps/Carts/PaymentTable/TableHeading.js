import React from 'react';
import TableCell from '@mui/material/TableCell';
import {styled} from '@mui/material/styles';
import {Fonts} from 'shared/constants/AppEnums';
import TableRow from '@mui/material/TableRow';
import {useIntl} from 'react-intl';

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
  const {formatMessage} = useIntl();
  return (
    <TableHeaderRow>
      <TableCell sx={{color: 'white'}} align='left'>
        {formatMessage({id: 'finance.sales.paymentMethod.paidMethod'})}
      </TableCell>
      <TableCell align='left'>
        {formatMessage({id: 'finance.sales.paymentMethod.paidAmount'})}
      </TableCell>
      <TableCell align='left'>
        {formatMessage({id: 'finance.sales.paymentMethod.paymentReference'})}
      </TableCell>
      <TableCell />
    </TableHeaderRow>
  );
};

export default TableHeading;