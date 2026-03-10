import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Autocomplete,
  FormControl,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';

import AppInfoView from '@anran/core/AppInfoView';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';

import CardHeader from './CardHeader';
// import {RoutePermittedRole2} from 'shared/constants/AppConst';

const TransposedTable = ({handleOpenConfirmationLogsDialog, branchDatabase, confirmationLogs, reCallAPI}) => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [filteredData, setFilteredData] = useState(null);
  const [paymentTableData, setPaymentTableData] = useState([]);
  const [loading, setLoading] = useState(false);
   const noOptionsText = formatMessage({ id: 'common.noOptionsAvailable' });

  // const [{apiData: branchDatabase}] = useGetDataApi(
  //   'api/branch/role-based',
  //   {},
  //   {},
  //   true,
  // );

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

  const today = dayjs().format('YYYY-MM-DD');

  const handleClickSubmit = async () => {
    if (selectedBranch) {
      setLoading(true);
      const formData = new FormData();
      formData.append('branch', selectedBranch);
      formData.append('selectedStartDate', today);
      formData.append('selectedEndDate', today);
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
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  const handleClickConfirmDailySales = async () => {
    try {
      for (const item of filteredData) {
        const formData = new FormData();
        formData.append('branch', item._id);
        formData.append('totalAmount', item.SaleTotalAmount || 0);
        formData.append('totalTax', item.SaleTotalTaxAmount || 0);
        formData.append('totalDiscount', item.SaleTotalDiscountAmount || 0);
        formData.append('totalReceived', item.payTotalAmount || 0);
        formData.append('confirmationStatus', 'Confirmed');

        await postDataApi(
          'api/report2/confirmation-daily-sales',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          }
        );
      }
      reCallAPI();
      infoViewActionsContext.showMessage(
        formatMessage({id: 'report.confirmations.submitted'}),
      );
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      const isDataPopulated = filteredDataForTable.every(
        (item) => item !== undefined && item !== null,
      );

      if (isDataPopulated) {
        setLoading(false);
        infoViewActionsContext.showMessage(
          formatMessage({id: 'report.data.loaded'}),
        );
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
            if (
              details.payMethod === 'fpx' ||
              details.payMethod === 'Online Banking' ||
              details.payMethod === 'Banks'
            ) {
              row.onlineBanking = formatCurrency(
                (Number(row.onlineBanking) || 0) + details.payAmount,
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
                (Number(row.eWallet) || 0) + details.payAmount,
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
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        setLoading(false);
        setPaymentTableData([]);
        return;
      }
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
  };

  const transposedData =
    filteredData && Array.isArray(filteredData) && filteredData.length > 0
      ? transposeData(filteredData)
      : null;

  const filteredDataForTable = transposedData
    ? transposedData.filter((row) => row.header !== 'orderBranch')
    : [];

  const exportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `OutletSalesReport_${currentDateTime}`;

    const branchLookup = (id) => {
      const branch = branchOptions.find((branch) => branch._id === id);
      return branch ? branch.branch : formatMessage({id: 'common.unknownBranch'});
    };

    const titleRow2 = [
      [formatMessage({id: 'report.dailyOutletSales.title'})],
      [formatMessage({id: 'report.startDate'}, {date: today})],
      [formatMessage({id: 'report.endDate'}, {date: today})],
      [
        formatMessage(
          {id: 'report.branch'},
          {
            name: selectedBranch
              .map(
                (branchId) =>
                  branchOptions.find((branch) => branch._id === branchId)?.branch,
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

    const emptyRow = [];

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
      ...filteredData
        .map((item) => ({
          branchName: branchLookup(item._id),
          data: [
            branchLookup(item._id),
            item.SaleTotalAmount
              ? formatCurrency(item.SaleTotalAmount)
              : '0.00',
            item.SaleAfterDiscount
              ? formatCurrency(item.SaleAfterDiscount)
              : '0.00',
            item.SaleTotalDiscountAmount
              ? formatCurrency(item.SaleTotalDiscountAmount)
              : '0.00',
            item.SaleTotalTaxAmount
              ? formatCurrency(item.SaleTotalTaxAmount)
              : '0.00',
            item.SaleTotalNetAmount
              ? formatCurrency(item.SaleTotalNetAmount)
              : '0.00',
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
      return isNaN(num) ? '0.00' : num.toFixed(2);
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
        ]),
      )
      .flat();

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

    const transposeWs = XLSX.utils.aoa_to_sheet([
      ...titleRow2,
      emptyRow,
      ...outletSalesData,
    ]);
    const paymentWs = XLSX.utils.aoa_to_sheet([
      ...titleRow2,
      emptyRow,
      paymentHeaders,
      ...flattenedPaymentData,
    ]);

    const totalPaymentRows = paymentTableData.reduce(
      (sum, branchData) => sum + branchData.tableData.length,
      0,
    );
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
                {formatMessage({id: 'report.dailyOutletSales.title'})}
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
          <Grid container size={{md: 12, xs: 12}} alignItems={'center'}>
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
                      const selectedBranch = value.map((branch) => branch._id);
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
            <Grid size={{md: 2, xs: 3}} sx={{marginLeft: 'auto'}}>
              <Button
                size='large'
                variant='outlined'
                color='primary'
                fullWidth
                onClick={handleClickSubmit}
                disabled={!selectedBranch || selectedBranch.length === 0}
                startIcon={<FilterAltIcon />}
              >
                {formatMessage({id: 'report.filters.submit'})}
              </Button>
            </Grid>
            {user.role === "admin" && (
              <>
                <Grid size={{md: 3, xs: 4}}>
                  <Button
                    size='large'
                    variant='outlined'
                    color='primary'
                    fullWidth
                    onClick={handleOpenConfirmationLogsDialog}
                    disabled={!selectedBranch}
                    startIcon={<FilterAltIcon />}
                  >
                    {formatMessage({id: 'report.confirmationLogs'})}
                  </Button>
                </Grid>
              </>
            )}
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
              {branchNames &&
              Array.isArray(filteredData) &&
              filteredData.length > 0
                ? branchNames.map((branch, index) => (
                    <Column
                      key={index}
                      field={`Column${index + 1}`}
                      header={branch}
                    />
                  ))
                : null}
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
                {tableData.tableData.some(
                  (row) =>
                    dayjs(row.date).isBefore(dayjs('2025-03-04'), 'day') &&
                    dayjs(row.date).isAfter(dayjs('2025-02-28'), 'day'),
                ) && (
                  <Column
                    field='creditdebit'
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
          {selectedBranch.length > 0 && (
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {(() => {
                const confirmedBranchIds = confirmationLogs.data
                  ? confirmationLogs.data.map(log => log.branch?._id)
                  : [];

                const confirmedSelectedBranches = selectedBranch.filter(branchId =>
                  confirmedBranchIds.includes(branchId)
                );
                const confirmedBranchNames = branchOptions
                  .filter(branch => confirmedSelectedBranches.includes(branch._id))
                  .map(branch => branch.branch)
                  .join(', ');

                if (selectedBranch.length === 1 && confirmedSelectedBranches.length === 1) {
                  const log = confirmationLogs.data?.find(
                    l => l.branch && l.branch._id === selectedBranch[0]
                  );
                  return (
                    <Button
                      disabled
                      size="large"
                      sx={{ maxWidth: 400 }}
                      fullWidth color="primary"
                      variant="contained"
                    >
                      {formatMessage(
                        {id: 'report.confirmedAt'},
                        {
                          dateTime: log
                            ? dayjs(log.confirmedAt).format('DD-MM-YYYY h:mm A')
                            : '-',
                        },
                      )}
                    </Button>
                  );
                }
                if (confirmedSelectedBranches.length > 0) {
                  return (
                    <Button
                      disabled
                      size="large"
                      sx={{ maxWidth: 400 }}
                      fullWidth color="primary"
                      variant="contained"
                    >
                      {formatMessage(
                        {id: 'report.confirmedBranches'},
                        {branches: confirmedBranchNames},
                      )}
                    </Button>
                  );
                }
                return (
                  <Button
                    disabled={!filteredData}
                    size="large"
                    sx={{ maxWidth: 200 }}
                    fullWidth color="primary"
                    variant="contained"
                    onClick={handleClickConfirmDailySales}
                  >
                    {formatMessage({id: 'report.confirmDailySales'})}
                  </Button>
                );
              })()}
            </Grid>
          )}
        </Grid>
      </Card>
    </Box>
  );
};

const TransposeTable = () => {
  const {formatMessage} = useIntl();
  const [confirmationLogsDialogOpen, setConfirmationLogsDialogOpen] = useState(false);
  const [{apiData: branchDatabase}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const [{apiData: confirmationLogs}, {reCallAPI}] = useGetDataApi(
    'api/report2/confirmation-daily-sales/today',
    {},
    {},
    true,
  );

  const [{apiData: staffName}] = useGetDataApi(
    '/api/staff',
    {},
    {},
    true,
  );

  const allBranches = Array.isArray(branchDatabase) ? branchDatabase : [];
  const logs = confirmationLogs.data || [];

  const mergedLogs = allBranches.map(branch => {
    const log = logs.find(l => l.branch && l.branch._id === branch._id);
    return {
      branchName: branch.branchName,
      confirmedBy: log ? log.confirmedBy : '-',
      confirmedAt: log ? log.confirmedAt : '-',
      confirmationStatus: log ? log.confirmationStatus : 'Pending',
    };
  });

  const confirmedAtBodyTemplate = (rowData) => {
    return (
      rowData.confirmedAt !== '-' ? (
        <Typography>
          {dayjs(rowData.confirmedAt).format('DD-MM-YYYY h:mm A')}
        </Typography>
      ) : (
        <Typography>-</Typography>
      )
    );
  };

  const confirmationStatusLabels = {
    Confirmed: formatMessage({id: 'common.confirmed'}),
    Pending: formatMessage({id: 'common.pending'}),
  };

  const confirmationStatusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={
          confirmationStatusLabels[rowData.confirmationStatus] ||
          rowData.confirmationStatus
        }
        severity={getSeverity(rowData)}
      ></Tag>
    );
  };

  const getSeverity = (rowData) => {
    switch (rowData.confirmationStatus) {
      case 'Confirmed':
        return 'success';

      case 'Pending':
        return 'warning';

      default:
        return null;
    }
  };

  const confirmedByBodyTemplate = (rowData) => {
    if (!rowData.confirmedBy) return '-';
    const staff = Array.isArray(staffName)
      ? staffName.find((s) => s._id === rowData.confirmedBy)
      : null;
    return staff ? staff.name : rowData.confirmedBy;
  };

  const handleOpenConfirmationLogsDialog = () => {
    setConfirmationLogsDialogOpen(true);
    reCallAPI();
  };

  const handleCloseConfirmationLogsDialog = () => {
    setConfirmationLogsDialogOpen(false);
  };

  return (
    <Box>
      <Card>
        <TransposedTable
          handleOpenConfirmationLogsDialog={handleOpenConfirmationLogsDialog}
          branchDatabase={branchDatabase}
          confirmationLogs={confirmationLogs}
          reCallAPI={reCallAPI}
        />
      </Card>
      <AppDialog
        dividers
        maxWidth='lg'
        open={confirmationLogsDialogOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseConfirmationLogsDialog}
            title={formatMessage({id: 'report.confirmationLogs'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              value={mergedLogs}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              emptyMessage={formatMessage({id: 'report.noRecordsFound'})}
              showGridlines
              stripedRows
            >
              <Column
                field='branchName'
                header={formatMessage({id: 'common.branch'})}
                style={{minWidth: '14rem'}}
              />
              <Column
                header={formatMessage({id: 'common.date'})}
                style={{minWidth: '6rem'}}
                body={() => dayjs().format('DD-MM-YYYY')}
              />
              <Column
                field='confirmedBy'
                header={formatMessage({id: 'report.confirmedBy'})}
                style={{minWidth: '12rem'}}
                body={confirmedByBodyTemplate}
              />
              <Column
                field='confirmationStatus'
                header={formatMessage({id: 'report.confirmationStatus'})}
                style={{minWidth: '6rem'}}
                body={confirmationStatusBodyTemplate}
              />
              <Column
                field='confirmedAt'
                header={formatMessage({id: 'report.confirmedAtLabel'})}
                style={{minWidth: '10rem'}}
                body={confirmedAtBodyTemplate}
              />
            </DataTable>
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={handleCloseConfirmationLogsDialog}>
            {formatMessage({id: 'common.done'})}
          </Button>
        </DialogActions>
      </AppDialog>
      <AppInfoView />
    </Box>
  );
};

export default TransposeTable;

TransposedTable.propTypes = {
  handleOpenConfirmationLogsDialog: PropTypes.function,
  branchDatabase: PropTypes.array,
  confirmationLogs: PropTypes.array,
  reCallAPI: PropTypes.func,
};