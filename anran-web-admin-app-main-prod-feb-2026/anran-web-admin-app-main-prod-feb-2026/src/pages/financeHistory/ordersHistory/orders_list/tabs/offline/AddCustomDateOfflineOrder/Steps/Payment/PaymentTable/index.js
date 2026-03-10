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

const CartTable = ({
  paymentItems,
  onRemoveItem,
  onChangeAmount,
  onChangeReference,
  payMethodList,
  onAddRow,
  onSelectPayMethod,
}) => {
  const {formatMessage} = useIntl();
  console.log(paymentItems);
  return (
    <AppTableContainer>
      <Table stickyHeader className='table'>
        <TableHead>
          <TableHeading />
        </TableHead>
        {paymentItems?.length > 0 ? (
          <TableBody>
            {paymentItems.map((data, index) => (
              <TableItem
                data={data}
                rowIndex={index}
                paymentItemsLength={paymentItems.length} // Pass the length of the payment items
                key={index}
                onRemoveItem={onRemoveItem}
                onChangeAmount={onChangeAmount}
                onChangeReference={onChangeReference}
                payMethodList={payMethodList}
                onAddRow={onAddRow}
                onSelectPayMethod={onSelectPayMethod}
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
  paymentItems: PropTypes.array,
  onChangeAmount: PropTypes.func,
  onRemoveItem: PropTypes.func,
  onChangeReference: PropTypes.func,
  payMethodList: PropTypes.array,
  onAddRow: PropTypes.func,
  onSelectPayMethod: PropTypes.func,
};