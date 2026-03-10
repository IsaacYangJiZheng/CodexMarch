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
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/EmailOutlined';
// import jwtAxios from '@anran/services/auth/jwt-auth';
// import {postDataApi} from '@anran/utility/APIHooks';
// import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import EmailInputDialog from './email/emailInputDialog';
import {useIntl} from 'react-intl';
// import { saveAs } from "file-saver";
// import invoiceData from './data/dummy_invoice.json';

const InvoicePage = ({invoiceData}) => {
  const {formatMessage} = useIntl();
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
      let docName = `${invoiceData.orderNumber}.pdf`;
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
      let docName = `${invoiceData.orderNumber}`;
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
          <Tooltip title={formatMessage({id: 'member.invoice.saveFile'})}>
            <IconButton
              onClick={generatePDF}
              sx={{color: (theme) => theme.palette.primary.main}}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={formatMessage({id: 'member.invoice.emailFile'})}>
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
                    <Typography
                      variant='h4'
                      sx={{fontSize: '50px', textAlign: 'left'}}
                    >
                      {formatMessage({id: 'member.invoice.title'})}
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
                            align='left'
                          >
                            {formatMessage({id: 'member.invoice.numberLabel'})}
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData.orderNumber}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                            align='left'
                          >
                            {formatMessage({id: 'member.invoice.dateLabel'})}
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {dayjs(invoiceData.orderDate).format('DD/MM/YYYY')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{
                              padding: '1px',
                              border: 'none',
                              fontSize: '20px',
                            }}
                            align='left'
                          >
                            {formatMessage({id: 'member.invoice.branchLabel'})}
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
                        {formatMessage({id: 'member.invoice.customerId'})}
                      </Typography>
                      <Typography sx={{fontSize: '20px'}}>
                        <strong>{invoiceData.member.mobileNumber}</strong>
                      </Typography>
                    </Grid>
                    <Grid size={{md: 4}}>
                      <Typography variant='button' sx={{fontSize: '20px'}}>
                        {formatMessage({id: 'member.invoice.salesConsultant'})}
                      </Typography>
                      <Typography sx={{fontSize: '20px'}}>
                        <strong>{invoiceData?.salesConsultant}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={{xs: 12, md: 5}}>
                    <Typography variant='button' sx={{fontSize: '22px'}}>
                      {formatMessage({id: 'member.invoice.billedTo'})}
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
                      {formatMessage({id: 'member.invoice.branchTitle'})}
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
                    minHeight: '650px',
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
                          <strong>{formatMessage({id: 'member.invoice.item'})}</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>
                            {formatMessage({id: 'member.invoice.description'})}
                          </strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>{formatMessage({id: 'member.invoice.qty'})}</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>
                            {formatMessage({id: 'member.invoice.unitPrice'})}
                          </strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>{formatMessage({id: 'member.invoice.discount'})}</strong>
                        </TableCell>
                        <TableCell
                          style={{
                            backgroundColor: '#00968814',
                            fontSize: '16px',
                          }}
                        >
                          <strong>{formatMessage({id: 'member.invoice.amount'})}</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceData.items &&
                        invoiceData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell style={{fontSize: '16px'}}>
                              {item.package.packageCode}
                            </TableCell>
                            <TableCell style={{fontSize: '16px'}}>
                              {item.package.packageName}
                            </TableCell>
                            <TableCell style={{fontSize: '16px'}}>
                              {item.quantity}
                            </TableCell>
                            <TableCell style={{fontSize: '16px'}}>
                              RM
                              {Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                              }).format(item?.unitPrice)}
                            </TableCell>
                            <TableCell style={{fontSize: '16px'}}>
                              RM {item.discountPrice.toFixed(2)}
                            </TableCell>
                            <TableCell style={{fontSize: '16px'}}>
                              RM{' '}
                              {Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                              }).format(item.unitAmount)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary & Footer */}
                <Grid container spacing={2} style={{marginTop: '20px'}}>
                  <Grid size={{xs: 12, md: 8}}>
                    <Typography variant='body' sx={{fontSize: '22px'}}>
                      <strong>
                        {formatMessage({id: 'member.invoice.terms.title'})}
                      </strong>
                    </Typography>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        {formatMessage({id: 'member.invoice.terms.disputes'})}
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        {formatMessage({id: 'member.invoice.terms.returns'})}
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant='caption' sx={{fontSize: '20px'}}>
                        {formatMessage({id: 'member.invoice.terms.taxes'})}
                      </Typography>
                    </Grid>
                    {dayjs(invoiceData.orderDate).isSameOrAfter('2025-08-01', 'day') && (
                      <Grid>
                        <Typography variant='caption' sx={{fontSize: '20px'}}>
                          {formatMessage({
                            id: 'member.invoice.terms.packageExpiry',
                          })}
                        </Typography>
                      </Grid>
                    )}
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
                            <strong>
                              {formatMessage({id: 'member.invoice.subtotal'})}
                            </strong>
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
                            }).format(invoiceData.orderTotalAmount)}
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
                            <strong>
                              {formatMessage({id: 'member.invoice.taxRate'})}
                            </strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData.taxValue}% ({invoiceData.taxCode})
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
                            <strong>
                              {formatMessage({id: 'member.invoice.salesTax'})}
                            </strong>
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
                            }).format(invoiceData.orderTotalTaxAmount)}
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
                            <strong>
                              {formatMessage({id: 'member.invoice.depositReceived'})}
                            </strong>
                          </TableCell>
                          <TableCell
                            sx={{
                              padding: '5px',
                              borderBottom: 'none',
                              fontSize: '20px',
                            }}
                          >
                            {invoiceData?.payments?.find(
                              (p) => p.payMethod === 'Deposit',
                            )?.payAmount
                              ? `RM ${invoiceData.payments.find((p) => p.payMethod === 'Deposit').payAmount.toFixed(2)}`
                              : 'RM 0.00'}
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
                            <strong>{formatMessage({id: 'member.invoice.total'})}</strong>
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
                            }).format(invoiceData.orderTotalNetAmount)}
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