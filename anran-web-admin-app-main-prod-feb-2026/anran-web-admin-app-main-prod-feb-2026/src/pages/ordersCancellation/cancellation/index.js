import React from 'react';
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

  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DeleteIcon from '@mui/icons-material/Delete';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import dayjs from 'dayjs';

import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import {useIntl} from 'react-intl';

const OrderCancellationList = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {formatMessage, locale} = useIntl();
  const [filteredData, setFilteredData] = React.useState(null);
  const [showPopupColumn, setShowPopupColumn] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState(null);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [openCancelDialog, setOpenCancelDialog] = React.useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    orderNumber: '',
    orderBranch: '',
    memberName: '',
    mobileNumber: '',
    branchName: '',
  });

  const [{apiData: branchOptions}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleOpenCancelDialog = (rowData) => {
    setSelectedOrder(rowData);
    setCancelReason(rowData.cancellationReason);
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
        '/api/order-cancellation/cancel-order-request-approval',
        infoViewActionsContext,
        { ...selectedOrder, cancelReason },
        {},
        false,
        false
      );
      fetchData();
      setTimeout(() => {
        infoViewActionsContext.showMessage(response.message);
      }, 300);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    } finally {
      handleCloseCancelDialog();
    }
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/order-cancellation/findAll',
        infoViewActionsContext,
        {},
        false,
        false,
      );
      setFilteredData(response);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  const formatDate = (value) => {
    return dayjs(value).format('MM/DD/YYYY');
  };

  const formatTime = (value) => {
    return dayjs(value).format('h:mm A');
  };

  const CancellationDateBodyTemplate = (rowData) => {
    const cancellationDate = dayjs(rowData.isCreated);
    if (cancellationDate.isValid()) {
      return (
        <>
          <div>{`${formatDate(cancellationDate)} ${formatTime(cancellationDate)}`}</div>
        </>
      );
    }
    return rowData.isCreated;
  };

  const OrdersDateBodyTemplate = (rowData) => {
    const cancellationDate = dayjs(rowData.ordersDate);
    if (cancellationDate.isValid()) {
      return (
        <>
          <div>{`${formatDate(cancellationDate)} ${formatTime(cancellationDate)}`}</div>
        </>
      );
    }
    return rowData.isCreated;
  };

  const ActionBodyTemplate = (rowData) => {
    return (
      <Button
        onClick={() => handleOpenCancelDialog(rowData)}
        color='warning'
        variant='outlined'
        disabled={rowData.status !== 'Pending'}
      >
        {rowData.status === 'Pending' ? (
          <Box>
            <DeleteIcon />
            {formatMessage({id: 'finance.cancellation.action.approve'})}
          </Box>
        ) : (
          formatMessage({id: 'finance.cancellation.action.approved'})
        )}
      </Button>
    );
  };

  const getCancellationReasonLabel = (reason) => {
    switch (reason) {
      case 'Duplicate Entry':
        return formatMessage({id: 'finance.sales.cancel.reason.duplicateEntry'});
      case 'Change of Payment Method':
        return formatMessage({
          id: 'finance.sales.cancel.reason.changePaymentMethod',
        });
      case 'Change of Package':
        return formatMessage({id: 'finance.sales.cancel.reason.changePackage'});
      case 'Invalid Purchased':
        return formatMessage({
          id: 'finance.sales.cancel.reason.invalidPurchased',
        });
      case 'Invalid Amount':
        return formatMessage({id: 'finance.sales.cancel.reason.invalidAmount'});
      case 'Others':
        return formatMessage({id: 'finance.sales.cancel.reason.others'});
      default:
        return reason;
    }
  };

  const CancellationReasonBodyTemplate = (rowData) => {
    if (rowData.cancellationReason === 'Others') {
      return rowData.otherReason || getCancellationReasonLabel('Others');
    }
    return getCancellationReasonLabel(rowData.cancellationReason);
  };

  const statusBodyTemplate = (rowData) => {
    if (rowData.status === 'Pending') {
      return formatMessage({id: 'common.pending'});
    }
    if (rowData.status === 'Approved') {
      return formatMessage({id: 'finance.cancellation.action.approved'});
    }
    return rowData.status;
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const columns = React.useMemo(
    () => [
    {
      field: 'isCreated',
      header: formatMessage({id: 'finance.cancellation.table.cancellationDate'}),
      dataType: 'date',
      style: {minWidth: '14rem'},
      displayOrder: 1,
      body: CancellationDateBodyTemplate,
    },
    {
      field: 'ordersDate',
      header: formatMessage({id: 'finance.cancellation.table.orderDate'}),
      dataType: 'date',
      style: {minWidth: '14rem'},
      displayOrder: 2,
      body: OrdersDateBodyTemplate,
    },
    {
      field: 'ordersNumber',
      header: formatMessage({id: 'finance.sales.table.invoiceNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 3,
    },
    {
      field: 'member.memberFullName',
      header: formatMessage({id: 'finance.sales.table.memberName'}),
      style: {minWidth: '12rem'},
      displayOrder: 4,
    },
    {
      field: 'member.mobileNumber',
      header: formatMessage({id: 'finance.sales.table.mobileNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 5,
    },
    {
      field: 'ordersBranch.branchName',
      header: formatMessage({id: 'finance.sales.table.branchName'}),
      style: {minWidth: '12rem'},
      displayOrder: 6,
    },
    {
      field: 'ordersTotalNetAmount',
      header: formatMessage({id: 'finance.sales.table.amount'}),
      style: {minWidth: '12rem'},
      displayOrder: 7,
    },
    {
      field: 'cancellationReason',
      header: formatMessage({id: 'finance.cancellation.table.reason'}),
      style: {minWidth: '12rem'},
      displayOrder: 8,
      body: CancellationReasonBodyTemplate,
    },
    {
      field: 'status',
      header: formatMessage({id: 'finance.cancellation.table.status'}),
      style: {minWidth: '12rem'},
      displayOrder: 9,
      body: statusBodyTemplate,
    },
    ],
    [formatMessage, locale],
  );

  React.useEffect(() => {
    setVisibleColumns((prev) => {
      if (!prev || prev.length === 0) {
        return columns;
      }
      const prevFields = new Set(prev.map((col) => col.field));
      const nextColumns = columns.filter((col) => prevFields.has(col.field));
      return nextColumns.length > 0 ? nextColumns : columns;
    });
    if (filteredData?.length > 0) {
      setTableData(filteredData);
    }
  }, [columns, filteredData]);

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
            {id: 'finance.cancellation.table.orderItemsTitle'},
            {orderNumber: data.ordersNumber},
          )}
        </h5>
        <div className='card'>
          <DataTable value={data.items}>
            <Column
              field='orderItemsPackage.packageCode'
              header={formatMessage({id: 'finance.sales.table.packageCode'})}
              style={{width: '4rem'}}
            ></Column>
            <Column
              field='orderItemsPackage.packageName'
              header={formatMessage({id: 'finance.sales.table.packageName'})}
              style={{width: '14rem'}}
            ></Column>
            <Column
              field='orderItemsUnitPrice'
              header={formatMessage({id: 'finance.sales.table.price'})}
              style={{width: '5rem'}}
            />
            <Column
              field='orderItemsQuantity'
              header={formatMessage({id: 'finance.sales.table.quantity'})}
              style={{width: '5rem'}}
            />
          </DataTable>
        </div>
        <h5>
          {formatMessage(
            {id: 'finance.cancellation.table.paymentDetailsTitle'},
            {orderNumber: data.ordersNumber},
          )}
        </h5>
        <div className='card'>
          <DataTable value={data.payments}>
            <Column
              field='paymentsNumber'
              header={formatMessage({id: 'finance.cancellation.table.paymentNo'})}
              style={{width: '14rem'}}
            />
            <Column
              field='paymentsDate'
              header={formatMessage({id: 'finance.sales.table.paymentDate'})}
              style={{width: '4rem'}}
            ></Column>
            <Column
              field='paymentsMethod'
              header={formatMessage({id: 'finance.sales.table.method'})}
              style={{width: '5rem'}}
            ></Column>
            <Column
              field='paymentsAmount'
              header={formatMessage({id: 'finance.sales.table.paidAmount'})}
              style={{width: '14rem'}}
            ></Column>
            <Column
              field='paymentsReference'
              header={formatMessage({id: 'finance.cancellation.table.reference'})}
              style={{width: '14rem'}}
            />
          </DataTable>
        </div>
      </div>
    );
  };

  const allowExpansion = (rowData) => {
    return rowData?.items && rowData.items.length > 0;
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
          {formatMessage({id: 'finance.cancellation.listing.title'})}
        </Typography>
        <Tooltip title={formatMessage({id: 'common.columnSelection'})} arrow>
          <IconButton onClick={() => setShowPopupColumn(true)} color='primary'>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage({id: 'common.refresh'})} arrow>
          <IconButton onClick={() => fetchData()} color='primary'>
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
      </Box>
    </Box>
  );

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
        const response = await postDataApi(
          '/api/order-cancellation/findAll',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        setTableData(response);
        console.log('Filtered members:', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
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
              {formatMessage({id: 'finance.cancellation.filter.title'})}
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
                  sx={{width: '100%'}}
                  label={formatMessage({id: 'finance.cancellation.filter.dateFrom'})}
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
                  sx={{width: '100%'}}
                  label={formatMessage({id: 'finance.cancellation.filter.dateTo'})}
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
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
              justifyContent='flex-end'
            >
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
              value={tableData?.length > 0 ? tableData : []}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              emptyMessage={formatMessage({id: 'report.noRecordsFound'})}
              selectionMode='single'
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
                header={formatMessage({id: 'finance.cancellation.table.action'})}
                body={ActionBodyTemplate}
                exportable={false}
                style={{maxWidth: '12rem'}}
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
            reCallAPI={fetchData}
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
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant='h1'>
              {formatMessage({id: 'finance.sales.cancel.reasonPrompt'})}
            </Typography>
          </Grid>
          <Grid size={12}>
            <FormControl component='fieldset'>
              <RadioGroup
                disabled
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <FormControlLabel
                  value='Duplicate Entry'
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.duplicateEntry',
                  })}
                />
                <FormControlLabel
                  value='Change of Payment Method'
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.changePaymentMethod',
                  })}
                />
                <FormControlLabel
                  value='Change of Package'
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.changePackage',
                  })}
                />
                <FormControlLabel
                  value='Invalid Purchased'
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.invalidPurchased',
                  })}
                />
                <FormControlLabel
                  value='Invalid Amount'
                  control={<Radio />}
                  label={formatMessage({
                    id: 'finance.sales.cancel.reason.invalidAmount',
                  })}
                />
                <FormControlLabel
                  value='Others'
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
                fullWidth
                multiline
                rows={4}
                disabled
                label={formatMessage({id: 'finance.sales.cancel.otherPlaceholder'})}
                variant='outlined'
                margin='normal'
                value={selectedOrder?.otherReason}
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
            color='primary'
            variant='outlined'
          >
            {formatMessage({id: 'finance.sales.cancel.back'})}
          </Button>
          <Button
            onClick={() => setOpenConfirmationDialog(true)}
            color='warning'
            variant='contained'
          >
            {formatMessage({id: 'finance.cancellation.approve.title'})}
          </Button>
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
            title={formatMessage({id: 'finance.cancellation.approve.title'})}
          />
        }
      >
        <Typography variant='h3'>
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
          <Button
            onClick={() => setOpenConfirmationDialog(false)}
            color='primary'
            variant='outlined'
          >
            {formatMessage({id: 'common.no'})}
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmationDialog(false);
              handleSaveCancelDialog();
            }}
            color='warning'
            variant='contained'
          >
            {formatMessage({id: 'common.yes'})}
          </Button>
        </Box>
      </AppDialog>
    </Box>
  );
};

export default OrderCancellationList;