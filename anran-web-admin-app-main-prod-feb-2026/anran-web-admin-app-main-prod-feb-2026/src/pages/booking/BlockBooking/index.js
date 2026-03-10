import React, { useState, useEffect, useRef } from 'react';
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
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useGetDataApi, postDataApi } from '@anran/utility/APIHooks';
import { useInfoViewActionsContext } from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import AppInfoView from '@anran/core/AppInfoView';

import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import CardHeader from './CardHeader';
import { Formik } from 'formik';
import AppDialog from '@anran/core/AppDialog';
import { Form } from 'formik';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import IntlMessages from '@anran/utility/IntlMessages';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import { Fonts } from 'shared/constants/AppEnums';
import { useIntl } from 'react-intl';

import dayjs from 'dayjs';

const BlockBooking = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const {formatMessage} = useIntl();
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [blockBookingData, setBlockBookingData] = React.useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedStartDate, setSelectedStartDate] = React.useState(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState(null);
  const [openTimeSlotDialog, setOpenTimeSlotDialog] = useState(false);
  const [currentTimeSlots, setCurrentTimeSlots] = useState([]);
  const [filters, setFilters] = React.useState({
    branch: '',
    status: '',
  });
  const toast = useRef(null);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const [{ apiData: branchData }] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const [{ apiData: floorData }] = useGetDataApi(
    `api/floors`,
    {},
    {},
    true,
  );

  const [{ apiData: roomData }] = useGetDataApi(
    `api/rooms/block-booking-rooms-options`,
    {},
    {},
    true,
  );

  const validationSchema = React.useMemo(
    () =>
      yup.object({
        branch: yup
          .string()
          .required(formatMessage({id: 'booking.validation.required'})),
        floor: yup
          .string()
          .required(formatMessage({id: 'booking.validation.required'})),
        room: yup.array().when('floor', {
          is: (val) => val && val !== 'ALL',
          then: (schema) =>
            schema
              .min(
                1,
                formatMessage({id: 'booking.block.validation.roomRequired'}),
              )
              .required(formatMessage({id: 'booking.validation.required'})),
          otherwise: (schema) => schema.notRequired(),
        }),
        blockingStart: yup
          .string()
          .required(formatMessage({id: 'booking.validation.required'})),
        blockingEnd: yup
          .string()
          .required(formatMessage({id: 'booking.validation.required'})),
        blockTimeSlot: yup.array().when('isFullDay', {
          is: false,
          then: (schema) =>
            schema
              .min(
                1,
                formatMessage({
                  id: 'booking.block.validation.timeSlotRequired',
                }),
              )
              .required(formatMessage({id: 'booking.validation.required'})),
          otherwise: (schema) => schema.notRequired(),
        }),
        isFullDay: yup.boolean(),
      }),
    [formatMessage],
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await postDataApi(
        '/api/block-booking/findAll',
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

  React.useEffect(() => {
    fetchData();
  }, []);

  const floorBodyTemplate = (rowData) =>
    Array.isArray(rowData.floor)
      ? rowData.floor.map(f => f.floorNo).join(', ')
      : '';

  const roomBodyTemplate = (rowData) =>
    Array.isArray(rowData.room)
      ? rowData.room.map(r => r.room_no).join(', ')
      : '';

  const blockedTimeSlotBodyTemplate = (rowData) => {
    if (!Array.isArray(rowData.blockTimeSlot) || rowData.blockTimeSlot.length === 0) return '';
    const slots = rowData.blockTimeSlot;
    const displaySlots = slots.slice(0, 2).join(', ');
    const hasMore = slots.length > 2;
    return (
      <>
        {displaySlots}
        {hasMore && (
          <>
            , <span
              style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                setCurrentTimeSlots(slots);
                setOpenTimeSlotDialog(true);
              }}
            >
              {formatMessage({id: 'booking.block.more'})}
            </span>
          </>
        )}
      </>
    );
  };

  const approvalStatusBodyTemplate = (rowData) => {
    return (
      rowData.approvalStatus ? (
        <Tag
          value={formatMessage({id: 'booking.block.approval.approved'})}
          severity='sucess'
        />
      ) : (
        <Tag
          value={formatMessage({id: 'booking.block.approval.pending'})}
          severity='warning'
        />
      )
    );
  };

  const blockingStatusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={getBlockingStatusLabel(rowData.blockingStatus)}
        severity={getSeverity(rowData)}
      ></Tag>
    );
  };

  const getBlockingStatusLabel = (status) => {
    switch (status) {
      case 'Scheduled':
        return formatMessage({id: 'booking.block.status.scheduled'});
      case 'Completed':
        return formatMessage({id: 'booking.block.status.completed'});
      case 'Deleted':
        return formatMessage({id: 'booking.block.status.deleted'});
      default:
        return status;
    }
  };

  const getSeverity = (rowData) => {
    switch (rowData.blockingStatus) {
      case 'Scheduled':
        return 'success';

      case 'Completed':
        return 'warning';

      case 'Deleted':
        return 'danger';

      default:
        return null;
    }
  };

  // Open dialog for add
  const handleOpenAddDialog = () => {
    setBlockBookingData(null);
    setOpenDialog(true);
  };
  // Open dialog for edit
  const handleOpenEditDialog = (rowData) => {
    setBlockBookingData(rowData);
    console.log('Edit Block Booking Data:', rowData);
    setOpenDialog(true);
  };
  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBlockBookingData(null);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setOpenDeleteDialog(true);
    setDeleteData(rowData);
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteData(null);
  };

  const onDeleteConfirm = () => {
    const payload = {
      _id: deleteData._id,
    };
    postDataApi(
      '/api/block-booking/delete-block-booking',
      infoViewActionsContext,
      payload,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        fetchData();
        infoViewActionsContext.showMessage('Removed successfully!');
        handleCloseDeleteDialog();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const actionBodyTemplate = (rowData) => {
    if (rowData.blockingStatus === 'Scheduled') {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <IconButton
            color='success'
            onClick={() => handleOpenEditDialog(rowData)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color='error'
            onClick={() => handleOpenDeleteDialog(rowData)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    } else if (rowData.blockingStatus === 'On-Going') {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <IconButton
            color='error'
          // onClick={() => handleOpenCancelDialog(rowData)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      );
    } else {
      return null;
    }
  };

  const applyFilters = async () => {
    const { branch, status } = filters;
    if (selectedStartDate || selectedEndDate || branch || status) {
      const formData = new FormData();
      if (branch) formData.append('branch', branch);
      if (selectedStartDate)
        formData.append('startDate', dayjs(selectedStartDate).format('YYYY-MM-DD'));
      if (selectedEndDate)
        formData.append('endDate', dayjs(selectedEndDate).format('YYYY-MM-DD'));
      if (status) formData.append('status', status);
      try {
        setLoading(true);
        const response = await postDataApi(
          '/api/block-booking/findAll',
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
      branch: '',
      status: '',
    });
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY');
  };

  // Datatable Columns Set Up
  const columns = React.useMemo(
    () => [
      {
        field: 'branch.branchName',
        header: formatMessage({id: 'booking.column.branch'}),
        displayOrder: 1,
        headerClassName: 'white-space-nowrap',
        sortable: true,
        style: { minWidth: '10rem' },
      },
      {
        field: 'floor.floorNo',
        header: formatMessage({id: 'booking.column.floor'}),
        style: { minWidth: '12rem' },
        displayOrder: 2,
        sortable: true,
        body: floorBodyTemplate,
      },
      {
        field: 'room.room_no',
        header: formatMessage({id: 'booking.column.room'}),
        style: { minWidth: '12rem' },
        displayOrder: 10,
        sortable: true,
        body: roomBodyTemplate,
      },
      {
        field: 'blockingStart',
        header: formatMessage({id: 'booking.column.blockingStart'}),
        style: { minWidth: '10rem' },
        displayOrder: 5,
        sortable: true,
        body: (rowData) => formatDateTime(rowData.blockingStart),
      },
      {
        field: 'blockingEnd',
        header: formatMessage({id: 'booking.column.blockingEnd'}),
        style: { minWidth: '10rem' },
        displayOrder: 6,
        sortable: true,
        body: (rowData) => formatDateTime(rowData.blockingEnd),
      },
      {
        field: 'blockTimeSlot',
        header: formatMessage({id: 'booking.column.blockedTimeSlot'}),
        style: { minWidth: '14rem' },
        displayOrder: 10,
        sortable: true,
        body: blockedTimeSlotBodyTemplate,
      },
      {
        field: 'blockingStatus',
        header: formatMessage({id: 'booking.column.blockingStatus'}),
        style: { minWidth: '8rem' },
        displayOrder: 12,
        sortable: true,
        body: blockingStatusBodyTemplate,
      },
      {
        field: 'approvalStatus',
        header: formatMessage({id: 'booking.column.approval'}),
        style: { minWidth: '8rem' },
        displayOrder: 12,
        sortable: true,
        body: approvalStatusBodyTemplate,
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
          {formatMessage({id: 'booking.block.title'})}
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
            ? formatMessage({id: 'booking.filters.hide'})
            : formatMessage({id: 'booking.filters.show'})}
        </Button>
        <Button
          size='large'
          variant='outlined'
          startIcon={<AddLocationAltOutlinedIcon />}
          onClick={handleOpenAddDialog}
        >
          {formatMessage({id: 'booking.block.addNew'})}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box>
      {showFilters && (
        <Card sx={{ mt: 2, p: 5 }}>
          <Box sx={{ pb: 4 }}>
            <Typography variant='h1'>
              {formatMessage({id: 'booking.block.filterTitle'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{ xs: 10, md: 10 }}
              alignItems='center'
            >
              {/* Filter by Branch */}
              <Grid size={{ md: 6, xs: 12 }}>
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
              {/* Filter by Status */}
              <Grid size={{ md: 6, xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'booking.filters.approval'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'booking.filters.approval'})}
                    value={filters.status || ''}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    <MenuItem value='true'>
                      {formatMessage({id: 'booking.block.approval.approved'})}
                    </MenuItem>
                    <MenuItem value='false'>
                      {formatMessage({id: 'booking.block.approval.pending'})}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Start Date */}
              <Grid size={{ md: 6, xs: 12 }}>
                <DatePicker
                  sx={{ width: '100%' }}
                  variant='outlined'
                  label={formatMessage({id: 'booking.filters.fromDate'})}
                  name='fromDate'
                  value={selectedStartDate}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(value) => setSelectedStartDate(value)}
                  slotProps={{
                    textField: {
                      margin: 'dense',
                    },
                  }}
                  format='DD/MM/YYYY'
                />
              </Grid>
              {/* Filter by End Date */}
              <Grid size={{ md: 6, xs: 12 }}>
                <DatePicker
                  sx={{ width: '100%' }}
                  variant='outlined'
                  label={formatMessage({id: 'booking.filters.toDate'})}
                  name='toDate'
                  value={selectedEndDate}
                  renderInput={(params) => <TextField {...params} />}
                  onChange={(value) => setSelectedEndDate(value)}
                  slotProps={{
                    textField: {
                      margin: 'dense',
                    },
                  }}
                  format='DD/MM/YYYY'
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              size={{ xs: 2, md: 2 }}
              alignItems='center'
            >
              <Grid size={{ xs: 12, md: 12 }} sx={{ textAlign: 'center' }}>
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
      <Card sx={{ mt: 2, p: 5 }}>
        <Toast ref={toast}></Toast>
        {/* Table */}
        <Grid size={{ xs: 12, md: 12 }}>
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
            <Column
              header={formatMessage({id: 'booking.column.action'})}
              body={actionBodyTemplate}
              exportable={false}
              style={{ maxWidth: '8rem' }}
            />
          </DataTable>
        </Grid>
      </Card>
      <AppDialog
        dividers
        maxWidth='md'
        open={openDialog}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseDialog}
            title={
              blockBookingData
                ? formatMessage({id: 'booking.block.dialog.editTitle'})
                : formatMessage({id: 'booking.block.dialog.createTitle'})
            }
          />
        }
      >
        <Formik
          validateOnBlur={true}
          enableReinitialize
          initialValues={{
            branch: blockBookingData?.branch?._id || '',
            floor: blockBookingData?.branch?._id ? (Array.isArray(blockBookingData?.floor) ? (blockBookingData.floor.length > 1 ? 'ALL' : blockBookingData.floor[0]?._id || '') : 'ALL') : '',
            room: Array.isArray(blockBookingData?.room) ? blockBookingData.room.map(r => r._id) : [],
            blockingStart: blockBookingData ? dayjs(blockBookingData.blockingStart) : null,
            blockingEnd: blockBookingData ? dayjs(blockBookingData.blockingEnd) : null,
            blockTimeSlot: blockBookingData?.blockTimeSlot || [],
            isFullDay: blockBookingData?.isFullDay ?? true,
          }}
          validationSchema={validationSchema}
          onSubmit={async (data, { setSubmitting }) => {
            setSubmitting(true);
            try {
              let floorValue = data.floor;
              let isFullBranch = false;
              if (floorValue === 'ALL') {
                isFullBranch = true;
                floorValue = (floorData && Array.isArray(floorData))
                  ? floorData.filter(floor => floor.branchName === data.branch).map(floor => floor._id)
                  : [];
              }
              let roomValue = data.room;
              if (Array.isArray(roomValue) && roomValue.includes('ALL')) {
                if (Array.isArray(floorValue)) {
                  roomValue = (roomData && Array.isArray(roomData))
                    ? roomData.filter(room => floorValue.includes(room.floor)).map(room => room._id)
                    : [];
                } else {
                  roomValue = (roomData && Array.isArray(roomData))
                    ? roomData.filter(room => room.floor === floorValue).map(room => room._id)
                    : [];
                }
              }

              const blockingStart = data.blockingStart ? dayjs(data.blockingStart).format('YYYY-MM-DD') : null;
              const blockingEnd = data.blockingEnd ? dayjs(data.blockingEnd).format('YYYY-MM-DD') : null;

              let blockTimeSlot = data.blockTimeSlot;
              if (data.isFullDay) {
                const selectedBranch = branchData?.find(b => b._id === data.branch);
                let allTimeSlots = [];
                if (selectedBranch && selectedBranch.operatingStart && selectedBranch.operatingEnd) {
                  // const opStart = dayjs(selectedBranch.operatingStart);
                  // const opEnd = dayjs(selectedBranch.operatingEnd);
                  // console.log("opEnd", opEnd);
                  // let current = opStart.startOf('hour');
                  // let end = opEnd.startOf('hour');
                  // if (opEnd.hour() === 0 && opEnd.minute() === 0) {
                  //   end = opEnd.add(1, 'day').startOf('hour');
                  // }
                  let aa = dayjs(selectedBranch.operatingStart).get('hour');
                  let bb = dayjs(selectedBranch.operatingEnd).get('hour');
                  let current1 = dayjs(new Date(0, 0, 0, aa, 0, 0));
                  let end1 = dayjs(new Date(0, 0, 0, bb, 0, 0, 0));
                  if (bb == 0) {
                    bb = 23;
                    end1 = dayjs(new Date(0, 0, 0, bb, 59, 59, 999));
                  } 
                  // if (opEnd.isBefore(opStart)) {
                  //   end = end.add(1, 'day');
                  // }
                  while (current1.isBefore(end1)) {
                    const next = current1.add(1, 'hour');
                    allTimeSlots.push(`${current1.format('HH:mm')}-${next.format('HH:mm')}`);
                    current1 = next;
                  }
                }
                blockTimeSlot = allTimeSlots;
              }

              const payload = {
                ...data,
                floor: floorValue,
                room: roomValue,
                blockingStart,
                blockingEnd,
                blockTimeSlot,
                ...(isFullBranch ? { isFullBranch: true } : {}),
              };
              if (blockBookingData && blockBookingData._id) {
                // Edit mode
                payload._id = blockBookingData._id;
                await postDataApi(
                  '/api/block-booking/update-block-booking',
                  infoViewActionsContext,
                  payload,
                  false,
                  false,
                  { 'Content-Type': 'multipart/form-data' },
                );
                infoViewActionsContext.showMessage('Block Booking Updated Successfully!');
              } else {
                // Add mode
                await postDataApi(
                  '/api/block-booking/new-block-booking',
                  infoViewActionsContext,
                  payload,
                  false,
                  false,
                  { 'Content-Type': 'multipart/form-data' },
                );
                infoViewActionsContext.showMessage('Block Booking Submitted Successfully!');
              }
              fetchData();
              handleCloseDialog();
            } catch (error) {
              infoViewActionsContext.fetchError(error.message);
            }
            setSubmitting(false);
          }}
        >
          {({ values, errors, setFieldValue }) => {
            // Helper to generate time slots
            const generateTimeSlots = (opStart, opEnd) => {
              console.log("generateTimeSlots", opStart, opEnd);
              const slots = [];
              // let current = opStart.startOf('hour');
              // If opEnd is 00:00 (midnight), treat as next day 00:00 for full-day range
              // let end = opEnd.startOf('hour');
              let aa = dayjs(opStart).get('hour');
              let bb = dayjs(opEnd).get('hour');
              let current1 = dayjs(new Date(0, 0, 0, aa, 0, 0));
              let end1 = dayjs(new Date(0, 0, 0, bb, 0, 0, 0));
              if (bb == 0) {
                bb = 23;
                end1 = dayjs(new Date(0, 0, 0, bb, 59, 59, 999));
              } 
              // if (opEnd.isBefore(opStart)) {
              //   end = end.add(1, 'day');
              // }
              while (current1.isBefore(end1)) {
                const next = current1.add(1, 'hour');
                slots.push({
                  label: `${current1.format('h:mm A')} - ${next.format('h:mm A')}`,
                  value: `${current1.format('HH:mm')}-${next.format('HH:mm')}`,
                  start: current1,
                  end: next,
                });
                current1 = next;
              }
              // if (opEnd.hour() === 0 && opEnd.minute() === 0) {
              //   end = opEnd.add(1, 'day').startOf('hour');
              // }
              // while (current.isBefore(end)) {
              //   const next = current.add(1, 'hour');
              //   slots.push({
              //     label: `${current.format('h:mm A')} - ${next.format('h:mm A')}`,
              //     value: `${current.format('HH:mm')}-${next.format('HH:mm')}`,
              //     start: current,
              //     end: next,
              //   });
              //   current = next;
              // }
              return slots;
            };

            let timeSlots = [];
            if (values.branch && branchData?.length > 0) {
              console.log("branchData", values.branch);
              const selectedBranch = branchData.find(b => b._id === values.branch);
              if (selectedBranch && selectedBranch.operatingStart && selectedBranch.operatingEnd) {
                const opStart = dayjs(selectedBranch.operatingStart);
                const opEnd = dayjs(selectedBranch.operatingEnd);
                timeSlots = generateTimeSlots(opStart, opEnd);
              }
            }

            const handleBranchChange = (e) => {
              setFieldValue('branch', e.target.value);
              setFieldValue('floor', 'ALL');
              setFieldValue('room', ['ALL']);
              setFieldValue('blockTimeSlot', []);
            };
            const handleFloorChange = (e) => {
              setFieldValue('floor', e.target.value);
              if (e.target.value === 'ALL') {
                setFieldValue('room', ['ALL']);
              } else {
                setFieldValue('room', []);
              }
            };
            return (
              <Form noValidate autoComplete='off'>
                <Grid container spacing={4} pt={2}>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>
                        {formatMessage({id: 'booking.block.dialog.branch'})}
                      </InputLabel>
                      <Select
                        label={formatMessage({id: 'booking.block.dialog.branch'})}
                        value={values.branch || ''}
                        onChange={handleBranchChange}
                      >
                        {branchData?.length > 0 ? branchData.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.branchName}
                          </MenuItem>
                        )) : []}
                      </Select>
                      {errors.branch && (
                        <FormHelperText style={{ color: '#f44336' }}>
                          {errors.branch}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                      {values.branch && (
                    <>
                      <Grid size={12}>
                        <FormControl fullWidth>
                          <InputLabel>
                            {formatMessage({id: 'booking.block.dialog.floor'})}
                          </InputLabel>
                          <Select
                            disabled={!values.branch}
                            label={formatMessage({
                              id: 'booking.block.dialog.floor',
                            })}
                            value={values.floor || ''}
                            onChange={handleFloorChange}
                          >
                            <MenuItem value='ALL'>
                              {formatMessage({id: 'booking.block.dialog.all'})}
                            </MenuItem>
                            {floorData?.filter(floor => floor.branchName === values?.branch).map((floor) => (
                              <MenuItem key={floor._id} value={floor._id}>
                                {floor.floorNo}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.floor && (
                            <FormHelperText style={{ color: '#f44336' }}>
                              {errors.floor}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={12}>
                        <Autocomplete
                          fullWidth
                          multiple
                          disabled={!values.floor || values.floor === 'ALL'}
                          options={['ALL', ...(roomData?.filter(room => room.floor === values?.floor) || [])]}
                          getOptionLabel={option =>
                            option === 'ALL'
                              ? formatMessage({id: 'booking.block.dialog.all'})
                              : option.room_no || option.toString()
                          }
                          value={
                            values.room?.includes('ALL')
                              ? ['ALL']
                              : roomData?.filter(room => values.room?.includes(room._id)) || []
                          }
                          onChange={(_, newValue) => {
                            if (newValue.includes('ALL')) {
                              setFieldValue('room', ['ALL']);
                            } else {
                              setFieldValue('room', newValue.map(room => room._id));
                            }
                          }}
                          getOptionDisabled={(option) => {
                            if (values.room?.includes('ALL') && option !== 'ALL') {
                              return true;
                            }
                            if (option === 'ALL' && values.room?.length > 0 && !values.room.includes('ALL')) {
                              return true;
                            }
                            return false;
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label={formatMessage({
                                id: 'booking.block.dialog.room',
                              })}
                              margin="dense"
                              error={!!errors.room}
                              helperText={errors.room}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => {
                            if (option === 'ALL' && value === 'ALL') return true;
                            if (option && value && option._id && value._id) return option._id === value._id;
                            return false;
                          }}
                        />
                      </Grid>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <DatePicker
                          sx={{ width: '100%' }}
                          variant='outlined'
                          label={formatMessage({
                            id: 'booking.block.dialog.fromDate',
                          })}
                          value={values.blockingStart}
                          renderInput={(params) => <TextField {...params} />}
                          onChange={(value) => setFieldValue('blockingStart', value)}
                          slotProps={{
                            textField: {
                              margin: 'dense',
                            },
                          }}
                          minDate={dayjs().add(1, 'day').startOf('day')}
                          format='DD/MM/YYYY'
                        />
                        {errors.blockingStart && (
                          <FormHelperText style={{ color: '#f44336' }}>
                            {errors.blockingStart}
                          </FormHelperText>
                        )}
                      </Grid>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <DatePicker
                          sx={{ width: '100%' }}
                          variant='outlined'
                          label={formatMessage({
                            id: 'booking.block.dialog.toDate',
                          })}
                          value={values.blockingEnd}
                          renderInput={(params) => <TextField {...params} />}
                          onChange={(value) => setFieldValue('blockingEnd', value)}
                          slotProps={{
                            textField: {
                              margin: 'dense',
                            },
                          }}
                          minDate={dayjs().add(1, 'day').startOf('day')}
                          format='DD/MM/YYYY'
                        />
                        {errors.blockingEnd && (
                          <FormHelperText style={{ color: '#f44336' }}>
                            {errors.blockingEnd}
                          </FormHelperText>
                        )}
                      </Grid>
                      <Grid size={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={values.isFullDay}
                              onChange={(_, checked) => setFieldValue('isFullDay', checked)}
                              name='isFullDay'
                              color='primary'
                            />
                          }
                          label={formatMessage({
                            id: 'booking.block.dialog.fullDay',
                          })}
                        />
                      </Grid>
                      {!values.isFullDay && (
                        <Grid size={12}>
                          <Autocomplete
                            multiple
                            options={timeSlots}
                            getOptionLabel={option => option.label}
                            value={timeSlots.filter(slot => (values.blockTimeSlot || []).includes(slot.value))}
                            onChange={(_, newValue) => setFieldValue('blockTimeSlot', newValue.map(slot => slot.value))}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            disableCloseOnSelect
                            renderInput={params => (
                              <TextField
                              {...params}
                              label={formatMessage({
                                id: 'booking.block.dialog.selectTimeSlots',
                              })}
                              margin="dense"
                              error={!!errors.blockTimeSlot}
                              helperText={errors.blockTimeSlot}
                            />
                          )}
                          noOptionsText={formatMessage({
                            id: 'booking.block.dialog.noTimeSlots',
                          })}
                        />
                      </Grid>
                    )}
                      <Grid sx={{ display: 'flex', justifyContent: 'flex-end' }} size={12}>
                        <Button
                          sx={{
                            mb: 2,
                            position: 'relative',
                            minWidth: 100,
                          }}
                          color='primary'
                          variant='contained'
                          type='submit'
                        >
                          <IntlMessages id='common.save' />
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </AppDialog>
      <AppConfirmDialogV2
        dividers
        open={openDeleteDialog}
        dialogTitle={formatMessage({id: 'booking.block.confirm.title'})}
        title={
          <Typography
            component='h4'
            variant='h4'
            sx={{
              mb: 3,
              fontWeight: Fonts.SEMI_BOLD,
            }}
            id='alert-dialog-title'
          >
            {formatMessage({id: 'booking.block.confirm.message'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
      <AppDialog
        open={openTimeSlotDialog}
        hideClose
        maxWidth='xs'
        title={
          <CardHeader
            onCloseAddCard={() => setOpenTimeSlotDialog(false)}
            title={formatMessage({id: 'booking.block.dialog.blockedSlotsTitle'})}
          />
        }
      >
        <Grid container spacing={2} pt={2}>
          <Grid size={12}>
            {currentTimeSlots.map((slot, idx) => (
              <Typography variant='h3' sx={{ mb: 2 }} key={idx}>{slot}</Typography>
            ))}
          </Grid>
          <Grid sx={{ display: 'flex', justifyContent: 'flex-end' }} size={12}>
            <Button
              sx={{
                mb: 2,
                position: 'relative',
                minWidth: 100,
              }}
              color='primary'
              variant='contained'
              onClick={() => setOpenTimeSlotDialog(false)}
            >
              {formatMessage({id: 'common.close'})}
            </Button>
          </Grid>
        </Grid>
      </AppDialog>
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

export default BlockBooking;