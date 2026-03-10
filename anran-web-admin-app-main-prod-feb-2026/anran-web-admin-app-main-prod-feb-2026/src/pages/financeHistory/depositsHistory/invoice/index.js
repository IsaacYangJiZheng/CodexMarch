import React, {useRef} from 'react';
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
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import AppTooltip from '@anran/core/AppTooltip';
// import IntlMessages from '@anran/utility/IntlMessages';
import Logo from './image/anran_invoice.png';
import dayjs from 'dayjs';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/EmailOutlined';
// import jwtAxios from '@anran/services/auth/jwt-auth';
// import {postDataApi} from '@anran/utility/APIHooks';
// import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import EmailInputDialog from './email/emailInputDialog';
// import { saveAs } from "file-saver";
// import invoiceData from './data/dummy_invoice.json';

const InvoicePage = ({invoiceData}) => {
  const [paymentMethodList, setPaymentMethodList] = React.useState([]);
  const [openEmailDialog, setOpenEmailDialog] = React.useState(false);
  const [attachment, setAttachment] = React.useState(false);
  // const infoViewActionsContext = useInfoViewActionsContext();
  console.log('invoiceData', invoiceData);

  React.useEffect(() => {
    if (invoiceData?.payments?.length > 0) {
      let method = [];
      invoiceData?.payments.map((item) => {
        method.push(item.payMethod.toUpperCase());
      });
      setPaymentMethodList(method);
    }
  }, [invoiceData]);

  const componentRef = useRef();

  const generatePDF = async () => {
    if (!componentRef.current) {
      console.error('Element not found!');
      return;
    }
    try {
      const element = componentRef.current;
      const canvas = await html2canvas(element, {scale: 2});
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, 'FAST');
      let docName = `${invoiceData.depositNumber}.pdf`;
      pdf.save(docName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const emailGeneratePDF = async () => {
    if (!componentRef.current) {
      console.error('Element not found!');
      return;
    }
    try {
      setOpenEmailDialog(true);
      const element = componentRef.current;
      const canvas = await html2canvas(element, {scale: 2});
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, 'FAST');
      let docName = `${invoiceData.depositNumber}`;
      var file = pdf.output('blob', {filename: docName});
      setAttachment(file);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // const emailGeneratePDF = async () => {
  //   setOpenEmailDialog(true);
  //   if (!componentRef.current) {
  //     console.error('Element not found!');
  //     return;
  //   }
  //   try {
  //     const element = componentRef.current;
  //     const canvas = await html2canvas(element, {scale: 2});
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'pt', 'a4', true);
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, 'FAST');
  //     let docName = `${invoiceData.orderNumber}`;
  //     var file = pdf.output('blob', {filename: docName});
  //     var fd = new FormData(); // To carry on your data
  //     fd.append('invoiceId', invoiceData._id);
  //     fd.append('invoiceNo', invoiceData.orderNumber);
  //     fd.append('mypdf', file);
  //     const response = await postDataApi(
  //       'api/email/send-invoice-pdf',
  //       infoViewActionsContext,
  //       fd,
  //       false,
  //       {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     );
  //     console.log('Response', response);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // };

  // const onClickBackButton = () => {
  //   setSelectedRow(null);
  // };

  return (
    <Box>
      <Card variant='outlined'>
        <Grid
          container
          alignItems='center'
          justifyContent='right'
          spacing={2}
          sx={{p: 2}}
        >
          {/* <Box
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
          </Box> */}
          <Tooltip title='Save File'>
            <IconButton
              onClick={generatePDF}
              sx={{color: (theme) => theme.palette.primary.main}}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Email File'>
            <IconButton
              onClick={emailGeneratePDF}
              sx={{color: (theme) => theme.palette.primary.main}}
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <div ref={componentRef} style={{width: '100%'}}>
          <Card variant='outlined' sx={{borderRadius: 0}}>
            <Box sx={{p: 5}}>
              <Container>
                <Grid container spacing={2}>
                  {/* Logo and Company Name */}
                  <Grid size={{xs: 12, md: 2}} align='left'>
                    <img
                      src={Logo}
                      alt='Company Logo'
                      style={{width: '100%', maxWidth: '130px'}}
                    />
                  </Grid>
                  <Grid
                    size={{xs: 12, md: 6}}
                    align='left'
                    alignContent={'center'}
                  >
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
                  <Grid size={{xs: 12, md: 4}} sx={{mt: 10}} align='center'>
                    <Typography variant='h4' sx={{fontSize: '50px'}}>
                      INVOICE
                    </Typography>
                    <Table size='small'>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            Invoice #:
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData.depositNumber}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            Invoice date:
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {dayjs(invoiceData.payDate).format('DD/MM/YYYY')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            Branch:
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData.branch.branchName}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>

                {/* Customer & Billing Information */}
                <Grid container style={{marginTop: '20px'}} spacing={2}>
                  <Grid size={{xs: 12, md: 7}}>
                    <Grid size={{md: 4}}>
                      <Typography variant='button' sx={{fontSize: '22px'}}>
                        Customer ID
                      </Typography>
                      <Typography sx={{fontSize: '20px'}}>
                        <strong>{invoiceData.member.mobileNumber}</strong>
                      </Typography>
                    </Grid>
                    <Grid size={{md: 4}}>
                      <Typography variant='button' sx={{fontSize: '20px'}}>
                        Sales Consultant
                      </Typography>
                      <Typography sx={{fontSize: '20px'}}>
                        <strong>{invoiceData?.salesConsultant}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={{xs: 12, md: 5}}>
                    <Typography variant='button' sx={{fontSize: '22px'}}>
                      Billed To
                    </Typography>
                    <Typography sx={{fontSize: '18px'}}>
                      <strong>{paymentMethodList.join(',')}</strong>
                    </Typography>
                    <Typography sx={{fontSize: '20px'}}>
                      <strong>
                        {invoiceData?.member.memberFullName?.toUpperCase()}
                      </strong>
                    </Typography>
                    <Typography sx={{fontSize: '20px'}}>
                      <strong>
                        {invoiceData.member.address},{invoiceData.member.city},
                        {invoiceData.member.states}-
                        {invoiceData.member.postcode}
                      </strong>
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <Typography variant='button' sx={{fontSize: '22px'}}>
                      ANRAN BRANCH
                    </Typography>
                    <Typography sx={{fontSize: '20px'}}>
                      <strong>{invoiceData.branch.branchName}</strong>
                    </Typography>
                    <Typography sx={{fontSize: '20px'}}>
                      <strong>
                        {invoiceData.branch.branchAddress},
                        {invoiceData.branch.branchCity},
                        {invoiceData.branch.branchState}-
                        {invoiceData.branch.branchPostcode}
                      </strong>
                    </Typography>
                    <Typography sx={{fontSize: '20px'}}>
                      <strong>{invoiceData.branch.branchContactNumber}</strong>
                    </Typography>
                  </Grid>
                </Grid>

                {/* Invoice Items Table */}
                <TableContainer
                  component={Paper}
                  style={{
                    marginTop: '20px',
                    minHeight: '750px',
                    border: '1px black solid',
                  }}
                >
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Item #</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Description</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Qty</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Unit Price</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Discount</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>Amount</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{fontSize: '16px'}}>{1}</TableCell>
                        <TableCell style={{fontSize: '16px'}}>
                          {invoiceData?.referenceNumber}
                        </TableCell>
                        <TableCell style={{fontSize: '16px'}}>{1}</TableCell>
                        <TableCell style={{fontSize: '16px'}}>
                          RM
                          {Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                          }).format(invoiceData?.payAmount)}
                        </TableCell>
                        <TableCell style={{fontSize: '16px'}}>RM {0}</TableCell>
                        <TableCell style={{fontSize: '16px'}}>
                          RM{' '}
                          {Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                          }).format(invoiceData?.payAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary & Footer */}
                <Grid container spacing={2} style={{marginTop: '20px'}}>
                  <Grid size={{xs: 12, md: 8}}>
                    <Typography variant='body' sx={{fontSize: '22px'}}>
                      <strong>Terms and Conditions</strong>
                    </Typography>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        <strong>Disputes and Claims.</strong> Any disputes or
                        claims regarding the invoice must be made within 7 days
                        from the invoice date.
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        <strong>Returns and Refunds.</strong> All Packages and
                        Services sold are non-refundable.
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        <strong>Taxes and Duties.</strong> All prices quoted are
                        exclusive of governmental tax charges.
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={{xs: 12, md: 4}} align='right'>
                    <Table size='small'>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            <strong>Invoice Subtotal:</strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            RM{' '}
                            {Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                            }).format(invoiceData.payAmount)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            <strong>Tax Rate:</strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {0}% ({'SST'})
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            <strong>Sales Tax:</strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            RM{' '}
                            {Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                            }).format(0)}
                          </TableCell>
                        </TableRow>
                        {/* <TableRow>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            <strong>Deposit Received:</strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData?.depositReceived
                              ? invoiceData?.depositReceived.toFixed(2)
                              : 'RM 0.00'}
                          </TableCell>
                        </TableRow> */}
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                            align='right'
                          >
                            <strong>Total:</strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                              fontWeight: 'bold',
                            }}
                          >
                            RM{' '}
                            {Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                            }).format(invoiceData?.payAmount)}
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
                        ANRAN NANO HEALTH DIGITAL INTELLIGENT TECHNOLOGY SDN.
                        BHD. 202201009972 (1455669-x)
                      </strong>
                    </Typography>
                    <Typography variant='body1'>
                      (Previously known as ANRAN NAMI WELLNESS CENTRE (HOLDINGS)
                      SDN. BHD.)
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
        </div>
      </Card>
      {openEmailDialog ? (
        <EmailInputDialog
          visible={openEmailDialog}
          setVisible={setOpenEmailDialog}
          attachment={attachment}
          memberEmail={invoiceData?.member?.email ?? ''}
          memberName={invoiceData?.member?.memberFullName ?? ''}
          memberPhone={invoiceData?.member?.mobileNumber ?? ''}
          invoiceData={invoiceData}
        />
      ) : null}
    </Box>
  );
};

export default InvoicePage;

InvoicePage.propTypes = {
  invoiceData: PropTypes.object.isRequired,
  setSelectedRow: PropTypes.func,
};

// import {useGetDataApi} from '@enjoey/utility/APIHooks';

// const [{ apiData: invoiceData }] = useGetDataApi(
//     '/api/invoice',
//     {},
//     {},
//     true,
// );
