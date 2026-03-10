import React, {useState, useEffect} from 'react';
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
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const noOptionsText = formatMessage({ id: 'common.noOptionsAvailable' });

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch', {}, {}, true);

  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      setBranchOptions(opt);
    }
  }, [branchDatabase]);

  const handleClickSubmit = async () => {
    if (selectedBranch && selectedStartDate && selectedEndDate) {
      const formData = new FormData();
      formData.append('branch', selectedBranch);
      formData.append(
        'from_date',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      formData.append('to_date', dayjs(selectedEndDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          'api/report2/walk-in-report',
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
    const fileName = `CustomerWalkInReport_${currentDateTime}`;
    const formattedData = filteredData.map((item) => ({
      BookingNo: item.bookingNo,
      Branch: item.branch.branchName,
      FloorNo: item.floor.floorNo,
      RoomNo: item.room.room_no,
      Start: dayjs(item.start).format('YYYY-MM-DD HH:mm:ss'),
      End: dayjs(item.end).format('YYYY-MM-DD HH:mm:ss'),
      MemberName: item.member.memberFullName,
      MobileNumber: item.member.mobileNumber,
      PackageName: item.memberPackage.package.packageName,
      PackageCode: item.memberPackage.package.packageCode,
      CurrentBalance: item.memberPackage.currentBalance,
      Pax: item.pax,
      MalePax: item.malePax,
      FemalePax: item.femalPax,
      BookingStatus: item.bookingstatus,
      CheckInDate: item.checkin_date
        ? dayjs(item.checkin_date).format('YYYY-MM-DD HH:mm:ss')
        : '',
      CheckOutDate: item.checkout_date
        ? dayjs(item.checkout_date).format('YYYY-MM-DD HH:mm:ss')
        : '',
      BookingType: item.bookingType,
      BookingDate: dayjs(item.bookingDate).format('YYYY-MM-DD HH:mm:ss'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

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
              <Typography variant='h1'>Customer Walk In Report</Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                disabled={!filteredData}
                startIcon={<DownloadIcon />}
              >
                Export to Excel
              </Button>
            </Box>
          </Grid>
          <Grid size={{md: 3, xs: 12}}>
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
                  const branchIds = value.map((branch) => branch._id);
                  setSelectedBranch(branchIds);
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
            <DatePicker
              sx={{width: '100%'}}
              variant='outlined'
              label='From Date'
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
              label='To Date'
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
              Submit Filter
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              emptyMessage={noOptionsText}
              value={filteredData}
              sortOrder={1}
              showGridlines
              stripedRows
            >
              <Column
                field='member.memberFullName'
                header='Customer Name'
                style={{minWidth: '200px'}}
              />
              <Column
                field='member.mobileNumber'
                header='Contact No.'
                style={{minWidth: '200px'}}
              />
              <Column
                field='walkin_date'
                header='Walk-in Date'
                style={{minWidth: '200px'}}
                body={(rowData) =>
                  dayjs(rowData.checkin_date).format('DD/MM/YYYY')
                }
              />
              <Column
                field='walkin_date'
                header='Walk-in Time'
                style={{minWidth: '200px'}}
                body={(rowData) =>
                  dayjs(rowData.checkin_date).format('hh:mm A')
                }
              />
              <Column
                field='pax'
                header='No. of Pax'
                style={{minWidth: '200px'}}
              />
              <Column
                field='branch.branchName'
                header='Branch'
                style={{minWidth: '200px'}}
              />
              <Column
                field='floor.floorNo'
                header='Floor'
                style={{minWidth: '200px'}}
              />
              <Column
                field='room.room_no'
                header='Room'
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.package.packageName'
                header='Package Name'
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.currentBalance'
                header='Package Balance'
                style={{minWidth: '200px'}}
              />
              <Column
                field='memberPackage.package._id'
                header='Package ID'
                style={{minWidth: '200px'}}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

const CustomerWalkInReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default CustomerWalkInReportTable;
