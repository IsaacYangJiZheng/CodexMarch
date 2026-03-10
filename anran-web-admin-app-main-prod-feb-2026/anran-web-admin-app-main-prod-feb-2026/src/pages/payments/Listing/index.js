import React, {useState, useEffect} from 'react';
import {useAuthUser} from '@anran/utility/AuthHooks';
import AppInfoView from '@anran/core/AppInfoView';
import {
  Card,
  Box,
  Button,
  Typography,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import OrdersDetail from './invoice';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import {useIntl} from 'react-intl';

const PaymentList = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  console.log('useAuthUser:', user);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [filters, setFilters] = React.useState({
    orderNumber: '',
    orderBranch: '',
    memberName: '',
    mobileNumber: '',
    orderMode: '',
  });

  const [{apiData: branchData}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const [selectedRow, setSelectedRow] = React.useState(null);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/payments/findAll/today',
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

  console.log('filteredData', filteredData);

  React.useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (value) => {
    return value.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const dateBodyTemplate = (rowData) => {
    if (rowData) {
      const payDate = new Date(rowData.payDate);
      if (!isNaN(payDate.getTime())) {
        return formatDate(payDate);
      }
      return rowData.payDate;
    }
    return '';
  };

  const applyFilters = async () => {
    const {memberName, mobileNumber, orderBranch, orderNumber, orderMode} =
      filters;
    if (memberName || mobileNumber || orderBranch || orderNumber || orderMode) {
      const formData = new FormData();
      if (orderNumber) formData.append('orderNumber', orderNumber);
      if (memberName) formData.append('memberName', memberName);
      if (mobileNumber) formData.append('mobileNumber', mobileNumber);
      if (orderBranch) formData.append('orderBranch', orderBranch);
      if (orderMode) formData.append('orderMode', orderMode);
      try {
        const response = await postDataApi(
          '/api/payments/findAll/today',
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
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    } else {
      console.log('No filters applied');
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
      orderMode: '',
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

  // Datatable Columns Set Up
  const columns = React.useMemo(
    () => [
    {
      field: 'payDate',
      header: formatMessage({id: 'finance.payments.table.paymentDate'}),
      style: {width: '14rem'},
      displayOrder: 1,
      body: dateBodyTemplate,
      sortable: true,
    },
    {
      field: 'orderNumber',
      header: formatMessage({id: 'finance.payments.table.invoiceNo'}),
      style: {minWidth: '200px'},
      displayOrder: 2,
    },
    {
      field: 'member.memberFullName',
      header: formatMessage({id: 'finance.payments.table.customerName'}),
      style: {minWidth: '200px'},
      displayOrder: 3,
    },
    {
      field: 'member.mobileNumber',
      header: formatMessage({id: 'finance.payments.table.contactNo'}),
      style: {minWidth: '200px'},
      displayOrder: 4,
    },
    {
      field: 'order.branch.branchName',
      header: formatMessage({id: 'finance.payments.table.branch'}),
      style: {minWidth: '200px'},
      displayOrder: 5,
    },
    {
      field: 'order.orderMode',
      header: formatMessage({id: 'finance.payments.table.purchaseType'}),
      style: {minWidth: '200px'},
      displayOrder: 6,
    },
    {
      field: 'representative',
      header: formatMessage({id: 'finance.payments.table.representative'}),
      style: {minWidth: '200px'},
      displayOrder: 7,
    },
    {
      field: 'order.package.packageName',
      header: formatMessage({id: 'finance.payments.table.purchasePackage'}),
      style: {minWidth: '200px'},
      displayOrder: 8,
    },
    {
      field: 'order.package.packageCode',
      header: formatMessage({id: 'finance.payments.table.packageId'}),
      style: {minWidth: '200px'},
      displayOrder: 9,
    },
    {
      field: 'order.orderTotalAmount',
      header: formatMessage({id: 'finance.payments.table.packageAmount'}),
      style: {minWidth: '150px'},
      displayOrder: 10,
    },
    {
      field: 'order.orderTotalDiscountAmount',
      header: formatMessage({id: 'finance.payments.table.discountAmount'}),
      style: {minWidth: '150px'},
      displayOrder: 11,
    },
    {
      field: 'order.orderTotalAmount',
      header: formatMessage({id: 'finance.payments.table.subtotal'}),
      style: {minWidth: '150px'},
      displayOrder: 12,
    },
    {
      field: 'order.orderTotalTaxAmount',
      header: formatMessage({id: 'finance.payments.table.sst'}),
      style: {minWidth: '150px'},
      displayOrder: 13,
    },
    {
      field: 'order.orderTotalNetAmount',
      header: formatMessage({id: 'finance.payments.table.grandTotal'}),
      style: {minWidth: '150px'},
      displayOrder: 14,
    },
    {
      field: 'payAmount',
      header: formatMessage({id: 'finance.payments.table.paymentAmount'}),
      style: {minWidth: '150px'},
      displayOrder: 14,
    },
    {
      field: 'payMethod',
      header: formatMessage({id: 'finance.payments.table.paymentType'}),
      style: {minWidth: '150px'},
      displayOrder: 15,
    },
    {
      field: 'payReference',
      header: formatMessage({id: 'finance.payments.table.paymentReference'}),
      style: {minWidth: '150px'},
      displayOrder: 15,
    },
    {
      field: 'order.status',
      header: formatMessage({id: 'finance.payments.table.status'}),
      style: {minWidth: '100px'},
      displayOrder: 16,
    },
    ],
    [formatMessage],
  );

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const handleExportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `${formatMessage({
      id: 'finance.payments.export.fileName',
    })}${currentDateTime}`;
    const exportData = [];
    filteredData.forEach((data) => {
      exportData.push({
        [formatMessage({id: 'finance.payments.table.paymentDate'})]:
          dayjs(data.payDate).format('MM/DD/YYYY'),
        [formatMessage({id: 'finance.payments.table.invoiceNo'})]:
          data.orderNumber,
        [formatMessage({id: 'finance.payments.table.customerName'})]:
          data.member.memberFullName,
        [formatMessage({id: 'finance.payments.table.contactNo'})]:
          data.member.mobileNumber,
        [formatMessage({id: 'finance.payments.table.branch'})]:
          data.order.branch.branchName,
        [formatMessage({id: 'finance.payments.table.purchaseType'})]:
          data.order.orderMode,
        [formatMessage({id: 'finance.payments.table.representative'})]:
          data.representative,
        [formatMessage({id: 'finance.payments.table.purchasePackage'})]:
          data.order.package.packageName,
        [formatMessage({id: 'finance.payments.table.packageId'})]:
          data.order.package.packageCode,
        [formatMessage({id: 'finance.payments.table.packageAmount'})]:
          data.order.orderTotalAmount,
        [formatMessage({id: 'finance.payments.table.discountAmount'})]:
          data.order.orderTotalDiscountAmount,
        [formatMessage({id: 'finance.payments.table.subtotal'})]:
          data.order.orderTotalAmount,
        [formatMessage({id: 'finance.payments.table.sst'})]:
          data.order.orderTotalTaxAmount,
        [formatMessage({id: 'finance.payments.table.grandTotal'})]:
          data.order.orderTotalNetAmount,
        [formatMessage({id: 'finance.payments.table.paymentAmount'})]:
          data.payAmount,
        [formatMessage({id: 'finance.payments.table.paymentType'})]:
          data.payMethod,
        [formatMessage({id: 'finance.payments.table.paymentReference'})]:
          data.payReference,
        [formatMessage({id: 'finance.payments.table.status'})]:
          data.order.status,
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h1'>
          {formatMessage({id: 'finance.payments.listing.title'})}
        </Typography>
        <Button
          size='large'
          startIcon={<ExpandMoreOutlinedIcon />}
          onClick={() => setShowPopupColumn(true)}
        />
        <Button
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => applyFilters()}
        />
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
          onClick={handleExportToExcel}
        >
          {formatMessage({id: 'common.exportToExcel'})}
        </Button>
      </Box>
    </Box>
  );

  return selectedRow ? (
    <OrdersDetail selectedRow={selectedRow} setSelectedRow={setSelectedRow} />
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'finance.payments.filter.title'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
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
                    {branchData?.length > 0
                      ? branchData.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.branchName}
                          </MenuItem>
                        ))
                      : []}
                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Purchace Type */}
              <Grid size={{xs: 12, md: 3}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'finance.payments.filter.orderMode'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'finance.payments.filter.orderMode'})}
                    value={filters.orderMode || ''}
                    onChange={(e) =>
                      handleFilterChange('orderMode', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    <MenuItem value='Online'>
                      {formatMessage({id: 'finance.payments.filter.orderMode.online'})}
                    </MenuItem>
                    <MenuItem value='walk-in'>
                      {formatMessage({id: 'finance.payments.filter.orderMode.walkIn'})}
                    </MenuItem>
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
                <Tooltip title={formatMessage({id: 'common.refresh'})} arrow>
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
              emptyMessage={formatMessage({id: 'table.empty'})}
              selectionMode='single'
              // onSelectionChange={(e) => setSelectedRow(e.value)}
              tableStyle={{minWidth: '50rem'}}
              showGridlines
              stripedRows
            >
              <Column
                header={formatMessage({id: 'finance.payments.table.index'})}
                headerStyle={{width: '3rem'}}
                body={(data, options) => options.rowIndex + 1}
              />
              {visibleColumns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  showFilterMenu={col.showFilterMenu ? true : false}
                  filter={col.filter ? true : false}
                  filterElement={col.filterElement ? col.filterElement : null}
                  filterPlaceholder={
                    col.filterPlaceholder ? col.filterPlaceholder : null
                  }
                  style={col.style ? col.style : null}
                  sortable={col.sortable ? true : false}
                  body={col.body ? col.body : null}
                />
              ))}
            </DataTable>
          </Grid>
        </Grid>
        <PopupColumnDialog
          isOpen={showPopupColumn}
          setOpenDialog={() => setShowPopupColumn(false)}
          columns={columns}
          setVisibleColumns={setVisibleColumns}
          visibleColumns={visibleColumns}
        />
        <AppInfoView />
      </Card>
    </Box>
  );
};

export default PaymentList;