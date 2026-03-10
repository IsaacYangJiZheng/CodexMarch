import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import {styled} from '@mui/material/styles';
import {formatCurrency} from '@anran/utility/helper/StringHelper';

const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
  width: 'fit-content',
  padding: 8,
  '&:first-of-type': {
    paddingLeft: 20,
  },
  '&:last-of-type': {
    paddingRight: 20,
  },
}));

const TableItem = ({data, currencyData, index}) => {
  return (
    <TableRow
      key={data?.id}
      sx={{
        position: 'relative',
        '.closeBtn': {
          display: 'none',
        },
        '&:hover': {
          '.closeBtn': {
            display: 'block',
          },
        },
      }}
    >
      <StyledTableCell align='left'>
        <Box sx={{display: 'flex', alignItems: 'center'}}>{index + 1}</Box>
      </StyledTableCell>
      <StyledTableCell>{data?.feeDescription}</StyledTableCell>
      {/* <StyledTableCell>{data?.discount ? 'Discount' : ''}</StyledTableCell> */}
      {/* <StyledTableCell align='left'>
        {data?.duration?.from} To {data?.duration?.to}
      </StyledTableCell> */}
      {/* <StyledTableCell align='left'>
        {data?.quantity?.value}{' '}
        {data?.quantity?.type !== 'fixed' &&
          `${data?.quantity?.type}${data?.quantity?.value > 1 ? 's' : ''}`}
      </StyledTableCell> */}
      {/* <StyledTableCell>
        {data?.unitPrice}{' '}
        {data?.quantity?.type !== 'fixed' ? `per ${data?.quantity?.type}` : ''}
      </StyledTableCell> */}
      <StyledTableCell align='left'>
        {data?.discount?.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{fontWeight: 'bold'}}>Discounts</Box>
              <Box sx={{textDecoration: 'line-through'}}>
                {formatCurrency(data?.orgAmount, {}, 2)}
              </Box>
            </Box>
            {data.discount.map((dis, index) => (
              <Box
                key={'dis' + index}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {dis.discountType == 'percent' && (
                  <Box sx={{color: 'green'}}>
                    {dis.discountValue} % {dis.discountCode.name}
                  </Box>
                )}
                {dis.discountType == 'dollar' && (
                  <Box sx={{color: 'green'}}>{dis.discountCode.name}</Box>
                )}

                <Box>{formatCurrency(dis.discountAmt, {}, 2)}</Box>
              </Box>
            ))}
          </Box>
        )}
      </StyledTableCell>

      <StyledTableCell align='left' sx={{width: '30px'}}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {formatCurrency(
            data?.feeAmount || 0,
            {
              language: currencyData.language,
              currency: currencyData.currency,
            },
            2,
          )}
        </Box>
      </StyledTableCell>
    </TableRow>
  );
};

export default TableItem;

TableItem.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number,
  currencyData: PropTypes.object,
};
