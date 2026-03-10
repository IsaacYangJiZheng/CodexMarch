import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Autocomplete,
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import AppInfoView from '@anran/core/AppInfoView';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';

const TransposedTable = () => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [paymentTableData, setPaymentTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const noOptionsText = formatMessage({ id: 'common.noOptionsAvailable' });


  const [{apiData: branchDatabase}] = useGetDataApi('api/branch/role-based', {}, {}, true);

  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      const allBranchesOption = {
        branch: formatMessage({id: 'common.allBranches'}),
        _id: 'All Branch',
      };
      setBranchOptions([allBranchesOption, ...opt]);
    }
  }, [branchDatabase, formatMessage]);

  const branchLookup = branchOptions.reduce((acc, branch) => {
    acc[branch._id] = branch.branch;
    return acc;
  }, {});

  const handleClickSubmit = async () => {
    if (selectedBranch && selectedStartDate && selectedEndDate) {
      setLoading(true);
      const formData = new FormData();
      formData.append('branch', selectedBranch);
      formData.append(
        'selectedStartDate',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      formData.append(
        'selectedEndDate',
        dayjs(selectedEndDate).format('YYYY-MM-DD'),
      );
      try {
        const response = await postDataApi(
          'api/report2/daily-sales',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  useEffect(() => {
    if (filteredData) {
      if (filteredData.length === 0) {
        setLoading(false);
        infoViewActionsContext.showMessage(
          formatMessage({id: 'report.filters.noData'}),
        );
      } else if (filteredData.length > 0) {
        const isDataPopulated = filteredDataForTable.every((item) => item !== undefined && item !== null);
        if (isDataPopulated) {
          setLoading(false);
          infoViewActionsContext.showMessage(
            formatMessage({id: 'report.data.loaded'}),
          );
        }
      }
    }
  }, [filteredData, formatMessage, infoViewActionsContext]);

  const formatCurrency = (value) => {
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? '0.00' : numericValue.toLocaleString();
  };

  const paymentsTableData = (filteredData, branchLookup) => {
    const allTableData = [];
    console.log(filteredData);
    filteredData.map((data) => {
      console.log('data', data.dailyGroupedData);
      const branchName =
        branchLookup[data._id] || formatMessage({id: 'common.unknownBranch'});
      const tableData = [];
      data.dailyGroupedData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((payments) => {
        const row = {
          date: payments.date,
          onlineBanking: '0.00',
          creditdebit: '0.00',
          deposit: '0.00',
          visa: '0.00',
          master: '0.00',
          eWallet: '0.00',
          amex: '0.00',
        };
        payments.payMethod.map((details) => {
          const formattedAmount = formatCurrency(details.payAmount);
          if (details.payMethod === 'fpx' || details.payMethod === 'Online Banking' || details.payMethod === 'Banks') {
            row.onlineBanking = formatCurrency(
              (Number(row.onlineBanking) || 0) + details.payAmount
            );
          } else if (details.payMethod === 'Credit/Debit Card') {
            row.creditdebit = formattedAmount;
          } else if (details.payMethod === 'Deposit') {
            row.deposit = formattedAmount;
          } else if (details.payMethod === '(VISA) Credit/Debit Card') {
            row.visa = formattedAmount;
          } else if (details.payMethod === '(MASTER) Credit/Debit Card') {
            row.master = formattedAmount;
          } else if (
            details.payMethod === 'e-Wallet' ||
            details.payMethod === 'wallet'
          ) {
            row.eWallet = formatCurrency(
              (Number(row.eWallet) || 0) + details.payAmount
            );
          } else if (details.payMethod === '(AMEX) Credit/Debit Card') {
            row.amex = formattedAmount;
          } else if (details.payMethod === 'Others') {
            row.others = formattedAmount;
          }
        });
        tableData.push(row);
      });
      allTableData.push({branchName, tableData});
    });
    console.log('Mapped Table Data:', allTableData);
    return allTableData;
  };

  useEffect(() => {
    if (filteredData) {
      const data = paymentsTableData(filteredData, branchLookup);
      setPaymentTableData(data);
    }
  }, [filteredData]);

  const branchNames =
    filteredData?.map((item) => {
      return branchLookup[item._id] || formatMessage({id: 'common.unknownBranch'});
    }) || '';

  const transposeData = (data) => {
    const keys = [
      {
        header: 'orderBranch',
        field: formatMessage({id: 'common.branch'}),
      },
      {
        header: 'SaleTotalNetAmount',
        field: formatMessage({id: 'report.outletSales.table.netSalesInStore'}),
      },
      {
        header: 'SaleAfterDiscountAmount',
        field: formatMessage({id: 'report.outletSales.table.salesAfterDiscount'}),
      },
      {
        header: 'SaleTotalDiscountAmount',
        field: formatMessage({id: 'report.outletSales.table.totalDiscount'}),
      },
      {
        header: 'SaleTotalTaxAmount',
        field: formatMessage({id: 'report.outletSales.table.totalTax'}),
      },
      // {header: 'Banks', field: 'Online Banking - 2'},
      // {header: 'Credit &amp; Debit Card', field: 'Visa - 11 & Master - 21'},
      // {header: 'e-Wallet', field: 'E-Wallet'},
      // {header: 'Cash', field: 'Cash'},
      {
        header: 'payTotalAmount',
        field: formatMessage({id: 'report.outletSales.table.totalReceived'}),
      },
      {
        header: 'firstInvoice',
        field: formatMessage({id: 'report.outletSales.table.firstInvoice'}),
      },
      {
        header: 'lastInvoice',
        field: formatMessage({id: 'report.outletSales.table.lastInvoice'}),
      },
      {
        header: 'count',
        field: formatMessage({id: 'report.outletSales.table.invoiceCount'}),
      },
      {
        header: 'SaleTotalAmount',
        field: formatMessage({id: 'report.outletSales.table.totalAmount'}),
      },
      {
        header: 'pax',
        field: formatMessage({id: 'report.outletSales.table.totalPackagesUsed'}),
      },
    ];

    const formatCurrency = (value) => {
      if (typeof value === 'number') {
        return `RM${value.toFixed(2)}`;
      } else if (!isNaN(parseFloat(value))) {
        return `RM${parseFloat(value).toFixed(2)}`;
      }
      return value;
    };

    const branchLookup = (id) => {
      const branch = branchOptions.find((branch) => branch._id === id);
      return branch
        ? branch.branch
        : formatMessage({id: 'common.unknownBranch'}); // Return branch name or default if not found
    };

    // const allDates = [];
    // data.forEach((item) => {
    //   item.dailyGroupedData.forEach((dataItem) => {
    //     if (!allDates.includes(dataItem.date)) {
    //       allDates.push(dataItem.date);
    //     }
    //   });
    // });

    return keys.map((key) => {
      const row = {header: key.header, field: key.field};
      data.forEach((item, index) => {
        row[`Column${index + 1}`] =
          key.header === 'orderBranch'
            ? branchLookup(item._id)
            : key.header === 'count'
              ? item[key.header] || '0'
              : key.header === 'payMethod'
                ? item._id.payMethod
                : key.header === 'firstInvoice' || key.header === 'lastInvoice' 
                  ? item[key.header] || ''
                  : key.header === 'pax'
                    ? item[key.header] || 0
                    : formatCurrency(item[key.header]) || 'RM0.00';
      });
      return row;
    });
    // return keys.map((key) => {
    //   const row = { header: key.header, field: key.field };
    //   const dateRow = { header: 'Date', field: 'Date' }; // For Date row

    //   data.forEach((item, index) => {
    //     // Create a new row for Date
    //     if (key.header === 'date') {
    //       // Populate the Date row for each branch
    //       allDates.forEach((date) => {
    //         dateRow[`Column${index + 1}`] = date;
    //       });
    //     } else {
    //       row[`Column${index + 1}`] =
    //         key.header === 'orderBranch'
    //           ? branchLookup(item._id)
    //           : key.header === 'count'
    //             ? item[key.header] || '0'
    //             : key.header === 'payMethod'
    //               ? item._id.payMethod
    //               : formatCurrency(item[key.header]) || 'RM0.00';
    //     }
    //   });

    //   return key.header === 'date' ? dateRow : row;
    // });
  };

  const transposedData = filteredData ? transposeData(filteredData) : '';
  const filteredDataForTable = transposedData
    ? transposedData.filter((row) => row.header !== 'orderBranch')
    : '';

  // const exportToExcel = () => {
  //   const ws = XLSX.utils.json_to_sheet(
  //     transposedData.map((row) => {
  //       const obj = {Field: row.field};
  //       Object.keys(row).forEach((key, idx) => {
  //         if (key !== 'header' && key !== 'field') {
  //           obj[`Column${idx}`] = row[key]; // Set the value for each column
  //         }
  //       });
  //       return obj;
  //     }),
  //   );

  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Transposed Data');
  //   XLSX.writeFile(wb, `${fileName}.xlsx`);
  // };

  // const exportToExcel = () => {
  //   const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
  //   const fileName = `OutletSalesReport_${currentDateTime}`;
  //   const transposedWsData = transposedData.map((row) => {
  //     const obj = {Field: row.field};
  //     Object.keys(row).forEach((key, idx) => {
  //       if (key !== 'header' && key !== 'field') {
  //         obj[`Column${idx}`] = row[key];
  //       }
  //     });
  //     return obj;
  //   });

  //   const flattenedPaymentData = paymentTableData
  //     .map((branchData) => {
  //       return branchData.tableData.map((payment) => ({
  //         Branch: branchData.branchName,
  //         Date: payment.date,
  //         OnlineBanking: payment.onlineBanking,
  //         Visa: payment.visa,
  //         eWallet: payment.eWallet,
  //         Cash: payment.cash,
  //       }));
  //     })
  //     .flat();

  //   const transposeWs = XLSX.utils.json_to_sheet(transposedWsData);
  //   const paymentWs = XLSX.utils.json_to_sheet(flattenedPaymentData);

  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, transposeWs, 'Transpose Data');
  //   XLSX.utils.book_append_sheet(wb, paymentWs, 'Payments Data');
  //   XLSX.writeFile(wb, `${fileName}.xlsx`);
  // };



  const exportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `OutletSalesReport_${currentDateTime}`;
  
    const branchLookup = (id) => {
      const branch = branchOptions.find((branch) => branch._id === id);
      return branch
        ? branch.branch
        : formatMessage({id: 'common.unknownBranch'}); // Return branch name or default if not found
    };

    // const titleRow = [
    //   `Outlet Sales Report: ${selectedBranch.map(branchId => 
    //     branchOptions.find(branch => branch._id === branchId)?.branch
    //   ).join(", ")} (${dayjs(selectedStartDate).format('DD/MM/YYYY')} - ${dayjs(selectedEndDate).format('DD/MM/YYYY')})`
    // ];
    const titleRow2 = [
      [formatMessage({id: 'report.customOutletSales.title'})],
      [
        formatMessage(
          {id: 'report.startDate'},
          {date: dayjs(selectedStartDate).format('DD/MM/YYYY')},
        ),
      ],
      [
        formatMessage(
          {id: 'report.endDate'},
          {date: dayjs(selectedEndDate).format('DD/MM/YYYY')},
        ),
      ],
      [
        formatMessage(
          {id: 'report.branch'},
          {
            name: selectedBranch
              .map(
                (branchId) =>
                  branchOptions.find((branch) => branch._id === branchId)
                    ?.branch,
              )
              .join(', '),
          },
        ),
      ],
      [
        formatMessage(
          {id: 'report.generatedDateTime'},
          {dateTime: dayjs().format('DD/MM/YYYY HH:mm:ss')},
        ),
      ],
    ];
  
    // Empty row for spacing
    const emptyRow = [];

    // Manually structure the transposed data without default headers
    // const transposedWsData = transposedData.map((row) => 
    //   [row.field, ...Object.values(row).slice(2)] // Skipping 'header' & keeping only relevant values
    // );
    // console.log('transpose', transposedWsData);

    const outletSalesData = [
      [
        formatMessage({id: 'common.branch'}),
        formatMessage({id: 'report.outletSales.table.netSalesInStore'}),
        formatMessage({id: 'report.outletSales.table.salesAfterDiscount'}),
        formatMessage({id: 'report.outletSales.table.totalDiscount'}),
        formatMessage({id: 'report.outletSales.table.totalTax'}),
        formatMessage({id: 'report.outletSales.table.totalReceived'}),
        formatMessage({id: 'report.outletSales.table.firstInvoice'}),
        formatMessage({id: 'report.outletSales.table.lastInvoice'}),
        formatMessage({id: 'report.outletSales.table.invoiceCount'}),
        formatMessage({id: 'report.outletSales.table.totalAmount'}),
        formatMessage({id: 'report.outletSales.table.totalPackagesUsed'}),
      ],
      ...filteredData.map((item) => ({
        branchName: branchLookup(item._id),
        data: [
          branchLookup(item._id),
          item.SaleTotalAmount ? formatCurrency(item.SaleTotalAmount) : '0.00',
          item.SaleAfterDiscount ? formatCurrency(item.SaleAfterDiscount) : '0.00',
          item.SaleTotalDiscountAmount ? formatCurrency(item.SaleTotalDiscountAmount) : '0.00',
          item.SaleTotalTaxAmount ? formatCurrency(item.SaleTotalTaxAmount) : '0.00',
          item.SaleTotalNetAmount ? formatCurrency(item.SaleTotalNetAmount) : '0.00',
          item.firstInvoice ? item.firstInvoice : '-',
          item.lastInvoice ? item.lastInvoice : '-',
          item.invoiceCount ? item.invoiceCount : 0,
          item.payTotalAmount ? formatCurrency(item.payTotalAmount) : '0.00',
          item.pax ? item.pax : 0,
        ],
      }))
      .sort((a, b) => a.branchName.localeCompare(b.branchName))
      .map((item) => item.data),
    ];

    const safeToFixed = (val) => {
      if (typeof val === 'string') {
        val = val.replace(/,/g, ''); // Remove commas
      }
      const num = Number(val);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const flattenedPaymentData = paymentTableData
      .sort((a, b) => a.branchName.localeCompare(b.branchName))
      .map((branchData) => 
        branchData.tableData.map((payment) => [
          branchData.branchName, 
          payment.date, 
          safeToFixed(payment.onlineBanking),
          safeToFixed(payment.creditdebit),
          safeToFixed(payment.visa),
          safeToFixed(payment.master),
          safeToFixed(payment.amex),
          safeToFixed(payment.deposit),
          safeToFixed(payment.eWallet),
          safeToFixed(payment.others),
        ])
      )
      .flat();
  
    // Add headers manually
    const paymentHeaders = [
      formatMessage({id: 'common.branch'}),
      formatMessage({id: 'common.date'}),
      formatMessage({id: 'report.outletSales.payment.onlineBanking'}),
      formatMessage({id: 'report.outletSales.payment.creditDebit'}),
      formatMessage({id: 'report.outletSales.payment.visa'}),
      formatMessage({id: 'report.outletSales.payment.master'}),
      formatMessage({id: 'report.outletSales.payment.amex'}),
      formatMessage({id: 'report.outletSales.payment.deposit'}),
      formatMessage({id: 'report.outletSales.payment.eWallet'}),
      formatMessage({id: 'report.outletSales.payment.others'}),
    ];
  
    // Convert arrays to worksheets (no default JSON headers)
    const transposeWs = XLSX.utils.aoa_to_sheet([...titleRow2, emptyRow, ...outletSalesData]);
    const paymentWs = XLSX.utils.aoa_to_sheet([...titleRow2, emptyRow, paymentHeaders, ...flattenedPaymentData]);

    // Calculate total number of payment rows
    const totalPaymentRows = paymentTableData.reduce((sum, branchData) => sum + branchData.tableData.length, 0);
    const startRow = titleRow2.length + 3; // Skip title rows, empty row, and header row
    const endRow = startRow + totalPaymentRows - 1;
    const colLetters = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
    for (let row = startRow; row <= endRow; row++) {
      colLetters.forEach((col) => {
        const cellRef = `${col}${row}`;
        if (paymentWs[cellRef] && !isNaN(paymentWs[cellRef].v)) {
          paymentWs[cellRef].t = 'n';
          paymentWs[cellRef].z = '0.00';
        }
      });
    }
  
    // Create and save the Excel file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      transposeWs,
      formatMessage({id: 'report.outletSales.sheet.transpose'}),
    );
    XLSX.utils.book_append_sheet(
      wb,
      paymentWs,
      formatMessage({id: 'report.outletSales.sheet.payments'}),
    );
  
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2} alignItems='center'>
          {/* Header */}
          <Grid size={12}>
            <Box
              display='flex'
              justifyContent='space-between'
              mb={2}
              alignItems='center'
            >
              <Typography variant='h1'>
                {formatMessage({id: 'report.customOutletSales.title'})}
              </Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                startIcon={<DownloadIcon />}
                disabled={!filteredData}
              >
                {formatMessage({id: 'common.exportToExcel'})}
              </Button>
            </Box>
          </Grid>
          <Grid container size={{md: 10, xs: 12}}>
            <Grid size={{md: 12, xs: 12}}>
              <FormControl fullWidth margin='dense'>
                <Autocomplete
                  multiple
                  id='branch-autocomplete'
                  options={branchOptions}
                  noOptionsText={noOptionsText}
                  getOptionLabel={(option) => option.branch || ''}
                  value={
                    Array.isArray(selectedBranch)
                      ? branchOptions.filter((branch) =>
                          selectedBranch.includes(branch._id),
                        )
                      : []
                  }
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option) => {
                      const optionName = option.branch || '';
                      return optionName
                        .toLowerCase()
                        .includes(params.inputValue.toLowerCase());
                    });
                    return filtered;
                  }}
                  onChange={(event, value) => {
                    const isAllBranchesSelected = value.some(
                      (branch) => branch._id === 'All Branch',
                    );
                    if (isAllBranchesSelected) {
                      const allBranches = branchOptions
                        .filter((branch) => branch._id !== 'All Branch')
                        .map((branch) => branch._id);
                      setSelectedBranch(allBranches);
                    } else {
                      const selectedBranch = value.map(
                        (branch) => branch._id,
                      );
                      setSelectedBranch(selectedBranch);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label={<IntlMessages id='common.selectBranches' />}
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{md: 6, xs: 12}}>
              <DatePicker
                sx={{width: '100%'}}
                variant='outlined'
                label={formatMessage({id: 'report.filters.fromDate'})}
                name='fromDate'
                value={selectedStartDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(value) => setSelectedStartDate(value)}
                slotProps={{
                  textField: {
                    margin: 'dense',
                  },
                }}
                // maxDate={dayjs().subtract(1, 'day').endOf('day')}
                maxDate={dayjs().endOf('day')}
                format='DD/MM/YYYY'
              />
            </Grid>
            <Grid size={{md: 6, xs: 12}}>
              <DatePicker
                sx={{width: '100%'}}
                variant='outlined'
                label={formatMessage({id: 'report.filters.toDate'})}
                name='toDate'
                value={selectedEndDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(value) => setSelectedEndDate(value)}
                slotProps={{
                  textField: {
                    margin: 'dense',
                  },
                }}
                // maxDate={dayjs().subtract(1, 'day').endOf('day')}
                maxDate={dayjs().endOf('day')}
                format='DD/MM/YYYY'
              />
            </Grid>
          </Grid>
          <Grid size={{md: 2, xs: 3}} sx={{marginLeft: 'auto'}}>
            <Button
              size='large'
              variant='outlined'
              color='primary'
              fullWidth
              onClick={handleClickSubmit}
              disabled={
                !selectedBranch || !selectedStartDate || !selectedEndDate
              }
              startIcon={<FilterAltIcon />}
            >
              {formatMessage({id: 'report.filters.submit'})}
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable value={filteredDataForTable} loading={loading} emptyMessage={noOptionsText}>
              {/* Static Field Column */}
              <Column
                field='field'
                header={formatMessage({id: 'common.branch'})}
              />

              {/* Dynamic Columns for Branch Data */}
              {branchNames ? (
                branchNames.map((branch, index) => (
                  <Column
                    key={index}
                    field={`Column${index + 1}`}
                    header={branch}
                  />
                ))
              ) : (
                <Typography>
                  {formatMessage({id: 'report.filters.selectPrompt'})}
                </Typography>
              )}
            </DataTable>
          </Grid>
          {paymentTableData.map((tableData, index) => (
            <Grid key={index} size={{xs: 12, md: 12}}>
              <h3>{tableData.branchName}</h3>
              <DataTable value={tableData.tableData} emptyMessage={noOptionsText}>
                <Column
                  field='date'
                  header={formatMessage({id: 'common.date'})}
                />
                <Column
                  field='onlineBanking'
                  header={formatMessage({
                    id: 'report.outletSales.payment.onlineBanking',
                  })}
                />
                {tableData.tableData.some(row => 
                  dayjs(row.date).isBefore(dayjs("2025-03-04"), "day") && 
                  dayjs(row.date).isAfter(dayjs("2025-02-28"), "day")
                ) && (
                  <Column
                    field="creditdebit"
                    header={formatMessage({
                      id: 'report.outletSales.payment.creditDebit',
                    })}
                  />
                )}
                <Column
                  field='deposit'
                  header={formatMessage({id: 'report.outletSales.payment.deposit'})}
                />
                <Column
                  field='visa'
                  header={formatMessage({id: 'report.outletSales.payment.visa'})}
                />
                <Column
                  field='master'
                  header={formatMessage({id: 'report.outletSales.payment.master'})}
                />
                <Column
                  field='amex'
                  header={formatMessage({id: 'report.outletSales.payment.amex'})}
                />
                <Column
                  field='eWallet'
                  header={formatMessage({id: 'report.outletSales.payment.eWallet'})}
                />
                <Column
                  field='others'
                  header={formatMessage({id: 'report.outletSales.payment.others'})}
                />
              </DataTable>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

const TransposeTable = () => {
  return (
    <Box>
      <Card>
        <TransposedTable />
      </Card>
      <AppInfoView />
    </Box>
  );
};

export default TransposeTable;