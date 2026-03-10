import React from 'react';
import PropTypes from 'prop-types';
import AppCard from '@anran/core/AppCard';
import AppGridContainer from '@anran/core/AppGridContainer';
import {Box, Divider, Grid, Typography} from '@mui/material';
import dayjs from 'dayjs';
// import {useGetDataApi} from '@anran/utility/APIHooks';
// import InvoiceTable from './InvoiceTable';
// import {downloadPdf} from '@anran/utility/helper/FileHelper';
// import {AiOutlineDownload} from 'react-icons/ai';
import {useGetDataApi} from '@anran/utility/APIHooks';

const InvoicePdf = ({selectedRow}) => {
  const [{apiData: orderDetailData, loading}, {setQueryParams}] = useGetDataApi(
    'api/order/detail',
    undefined,
    {id: selectedRow._id},
    true,
  );
  React.useEffect(() => {
    if (selectedRow) {
      setQueryParams({id: selectedRow._id});
    }
  }, [selectedRow]);

  console.log(orderDetailData);

  //   const invDate = dayjs(selectedRow.invoiceDate);
  if (loading) {
    return <> Laoding....</>;
  }

  return (
    <AppCard sx={{width: '100%', margin: 'auto'}}>
      <Box id='pdfdiv'>
        <Box sx={{py: 10, px: 1}}>
          <AppGridContainer spacing={5}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  position: 'relative',
                  p: 0,
                  borderRadius: 2,
                }}
              >
                <Typography variant='h1' sx={{mb: 3}}>
                  Invoice
                </Typography>
                <Box component='span' sx={{mr: 2}}>
                  {selectedRow?.orderNumber}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Box component='span' sx={{mr: 2}}>
                    Invoice #:
                  </Box>
                  <Box>{selectedRow.orderNumber}</Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Box component='span' sx={{mr: 2}}>
                    Invoice Date:
                  </Box>
                  <Box>
                    {dayjs(selectedRow.invoiceDate).format('DD-MM-YYYY')}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Box component='span' sx={{mr: 2}}>
                    Student:
                  </Box>

                  <Typography variant='h4'>
                    {selectedRow?.orderNumber}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  <Box component='span' sx={{mr: 2}}>
                    Program:
                  </Box>

                  <Typography variant='h4'>
                    {selectedRow?.orderNumber}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                ml: 'auto',
                display: 'flex',
                alignItems: 'flex-end',
                flexDirection: 'column',
              }}
            >
              <Box sx={{width: '70%', ml: 4, mr: -4}}>
                {selectedRow?.logo && (
                  <img
                    src={selectedRow?.logo + '?time=' + new Date().valueOf()}
                    alt='logo'
                    crossOrigin=''
                    style={{width: '100%', height: 'auto'}}
                  />
                )}
              </Box>
              {/* <Box sx={{width: '70%', ml: 4, mr: -4}}>
                {selectedInv?.branch.logo && (
                  <img
                    src={
                      selectedInv?.branch.logo + '?time=' + new Date().valueOf()
                    }
                    alt='logo'
                    crossOrigin=''
                    style={{width: '100%', height: 'auto'}}
                  />
                )}
              </Box> */}
              <Box
                sx={{
                  ml: 'auto',
                  display: 'flex',
                  alignItems: 'flex-end',
                  flexDirection: 'column',
                }}
              >
                <Typography variant='h4' sx={{mb: 3}}>
                  {selectedRow?.orderNumber}
                </Typography>
                <Box>{selectedRow?.orderNumber}</Box>
                <Box>{selectedRow?.orderNumber}</Box>
                <Box>
                  {selectedRow?.orderNumber} {selectedRow?.orderNumber}
                </Box>
              </Box>
            </Grid>
          </AppGridContainer>

          <Box sx={{mb: 4}}>{selectedRow?.introductionText ? '' : ''}</Box>
        </Box>

        {/* <InvoiceTable
          items={selectedRow.items}
          taxTypeData={selectedRow.orderNumber}
          taxRateData={1}
          currency={'RM'}
        /> */}

        <Box sx={{py: 10, px: 4}}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1,
            }}
          >
            <Typography variant='h4' sx={{mb: 1}}>
              Payment Terms
            </Typography>
            <Typography variant='body1' sx={{mb: 4}}>
              Please Pay within days of receiving this invoice.
            </Typography>
          </Box>

          <Box sx={{mb: 3}}>{selectedRow.conclusionText}</Box>
          <Divider />

          {selectedRow?.accounting && (
            <Box
              sx={{
                position: 'relative',
                p: 3,
                my: 4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                width: 'fit-content',
              }}
            >
              <Typography variant='h4' sx={{mb: 4}}>
                Bank Account
              </Typography>
              <Box sx={{color: 'text.primary'}}>
                <Box>Receiver: {selectedRow?.accounting.accountHolder}</Box>
                <Box>Bank Name: {selectedRow?.accounting.bankName}</Box>
                <Box>
                  Country of bank: {selectedRow?.accounting.countryOfBank}
                </Box>
                <Box>
                  Account Number: {selectedRow?.accounting.accountNumber}
                </Box>
                <Box>SWIFT/BIC: {selectedRow?.accounting.swiftBic}</Box>
                <Box>IFSC: {selectedRow?.accounting.ifsc}</Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      {/* <Button
        variant='contained'
        startIcon={<AiOutlineDownload size={20} />}
        sx={{display: 'flex', ml: 'auto', mt: 4}}
        onClick={() => downloadPdf()}
      >
        Download Invoice
      </Button> */}
    </AppCard>
  );
};

export default InvoicePdf;

InvoicePdf.propTypes = {
  selectedRow: PropTypes.object.isRequired,
  setSelectedInvoice: PropTypes.func,
  clientsList: PropTypes.array,
  invoiceSettings: PropTypes.object,
};
