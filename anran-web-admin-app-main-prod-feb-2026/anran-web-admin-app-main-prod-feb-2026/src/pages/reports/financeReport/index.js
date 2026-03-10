import React, { useState, useMemo, useRef, useCallback, useTransition } from 'react';
import {useIntl} from 'react-intl';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DatePicker } from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PropTypes from 'prop-types';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import IntlMessages from '@anran/utility/IntlMessages';
import { useInfoViewActionsContext } from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import { postDataApi, useGetDataApi } from '@anran/utility/APIHooks';

const safeArray = (v) => (Array.isArray(v) ? v : []);
const fmtRM = (n) => (Number.isFinite(Number(n)) ? `RM ${Number(n).toFixed(2)}` : '-');
const normalizeMethod = (s='') => s.toLowerCase().trim();

const bucketOf = (method) => {
  const m = normalizeMethod(method)
    .replace(/\s+/g, ' '); // collapse spaces
  if (m.includes('visa')) return 'visa';
  if (m.includes('master')) return 'master';
  if (m.includes('amex') || m.includes('american express')) return 'amex';
  if (m.includes('wallet')) return 'ewallet';
  if (m.includes('deposit')) return 'deposit';
  if (m.includes('fpx') || m.includes('online banking') || m.includes('online')) return 'bank';
  if (m.includes('credit') || m.includes('debit') || m.includes('card')) return 'card';
  return 'other';
};

const sumBucket = (row, bucket) =>
  safeArray(row?.payments)
    .filter(p => bucketOf(p?.payMethod) === bucket)
    .reduce((s,p)=> s + (Number(p?.payAmount)||0), 0);

