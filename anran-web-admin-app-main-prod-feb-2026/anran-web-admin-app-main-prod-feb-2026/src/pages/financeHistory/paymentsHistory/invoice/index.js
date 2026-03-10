import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppTooltip from '@anran/core/AppTooltip';
import IntlMessages from '@anran/utility/IntlMessages';
import Logo from './image/anran_invoice.png';
import invoiceData from './data/dummy_invoice.json';

const InvoicePage = ({setSelectedRow}) => {
  const onClickBackButton = () => {
    setSelectedRow(null);
  };
  return (
    <Card variant='outlined'>
      <Box sx={{backgroundColor: '#00968814', p: 5}}>
        <Box
          sx={{
            cursor: 'pointer',
          }}
          component='span'
          mr={{xs: 2, sm: 4}}
          onClick={onClickBackButton}
        >
          <AppTooltip title={<IntlMessages id='common.back' />}>
            <ArrowBackIcon
              sx={{
                color: (theme) => theme.palette.primary.main,
              }}
            />
          </AppTooltip>
        </Box>
        <Container>
          <Grid container spacing={2}>
            {/* Logo and Company Name */}
            <Grid item xs={12} sm={2} align='center'>
              <img
                src={Logo}
                alt='Company Logo'
                style={{width: '100%', maxWidth: '130px'}}
              />
            </Grid>
            <Grid item xs={12} sm={7} align='left' alignContent={'center'}>
              <Typography
                variant='h5'
                sx={{fontSize: {xs: '24px', md: '40px'}}}
              >
                ANRAN WELLNESS
              </Typography>
              <Typography
                variant='h5'
                sx={{fontSize: {xs: '24px', md: '40px'}}}
              >
                安然纳米汗蒸养生馆
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} align='center'>
              <Typography
                variant='h4'
                sx={{fontSize: {xs: '30px', md: '50px'}}}
              >
                INVOICE
              </Typography>
              <Table size='small'>
                <TableBody>
                  <TableRow>
                    <TableCell
                      sx={{padding: '1px', border: 'none'}}
                      align='right'
                    >
                      Invoice #:
                    </TableCell>
                    <TableCell sx={{padding: '1px', border: 'none'}}>
                      {invoiceData.invoiceNumber}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{padding: '1px', border: 'none'}}
                      align='right'
                    >
                      Invoice date:
                    </TableCell>
                    <TableCell sx={{padding: '1px', border: 'none'}}>
                      {invoiceData.invoiceDate}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{padding: '1px', border: 'none'}}
                      align='right'
                    >
                      Branch:
                    </TableCell>
                    <TableCell sx={{padding: '1px', border: 'none'}}>
                      {invoiceData.branch}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          {/* Customer & Billing Information */}
          <Grid container style={{marginTop: '20px'}} spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid mb={3}>
                <Typography
                  variant='button'
                  sx={{fontSize: {xs: '12px', md: '15px'}}}
                >
                  Customer ID
                </Typography>
                <Typography>
                  <strong>{invoiceData.customerId}</strong>
                </Typography>
              </Grid>
              <Grid mb={3}>
                <Typography
                  variant='button'
                  sx={{fontSize: {xs: '12px', md: '15px'}}}
                >
                  Sales Consultant
                </Typography>
                <Typography>
                  <strong>{invoiceData.salesConsultant}</strong>
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant='button'
                sx={{fontSize: {xs: '12px', md: '15px'}}}
              >
                Billed To
              </Typography>
              <Typography>
                <strong>{invoiceData.paymentMethod}</strong>
              </Typography>
              <Typography>
                <strong>{invoiceData.customerName}</strong>
              </Typography>
              <Typography>
                <strong>{invoiceData.customerAddress}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant='button'
                sx={{fontSize: {xs: '12px', md: '15px'}}}
              >
                ANRAN BRANCH
              </Typography>
              <Typography>
                <strong>{invoiceData.branchCompanyName}</strong>
              </Typography>
              <Typography>
                <strong>{invoiceData.branchAddress}</strong>
              </Typography>
              <Typography>
                <strong>{invoiceData.branchContact}</strong>
              </Typography>
            </Grid>
          </Grid>

          {/* Invoice Items Table */}
          <TableContainer component={Paper} style={{marginTop: '20px'}}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Item #</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Qty</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Unit Price</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Discount</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Price</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items &&
                  invoiceData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell>{item.discount}</TableCell>
                      <TableCell>{item.price}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary & Footer */}
          <Grid container spacing={2} style={{marginTop: '20px'}}>
            <Grid item xs={12} md={9}>
              <Typography variant='body'>
                <strong>Terms and Conditions</strong>
              </Typography>
              <Grid>
                <Typography variant='caption'>
                  <strong>Disputes and Claims.</strong> Any disputes or claims
                  regarding the invoice must be made within 7 days from the
                  invoice date.
                </Typography>
              </Grid>
              <Grid>
                <Typography variant='caption'>
                  <strong>Returns and Refunds.</strong> All Packages and
                  Services sold are non-refundable.
                </Typography>
              </Grid>
              <Grid>
                <Typography variant='caption'>
                  <strong>Taxes and Duties.</strong> All prices quoted are
                  exclusive of governmental tax charges.
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3} align='right'>
              <Table size='small'>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{padding: '5px'}} align='right'>
                      <strong>Invoice Subtotal:</strong>
                    </TableCell>
                    <TableCell sx={{padding: '5px'}}>
                      {invoiceData.subtotal}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{padding: '5px'}} align='right'>
                      <strong>Tax Rate:</strong>
                    </TableCell>
                    <TableCell sx={{padding: '5px'}}>
                      {invoiceData.taxRate}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{padding: '5px'}} align='right'>
                      <strong>Sales Tax:</strong>
                    </TableCell>
                    <TableCell sx={{padding: '5px'}}>
                      {invoiceData.salesTax}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{padding: '5px'}} align='right'>
                      <strong>Deposit Received:</strong>
                    </TableCell>
                    <TableCell sx={{padding: '5px'}}>
                      {invoiceData.depositReceived}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{padding: '5px'}} align='right'>
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell sx={{padding: '5px'}}>
                      {invoiceData.total}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          {/* Footer Information */}
          <Grid
            container
            style={{marginTop: '40px', marginBottom: '40px'}}
            justifyContent={'center'}
          >
            <Grid item xs={12} align='center'>
              <Typography variant='body1'>
                <strong>
                  ANRAN NANO HEALTH DIGITAL INTELLIGENT TECHNOLOGY SDN. BHD.
                  202201009972 (1455669-x)
                </strong>
              </Typography>
              <Typography variant='body1'>
                (Previously known as ANRAN NAMI WELLNESS CENTRE (HOLDINGS) SDN.
                BHD.)
              </Typography>
              <Typography variant='body1'>
                603 5525 1136 | anran360@anranwellness.com |
                www.anranwellness.com
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Card>
  );
};

export default InvoicePage;

InvoicePage.propTypes = {
  setSelectedRow: PropTypes.func,
};

// import {useGetDataApi} from '@enjoey/utility/APIHooks';

// const [{ apiData: invoiceData }] = useGetDataApi(
//     '/api/invoice',
//     {},
//     {},
//     true,
// );
