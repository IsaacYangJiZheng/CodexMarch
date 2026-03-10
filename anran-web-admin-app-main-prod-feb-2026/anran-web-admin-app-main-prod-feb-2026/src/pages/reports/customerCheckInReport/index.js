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
  MenuItem,
  Select,
  InputLabel,
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
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [contactNumber, setContactNumber] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [bookingType, setBookingType] = useState('');
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
    if (
      selectedBranch &&
      contactNumber &&
      selectedStartDate &&
      selectedEndDate &&
      bookingType
    ) {
      const formData = new FormData();
      formData.append('branch', selectedBranch);
      formData.append('contactNumber', contactNumber);
      formData.append(
        'from_date',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      formData.append('to_date', dayjs(selectedEndDate).format('YYYY-MM-DD'));
      formData.append('bookingType', bookingType);
      try {
        const response = await postDataApi(
          'api/report2/check-in-report',
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

  const exportToExcel = () => {
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `CustomerCheckInReport${currentDateTime}`;

    const selectedBranches = selectedBranch
      .map(
        (branchId) =>
          branchOptions.find((branch) => branch._id === branchId)?.branch,
      )
      .join(', ') || formatMessage({id: 'common.all'});

    const titleRow = [
      formatMessage({id: 'report.customerCheckIn.title'}),
      formatMessage(
        {id: 'report.customerCheckIn.filters.summary'},
        {
          branch: selectedBranches,
          contactNumber:
            contactNumber || formatMessage({id: 'common.notAvailable'}),
          fromDate: selectedStartDate
            ? dayjs(selectedStartDate).format('DD/MM/YYYY')
            : formatMessage({id: 'common.notAvailable'}),
          toDate: selectedEndDate
            ? dayjs(selectedEndDate).format('DD/MM/YYYY')
            : formatMessage({id: 'common.notAvailable'}),
          type: bookingType || formatMessage({id: 'common.all'}),
        },
      ),
    ];
  
    // Empty row for spacing
    const emptyRow = [];
      // Column headers
    const headers = [
      formatMessage({id: 'report.customerCheckIn.table.bookingNo'}),
      formatMessage({id: 'common.branch'}),
      formatMessage({id: 'report.customerCheckIn.table.floorNo'}),
      formatMessage({id: 'report.customerCheckIn.table.roomNo'}),
      formatMessage({id: 'report.customerCheckIn.table.start'}),
      formatMessage({id: 'report.customerCheckIn.table.end'}),
      formatMessage({id: 'report.customerCheckIn.table.memberName'}),
      formatMessage({id: 'report.customerCheckIn.table.mobileNumber'}),
      formatMessage({id: 'report.customerCheckIn.table.packageName'}),
      formatMessage({id: 'report.customerCheckIn.table.packageCode'}),
      formatMessage({id: 'report.customerCheckIn.table.currentBalance'}),
      formatMessage({id: 'report.customerCheckIn.table.pax'}),
      formatMessage({id: 'report.customerCheckIn.table.malePax'}),
      formatMessage({id: 'report.customerCheckIn.table.femalePax'}),
      formatMessage({id: 'report.customerCheckIn.table.bookingStatus'}),
      formatMessage({id: 'report.customerCheckIn.table.checkInDate'}),
      formatMessage({id: 'report.customerCheckIn.table.checkOutDate'}),
      formatMessage({id: 'report.customerCheckIn.table.bookingType'}),
      formatMessage({id: 'report.customerCheckIn.table.bookingDate'}),
    ];

    // Map filtered data into an array of arrays for Excel
    const tableData = filteredData.map(item => ([
      item.bookingNo,
      item.branch.branchName,
      item.floor.floorNo,
      item.room.room_no,
      dayjs(item.start).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(item.end).format('YYYY-MM-DD HH:mm:ss'),
      item.member.memberFullName,
      item.member.mobileNumber,
      item.memberPackage.package.packageName,
      item.memberPackage.package.packageCode,
      item.memberPackage.currentBalance,
      item.pax,
      item.malePax,
      item.femalPax,
      item.bookingstatus,
      item.checkin_date ? dayjs(item.checkin_date).format('YYYY-MM-DD HH:mm:ss') : '',
      item.checkout_date ? dayjs(item.checkout_date).format('YYYY-MM-DD HH:mm:ss') : '',
      item.bookingType,
      dayjs(item.bookingDate).format('YYYY-MM-DD HH:mm:ss'),
    ]));
    // const formattedData = filteredData.map((item) => ({
    //   BookingNo: item.bookingNo,
    //   Branch: item.branch.branchName,
    //   FloorNo: item.floor.floorNo,
    //   RoomNo: item.room.room_no,
    //   Start: dayjs(item.start).format('YYYY-MM-DD HH:mm:ss'),
    //   End: dayjs(item.end).format('YYYY-MM-DD HH:mm:ss'),
    //   MemberName: item.member.memberFullName,
    //   MobileNumber: item.member.mobileNumber,
    //   PackageName: item.memberPackage.package.packageName,
    //   PackageCode: item.memberPackage.package.packageCode,
    //   CurrentBalance: item.memberPackage.currentBalance,
    //   Pax: item.pax,
    //   MalePax: item.malePax,
    //   FemalePax: item.femalPax,
    //   BookingStatus: item.bookingstatus,
    //   CheckInDate: item.checkin_date
    //     ? dayjs(item.checkin_date).format('YYYY-MM-DD HH:mm:ss')
    //     : '',
    //   CheckOutDate: item.checkout_date
    //     ? dayjs(item.checkout_date).format('YYYY-MM-DD HH:mm:ss')
    //     : '',
    //   BookingType: item.bookingType,
    //   BookingDate: dayjs(item.bookingDate).format('YYYY-MM-DD HH:mm:ss'),
    // }));

    const worksheet = XLSX.utils.aoa_to_sheet([titleRow, emptyRow, headers, ...tableData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      formatMessage({id: 'report.sheet.bookings'}),
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
                {formatMessage({id: 'report.customerCheckIn.title'})}
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
            <Grid size={{md: 3, xs: 12}}>
              <TextField
                margin='dense'
                label={formatMessage({id: 'report.customerCheckIn.filter.contactNo'})}
                variant='outlined'
                fullWidth
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </Grid>
            <Grid size={{md: 3, xs: 12}}>
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
            <Grid size={{md: 3, xs: 12}}>
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
            <Grid size={{md: 3, xs: 12}}>
              <FormControl margin='dense' fullWidth>
                <InputLabel>
                  {formatMessage({id: 'report.customerCheckIn.filter.type'})}
                </InputLabel>
                <Select
                  label={formatMessage({id: 'report.customerCheckIn.filter.type'})}
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                >
                  <MenuItem value='All'>
                    {formatMessage({id: 'common.all'})}
                  </MenuItem>
                  <MenuItem value='Instant'>{formatMessage({id: 'report.customerCheckIn.filter.type.checkIn'})}
                  </MenuItem>
                  <MenuItem value='Online'>{formatMessage({id: 'report.customerCheckIn.filter.type.walkIn'})}
                  </MenuItem>
                  <MenuItem value='Mobile'>{formatMessage({id: 'report.customerCheckIn.filter.type.mobile'})}
                  </MenuItem>
                    
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid size={{md: 2, sx: 3}} sx={{marginLeft: 'auto'}}>
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
            <DataTable
              value={filteredData}
              emptyMessage={noOptionsText}
              sortOrder={1}
              showGridlines
              stripedRows
            >
              <Column
                field='member.memberFullName'
                header={formatMessage({id: 'report.customerCheckIn.table.customerName'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='member.mobileNumber'
                header={formatMessage({id: 'report.customerCheckIn.table.contactNo'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='checkin_date'
                header={formatMessage({id: 'report.customerCheckIn.table.checkInDate'})}
                style={{minWidth: '200px'}}
                body={(rowData) =>
                  dayjs(rowData.checkin_date).format('DD/MM/YYYY')
                }
              />
              <Column
                field='checkin_date'
                header={formatMessage({id: 'report.customerCheckIn.table.checkInTime'})}
                style={{minWidth: '200px'}}
                body={(rowData) =>
                  dayjs(rowData.checkin_date).format('hh:mm A')
                }
              />
              <Column
                field='pax'
                header={formatMessage({id: 'report.customerCheckIn.table.paxCount'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'common.branch'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='floor.floorNo'
                header={formatMessage({id: 'report.customerCheckIn.table.floor'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='room.room_no'
                header={formatMessage({id: 'report.customerCheckIn.table.room'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.package.packageName'
                header={formatMessage({id: 'report.customerCheckIn.table.packageName'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.currentBalance'
                header={formatMessage({id: 'report.customerCheckIn.table.packageBalance'})}
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.package._id'
                header={formatMessage({id: 'report.customerCheckIn.table.packageId'})}
                style={{minWidth: '200px'}}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

const CustomerCheckInReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default CustomerCheckInReportTable;