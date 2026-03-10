import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  Autocomplete,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';

import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';

const LogsTable = () => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch/role-based', {}, {}, true);
  const [{apiData: staffName}] = useGetDataApi(
    '/api/staff',
    {},
    {},
    true,
  );

  console.log('staff', staffName);

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

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/report2/confirmation-daily-sales/all',
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

  const money = (v) =>
  new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v ?? 0));

const moneyBody = (field) => (row) => money(row[field]);

  const confirmationStatusBodyTemplate = (rowData) => {
    const confirmationStatusLabels = {
      Confirmed: formatMessage({id: 'common.confirmed'}),
      Pending: formatMessage({id: 'common.pending'}),
    };
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

  // Template to display staff name instead of UID
  const confirmedByBodyTemplate = (rowData) => {
    if (!rowData.confirmedBy) return '-';
    const staff = Array.isArray(staffName)
      ? staffName.find((s) => s._id === rowData.confirmedBy)
      : null;
    return staff ? staff.name : rowData.confirmedBy;
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

  const handleClickSubmit = async () => {
    if (
      selectedBranch ||
      selectedStartDate ||
      selectedEndDate
    ) {
      const formData = new FormData();
      if(selectedBranch) formData.append('branch', selectedBranch);
      if(selectedStartDate)
      formData.append(
        'startDate',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      if(selectedEndDate)
      formData.append(
        'endDate',
        dayjs(selectedEndDate).format('YYYY-MM-DD'),
      );
      try {
        const response = await postDataApi(
          'api/report2/confirmation-daily-sales/all',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log(filteredData);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  const resetFilters = () => {
    setSelectedBranch('');
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    fetchData();
  };

  const exportToExcel = () => {
    const tableData = [
      [
        formatMessage({id: 'common.branch'}),
        formatMessage({id: 'report.confirmedBy'}),
        formatMessage({id: 'report.confirmationLogs.totalAmount'}),
        formatMessage({id: 'report.confirmationLogs.totalDiscount'}),
        formatMessage({id: 'report.confirmationLogs.totalTax'}),
        formatMessage({id: 'report.confirmationLogs.netAmount'}),
        formatMessage({id: 'report.confirmedAtLabel'}),
      ],
    ];

    const titleRow2 = [
      [formatMessage({id: 'report.confirmationLogs.title'})],
      [
        formatMessage(
          {id: 'report.generatedDateTime'},
          {dateTime: dayjs().format('DD/MM/YYYY HH:mm:ss')},
        ),
      ],
    ];

    const emptyRow = [];
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `DailySalesConfirmationLogs${currentDateTime}`;
    
    filteredData.data.forEach((record) => {
      const branchName =
        record.branch?.branchName ||
        formatMessage({id: 'common.notAvailable'});
      const confirmedAt = record.confirmedAt
        ? dayjs(record.confirmedAt).format('DD/MM/YYYY')
        : formatMessage({id: 'common.notAvailable'});
      let staffDisplayName = formatMessage({id: 'common.notAvailable'});
      if (record.confirmedBy) {
        if (Array.isArray(staffName)) {
          const staff = staffName.find((s) => s._id === record.confirmedBy);
          staffDisplayName = staff ? staff.name : record.confirmedBy;
        } else {
          staffDisplayName = record.confirmedBy;
        }
      }
      
      const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

      // Add row to tableData
      tableData.push([
        branchName,
        staffDisplayName,
        round2(record.totalAmount),
        round2(record.totalDiscount),
        round2(record.totalTax),
        round2(record.totalReceived),
        confirmedAt,
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet([...titleRow2, emptyRow, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      formatMessage({id: 'report.confirmationLogs.title'}),
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
                {formatMessage({id: 'report.confirmationLogs.title'})}
              </Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                startIcon={<DownloadIcon />}
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
                  field: {clearable: true},
                }}
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
                  field: {clearable: true},
                }}
                maxDate={dayjs().endOf('day')}
                format='DD/MM/YYYY'
              />
            </Grid>
          </Grid>
          <Grid container size={{md: 2, xs: 3}} sx={{marginLeft: 'auto'}}>
            <Grid size={12}>
              <Button
                size='large'
                variant='outlined'
                color='primary'
                fullWidth
                onClick={handleClickSubmit}
                disabled={
                  (!selectedBranch || (Array.isArray(selectedBranch) && selectedBranch.length === 0)) &&
                  !selectedStartDate &&
                  !selectedEndDate
                }
                startIcon={<FilterAltIcon />}
              >
                {formatMessage({id: 'report.filters.submit'})}
              </Button>
            </Grid>
            <Grid size={12} sx={{textAlign: 'center'}}>
              <Tooltip title={formatMessage({id: 'common.reset'})} arrow>
                <IconButton onClick={resetFilters} color='primary'>
                  <RefreshOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={filteredData ? filteredData.data : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              emptyMessage={formatMessage({id: 'report.noRecordsFound'})}
              showGridlines
              stripedRows
            >
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'common.branch'})}
                style={{minWidth: '14rem'}}
              />
              <Column
                field='confirmedBy'
                header={formatMessage({id: 'report.confirmedBy'})}
                style={{minWidth: '12rem'}}
                body={confirmedByBodyTemplate}
              />
              <Column
                field='totalAmount'
                header={formatMessage({id: 'report.confirmationLogs.totalAmount'})}
                style={{minWidth: '12rem'}}
                body={moneyBody('totalAmount')}
              />
              <Column
                field='totalDiscount'
                header={formatMessage({id: 'report.confirmationLogs.totalDiscount'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='totalTax'
                header={formatMessage({id: 'report.confirmationLogs.totalTax'})}
                style={{minWidth: '12rem'}}
                body={moneyBody('totalTax')} 
              />
              <Column
                field='totalReceived'
                header={formatMessage({id: 'report.confirmationLogs.netAmount'})}
                style={{minWidth: '12rem'}}
                body={moneyBody('totalReceived')}
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
      </Card>
    </Box>
  );
};

const ConfirmationHistoryLogsTable = () => {
  return (
    <Box>
      <Card>
        <LogsTable />
      </Card>
    </Box>
  );
};

export default ConfirmationHistoryLogsTable;