import React, {useMemo, useState} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import dayjs from 'dayjs';

import {postDataApi} from '@anran/utility/APIHooks';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Fonts} from 'shared/constants/AppEnums';

import AddNewPackageTransfer from './AddNewPackageTransferV2';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const PackageTransfer = () => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    transferFrom: '',
    transferTo: '',
  });

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/transfer/findAll',
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

  const purchaseDateBodyTemplate = (rowData) => (
    <div>{dayjs(rowData.transferDate).format('DD-MM-YYYY')}</div>
  );

  const transferFromBodyTemplate = (rowData) => {
    return (
      <div>{`${rowData.memberFrom.memberFullName} - ${rowData.memberFrom.mobileNumber}`}</div>
    );
  };

  const transferToBodyTemplate = (rowData) => {
    return (
      <div>{`${rowData.memberTo.memberFullName} - ${rowData.memberTo.mobileNumber}`}</div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.member_transfer_delete) && (
          <Grid size={{xs: 6, md: 6}}>
            {rowData?.status == 'Success' ? (
              <IconButton
                color='error'
                onClick={() => handleOpenDeletePackageTransferDialog(rowData)}
              >
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Grid>
        )}
      </Grid>
    );
  };

  const columns = useMemo(
    () => [
      {
        field: 'transferDate',
        header: formatMessage({id: 'member.transfer.table.transferDate'}),
        displayOrder: 1,
        style: {width: '15rem'},
        body: purchaseDateBodyTemplate,
        sortable: true,
      },
      {
        field: 'memberFrom',
        header: formatMessage({id: 'member.transfer.table.transferFrom'}),
        style: {width: '14rem'},
        displayOrder: 2,
        body: transferFromBodyTemplate,
        sortable: true,
      },
      {
        field: 'memberTo',
        header: formatMessage({id: 'member.transfer.table.transferTo'}),
        style: {width: '14rem'},
        displayOrder: 3,
        body: transferToBodyTemplate,
        sortable: true,
      },
      {
        field: 'fromMemberPackage.package.packageCode',
        header: formatMessage({id: 'member.transfer.table.packageCode'}),
        style: {width: '14rem'},
        displayOrder: 4,
        sortable: true,
      },
      {
        field: 'fromMemberPackage.package.packageName',
        header: formatMessage({id: 'member.transfer.table.packageName'}),
        style: {width: '14rem'},
        displayOrder: 4,
        sortable: true,
      },
      {
        field: 'fromMemberPackage.currentBalance',
        header: formatMessage({id: 'member.transfer.table.currentBalance'}),
        style: {width: '14rem'},
        displayOrder: 5,
        sortable: true,
      },
      {
        field: 'status',
        header: formatMessage({id: 'member.transfer.table.status'}),
        style: {width: '14rem'},
        displayOrder: 5,
        sortable: true,
      },
    ],
    [formatMessage],
  );

  React.useEffect(() => {
    setVisibleColumns((prev) => {
      if (prev.length === 0) {
        return columns;
      }
      const columnMap = new Map(columns.map((col) => [col.field, col]));
      return prev.map((col) => {
        const latest = columnMap.get(col.field);
        return latest ? {...latest, ...col, header: latest.header} : col;
      });
    });
  }, [columns]);

  const [openAddPackageTransferDialog, setOpenAddPackageTransferDialog] =
    useState(false);
  const handleOpenAddPackageTransferDialog = () => {
    setOpenAddPackageTransferDialog(true);
  };

  const handleCloseAddPackageTransferDialog = () => {
    setOpenAddPackageTransferDialog(false);
  };

  const [openDeletePackageTransferDialog, setOpenDeletePackageTransferDialog] =
    useState(false);
  const [deletingPackageTransfer, setDeletingPackageTransfer] = useState(null);
  const handleOpenDeletePackageTransferDialog = (rowData) => {
    setDeletingPackageTransfer(rowData);
    setOpenDeletePackageTransferDialog(true);
  };

  const onDeleteConfirm = () => {
    postDataApi(
      `/api/transfer/web/cancel`,
      infoViewActionsContext,
      {id: deletingPackageTransfer._id},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        fetchData();
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.transfer.delete.success'}),
        );
        setOpenDeletePackageTransferDialog(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const handleCloseDeletePackageTransferDialog = () => {
    setDeletingPackageTransfer(null);
    setOpenDeletePackageTransferDialog(false);
  };

  console.log('selectedMember', selectedMember);

  const applyFilters = async () => {
    const {startDate, endDate, transferFrom, transferTo} = filters;
    if (startDate || endDate || transferFrom || transferTo) {
      const formData = new FormData();
      if (transferFrom) formData.append('transferFrom', transferFrom);
      if (transferTo) formData.append('transferTo', transferTo);
      if (startDate)
        formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate)
        formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          '/api/transfer/findAll',
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
      startDate: '',
      endDate: '',
      transferFrom: '',
      transferTo: '',
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
              {formatMessage({id: 'member.transfer.filter.title'})}
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
                  label={formatMessage({
                    id: 'member.transfer.filter.fromDate',
                  })}
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
                  label={formatMessage({
                    id: 'member.transfer.filter.toDate',
                  })}
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
              {/* Filter by Name */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({
                    id: 'member.transfer.filter.transferFrom',
                  })}
                  variant='outlined'
                  fullWidth
                  value={filters.transferFrom}
                  onChange={(e) =>
                    handleFilterChange('transferFrom', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Name */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({
                    id: 'member.transfer.filter.transferTo',
                  })}
                  variant='outlined'
                  fullWidth
                  value={filters.transferTo}
                  onChange={(e) =>
                    handleFilterChange('transferTo', e.target.value)
                  }
                />
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
                  {formatMessage({id: 'member.transfer.filter.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Box display='flex' justifyContent='space-between' mb={2}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant='h1'>
                  {formatMessage({id: 'member.transfer.title'})}
                </Typography>
                <Button
                  size='large'
                  startIcon={<ExpandMoreOutlinedIcon />}
                  onClick={() => setShowPopupColumn(true)}
                />
                <Button
                  size='large'
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={() => fetchData()}
                />
              </Box>
              <Box display='flex' alignItems='center' gap={2}>
                <Button
                  size='large'
                  variant='outlined'
                  onClick={toggleFilters}
                  startIcon={
                    showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />
                  }
                >
                  {showFilters
                    ? formatMessage({id: 'member.transfer.filter.hide'})
                    : formatMessage({id: 'member.transfer.filter.show'})}
                </Button>
                {user.permission.includes(RoutePermittedRole2.member_transfer_create) && (
                  <Button
                    size='large'
                    variant='outlined'
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenAddPackageTransferDialog}
                  >
                    {formatMessage({id: 'member.transfer.add'})}
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
          {/* Table */}
          <Grid item size={12}>
            <DataTable
              value={filteredData?.length > 0 ? filteredData : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              emptyMessage={formatMessage({id: 'member.transfer.table.empty'})}
              selectionMode='single'
              onSelectionChange={(e) => setSelectedMember(e.value)}
              // selection={selectedProduct}
              showGridlines
              stripedRows
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
              {user.permission.includes(RoutePermittedRole2.member_transfer_delete) && (
                <Column
                  body={actionBodyTemplate}
                  header={formatMessage({id: 'member.transfer.table.action'})}
                  exportable={false}
                  style={{maxWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AddNewPackageTransfer
        open={openAddPackageTransferDialog}
        onClose={handleCloseAddPackageTransferDialog}
        reCallAPI={fetchData}
      />
      <AppConfirmDialogV2
        dividers
        open={openDeletePackageTransferDialog}
        dialogTitle={formatMessage({id: 'member.transfer.delete.title'})}
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
            {formatMessage({id: 'member.transfer.delete.confirm'})}
          </Typography>
        }
        onDeny={handleCloseDeletePackageTransferDialog}
        onConfirm={onDeleteConfirm}
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

export default PackageTransfer;