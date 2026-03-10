import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Radio,
  FormControlLabel,
  RadioGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../../../../widgets/PopupColumnDialog';
import {useIntl} from 'react-intl';

const OfflineOrderList = ({
  setVisible,
  setSelectedRow,
  branchOptions,
}) => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [filteredData, setFilteredData] = React.useState(null);
  const [showPopupColumn, setShowPopupColumn] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [expandedRows, setExpandedRows] = React.useState(null);
  const [tableData, setTableData] = React.useState([]);
  const [showFilters, setShowFilters] = React.useState(true);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    orderNumber: '',
    orderBranch: '',
    memberName: '',
    mobileNumber: '',
    branchName: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [openCancelDialog, setOpenCancelDialog] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [otherReason, setOtherReason] = React.useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = React.useState(false);
  
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleExportExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `WalkinSalesHistory${currentDateTime}`;
    const exportData = [];
    filteredData.forEach((data) => {
      if (Array.isArray(data.items) && data.items.length > 0) {
        data.items.forEach((item) => {
          exportData.push({
            'Purchase Date': data.orderDateStr,
            'Invoice No': data.orderNumber,
            'Member Name': data.member.memberFullName,
            'Mobile No': data.member.mobileNumber,
            'Branch Name': data.branch.branchName,
            Amount: data.orderTotalNetAmount,
            Status: data.status,
            'Package Code': item?.package?.packageCode || '',
            'Package Name': item?.package?.packageName || '',
            Price: item?.unitPrice || '',
            Quantity: item?.quantity || '',
            'Net Amount': item?.netAmount || '',
            'Payment Date': data.payments[0]?.payDate || '',
            'Payment Method': data.payments[0]?.payMethod || '',
            'Paid Amount': data.payments[0]?.payAmount || '',
          });
        });
      }
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // const handleExportExcelSQLFormat = () => {
  //   const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
  //   const fileName = `WalkinSalesHistorySQL${currentDateTime}`;
  //   const exportData = [];
  //   let seq = 1;
  //   filteredData.forEach((data) => {
  //     if (Array.isArray(data.items) && data.items.length > 0) {
  //       data.items.forEach((item) => {
  //         exportData.push({
  //           'DocDate': data.orderDateStr,
  //           'DocNo(20)': data.orderNumber,
  //           'Code(10)': data.branch.customerCode,
  //           'CompanyName(100)': data.member.memberFullName,
  //           'ADDRESS1(60)': data.member.address,
  //           'ADDRESS2(60)': data.member.states,
  //           'ADDRESS3(60)': '',
  //           'ADDRESS4(60)': '',
  //           'POSTCODE(10)': data.member.postcode,
  //           'CITY(50)': data.member.city,
  //           'STATE(50)': data.member.states,
  //           'COUNTRY(2)': 'MY',
  //           'PHONE1(200)': data.member.mobileNumber,
  //           'Description_HDR(200)': 'SALES',
  //           'CC(200)': 'Post from 3rd Party App/System',
  //           'SEQ': seq++,
  //           'ACCOUNT(10)': data.branch.accountCode,
  //           'ItemCode(30)': item?.package?.packageCode || '',
  //           'Description_DTL(200)': item?.package?.packageName || '',
  //           Qty: item?.quantity || '',
  //           'UOM(10)': 'UNIT',
  //           UnitPrice: item?.unitPrice || '',
  //           'Tax(10)': item?.taxCode,
  //           TaxAmt: item?.taxAmount || '',
  //           'Net Amount': item?.netAmount || '',
  //         });
  //       });
  //     }
  //   });
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  //   XLSX.writeFile(workbook, `${fileName}.xlsx`);
  // };

  const formatDate = (value) => {
    return value.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const dateBodyTemplate = (rowData) => {
    if (rowData.orderDateStr instanceof Date) {
      return formatDate(rowData.orderDateStr);
    }
    return rowData.orderDateStr;
  };

  const payDateBodyTemplate = (rowData) => {
    if (rowData.payDate instanceof Date) {
      return formatDate(rowData.payDate);
    }
    return dayjs(rowData.payDate).format('MMMM D, YYYY h:mm A');
  };

  const actionBodyTemplate = (rowData) => {
    if (rowData.status === 'Paid') {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <IconButton color='success' onClick={() => handleOpenDialog(rowData)}>
            <ViewIcon />
          </IconButton>
          <IconButton color='error' onClick={() => handleOpenCancelDialog(rowData)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    } else {
      return null;
    }
  };

  const getStatusLabel = React.useCallback(
    (status) => {
      switch (status) {
        case 'Paid':
          return formatMessage({id: 'finance.sales.status.paid'});
        case 'Pending':
          return formatMessage({id: 'finance.sales.status.pending'});
        case 'Failed':
          return formatMessage({id: 'finance.sales.status.failed'});
        default:
          return status;
      }
    },
    [formatMessage],
  );

  const statusBodyTemplate = React.useCallback(
    (rowData) => {
      return (
        <Tag
          value={getStatusLabel(rowData.status)}
          severity={getSeverity(rowData)}
        ></Tag>
      );
    },
    [getStatusLabel],
  );

  const getSeverity = (rowData) => {
    switch (rowData.status) {
      case 'Paid':
        return 'success';

      case 'Pending':
        return 'warning';

      case 'Failed':
        return 'danger';

      default:
        return null;
    }
  };

  const handleOpenDialog = (rowData) => {
    setVisible(true);
    setSelectedRow(rowData);
  };

  const handleOpenCancelDialog = (rowData) => {
    setSelectedOrder(rowData);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
    setSelectedOrder(null);
  };

  const handleSaveCancelDialog = async () => {
    if (!cancelReason) {
      infoViewActionsContext.fetchError(
        formatMessage({id: 'finance.sales.cancel.errorReasonRequired'}),
      );
      return;
    }

    try {
      const response = await postDataApi(
        '/api/order-cancellation/cancel-order',
        infoViewActionsContext,
        { ...selectedOrder, cancelReason, otherReason },
        {},
        false,
        false
      );
      applyFilters();
      setTimeout(() => {
        infoViewActionsContext.showMessage(response.message);
      }, 300);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    } finally {
      handleCloseCancelDialog();
    }
  };

  const handleSaveCancelRequestDialog = async () => {
    if (!cancelReason) {
      infoViewActionsContext.fetchError(
        formatMessage({id: 'finance.sales.cancel.errorReasonRequired'}),
      );
      return;
    }

    try {
      const response = await postDataApi(
        '/api/order-cancellation/cancel-order-request',
        infoViewActionsContext,
        { ...selectedOrder, cancelReason, otherReason },
        {},
        false,
        false
      );
      applyFilters();
      setTimeout(() => {
        infoViewActionsContext.showMessage(response.message);
      }, 300);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    } finally {
      handleCloseCancelDialog();
    }
  };

  const handleCancelReasonChange = (e) => {
    const value = e.target.value;
    setCancelReason(value);
    if (value !== 'Others') {
      setOtherReason('');
    }
  };

  const columns = React.useMemo(
    () => [
      {
        field: 'orderDateStr',
        header: formatMessage({id: 'finance.sales.table.purchaseDate'}),
        dataType: 'date',
        style: {minWidth: '14rem'},
        displayOrder: 1,
        body: dateBodyTemplate,
        sortable: true,
      },
      {
        field: 'orderNumber',
        header: formatMessage({id: 'finance.sales.table.invoiceNo'}),
        style: {minWidth: '12rem'},
        displayOrder: 2,
      },
      {
        field: 'member.memberFullName',
        header: formatMessage({id: 'finance.sales.table.memberName'}),
        style: {minWidth: '12rem'},
        displayOrder: 5,
      },
      {
        field: 'member.mobileNumber',
        header: formatMessage({id: 'finance.sales.table.mobileNo'}),
        style: {minWidth: '12rem'},
        displayOrder: 6,
      },
      {
        field: 'branch.branchName',
        header: formatMessage({id: 'finance.sales.table.branchName'}),
        style: {minWidth: '12rem'},
        displayOrder: 7,
      },
      {
        field: 'orderTotalNetAmount',
        header: formatMessage({id: 'finance.sales.table.amount'}),
        style: {minWidth: '12rem'},
        displayOrder: 8,
      },
      {
        field: 'status',
        header: formatMessage({id: 'finance.sales.table.status'}),
        style: {minWidth: '12rem'},
        displayOrder: 8,
        body: statusBodyTemplate,
      },
    ],
    [formatMessage, statusBodyTemplate],
  );

  React.useEffect(() => {
    setVisibleColumns((prev) => {
      if (!prev.length) {
        return columns;
      }
      return prev
        .map((prevCol) => columns.find((col) => col.field === prevCol.field))
        .filter(Boolean);
    });
  }, [columns]);

  React.useEffect(() => {
    if (filteredData?.length > 0) {
      setTableData(getData(filteredData));
    }
  }, [filteredData]);

  console.log(tableData);

  const getData = (data) => {
    return [...(data || [])].map((d) => {
      d.orderDateStr = new Date(d.orderDateStr);

      return d;
    });
  };

  const header = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box display='flex' alignItems='center' gap={2}>
        <Typography variant='h1'>
          {formatMessage({id: 'finance.sales.listing'})}
        </Typography>
        <Tooltip title={formatMessage({id: 'common.columnSelection'})} arrow>
          <IconButton onClick={() => setShowPopupColumn(true)} color='primary'>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage({id: 'common.refresh'})} arrow>
          <IconButton onClick={() => applyFilters()} color='primary'>
            <RefreshOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box display='flex' alignItems='center' gap={2}>
        <Button
          size='large'
          variant='outlined'
          startIcon={showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
          onClick={toggleFilters}
        >
          {showFilters
            ? formatMessage({id: 'finance.sales.filter.hide'})
            : formatMessage({id: 'finance.sales.filter.show'})}
        </Button>
        <Button
          size='large'
          variant='contained'
          color='primary'
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
        >
          {formatMessage({id: 'finance.sales.export'})}
        </Button>
        {/* <Button
          size='large'
          variant='contained'
          color='primary'
          startIcon={<DownloadIcon />}
          onClick={handleExportExcelSQLFormat}
        >
          Export to Excel SQL Format
        </Button> */}
      </Box>
    </Box>
  );

  const onRowExpand = (event) => {
    console.log(event.data.name);
  };

  const onRowCollapse = (event) => {
    console.log(event.data.name);
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div className='p-3'>
        <h5>
          {formatMessage(
            {id: 'finance.sales.section.packagesFor'},
            {orderNumber: data.orderNumber},
          )}
        </h5>
        <div className='card'>
          <DataTable value={data.items}>
            <Column
              field='package.packageCode'
              header={formatMessage({id: 'finance.sales.table.packageCode'})}
              style={{width: '4rem'}}
            ></Column>
            <Column
              field='package.packageName'
              header={formatMessage({id: 'finance.sales.table.packageName'})}
              style={{width: '14rem'}}
            ></Column>
            <Column
              field='unitPrice'
              header={formatMessage({id: 'finance.sales.table.price'})}
              style={{width: '5rem'}}
            ></Column>
            <Column
              field='quantity'
              header={formatMessage({id: 'finance.sales.table.quantity'})}
              style={{width: '5rem'}}
            ></Column>
            <Column
              field='netAmount'
              header={formatMessage({id: 'finance.sales.table.netAmount'})}
              style={{width: '5rem'}}
            ></Column>
          </DataTable>
        </div>
        <h5>
          {formatMessage(
            {id: 'finance.sales.section.paymentsFor'},
            {orderNumber: data.orderNumber},
          )}
        </h5>
        <div className='card'>
          <DataTable value={data.payments}>
            <Column
              field='payDate'
              header={formatMessage({id: 'finance.sales.table.paymentDate'})}
              style={{width: '4rem'}}
              body={payDateBodyTemplate}
            ></Column>
            <Column
              field='payMethod'
              header={formatMessage({id: 'finance.sales.table.method'})}
              style={{width: '5rem'}}
            ></Column>
            <Column
              field='payAmount'
              header={formatMessage({id: 'finance.sales.table.paidAmount'})}
              style={{width: '14rem'}}
            ></Column>
          </DataTable>
        </div>
      </div>
    );
  };

  const allowExpansion = (rowData) => {
    return rowData?.items && rowData.items.length > 0;
  };

  const applyFilters = async () => {
    const {
      memberName,
      mobileNumber,
      orderBranch,
      startDate,
      endDate,
      orderNumber,
    } = filters;
    if (
      memberName ||
      mobileNumber ||
      orderBranch ||
      startDate ||
      endDate ||
      orderNumber
    ) {
      const formData = new FormData();
      if (orderNumber) formData.append('orderNumber', orderNumber);
      if (memberName) formData.append('memberName', memberName);
      if (mobileNumber) formData.append('mobileNumber', mobileNumber);
      if (orderBranch) formData.append('orderBranch', orderBranch);
      if (startDate)
        formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate)
        formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));
      try {
        setLoading(true);
        const response = await postDataApi(
          '/api/order/findAllv2',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log('Filtered members:', response);
        setLoading(false);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
        setLoading(false);
      }
    } else {
      console.log('No filters applied');
      setFilteredData(null);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      memberName: '',
      mobileNumber: '',
      orderNumber: '',
      orderBranch: '',
      startDate: '',
      endDate: '',
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        applyFilters();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filters]);

  return (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'finance.sales.filter.walkInTitle'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
              {/* Start Date Picker */}
              <Grid size={{md: 3, xs: 12}}>
                <DatePicker
                  slotProps={{field: {clearable: true}}}
                  sx={{width: '100%'}}
                  label={formatMessage({
                    id: 'finance.sales.filter.purchaseDateFrom',
                  })}
                  value={filters.startDate ? dayjs(filters.startDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'startDate',
                      newValue ? newValue.toISOString() : null,
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>
              {/* End Date Picker */}
              <Grid size={{md: 3, xs: 12}}>
                <DatePicker
                  slotProps={{field: {clearable: true}}}
                  sx={{width: '100%'}}
                  label={formatMessage({
                    id: 'finance.sales.filter.purchaseDateTo',
                  })}
                  value={filters.endDate ? dayjs(filters.endDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'endDate',
                      newValue ? newValue.toISOString() : null,
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>
              {/* Filter by Invoice No. */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'finance.sales.filter.invoiceNo'})}
                  variant='outlined'
                  fullWidth
                  value={filters.orderNumber}
                  onChange={(e) =>
                    handleFilterChange('orderNumber', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Name */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'finance.sales.filter.memberName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.memberName}
                  onChange={(e) =>
                    handleFilterChange('memberName', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Mobile No */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'finance.sales.filter.mobileNo'})}
                  variant='outlined'
                  fullWidth
                  value={filters.mobileNumber}
                  onChange={(e) =>
                    handleFilterChange('mobileNumber', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Branch */}
              <Grid size={{md: 3, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'finance.sales.filter.branch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'finance.sales.filter.branch'})}
                    value={filters.orderBranch || ''}
                    onChange={(e) =>
                      handleFilterChange('orderBranch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    {branchOptions?.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {/* Filter Buttons */}
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
              justifyContent='flex-end'
            >
              {/* Reset Filters Button */}
              <Grid size={{xs: 'auto'}} sx={{textAlign: 'center'}}>
                <Tooltip title={formatMessage({id: 'common.reset'})} arrow>
                  <IconButton onClick={resetFilters} color='primary'>
                    <RefreshOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              {/* Apply Filters Button */}
              <Grid size={{xs: 'auto'}}>
                <Button
                  size='large'
                  variant='outlined'
                  onClick={applyFilters}
                  fullWidth
                >
                  {formatMessage({id: 'finance.sales.filter.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <DataTable
              header={header}
              value={filteredData?.length > 0 ? filteredData : []}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              loading={loading}
              emptyMessage={formatMessage({id: 'common.noRecordFound'})}
              selectionMode='single'
              // onSelectionChange={(e) => setSelectedRow(e.value)}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              onRowExpand={onRowExpand}
              onRowCollapse={onRowCollapse}
              rowExpansionTemplate={rowExpansionTemplate}
              showGridlines
              stripedRows
            >
              <Column expander={allowExpansion} style={{minWidth: '3rem'}} />
              {visibleColumns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  dataType={col.dataType}
                  header={col.header}
                  showFilterMenu={col.showFilterMenu ? true : false}
                  filter={col.filter ? true : false}
                  filterElement={col.filterElement ? col.filterElement : null}
                  filterPlaceholder={
                    col.filterPlaceholder ? col.filterPlaceholder : null
                  }
                  filterApply={col.filterApply ? col.filterApply : null}
                  filterClear={col.filterClear ? col.filterClear : null}
                  filterFooter={col.filterFooter ? col.filterFooter : null}
                  style={col.style ? col.style : null}
                  sortable={col.sortable ? true : false}
                  body={col.body ? col.body : null}
                />
              ))}
              <Column
                header={formatMessage({id: 'finance.sales.table.action'})}
                body={actionBodyTemplate}
                exportable={false}
                style={{maxWidth: '8rem'}}
              />
            </DataTable>
          </Grid>
        </Grid>
        {showPopupColumn ? (
          <PopupColumnDialog
            isOpen={showPopupColumn}
            setOpenDialog={() => setShowPopupColumn(false)}
            columns={columns}
            setVisibleColumns={setVisibleColumns}
            visibleColumns={visibleColumns}
          />
        ) : null}
      </Card>
      <AppDialog
        dividers
        maxWidth='md'
        open={openCancelDialog}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseCancelDialog}
            title={formatMessage({id: 'finance.sales.cancel.title'})}
            isCancelOrder
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant='h3'>
              {formatMessage({id: 'finance.sales.cancel.reasonPrompt'})}
            </Typography>
          </Grid>
          <Grid size={12}>
            <FormControl component="fieldset">
              <RadioGroup
                value={cancelReason}
                onChange={handleCancelReasonChange}
              >
                <FormControlLabel
                  value="Duplicate Entry"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.duplicateEntry',
                  })}
                />
                <FormControlLabel
                  value="Change of Payment Method"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.changePaymentMethod',
                  })}
                />
                <FormControlLabel
                  value="Change of Package"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.changePackage',
                  })}
                />
                <FormControlLabel
                  value="Invalid Purchased"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.invalidPurchased',
                  })}
                />
                <FormControlLabel
                  value="Invalid Amount"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.invalidAmount',
                  })}
                />
                <FormControlLabel
                  value="Others"
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.others',
                  })}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          {cancelReason === 'Others' && (
            <Grid size={12}>
              <TextField
                label={formatMessage({
                  id: 'finance.sales.cancel.otherPlaceholder',
                })}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            </Grid>
          )}
        </Grid>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseCancelDialog}
            color="primary"
            variant='outlined'
          >
            {formatMessage({id: 'finance.sales.cancel.back'})}
          </Button>
          {user.permission.includes(RoutePermittedRole2.finance_sales_delete) ? (
            <Button onClick={() => setOpenConfirmationDialog(true)} color="warning" variant='contained'>
              {formatMessage({id: 'finance.sales.cancel.title'})}
            </Button>
          ) : (
            <Button onClick={() => setOpenConfirmationDialog(true)} color="warning" variant='contained'>
              {formatMessage({id: 'finance.sales.cancel.sendRequest'})}
            </Button>
          )}
        </Box>
      </AppDialog>

      <AppDialog
        dividers
        maxWidth='xs'
        hideClose
        open={openConfirmationDialog}
        title={
          <CardHeader
            onCloseAddCard={() => setOpenConfirmationDialog(false)}
            title={formatMessage({id: 'finance.sales.cancel.confirmTitle'})}
          />
        }
      >
        <Typography variant="h3">
          {formatMessage({id: 'finance.sales.cancel.confirmMessage'})}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <Button onClick={() => setOpenConfirmationDialog(false)} color="primary" variant="outlined">
            {formatMessage({id: 'common.no'})}
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmationDialog(false);
              if (user.permission.includes(RoutePermittedRole2.finance_sales_delete)) {
                handleSaveCancelDialog();
              } else {
                handleSaveCancelRequestDialog();
              }
            }}
            color="warning"
            variant="contained"
          >
            {formatMessage({id: 'common.yes'})}
          </Button>
        </Box>
      </AppDialog>
    </Box>
  );
};

export default OfflineOrderList;

OfflineOrderList.propTypes = {
  setSelectedRow: PropTypes.func,
  setVisible: PropTypes.func,
  branchOptions: PropTypes.array,
};