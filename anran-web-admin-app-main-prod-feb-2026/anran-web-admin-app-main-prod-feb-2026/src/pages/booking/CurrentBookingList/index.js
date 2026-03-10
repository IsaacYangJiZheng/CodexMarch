import React, {useState, useEffect, useRef} from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';
import {Toast} from 'primereact/toast';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import AppInfoView from '@anran/core/AppInfoView';
import {Fonts} from 'shared/constants/AppEnums';

import BookingDetail from './booking_detail';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';

import clsx from 'clsx';
import dayjs from 'dayjs';
import {useIntl} from 'react-intl';

const BookingList = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {formatMessage} = useIntl();
  // const [areaOptions, setAreaOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    branch: '',
    bookingNumber: '',
    memberName: '',
    mobileNumber: '',
    packageId: '',
  });
  const toast = useRef(null);

  // const [{apiData: branchDatabase, loading}] = useGetDataApi(
  //   'api/booking/today/v3',
  //   {},
  //   {},
  //   true,
  // );

  // const [{apiData: areaData}] = useGetDataApi('api/area', {}, {}, true);

  // Retrieve Data
  // useEffect(() => {
  //   if (areaData?.length > 0) {
  //     let opt = [];
  //     areaData?.map((area) => {
  //       opt.push({areaName: area.areaName, _id: area._id});
  //     });
  //     setAreaOptions(opt);
  //   }
  // }, [areaData]);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const [{apiData: branchData}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await postDataApi(
        '/api/booking/today/findAll',
        infoViewActionsContext,
        {},
        false,
        false,
      );
      setFilteredData(response);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('filteredData', filteredData);

  React.useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (value) => {
    return dayjs(value).format('MM/DD/YYYY');
  };

  const formatTime = (value) => {
    return dayjs(value).format('h:mm A');
  };

  const dateBodyTemplate = (rowData) => {
    const bookingDate = dayjs(rowData.bookingDate);
    if (bookingDate.isValid()) {
      return (
        <>
          <div>{`${formatDate(bookingDate)} ${formatTime(bookingDate)}`}</div>
        </>
      );
    }
    return rowData.bookingDate;
  };
  const slotDateBodyTemplate = (rowData) => {
    return (
      <Typography>
        {dayjs(rowData.start).format('DD-MMM-YYYY h:mm A')} -
        {dayjs(rowData.end).format('h:mm A')}
      </Typography>
    );
  };

  const checkInBodyTemplate = (rowData) => {
    const checkin_date = dayjs(rowData.checkin_date);
    if (checkin_date.isValid()) {
      return (
        <>
          <div>{`${formatDate(checkin_date)} ${formatTime(checkin_date)}`}</div>
        </>
      );
    }
    return rowData.checkin_date;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={getBookingStatusLabel(rowData.bookingstatus)}
        severity={getSeverity(rowData)}
      ></Tag>
    );
  };

  const getBookingStatusLabel = (status) => {
    switch (status) {
      case 'Booked':
        return formatMessage({id: 'booking.status.booked'});
      case 'Complete':
        return formatMessage({id: 'booking.status.completed'});
      case 'Cancel':
        return formatMessage({id: 'booking.status.cancelled'});
      case 'CheckedIn':
        return formatMessage({id: 'booking.status.checkedIn'});
      default:
        return status;
    }
  };

  const getSeverity = (rowData) => {
    switch (rowData.bookingstatus) {
      case 'Complete':
        return 'success';

      case 'Booked':
        return 'warning';

      case 'Cancel':
        return 'danger';

      default:
        return null;
    }
  };

  const applyFilters = async () => {
    console.log(filters);
    const {
      memberName,
      mobileNumber,
      branch,
      startDate,
      endDate,
      bookingNumber,
      packageId,
      status,
    } = filters;
    if (
      startDate ||
      endDate ||
      memberName ||
      mobileNumber ||
      branch ||
      bookingNumber ||
      packageId ||
      status
    ) {
      const formData = new FormData();
      if (bookingNumber) formData.append('bookingNumber', bookingNumber);
      if (memberName) formData.append('memberName', memberName);
      if (mobileNumber) formData.append('mobileNumber', mobileNumber);
      if (branch) formData.append('branch', branch);
      if (startDate)
        formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate)
        formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));
      if (packageId) formData.append('packageId', packageId);
      if (status) formData.append('status', status);
      try {
        setLoading(true);
        const response = await postDataApi(
          '/api/booking/today/findAll',
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
      } finally {
        setLoading(false);
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
      startDate: '',
      endDate: '',
      packageId: '',
      memberName: '',
      mobileNumber: '',
      bookingNumber: '',
      branch: '',
      status: '',
    });
  };

  // Datatable Columns Set Up
  const columns = React.useMemo(
    () => [
      {
        field: 'bookingDate',
        header: formatMessage({id: 'booking.column.bookingMade'}),
        displayOrder: 1,
        headerClassName: 'white-space-nowrap',
        sortable: true,
        body: dateBodyTemplate,
        style: {minWidth: '12rem'},
      },
      {
        field: 'bookingNo',
        header: formatMessage({id: 'booking.column.bookingNo'}),
        style: {minWidth: '14rem'},
        displayOrder: 2,
        sortable: true,
      },
      {
        field: 'start',
        header: formatMessage({id: 'booking.column.slot'}),
        style: {minWidth: '18rem'},
        displayOrder: 10,
        body: slotDateBodyTemplate,
        sortable: true,
      },
      {
        field: 'member.memberFullName',
        header: formatMessage({id: 'booking.column.memberName'}),
        style: {minWidth: '14rem'},
        displayOrder: 5,
        sortable: true,
      },
      {
        field: 'member.mobileNumber',
        header: formatMessage({id: 'booking.column.mobileNo'}),
        displayOrder: 6,
        headerClassName: 'white-space-nowrap',
      },
      {
        field: 'memberPackage.package.packageName',
        header: formatMessage({id: 'booking.column.packageName'}),
        displayOrder: 3,
        sortable: true,
        style: {minWidth: '14rem'},
      },
      {
        field: 'memberPackage.package.packageCode',
        header: formatMessage({id: 'booking.column.packageId'}),
        style: {minWidth: '10rem'},
        displayOrder: 4,
      },
      {
        field: 'branch.branchName',
        header: formatMessage({id: 'booking.column.branch'}),
        style: {minWidth: '10rem'},
        displayOrder: 7,
        sortable: true,
      },
      {
        field: 'floor.floorNo',
        header: formatMessage({id: 'booking.column.floor'}),
        style: {minWidth: '6rem'},
        displayOrder: 8,
        sortable: true,
      },
      {
        field: 'room.room_no',
        header: formatMessage({id: 'booking.column.room'}),
        style: {minWidth: '6rem'},
        displayOrder: 9,
      },
      {
        field: 'pax',
        header: formatMessage({id: 'booking.column.pax'}),
        style: {minWidth: '5rem'},
        displayOrder: 11,
      },
      {
        field: 'bookingstatus',
        header: formatMessage({id: 'booking.column.status'}),
        style: {minWidth: '8rem'},
        displayOrder: 12,
        sortable: true,
        body: statusBodyTemplate,
      },
      {
        field: 'checkin_date',
        header: formatMessage({id: 'booking.column.checkinDate'}),
        style: {minWidth: '14rem'},
        displayOrder: 13,
        headerClassName: 'white-space-nowrap',
        body: checkInBodyTemplate,
      },
      {
        style: {minWidth: '10rem'},
        displayOrder: 14,
        exportable: false,
      },
    ],
    [formatMessage],
  );

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  useEffect(() => {
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
          {formatMessage({id: 'booking.current.title'})}
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
            ? formatMessage({id: 'booking.filters.hide'})
            : formatMessage({id: 'booking.filters.show'})}
        </Button>
      </Box>
    </Box>
  );

  // console.log('selectedBranch', selectedBranch, areaOptions);

  return selectedBranch ? (
    <Card sx={{mt: 2, p: 5}}>
      <Box
        sx={{
          transition: 'all 0.5s ease',
          transform: 'translateX(100%)',
          opacity: 0,
          visibility: 'hidden',
          '&.show': {
            transform: 'translateX(0)',
            opacity: 1,
            visibility: 'visible',
          },
        }}
        className={clsx({
          show: 1,
        })}
      >
        <Box
          component='h2'
          variant='h2'
          sx={{
            fontSize: 16,
            // color: 'white',
            fontWeight: Fonts.SEMI_BOLD,
            mb: {
              xs: 2,
              lg: 1,
            },
          }}
        >
          Branch : {selectedBranch?.branchName.toUpperCase()}
          {selectedBranch?.hqStatus && (
            <Tag style={{marginLeft: 10}} value={'HQ'} severity={'success'} />
          )}
          {selectedBranch?.isFranchise && (
            <Tag
              style={{marginLeft: 10}}
              value={'Franchise'}
              severity={'info'}
            />
          )}
        </Box>
        <BookingDetail
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />
      </Box>{' '}
    </Card>
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'booking.current.filterTitle'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 10, md: 10}}
              alignItems='center'
            >
              {/* Filter by Booking No. */}
              <Grid size={{md: 6, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'booking.filters.bookingNo'})}
                  variant='outlined'
                  fullWidth
                  value={filters.bookingNumber}
                  onChange={(e) =>
                    handleFilterChange('bookingNumber', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Package Id */}
              <Grid size={{md: 6, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'booking.filters.packageId'})}
                  variant='outlined'
                  fullWidth
                  value={filters.packageId}
                  onChange={(e) =>
                    handleFilterChange('packageId', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Name */}
              <Grid size={{md: 6, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'booking.filters.memberName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.memberName}
                  onChange={(e) =>
                    handleFilterChange('memberName', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Mobile No */}
              <Grid size={{md: 6, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'booking.filters.mobileNo'})}
                  variant='outlined'
                  fullWidth
                  value={filters.mobileNumber}
                  onChange={(e) =>
                    handleFilterChange('mobileNumber', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Branch */}
              <Grid size={{md: 6, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'booking.filters.branch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'booking.filters.branch'})}
                    value={filters.branch || ''}
                    onChange={(e) =>
                      handleFilterChange('branch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    {branchData?.length > 0 ? branchData.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </MenuItem>
                    )) : []}
                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Branch */}
              <Grid size={{md: 6, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'booking.filters.status'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'booking.filters.status'})}
                    value={filters.status || ''}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    <MenuItem value='Booked'>
                      {formatMessage({id: 'booking.status.booked'})}
                    </MenuItem>
                    <MenuItem value='Complete'>
                      {formatMessage({id: 'booking.status.completed'})}
                    </MenuItem>
                    <MenuItem value='CheckedIn'>
                      {formatMessage({id: 'booking.status.checkedIn'})}
                    </MenuItem>
                    <MenuItem value='Cancel'>
                      {formatMessage({id: 'booking.status.cancelled'})}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              size={{xs: 2, md: 2}}
              alignItems='center'
            >
              <Grid size={{xs: 12, md: 12}} sx={{textAlign: 'center'}}>
                <Tooltip title={formatMessage({id: 'common.reset'})} arrow>
                  <IconButton onClick={resetFilters} color='primary'>
                    <RefreshOutlinedIcon />
                  </IconButton>
                </Tooltip>
                {/* Apply Filters Button */}
                <Tooltip
                  title={formatMessage({id: 'booking.filters.apply'})}
                  arrow
                >
                  <Button
                    size='large'
                    variant='outlined'
                    onClick={applyFilters}
                    fullWidth
                  >
                    {formatMessage({id: 'booking.filters.apply'})}
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast}></Toast>
        {/* Table */}
        <Grid size={{xs: 12, md: 12}}>
          <DataTable
            header={header}
            value={filteredData?.length > 0 ? filteredData : []}
            dataKey='_id'
            loading={loading}
            paginator
            rows={10}
          >
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
      </Card>
      <PopupColumnDialog
        isOpen={showPopupColumn}
        setOpenDialog={() => setShowPopupColumn(false)}
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
      />
      <AppInfoView />
    </Box>
  );
};

export default BookingList;