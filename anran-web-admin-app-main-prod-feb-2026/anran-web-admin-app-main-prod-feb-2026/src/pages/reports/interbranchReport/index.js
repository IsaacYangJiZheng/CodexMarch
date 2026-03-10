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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';

const ReportTable = () => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
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

  const handleClickSubmit = async () => {
    if (selectedBranch && selectedStartDate && selectedEndDate) {
      const formData = new FormData();
      formData.append('selectedBranch', selectedBranch);
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
          'api/report2/inter-branch-cost',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response.detail);
        console.log(filteredData);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  console.log(filteredData);

  const exportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `InterBranchCostingReport_${currentDateTime}`;
    const titleRow = [
      formatMessage({id: 'report.interbranch.title'}),
      formatMessage(
        {id: 'report.interbranch.filters.summary'},
        {
          branch:
            branchOptions.find((b) => b._id === selectedBranch)?.branch ||
            formatMessage({id: 'common.notAvailable'}),
          fromDate: selectedStartDate
            ? dayjs(selectedStartDate).format('DD/MM/YYYY')
            : formatMessage({id: 'common.notAvailable'}),
          toDate: selectedEndDate
            ? dayjs(selectedEndDate).format('DD/MM/YYYY')
            : formatMessage({id: 'common.notAvailable'}),
        },
      ),
    ];
    const emptyRow = [];
    const headers = [
      formatMessage({id: 'report.interbranch.table.checkInNo'}),
      formatMessage({id: 'report.interbranch.table.homeBranch'}),
      formatMessage({id: 'report.interbranch.table.checkInBranch'}),
      formatMessage({id: 'report.interbranch.table.memberName'}),
      formatMessage({id: 'report.interbranch.table.mobileNumber'}),
      formatMessage({id: 'report.interbranch.table.packageName'}),
      formatMessage({id: 'report.interbranch.table.packageCode'}),
      formatMessage({id: 'report.interbranch.table.pax'}),
      formatMessage({id: 'report.interbranch.table.totalCost'}),
      formatMessage({id: 'report.interbranch.table.costSharing'}),
      formatMessage({id: 'report.interbranch.table.checkInDate'}),
    ];
  
    // Formatted data rows
    const formattedData = filteredData.map((item) => ([
      item.bookingNo || formatMessage({id: 'common.notAvailable'}),
      item.homeBranch?.branchName || formatMessage({id: 'common.notAvailable'}),
      item.checkInBranch?.branchName || formatMessage({id: 'common.notAvailable'}),
      item.member?.memberFullName || formatMessage({id: 'common.notAvailable'}),
      item.member?.mobileNumber || formatMessage({id: 'common.notAvailable'}),
      item.package?.packageName || formatMessage({id: 'common.notAvailable'}),
      item.package?.packageCode || formatMessage({id: 'common.notAvailable'}),
      item.pax || 0,
      item.totalCost?.toFixed(2) || '0.00',
      (item.totalCost / item.pax || 0).toFixed(2),
      item.checkin_date ? dayjs(item.checkin_date).format('YYYY-MM-DD HH:mm:ss') : '',
    ]));
    // const formattedData = filteredData.map((item) => ([
    //   'CheckIn/WalkIn No': item.bookingNo || 'N/A',
    //   HomeBranch: item.homeBranch?.branchName || 'N/A',
    //   CheckInBranch: item.checkInBranch?.branchName || 'N/A',
    //   MemberName: item.member?.memberFullName || 'N/A',
    //   MobileNumber: item.member?.mobileNumber || 'N/A',
    //   PackageName: item.package?.packageName || 'N/A',
    //   PackageCode: item.package?.packageCode || 'N/A',
    //   Pax: item.pax || 0,
    //   TotalCost: item.totalCost?.toFixed(2) || '0.00',
    //   CostSharing: (item.totalCost / item.pax || 0).toFixed(2),
    //   CheckInDate: item.checkin_date
    //     ? dayjs(item.checkin_date).format('YYYY-MM-DD HH:mm:ss')
    //     : '',
    // ]));
    const worksheet = XLSX.utils.aoa_to_sheet([titleRow, emptyRow, headers, ...formattedData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      formatMessage({id: 'report.sheet.data'}),
    );
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
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
                {formatMessage({id: 'report.interbranch.title'})}
              </Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                disabled={!filteredData}
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
                !selectedBranch ||
                // !selectedPackageCategory ||
                !selectedStartDate ||
                !selectedEndDate
              }
              startIcon={<FilterAltIcon />}
            >
              {formatMessage({id: 'report.filters.submit'})}
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable value={filteredData} emptyMessage={noOptionsText}>
              <Column
                field='homeBranch.branchName'
                header={formatMessage({id: 'report.interbranch.table.homeBranch'})}
              />
              <Column
                field='member.memberFullName'
                header={formatMessage({id: 'report.interbranch.table.customerName'})}
              />
              <Column
                field='member.mobileNumber'
                header={formatMessage({id: 'report.interbranch.table.customerPhone'})}
              />
              <Column
                field='bookingNo'
                header={formatMessage({id: 'report.interbranch.table.checkInNo'})}
              />
              <Column
                field='checkInBranch.branchName'
                header={formatMessage({id: 'report.interbranch.table.checkInBranch'})}
              />
              <Column
                header={formatMessage({id: 'common.date'})}
                style={{minWidth: '200px'}}
                body={(rowData) =>
                  rowData.checkin_date
                    ? dayjs(rowData.checkin_date).format('DD-MM-YYYY hh:mm A')
                    : ''
                }
              />
              <Column
                field='pax'
                header={formatMessage({id: 'report.interbranch.table.quantity'})}
              />
              <Column
                field='package.packageCategory'
                header={formatMessage({id: 'report.interbranch.table.category'})}
              />
              <Column
                field='package.packageName'
                header={formatMessage({id: 'report.interbranch.table.packageName'})}
              />
              <Column
                field='package.packageCode'
                header={formatMessage({id: 'report.interbranch.table.packageId'})}
              />
              <Column
                header={formatMessage({id: 'report.interbranch.table.costSharing'})}
                body={(rowData) => {
                  const costSharing = rowData.totalCost / rowData.pax || 0;
                  return costSharing.toFixed(2);
                }}
              />
              <Column
                header={formatMessage({id: 'report.interbranch.table.totalCost'})}
                body={(rowData) => {
                  const totalCost = rowData.totalCost;
                  return totalCost.toFixed(2);
                }}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

const InterBranchReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default InterBranchReportTable;