/** ====== Memoized DataTable to avoid re-rendering during dropdown interaction ====== */
const FinanceTable = React.memo(function FinanceTable({
  rows,
  loading,
  headers,
  emptyMessage,
}) {
  const value = useMemo(() => safeArray(rows), [rows]);

  const renderDate = useCallback(
    (d) => (d?.orderDate ? dayjs(d.orderDate).format('DD-MM-YYYY') : ''),
    []
  );

  return (
    <DataTable
      value={value}
      loading={loading}
      emptyMessage={emptyMessage}
      scrollable
      scrollHeight="60vh"
      virtualScrollerOptions={{ itemSize: 100, delay: 0 }}
    >
      <Column field="branch.branchName" header={headers.branch} />
      <Column header={headers.salesDate} field="orderDate" body={renderDate} />
      <Column field="member.memberFullName" header={headers.member} />
      <Column field="orderNumber" header={headers.invoiceNo} />

      <Column header={headers.bank} body={(d)=> {
        const t = sumBucket(d,'bank'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.creditDebit} body={(d)=> {
        const t = sumBucket(d,'card'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.visa} body={(d)=> {
        const t = sumBucket(d,'visa'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.master} body={(d)=> {
        const t = sumBucket(d,'master'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.amex} body={(d)=> {
        const t = sumBucket(d,'amex'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.deposit} body={(d)=> {
        const t = sumBucket(d,'deposit'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.eWallet} body={(d)=> {
        const t = sumBucket(d,'ewallet'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>
      <Column header={headers.others} body={(d)=> {
        const t = sumBucket(d,'other'); return t ? `RM ${t.toFixed(2)}` : '-';
      }}/>

      <Column
        header={headers.grossTotal}
        field="orderTotalAmount"
        body={(d) => fmtRM(d?.orderTotalAmount)}
      />
      <Column
        header={headers.tax}
        field="orderTotalTaxAmount"
        body={(d) => fmtRM(d?.orderTotalTaxAmount)}
      />
      <Column
        header={headers.netTotal}
        field="orderTotalNetAmount"
        body={(d) => fmtRM(d?.orderTotalNetAmount)}
      />
    </DataTable>
  );
});

FinanceTable.propTypes = {
  rows: PropTypes.array,
  loading: PropTypes.bool,
  headers: PropTypes.object,
  emptyMessage: PropTypes.string,
};

/** ============================ Main Page ============================ */
const ReportTable = () => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [selectedBranch, setSelectedBranch] = useState([]); // array of ids
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]); // always array
  const [loading, setLoading] = useState(false);

  // Defer heavy state updates while interacting with the dropdown
  const [isPending, startTransition] = useTransition();

  // request guard to prevent stale responses overriding newer ones
  const requestIdRef = useRef(0);

  const tableHeaders = useMemo(
    () => ({
      branch: formatMessage({id: 'common.branch'}),
      salesDate: formatMessage({id: 'report.finance.table.salesDate'}),
      member: formatMessage({id: 'report.finance.table.member'}),
      invoiceNo: formatMessage({id: 'report.finance.table.invoiceNo'}),
      bank: formatMessage({id: 'report.finance.table.bank'}),
      creditDebit: formatMessage({id: 'report.finance.table.creditDebit'}),
      visa: formatMessage({id: 'report.finance.table.visa'}),
      master: formatMessage({id: 'report.finance.table.master'}),
      amex: formatMessage({id: 'report.finance.table.amex'}),
      deposit: formatMessage({id: 'report.finance.table.deposit'}),
      eWallet: formatMessage({id: 'report.finance.table.eWallet'}),
      others: formatMessage({id: 'report.finance.table.others'}),
      grossTotal: formatMessage({id: 'report.finance.table.grossTotal'}),
      tax: formatMessage({id: 'report.finance.table.tax'}),
      netTotal: formatMessage({id: 'report.finance.table.netTotal'}),
    }),
    [formatMessage],
  );

  const [{ apiData: branchDatabase }] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true
  );

  /** ---- Memoize options and fast id→option lookup ---- */
  const branchOptions = useMemo(() => {
    if (!Array.isArray(branchDatabase)) return [];
    const opts = branchDatabase.map((b) => ({ branch: b.branchName, _id: b._id }));
    return [
      {branch: formatMessage({id: 'common.allBranches'}), _id: 'All Branch'},
      ...opts,
    ];
  }, [branchDatabase, formatMessage]);

  const branchById = useMemo(() => {
    const m = new Map();
    branchOptions.forEach((o) => m.set(o._id, o));
    return m;
  }, [branchOptions]);

  const selectedBranchOptions = useMemo(() => {
    if (!Array.isArray(selectedBranch) || selectedBranch.length === 0) return [];
    return selectedBranch.map((id) => branchById.get(id)).filter(Boolean);
  }, [selectedBranch, branchById]);

  const filterOptions = useCallback((options, params) => {
    const q = (params?.inputValue || '').toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.branch || '').toLowerCase().includes(q));
  }, []);

  /** ---- Submit (JSON payload; guarded) ---- */
  const handleClickSubmit = useCallback(async () => {
    if (
      !Array.isArray(selectedBranch) ||
      selectedBranch.length === 0 ||
      !selectedStartDate ||
      !selectedEndDate
    ) {
      return;
    }

    const payload = {
      selectedBranch,
      selectedStartDate: dayjs(selectedStartDate).format('YYYY-MM-DD'),
      selectedEndDate: dayjs(selectedEndDate).format('YYYY-MM-DD'),
    };

    const myId = ++requestIdRef.current;
    setLoading(true);

    try {
      const response = await postDataApi(
        'api/report2/finance-report',
        infoViewActionsContext,
        payload,
        false,
        false,
        { 'Content-Type': 'application/json' }
      );

      const next =
        Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];

      if (myId === requestIdRef.current) {
        setFilteredData(next);
      }
    } catch (error) {
      if (myId === requestIdRef.current) {
        setFilteredData([]);
      }
      infoViewActionsContext.fetchError(
        error?.message || formatMessage({id: 'report.requestFailed'}),
      );
    } finally {
      if (myId === requestIdRef.current) setLoading(false);
    }
  }, [
    selectedBranch,
    selectedStartDate,
    selectedEndDate,
    formatMessage,
    infoViewActionsContext,
  ]);

  /** ---- Export: Finance (human-readable) ---- */
  const exportToExcel = useCallback(() => {
    const rows = safeArray(filteredData);
    const headerRow = [
      tableHeaders.branch,
      tableHeaders.salesDate,
      tableHeaders.member,
      tableHeaders.invoiceNo,
      tableHeaders.bank,
      tableHeaders.creditDebit,
      tableHeaders.visa,
      tableHeaders.master,
      tableHeaders.amex,
      tableHeaders.deposit,
      tableHeaders.eWallet,
      tableHeaders.others,
      tableHeaders.grossTotal,
      tableHeaders.tax,
      tableHeaders.netTotal,
    ];

    const title = [
      [formatMessage({id: 'report.finance.title'})],
      [
        formatMessage(
          {id: 'report.startDate'},
          {
            date: selectedStartDate
              ? dayjs(selectedStartDate).format('DD/MM/YYYY')
              : formatMessage({id: 'common.notAvailable'}),
          },
        ),
      ],
      [
        formatMessage(
          {id: 'report.endDate'},
          {
            date: selectedEndDate
              ? dayjs(selectedEndDate).format('DD/MM/YYYY')
              : formatMessage({id: 'common.notAvailable'}),
          },
        ),
      ],
      [
        formatMessage(
          {id: 'report.branch'},
          {
            name:
              safeArray(selectedBranch)
                .map((id) => branchById.get(id)?.branch)
                .filter(Boolean)
                .join(', ') || formatMessage({id: 'common.notAvailable'}),
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

    const tableData = [headerRow];

    rows.forEach((record) => {
      const branchName =
        record?.branch?.branchName ||
        formatMessage({id: 'common.notAvailable'});
      const orderDate = record?.orderDate
        ? dayjs(record.orderDate).format('DD/MM/YYYY')
        : formatMessage({id: 'common.notAvailable'});
      const memberName =
        record?.member?.memberFullName ||
        formatMessage({id: 'common.notAvailable'});
      const invoiceNo =
        record?.orderNumber || formatMessage({id: 'common.notAvailable'});

      const pays = safeArray(record?.payments);
      const bucketSum = (bucket) =>
        pays.reduce((s, p) => (bucketOf(p?.payMethod) === bucket ? s + (Number(p?.payAmount) || 0) : s), 0);

      const bankTotal   = bucketSum('bank');
      const cardTotal   = bucketSum('card');
      const visaTotal   = bucketSum('visa');
      const masterTotal = bucketSum('master');
      const amexTotal   = bucketSum('amex');
      const depositTotal= bucketSum('deposit');
      const eWalletTotal= bucketSum('ewallet');
      const othersTotal = bucketSum('other');

      tableData.push([
          branchName,
          orderDate,
          memberName,
          invoiceNo,
          bankTotal ? bankTotal.toFixed(2) : '0.00',
          cardTotal ? cardTotal.toFixed(2) : '0.00',
          visaTotal ? visaTotal.toFixed(2) : '0.00',
          masterTotal ? masterTotal.toFixed(2) : '0.00',
          amexTotal ? amexTotal.toFixed(2) : '0.00',
          depositTotal ? depositTotal.toFixed(2) : '0.00',
          eWalletTotal ? eWalletTotal.toFixed(2) : '0.00',
          othersTotal ? othersTotal.toFixed(2) : '0.00',   // <— new
          record?.orderTotalAmount ? Number(record.orderTotalAmount).toFixed(2) : '0.00',
          record?.orderTotalTaxAmount ? Number(record.orderTotalTaxAmount).toFixed(2) : '0.00',
          record?.orderTotalNetAmount ? Number(record.orderTotalNetAmount).toFixed(2) : '0.00',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet([...title, [], ...tableData]);
    const startRow = title.length + 2;
    const numberCols = ['E','F','G','H','I','J','K','L','M','N','O'];

    for (let row = startRow; row <= tableData.length + title.length + 1; row++) {
      numberCols.forEach((col) => {
        const cellRef = `${col}${row}`;
        if (ws[cellRef] && !isNaN(ws[cellRef].v)) {
          ws[cellRef].v = Number(ws[cellRef].v);
          ws[cellRef].t = 'n';
          ws[cellRef].z = '0.00';
        }
      });
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      formatMessage({id: 'report.finance.title'}),
    );
    const fileName = `FinanceReport${dayjs().format('YYYYMMDD_HHmmss')}`;
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }, [
    filteredData,
    selectedBranch,
    selectedStartDate,
    selectedEndDate,
    branchById,
    formatMessage,
    tableHeaders,
  ]);


const handleExportExcelSQLFormat = useCallback(() => {
  try {
    const orders = safeArray(filteredData);
    if (orders.length === 0) return;

    const fileName = `SalesSQLReport${dayjs().format('YYYYMMDD_HHmmss')}`;
    const exportData = [];

    orders.forEach((data) => {
      const docDate =
        data?.orderDate ? dayjs(data.orderDate).format('D/M/YYYY') : '';
      const memberName = (data?.member?.memberFullName || '')
        .toString()
        .toUpperCase();

      // You don't have items here, so we export 1 row per order
      exportData.push({
        DocDate: docDate,
        'DocNo(20)': data?.orderNumber || '',
        'Code(10)': data?.branch?.customerCode || '',
        'CompanyName(100)': memberName,
        'ADDRESS1(60)': data?.member?.address || '',
        'ADDRESS2(60)': data?.member?.states || '',
        'ADDRESS3(60)': '',
        'ADDRESS4(60)': '',
        'POSTCODE(10)': data?.member?.postcode || '',
        'CITY(50)': data?.member?.city || '',
        'STATE(50)': data?.member?.states || '',
        'COUNTRY(2)': 'MY',
        'PHONE1(200)': data?.member?.mobileNumber || '',
        'Description_HDR(200)': 'SALES',
        'CC(200)': 'Post from 3rd Party App/System',
        SEQ: 0, // fill later
        'ACCOUNT(10)': data?.branch?.accountCode || '',
        // No line items available on this page:
        'ItemCode(30)': '',
        'Description_DTL(200)': '',
        Qty: 1, // or 0 if you prefer
        'UOM(10)': 'UNIT',
        UnitPrice: Number(data?.orderTotalNetAmount ?? 0),
        'Tax(10)': '', // you can map your tax code if you have one at order level
        TaxAmt: Number(data?.orderTotalTaxAmount ?? 0),
        'Net Amount': Number(data?.orderTotalNetAmount ?? 0),
      });
    });

    // Sort to assign SEQ deterministically
    exportData.sort((a, b) => {
      const da = dayjs(a.DocDate, 'D/M/YYYY').toDate().getTime() || 0;
      const db = dayjs(b.DocDate, 'D/M/YYYY').toDate().getTime() || 0;
      if (da !== db) return da - db;
      return String(a['DocNo(20)']).localeCompare(String(b['DocNo(20)']));
    });
    exportData.forEach((row, i) => (row.SEQ = i + 1));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      formatMessage({id: 'report.sheet.orders'}),
    );
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (err) {
    console.error('[SQL Export] ERROR', err);
    infoViewActionsContext.fetchError(
      formatMessage(
        {id: 'report.exportError'},
        {message: err?.message || err},
      ),
    );
  }
}, [filteredData, formatMessage, infoViewActionsContext]);


  /** ---- Autocomplete handlers (transitioned to keep UI responsive) ---- */
  const handleBranchChange = useCallback(
    (event, value) => {
      startTransition(() => {
        const isAll = value.some((v) => v._id === 'All Branch');
        const nextIds = isAll
          ? branchOptions.filter((b) => b._id !== 'All Branch').map((b) => b._id)
          : value.map((b) => b._id);
        setSelectedBranch(nextIds);
      });
    },
    [branchOptions]
  );

  const disableSubmit =
    !Array.isArray(selectedBranch) ||
    selectedBranch.length === 0 ||
    !selectedStartDate ||
    !selectedEndDate ||
    loading ||
    isPending;

  return (
    <Box>
      <Card sx={{ mt: 2, p: 5 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Header */}
          <Grid size={12}>
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
              <Typography variant="h1">
                {formatMessage({id: 'report.finance.title'})}
              </Typography>
              <Box gap={2} display="flex">
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={exportToExcel}
                  disabled={safeArray(filteredData).length === 0}
                  startIcon={<DownloadIcon />}
                >
                  {formatMessage({id: 'common.exportToExcel'})}
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={() => { console.log('[SQL Export] button clicked'); handleExportExcelSQLFormat(); }}
                  disabled={safeArray(filteredData).length === 0}
                  startIcon={<DownloadIcon />}
                >
                  {formatMessage({id: 'report.finance.exportSql'})}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Filters */}
          <Grid container size={{ md: 10, xs: 12 }}>
            <Grid size={{ md: 12, xs: 12 }}>
              <FormControl fullWidth margin="dense">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  filterSelectedOptions
                  id="branch-autocomplete"
                  options={branchOptions}
                  value={selectedBranchOptions}
                  getOptionLabel={(option) => option.branch || ''}
                  isOptionEqualToValue={(a, b) => a._id === b._id}
                  filterOptions={filterOptions}
                  onChange={handleBranchChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={<IntlMessages id="common.selectBranches" />}
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <DatePicker
                sx={{ width: '100%' }}
                variant="outlined"
                label={formatMessage({id: 'report.filters.fromDate'})}
                name="fromDate"
                value={selectedStartDate}
                onChange={(value) => setSelectedStartDate(value)}
                slotProps={{ textField: { margin: 'dense' } }}
                maxDate={dayjs().endOf('day')}
                format="DD/MM/YYYY"
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <DatePicker
                sx={{ width: '100%' }}
                variant="outlined"
                label={formatMessage({id: 'report.filters.toDate'})}
                name="toDate"
                value={selectedEndDate}
                onChange={(value) => setSelectedEndDate(value)}
                slotProps={{ textField: { margin: 'dense' } }}
                maxDate={dayjs().endOf('day')}
                format="DD/MM/YYYY"
              />
            </Grid>
          </Grid>

          <Grid size={{ md: 2, xs: 3 }} sx={{ marginLeft: 'auto' }}>
            <Button
              size="large"
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleClickSubmit}
              disabled={disableSubmit}
              startIcon={<FilterAltIcon />}
            >
              {loading || isPending
                ? formatMessage({id: 'report.loading'})
                : formatMessage({id: 'report.filters.submit'})}
            </Button>
          </Grid>

          {/* Table */}
          <Grid size={12}>
            <FinanceTable
              rows={filteredData}
              loading={loading}
              headers={tableHeaders}
              emptyMessage={formatMessage({id: 'report.noData'})}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

const ItemSalesReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default ItemSalesReportTable;