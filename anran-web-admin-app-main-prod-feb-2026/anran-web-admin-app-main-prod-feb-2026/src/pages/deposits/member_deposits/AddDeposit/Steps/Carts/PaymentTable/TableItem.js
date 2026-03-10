import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import {Box, TextField} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
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
const TableItem = ({data, onRemoveItem, onChangeAmount, onChangeReference}) => {
  const {formatMessage} = useIntl();
  return (
    <TableRow key={data.name} className='item-hover'>
      <StyledTableCell>
        <Box display='flex'>
          <Box>
            <Box fontSize={14} fontWeight={Fonts.MEDIUM}>
              {data.displayName || data.name}
            </Box>
          </Box>
        </Box>
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        <TextField
          type='number'
          sx={{minWidth: 50}}
          variant='standard'
          value={data?.amount}
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
            if (e.target.value == '') {
              onChangeAmount(data, 0);
            } else {
              onChangeAmount(data, parseFloat(e.target.value));
            }
          }}
        />
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        <TextField
          type='text'
          sx={{minWidth: 50}}
          variant='standard'
          value={data?.reference}
          slo
          placeholder={formatMessage({
            id: 'finance.sales.paymentMethod.referencePlaceholder',
          })}
          onChange={(e) => {
            onChangeReference(data, e.target.value);
          }}
        />
      </StyledTableCell>
      <StyledTableCell component='th' scope='row'>
        <CancelIcon onClick={() => onRemoveItem(data)} />
      </StyledTableCell>
    </TableRow>
  );
};

export default TableItem;

TableItem.propTypes = {
  data: PropTypes.object.isRequired,
  setTableData: PropTypes.func,
  onChangeAmount: PropTypes.func,
  onChangeReference: PropTypes.func,
  onRemoveItem: PropTypes.func,
};