import React from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHeading from './TableHeading';
import TableItem from './TableItem';
import AppTableContainer from '@anran/core/AppTableContainer';
import PropTypes from 'prop-types';

const CartTable = ({paymentItems, onRemoveItem, onChangeAmount, onChangeReference}) => {
  return (
    <AppTableContainer>
      <Table stickyHeader className='table'>
        <TableHead>
          <TableHeading />
        </TableHead>
        {paymentItems?.length > 0 ? (
          <TableBody>
            {paymentItems.map((data) => (
              <TableItem
                data={data}
                key={data.id}
                onRemoveItem={onRemoveItem}
                onChangeAmount={onChangeAmount}
                onChangeReference={onChangeReference}
              />
            ))}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={5}>
                No Items
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>
    </AppTableContainer>
  );
};

export default CartTable;

CartTable.propTypes = {
  paymentItems: PropTypes.array,
  onChangeAmount: PropTypes.func,
  onChangeReference: PropTypes.func,
  onRemoveItem: PropTypes.func,
};
