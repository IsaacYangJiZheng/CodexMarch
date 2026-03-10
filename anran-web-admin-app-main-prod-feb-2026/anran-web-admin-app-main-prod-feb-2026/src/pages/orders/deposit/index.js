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

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import dayjs from 'dayjs';

import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../../../widgets/PopupColumnDialog';
import PropTypes from 'prop-types';

const MemberDepositList = ({branchOptions, setFilteredData, filteredData, reCallAPI}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [showPopupColumn, setShowPopupColumn] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    orderNumber: '',
    orderBranch: '',
    memberName: '',
    mobileNumber: '',
    branchName: '',
  });
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

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

  const columns = [
    {
      field: 'payDate',
      header: 'Deposit Date',
      dataType: 'date',
      style: {minWidth: '14rem'},
      displayOrder: 1,
      body: payDateBodyTemplate,
    },
    {
      field: 'depositNumber',
      header: 'Deposit No.',
      style: {minWidth: '12rem'},
      displayOrder: 2,
    },
    {
      field: 'member.memberFullName',
      header: 'Member Name',
      style: {minWidth: '12rem'},
      displayOrder: 5,
    },
    {
      field: 'member.mobileNumber',
      header: 'Mobile No',
      style: {minWidth: '12rem'},
      displayOrder: 6,
    },
    {
      field: 'branch.branchName',
      header: 'Branch Name',
      style: {minWidth: '12rem'},
      displayOrder: 7,
    },
    {
      field: 'payAmount',
      header: 'Amount',
      style: {minWidth: '12rem'},
      displayOrder: 8,
    },
    {
      field: 'payMethod',
      header: 'Method',
      style: {minWidth: '12rem'},
      displayOrder: 9,
    },
    {
      field: 'referenceNumber',
      header: 'Reference No.',
      style: {minWidth: '12rem'},
      displayOrder: 9,
    },
  ];

  React.useEffect(() => {
    setVisibleColumns(columns);
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
        <Typography variant='h1'>Deposits Listing</Typography>
        <Tooltip title='Column Selection' arrow>
          <IconButton onClick={() => setShowPopupColumn(true)} color='primary'>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title='Refresh' arrow>
          <IconButton onClick={() => reCallAPI()} color='primary'>
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
          {showFilters ? 'Hide Filters' : 'Show Filters'}
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
    reCallAPI();
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
            <Typography variant='h1'>Filter Member Deposits</Typography>
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
                  label='Purchase Date (From Date)'
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
                  label='Purchase Date (To Date)'
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
                  label='Filter by Invoice No.'
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
                  label='Filter by Name'
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
                  label='Filter by Mobile No'
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
                  <InputLabel>Filter by Branch</InputLabel>
                  <Select
                    label='Filter by Branch'
                    value={filters.branch || ''}
                    onChange={(e) =>
                      handleFilterChange('branch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>None</em>
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
                <Tooltip title='Reset' arrow>
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
                  Apply Filters
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
              emptyMessage='No records found.'
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
            reCallAPI={reCallAPI}
          />
        ) : null}
      </Card>
    </Box>
  );
};

export default MemberDepositList;

MemberDepositList.propTypes = {
  reCallAPI: PropTypes.func,
  filteredData: PropTypes.array,
  branchOptions: PropTypes.array,
  setFilteredData: PropTypes.func,
};
