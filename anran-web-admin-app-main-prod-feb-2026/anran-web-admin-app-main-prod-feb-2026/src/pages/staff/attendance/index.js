// src/pages/staff/attendance/index.js
import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Avatar,
  MenuItem,
  Tooltip,
  Select,
  InputLabel,
  TextField,
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Image} from 'primereact/image';
import {Tag} from 'primereact/tag';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

import CreateAttendance from './CreateAttendance';
import EditAttendance from './EditAttendance';
import DeleteAttendance from './DeleteAttendance';

import dayjs from 'dayjs';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const Attendance = () => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const toast = useRef(null);

  const [staffOptions, setStaffOptions] = useState([]);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    name: '',
    staffCode: '',
    branch: '',
    startDate: '',
    endDate: '',
  });

  // Approach B: SINGLE source of truth for table data + loading
  const [
    {apiData: attendanceDatabase, loading},
    {reCallAPI},
  ] = useGetDataApi('api/attendance', {}, {}, true);

  const [{apiData: branchOptions}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const [{apiData: staffDatabase}] = useGetDataApi('api/staff', {}, {}, true);

  useEffect(() => {
    if (Array.isArray(staffDatabase) && staffDatabase.length > 0) {
      const opt = staffDatabase.map((staff) => ({
        name: staff.name,
        _id: staff._id,
        staffCode: staff.staffCode,
        branch: staff.branch,
      }));
      setStaffOptions(opt);
    }
  }, [staffDatabase]);

  const formatDateTime = (dateString) => {
    if (!dateString) return {formattedDate: '-', formattedTime: '-'};

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime()))
      return {formattedDate: '-', formattedTime: '-'};

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return {
      formattedDate: `${year}-${month}-${day}`,
      formattedTime: `${hours}:${minutes}`,
    };
  };

  const branchBodyTemplate = (rowData) => {
    const branch = rowData?.branch;
    return (
      <div className='flex align-items-center gap-2'>
        <span>{branch?.branchName ?? '-'}</span>
      </div>
    );
  };

  const checkInBodyTemplate = (rowData) => {
    const {formattedDate, formattedTime} = formatDateTime(rowData?.checkIn);
    return (
      <ListItem>
        <ListItemAvatar>
          <Image
            src={rowData?.checkInImageUrl}
            alt={rowData?.memberFullName ?? 'check-in'}
            width='40'
            height='40'
            preview
            downloadable
          />
        </ListItemAvatar>
        <ListItemText
          primary={formatMessage(
            {id: 'attendance.label.date'},
            {date: formattedDate},
          )}
          secondary={formatMessage(
            {id: 'attendance.label.time'},
            {time: formattedTime},
          )}
        />
      </ListItem>
    );
  };

  const checkOutBodyTemplate = (rowData) => {
    const {formattedDate, formattedTime} = formatDateTime(rowData?.checkOut);
    return (
      <ListItem>
        <ListItemAvatar>
          <Image
            src={rowData?.checkOutImageUrl}
            alt={rowData?.memberFullName ?? 'check-out'}
            width='40'
            height='40'
            preview
            downloadable
          />
        </ListItemAvatar>
        <ListItemText
          primary={formatMessage(
            {id: 'attendance.label.date'},
            {date: formattedDate},
          )}
          secondary={formatMessage(
            {id: 'attendance.label.time'},
            {time: formattedTime},
          )}
        />
      </ListItem>
    );
  };

  const staffNameBodyTemplate = (rowData) => {
    const staff = rowData?.staff;
    return (
      <ListItem>
        <ListItemAvatar>
          <Avatar
            alt={staff?.name ?? 'staff'}
            src={staff?.profileImageUrl}
            sx={{width: 40, height: 40}}
          />
        </ListItemAvatar>
        <ListItemText primary={staff?.name ?? '-'} />
      </ListItem>
    );
  };

  const statusBodyTemplate = (rowData) => {
    if (rowData?.allowOT) {
      return <Tag value={formatMessage({id: 'common.yes'})} severity='success' />;
    }
    return <Tag value={formatMessage({id: 'common.no'})} severity='danger' />;
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [initialValues, setInitialValues] = useState({});

  const handleOpenEditDialog = (rowData) => {
    setEditingAttendanceId(rowData?._id);
    setInitialValues({
      staff: rowData?.staff?._id,
      staffCode: rowData?.staff?._id,
      branch: rowData?.branch?._id,
      checkIn: rowData?.checkIn ? dayjs(rowData.checkIn) : null,
      checkOut: rowData?.checkOut ? dayjs(rowData.checkOut) : null,
      duration: rowData?.duration,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingAttendanceId(null);
    setInitialValues({});
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAttendance, setDeletingAttendance] = useState(null);

  const handleOpenDeleteDialog = (rowData) => {
    setDeletingAttendance(rowData);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingAttendance(null);
    setDeleteDialogOpen(false);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.hr_attendance_update) && (
          <Grid item xs={6} md={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.hr_attendance_delete) && (
          <Grid item xs={6} md={6}>
            <IconButton
              color='error'
              onClick={() => handleOpenDeleteDialog(rowData)}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    );
  };

  const columns = useMemo(
    () => [
      {
        field: 'staff',
        header: formatMessage({id: 'staff.column.staff'}),
        style: {minWidth: '15rem'},
        displayOrder: 1,
        body: staffNameBodyTemplate,
        sortable: true,
      },
      {
        field: 'branch',
        header: formatMessage({id: 'common.branch'}),
        style: {minWidth: '15rem'},
        body: branchBodyTemplate,
        displayOrder: 2,
      },
      {
        field: 'checkIn',
        header: formatMessage({id: 'attendance.column.checkIn'}),
        displayOrder: 3,
        sortable: true,
        style: {minWidth: '14rem'},
        body: checkInBodyTemplate,
      },
      {
        field: 'checkOut',
        header: formatMessage({id: 'attendance.column.checkOut'}),
        displayOrder: 4,
        sortable: true,
        style: {minWidth: '14rem'},
        body: checkOutBodyTemplate,
      },
      {
        field: 'allowOT',
        header: formatMessage({id: 'attendance.column.allowOt'}),
        displayOrder: 5,
        sortable: true,
        style: {minWidth: '14rem'},
        body: statusBodyTemplate,
      },
      {
        field: 'duration',
        header: formatMessage({id: 'attendance.column.duration'}),
        displayOrder: 6,
        sortable: true,
        style: {minWidth: '14rem'},
      },
    ],
    [formatMessage],
  );

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const [openAddNewAttendance, setOpenAddNewAttendance] = useState(false);
  const handleOpenAddNewAttendance = () => setOpenAddNewAttendance(true);
  const handleCloseAddNewAttendance = () => setOpenAddNewAttendance(false);

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const applyFilters = async () => {
    const {name, staffCode, branch, startDate, endDate} = filters;

    // If no filters, just reload default list
    if (!name && !staffCode && !branch && !startDate && !endDate) {
      reCallAPI();
      return;
    }

    const formData = new FormData();
    if (name) formData.append('name', name);
    if (staffCode) formData.append('staffCode', staffCode);
    if (branch) formData.append('branch', branch);
    if (startDate) formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
    if (endDate) formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));

    try {
      // Using your existing filter endpoint, then "overwrite" the hook cache
      // Since Approach B is "hook as single source", easiest is: call API and set local state
      // BUT that violates "single source" slightly.
      // Better: if your backend can accept query params on api/attendance, switch to that.
      // For now we will just trigger a fetch and rely on DataTable value override via a temp state:
      const response = await postDataApi(
        '/api/attendance/findallv2',
        infoViewActionsContext,
        formData,
        false,
        false,
        {'Content-Type': 'multipart/form-data'},
      );
      // store filtered results locally
      setFilteredOverride(Array.isArray(response) ? response : []);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({...prev, [field]: value}));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      staffCode: '',
      branch: '',
      startDate: '',
      endDate: '',
    });
    setFilteredOverride(null);
    reCallAPI();
  };

  // Optional: allow filtered results without changing the hook.
  // If you want PURE hook-only, you must implement filtering in api/attendance itself.
  const [filteredOverride, setFilteredOverride] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') applyFilters();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h1'>
          {formatMessage({id: 'attendance.table.title'})}
        </Typography>
        <Button
          size='large'
          startIcon={<ExpandMoreOutlinedIcon />}
          onClick={() => setShowPopupColumn(true)}
        />
        <Button
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => {
            setFilteredOverride(null);
            reCallAPI();
          }}
        />
      </Box>

      <Box display='flex' alignItems='center' gap={2}>
        <Button
          size='large'
          variant='outlined'
          onClick={toggleFilters}
          startIcon={showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
        >
          {showFilters
            ? formatMessage({id: 'attendance.filters.hide'})
            : formatMessage({id: 'attendance.filters.show'})}
        </Button>

        {user.permission.includes(RoutePermittedRole2.hr_attendance_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<Add />}
            onClick={handleOpenAddNewAttendance}
          >
            {formatMessage({id: 'attendance.action.addNew'})}
          </Button>
        )}
      </Box>
    </Box>
  );

  const tableValue = useMemo(() => {
    if (Array.isArray(filteredOverride)) return filteredOverride;
    return Array.isArray(attendanceDatabase) ? attendanceDatabase : [];
  }, [attendanceDatabase, filteredOverride]);

  return (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'attendance.filters.title'})}
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent='space-between'>
            <Grid container spacing={2} alignItems='center' size={{xs: 12, md: 12}}>
              <Grid size={{md: 2.4, xs: 12}}>
                <DatePicker
                  sx={{width: '100%'}}
                  label={formatMessage({id: 'attendance.filters.checkInFrom'})}
                  value={filters.startDate ? dayjs(filters.startDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'startDate',
                      newValue ? newValue.toISOString() : '',
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>

              <Grid size={{md: 2.4, xs: 12}}>
                <DatePicker
                  sx={{width: '100%'}}
                  label={formatMessage({id: 'attendance.filters.checkInTo'})}
                  value={filters.endDate ? dayjs(filters.endDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'endDate',
                      newValue ? newValue.toISOString() : '',
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>

              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'attendance.filters.byName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </Grid>

              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'attendance.filters.byStaffCode'})}
                  variant='outlined'
                  fullWidth
                  value={filters.staffCode}
                  onChange={(e) => handleFilterChange('staffCode', e.target.value)}
                />
              </Grid>

              <Grid size={{md: 2.4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'attendance.filters.byBranch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'attendance.filters.byBranch'})}
                    value={filters.branch || ''}
                    onChange={(e) => handleFilterChange('branch', e.target.value)}
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    {Array.isArray(branchOptions) &&
                      branchOptions.map((branch) => (
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
              alignItems='center'
              size={{xs: 12, md: 12}}
              justifyContent='flex-end'
            >
              <Grid size={{xs: 'auto'}} sx={{textAlign: 'center'}}>
                <Tooltip title={formatMessage({id: 'attendance.filters.reset'})} arrow>
                  <IconButton onClick={resetFilters} color='primary'>
                    <RefreshOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>

              <Grid size={{xs: 'auto'}}>
                <Button size='large' variant='outlined' onClick={applyFilters} fullWidth>
                  {formatMessage({id: 'attendance.filters.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}

      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <DataTable
              header={header}
              value={tableValue}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              loading={!!loading}
              emptyMessage={formatMessage({id: 'attendance.table.empty'})}
              showGridlines
              stripedRows
            >
              {visibleColumns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  style={col.style ?? null}
                  sortable={!!col.sortable}
                  body={col.body ?? null}
                />
              ))}

              {(user.permission.includes(RoutePermittedRole2.hr_attendance_update) ||
                user.permission.includes(RoutePermittedRole2.hr_attendance_delete)) && (
                <Column
                  body={actionBodyTemplate}
                  header={formatMessage({id: 'attendance.column.action'})}
                  exportable={false}
                  style={{maxWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>

      <CreateAttendance
        open={openAddNewAttendance}
        onClose={handleCloseAddNewAttendance}
        reCallAPI={() => {
          setFilteredOverride(null);
          reCallAPI();
        }}
        branchOptions={branchOptions}
        staffOptions={staffOptions}
      />

      <EditAttendance
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        reCallAPI={() => {
          setFilteredOverride(null);
          reCallAPI();
        }}
        editingAttendanceId={editingAttendanceId}
        initialValues={initialValues}
        branchOptions={branchOptions}
        staffOptions={staffOptions}
      />

      <DeleteAttendance
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        reCallAPI={() => {
          setFilteredOverride(null);
          reCallAPI();
        }}
        deletingAttendance={deletingAttendance}
      />

      <PopupColumnDialog
        isOpen={showPopupColumn}
        setOpenDialog={() => setShowPopupColumn(false)}
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
      />
    </Box>
  );
};

export default Attendance;
