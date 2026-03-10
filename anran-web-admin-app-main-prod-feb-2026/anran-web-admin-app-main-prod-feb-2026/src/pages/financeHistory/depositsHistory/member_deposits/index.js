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
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import dayjs from 'dayjs';

import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../../widgets/PopupColumnDialog';
import AppInfoView from '@anran/core/AppInfoView';
import OrdersDetail from '../invoice';
import CardHeader from '../CardHeader';
import AppDialog from '@anran/core/AppDialog';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import {useIntl} from 'react-intl';

const MemberDepositList = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {formatMessage, locale} = useIntl();
  const [showPopupColumn, setShowPopupColumn] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
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

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/memberDeposit/findAll',
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

  const payDateBodyTemplate = (rowData) => {
    if (rowData.payDate instanceof Date) {
      return formatDate(rowData.payDate);
    }
    return dayjs(rowData.payDate).format('MMMM D, YYYY h:mm A');
  };

  const payAmountBodyTemplate = (rowData) => {
    return `RM ${parseFloat(rowData.payAmount).toFixed(2)}`;
  };

  const actionBodyTemplate = (rowData) => {
    if (rowData.payMethod != 'Deduction') {
      return (
        <IconButton color='success' onClick={() => handleOpenDialog(rowData)}>
          <ViewIcon />
        </IconButton>
      );
    } else {
      return <></>;
    }
  };

  const handleOpenDialog = (rowData) => {
    setVisible(true);
    setSelectedRow(rowData);
  };

  const columns = React.useMemo(
    () => [
    {
      field: 'payDate',
      header: formatMessage({id: 'finance.deposits.table.depositDate'}),
      dataType: 'date',
      style: {minWidth: '14rem'},
      displayOrder: 1,
      body: payDateBodyTemplate,
      sortable: true,
    },
    {
      field: 'depositNumber',
      header: formatMessage({id: 'finance.deposits.table.depositNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 2,
    },
    {
      field: 'member.memberFullName',
      header: formatMessage({id: 'finance.sales.table.memberName'}),
      style: {minWidth: '12rem'},
      displayOrder: 3,
    },
    {
      field: 'member.mobileNumber',
      header: formatMessage({id: 'finance.sales.table.mobileNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 4,
    },
    {
      field: 'branch.branchName',
      header: formatMessage({id: 'finance.sales.table.branchName'}),
      style: {minWidth: '12rem'},
      displayOrder: 5,
    },
    {
      field: 'payAmount',
      header: formatMessage({id: 'finance.deposits.table.amount'}),
      style: {minWidth: '12rem'},
      displayOrder: 6,
      body: payAmountBodyTemplate,
    },
    {
      field: 'payMethod',
      header: formatMessage({id: 'finance.deposits.table.method'}),
      style: {minWidth: '12rem'},
      displayOrder: 7,
    },
    {
      field: 'referenceNumber',
      header: formatMessage({id: 'finance.deposits.table.referenceNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 8,
    },
    {
      field: 'orderNumber',
      header: formatMessage({id: 'finance.deposits.table.invoiceNo'}),
      style: {minWidth: '12rem'},
      displayOrder: 9,
      body: (rowData) => rowData.orderNumber || rowData.depositNumber || '-',
    },
    ],
    [formatMessage, locale],
  );

  const handleExportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `${formatMessage({id: 'finance.deposits.export.fileName'})}${currentDateTime}`;
    const exportData = [];
    filteredData.forEach((data) => {
      exportData.push({
        [formatMessage({id: 'finance.deposits.table.depositDate'})]: data.payDate
          ? dayjs(data.payDate).format('MMMM D, YYYY h:mmA')
          : '-',
        [formatMessage({id: 'finance.deposits.table.depositNo'})]:
          data.depositNumber || '-',
        [formatMessage({id: 'finance.sales.table.memberName'})]:
          data.member?.memberFullName || '-',
        [formatMessage({id: 'finance.sales.table.mobileNo'})]:
          data.member?.mobileNumber || '-',
        [formatMessage({id: 'finance.sales.table.branchName'})]:
          data.branch?.branchName || '-',
        [formatMessage({id: 'finance.deposits.table.amount'})]:
          data.payAmount ?? '-',
        [formatMessage({id: 'finance.deposits.table.method'})]:
          data.payMethod || '-',
        [formatMessage({id: 'finance.deposits.table.referenceNo'})]:
          data.referenceNumber || '-',
        [formatMessage({id: 'finance.deposits.table.invoiceNo'})]:
          data.orderNumber || '-',
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  React.useEffect(() => {
    setVisibleColumns((prev) => {
      if (!prev || prev.length === 0) {
        return columns;
      }
      const prevFields = new Set(prev.map((col) => col.field));
      const nextColumns = columns.filter((col) => prevFields.has(col.field));
      return nextColumns.length > 0 ? nextColumns : columns;
    });
  }, [columns]);

  React.useEffect(() => {
    if (filteredData?.length > 0) {
      setTableData(filteredData);
    }
  }, [filteredData]);

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
          {formatMessage({id: 'finance.deposits.listing'})}
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

  const applyFilters = async () => {
    const {
      memberName,
      mobileNumber,
      branch,
      startDate,
      endDate,
      depositNumber,
    } = filters;
    if (
      memberName ||
      mobileNumber ||
      branch ||
      startDate ||
      endDate ||
      depositNumber
    ) {
      const formData = new FormData();
      if (depositNumber) formData.append('depositNumber', depositNumber);
      if (memberName) formData.append('memberName', memberName);
      if (mobileNumber) formData.append('mobileNumber', mobileNumber);
      if (branch) formData.append('branch', branch);
      if (startDate)
        formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate)
        formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          '/api/memberDeposit/findAll',
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
      depositNumber: '',
      branch: '',
      startDate: '',
      endDate: '',
    });
    fetchData();
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
              {formatMessage({id: 'finance.deposits.filter.title'})}
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
                  label={formatMessage({id: 'finance.deposits.filter.dateFrom'})}
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
                  label={formatMessage({id: 'finance.deposits.filter.dateTo'})}
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
                  label={formatMessage({id: 'finance.deposits.filter.depositNo'})}
                  variant='outlined'
                  fullWidth
                  value={filters.depositNumber}
                  onChange={(e) =>
                    handleFilterChange('depositNumber', e.target.value)
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
                    value={filters.branch || ''}
                    onChange={(e) =>
                      handleFilterChange('branch', e.target.value)
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
              showGridlines
              stripedRows
            >
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
                header={formatMessage({id: 'finance.deposits.table.action'})}
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
            reCallAPI={fetchData}
          />
        ) : null}
      </Card>
      {visible ? (
        <AppDialog
          dividers
          fullHeight
          isDocumentView
          maxWidth='1200px'
          maxHeight='700px'
          open={visible}
          hideClose
          title={
            <CardHeader
              onCloseAddCard={() => {
                setVisible(false);
                setSelectedRow(null);
              }}
              title={formatMessage({id: 'member.invoice.title'})}
            />
          }
        >
          <OrdersDetail
            invoiceData={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        </AppDialog>
      ) : (
        <></>
      )}
      <AppInfoView />
    </Box>
  );
};

export default MemberDepositList;