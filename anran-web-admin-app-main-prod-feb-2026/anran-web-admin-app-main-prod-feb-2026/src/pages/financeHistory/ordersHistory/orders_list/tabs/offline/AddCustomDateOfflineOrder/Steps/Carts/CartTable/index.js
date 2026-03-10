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
import {useIntl} from 'react-intl';

const CartTable = ({cartItems, onRemoveItem, onIncrement, onDecrement}) => {
  const {formatMessage} = useIntl();
  return (
    <AppTableContainer>
      <Table stickyHeader className='table'>
        <TableHead>
          <TableHeading />
        </TableHead>
        {cartItems?.length > 0 ? (
          <TableBody>
            {cartItems.map((data) => (
              <TableItem
                data={data}
                key={data.id}
                onRemoveItem={onRemoveItem}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
              />
            ))}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow>
              <TableCell align='center' colSpan={5}>
                {formatMessage({id: 'finance.sales.paymentMethod.noItems'})}
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
  cartItems: PropTypes.array,
  onDecrement: PropTypes.func,
  onIncrement: PropTypes.func,
  onRemoveItem: PropTypes.func,
};