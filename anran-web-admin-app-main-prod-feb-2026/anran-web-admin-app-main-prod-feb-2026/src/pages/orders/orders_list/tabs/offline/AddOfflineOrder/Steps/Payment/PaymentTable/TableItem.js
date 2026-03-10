import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import {Tooltip, Box, TextField, MenuItem, Select, IconButton} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import {Fonts} from 'shared/constants/AppEnums';
import {styled} from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import {useIntl} from 'react-intl';

const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
  padding: 8,
  '&:first-of-type': {
    paddingLeft: 20,
  },
  '&:last-of-type': {
    paddingRight: 20,
  },
}));
const TableItem = ({data, rowIndex, paymentItemsLength, onRemoveItem, onChangeAmount, onChangeReference, payMethodList, onAddRow, onSelectPayMethod}) => {
  const {formatMessage} = useIntl();
  const paymentLabelMap = {
    2: formatMessage({id: 'finance.sales.paymentMethod.onlineBanking'}),
    4: formatMessage({id: 'finance.sales.paymentMethod.ewallet'}),
    6: formatMessage({id: 'finance.sales.paymentMethod.visa'}),
    7: formatMessage({id: 'finance.sales.paymentMethod.master'}),
    8: formatMessage({id: 'finance.sales.paymentMethod.amex'}),
    9: formatMessage({id: 'finance.sales.paymentMethod.others'}),
    5: formatMessage({id: 'finance.sales.paymentMethod.deposit'}),
  };
  return (
    <TableRow key={data.uuid} className='item-hover'>
      <StyledTableCell>
        {data.id === 5 ? (
          <Select
            variant='standard'
            fullWidth
            value="Deposit"
            disabled
            renderValue={() => formatMessage({id: 'finance.sales.paymentMethod.deposit'})}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value='Deposit'>
              {formatMessage({id: 'finance.sales.paymentMethod.deposit'})}
            </MenuItem>
          </Select>
        ) : (
          <Select
            fullWidth
            variant='standard'
            value={data.id || ''}
            onChange={(e) => {
              const selectedPayMethod = payMethodList.find((method) => method.id === e.target.value);
              onSelectPayMethod(selectedPayMethod, rowIndex);
            }}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value='' disabled>
              {formatMessage({id: 'finance.sales.paymentMethod.select'})}
            </MenuItem>
            {payMethodList
              .filter((method) => method.id !== 5)
              .map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {paymentLabelMap[method.id] ?? method.name}
                </MenuItem>
              ))}
          </Select>
        )}
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        <TextField
          fullWidth
          type='number'
          sx={{minWidth: 50}}
          variant='standard'
          value={data?.amount}
          disabled={data.id === 5} // Disable amount input for deposit row
          slo
          placeholder={formatMessage({id: 'finance.sales.paymentMethod.amountPlaceholder'})}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>RM</InputAdornment>
              ),
              sx: {
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                  {
                    display: 'none',
                  },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              },
            },
          }}
          onFocus={(e) =>
            e.target.addEventListener(
              'wheel',
              function (e) {
                e.preventDefault();
              },
              {passive: false},
            )
          }
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
            onChangeAmount(data.uuid, value); // Pass uuid to update the specific row
          }}
        />
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        <TextField
          fullWidth
          type='text'
          sx={{minWidth: 50}}
          variant='standard'
          value={data?.reference}
          slo
          placeholder={formatMessage({id: 'finance.sales.paymentMethod.referencePlaceholder'})}
          onChange={(e) => {
            onChangeReference(data, e.target.value);
          }}
        />
      </StyledTableCell>
      <StyledTableCell component='th' scope='row' align='center'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', // Align items horizontally in the center
            alignItems: 'center', // Align items vertically in the center
            gap: 2, // Add spacing between the icons
          }}
        >
          {paymentItemsLength > 1 && (
            <Tooltip
              title={formatMessage({id: 'finance.sales.paymentMethod.remove'})}
              arrow
            >
              <IconButton onClick={() => onRemoveItem(data.uuid)}>
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title={formatMessage({id: 'finance.sales.paymentMethod.add'})}
            arrow
          >
            <IconButton onClick={onAddRow}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledTableCell>
    </TableRow>
  );
};

export default TableItem;

TableItem.propTypes = {
  data: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
  paymentItemsLength: PropTypes.number.isRequired,
  setTableData: PropTypes.func,
  onChangeAmount: PropTypes.func,
  onRemoveItem: PropTypes.func,
  onChangeReference: PropTypes.func,
  payMethodList: PropTypes.array,
  onAddRow: PropTypes.func,
  onSelectPayMethod: PropTypes.func,
};