import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {Fonts} from 'shared/constants/AppEnums';
import {styled} from '@mui/material/styles';
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
const TableItem = ({data, onRemoveItem, onIncrement, onDecrement}) => {
  const {formatMessage} = useIntl();
  return (
    <TableRow key={data.name} className='item-hover'>
      <StyledTableCell>
        <Box display='flex'>
          <Avatar sx={{mr: 3.5}} src={data.packageImageURL || data.image} />
          <Box>
            <Box fontSize={14} fontWeight={Fonts.MEDIUM}>
              {data.packageName}
            </Box>
            <Box color='text.secondary' fontSize={14}>
              {data.packageUnlimitedStatus
                ? formatMessage(
                    {id: 'finance.sales.package.unlimited'},
                    {validity: data.packageValidity},
                  )
                : formatMessage(
                    {id: 'finance.sales.package.limited'},
                    {
                      count: data.packageUsageLimit,
                      validity: data.packageValidity,
                    },
                  )}
            </Box>
          </Box>
        </Box>
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        RM {data.packagePrice}
      </StyledTableCell>
      <StyledTableCell align='left'>
        <Box
          border={1}
          borderRadius={4}
          display='flex'
          borderColor='text.secondary'
          alignItems='center'
          justifyContent='center'
          width={100}
          height={36}
        >
          <AddIcon className='pointer' onClick={() => onIncrement(data)} />
          <Box component='span' px={3}>
            {data.qty}
          </Box>
          <RemoveIcon className='pointer' onClick={() => onDecrement(data)} />
        </Box>
        {data.qty == data.allowedQty && (
          <>{formatMessage({id: 'finance.sales.cart.maxReached'})}</>
        )}
      </StyledTableCell>
      <StyledTableCell align='left' fontWeight={Fonts.MEDIUM}>
        RM {parseFloat(data.packagePrice * +data.qty).toFixed(2)}
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
  onDecrement: PropTypes.func,
  onIncrement: PropTypes.func,
  onRemoveItem: PropTypes.func,
};