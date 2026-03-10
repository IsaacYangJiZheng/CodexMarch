import React, {useState, useEffect, useRef, useMemo} from 'react';
import {Box, Card, Typography, Button, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Dropdown} from 'primereact/dropdown';
import {Toast} from 'primereact/toast';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';

import {useGetDataApi} from '@anran/utility/APIHooks';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';

import CreateVoucher from './CreateVoucher';
import EditVoucher from './EditVoucher';
import DeleteVoucher from './DeleteVoucher';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const Voucher = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const toast = useRef(null);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [filters, setFilters] = useState({
    voucherType: {value: null, matchMode: 'equals'},
    voucherCode: {value: null, matchMode: 'contains'},
    rewardType: {value: null, matchMode: 'equals'},
    validityType: {value: null, matchMode: 'equals'},
    isActive: {value: null, matchMode: 'equals'},
  });

  const [{apiData: voucherDatabase, loading}, {reCallAPI}] = useGetDataApi(
    'api/voucher',
    {},
    {},
    true,
  );

  // Datatable Templates
  const statusBodyTemplate = (rowData) => {
    return rowData.isActive
      ? formatMessage({id: 'admin.voucher.status.active'})
      : formatMessage({id: 'admin.voucher.status.inactive'});
  };

  const voucherTypeLabel = (value) => {
    const voucherTypeLabels = {
      'New Member': formatMessage({id: 'admin.voucher.type.newMember'}),
      Birthday: formatMessage({id: 'admin.voucher.type.birthday'}),
      Milestone: formatMessage({id: 'admin.voucher.type.milestone'}),
      Referral: formatMessage({id: 'admin.voucher.type.referral'}),
      Inactivity: formatMessage({id: 'admin.voucher.type.inactivity'}),
      Anniversary: formatMessage({id: 'admin.voucher.type.anniversary'}),
    };
    return voucherTypeLabels[value] || value;
  };

  const rewardTypeLabel = (value) => {
    const rewardTypeLabels = {
      Percentage: formatMessage({id: 'admin.voucher.rewardType.percentage'}),
      Amount: formatMessage({id: 'admin.voucher.rewardType.amount'}),
    };
    return rewardTypeLabels[value] || value;
  };

  const validityTypeLabel = (value) => {
    const validityTypeLabels = {
      Day: formatMessage({id: 'admin.voucher.validityType.day'}),
      Week: formatMessage({id: 'admin.voucher.validityType.week'}),
      Month: formatMessage({id: 'admin.voucher.validityType.month'}),
      Year: formatMessage({id: 'admin.voucher.validityType.year'}),
    };
    return validityTypeLabels[value] || value;
  };

  const typeFilterTemplate = () => {
    return (
      <Dropdown
        value={filters.voucherType.value}
        options={[
          {
            label: formatMessage({id: 'admin.voucher.type.newMember'}),
            value: 'New Member',
          },
          {
            label: formatMessage({id: 'admin.voucher.type.birthday'}),
            value: 'Birthday',
          },
          {
            label: formatMessage({id: 'admin.voucher.type.milestone'}),
            value: 'Milestone',
          },
          {
            label: formatMessage({id: 'admin.voucher.type.referral'}),
            value: 'Referral',
          },
          {
            label: formatMessage({id: 'admin.voucher.type.inactivity'}),
            value: 'Inactivity',
          },
          {
            label: formatMessage({id: 'admin.voucher.type.anniversary'}),
            value: 'Anniversary',
          },
        ]}
        onChange={(e) => {
          setFilters((prevFilters) => ({
            ...prevFilters,
            voucherType: {value: e.value, matchMode: 'equals'},
          }));
        }}
        placeholder={formatMessage({id: 'admin.voucher.filter.type.placeholder'})}
      />
    );
  };

  const statusFilterTemplate = () => {
    return (
      <Dropdown
        value={filters.isActive.value}
        options={[
          {
            label: formatMessage({id: 'admin.voucher.status.active'}),
            value: false,
          },
          {
            label: formatMessage({id: 'admin.voucher.status.inactive'}),
            value: true,
          },
        ]}
        onChange={(e) => {
          setFilters((prevFilters) => ({
            ...prevFilters,
            isActive: {value: e.value, matchMode: 'equals'},
          }));
        }}
        placeholder={formatMessage({id: 'admin.voucher.filter.status'})}
      />
    );
  };

  const voucherTypeBodyTemplate = (rowData) =>
    voucherTypeLabel(rowData.voucherType);

  const rewardTypeBodyTemplate = (rowData) =>
    rewardTypeLabel(rowData.rewardType);

  const validityTypeBodyTemplate = (rowData) =>
    validityTypeLabel(rowData.validityType);

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_voucher_update) && (
          <Grid size={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_voucher_delete) && (
          <Grid isize={6}>
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
        field: 'voucherType',
        header: formatMessage({id: 'admin.voucher.table.type'}),
        filterMenuStyle: {minWidth: '14rem'},
        displayOrder: 1,
        filterField: 'voucherType',
        showFilterMenu: false,
        filter: true,
        filterElement: typeFilterTemplate,
        body: voucherTypeBodyTemplate,
        sortable: true,
      },
      {
        field: 'voucherCode',
        header: formatMessage({id: 'admin.voucher.table.code'}),
        filterMenuStyle: {minWidth: '12rem'},
        displayOrder: 2,
        filterField: 'voucherCode',
        showFilterMenu: false,
        filter: true,
        filterPlaceholder: formatMessage({id: 'admin.voucher.filter.code'}),
        sortable: true,
      },
      {
        field: 'rewardType',
        header: formatMessage({id: 'admin.voucher.table.rewardType'}),
        filterMenuStyle: {minWidth: '12rem'},
        displayOrder: 3,
        filterField: 'rewardType',
        showFilterMenu: false,
        filter: true,
        filterPlaceholder: formatMessage({id: 'admin.voucher.filter.rewardType'}),
        body: rewardTypeBodyTemplate,
        sortable: true,
      },
      {
        field: 'rewardValue',
        header: formatMessage({id: 'admin.voucher.table.reward'}),
        filterMenuStyle: {minWidth: '12rem'},
        displayOrder: 4,
        filter: false,
        showFilterMenu: false,
      },
      {
        field: 'validityType',
        header: formatMessage({id: 'admin.voucher.table.validityType'}),
        filterMenuStyle: {minWidth: '12rem'},
        displayOrder: 3,
        filterField: 'validityType',
        showFilterMenu: false,
        filter: true,
        filterPlaceholder: formatMessage({
          id: 'admin.voucher.filter.validityType',
        }),
        body: validityTypeBodyTemplate,
        sortable: true,
      },
      {
        field: 'validityValue',
        header: formatMessage({id: 'admin.voucher.table.validity'}),
        filterMenuStyle: {minWidth: '12rem'},
        displayOrder: 4,
        filter: false,
        showFilterMenu: false,
      },
      {
        field: 'isActive',
        header: formatMessage({id: 'admin.voucher.table.status'}),
        filterMenuStyle: {minWidth: '14rem'},
        displayOrder: 5,
        filterField: 'isActive',
        showFilterMenu: false,
        body: statusBodyTemplate,
        filter: true,
        filterElement: statusFilterTemplate,
      },
    ],
    [filters, formatMessage],
  );

  useEffect(() => {
    setVisibleColumns((prevColumns) => {
      if (!prevColumns.length) {
        return columns;
      }
      return columns.filter((col) =>
        prevColumns.some((prevCol) => prevCol.field === col.field),
      );
    });
  }, [columns]);

  // Dialog Actions
  const [openAddNewVoucher, setOpenAddNewVoucher] = useState(false);
  const handleOpenAddNewVoucher = () => {
    setOpenAddNewVoucher(true);
  };

  const handleCloseAddNewVoucher = () => {
    setOpenAddNewVoucher(false);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const handleOpenEditDialog = (rowData) => {
    setEditingVoucherId(rowData._id);
    console.log(rowData);
    setInitialValues({
      voucherType: rowData.voucherType,
      voucherCode: rowData.voucherCode,
      voucherDescription: rowData.voucherDescription,
      rewardType: rowData.rewardType,
      rewardValue: rowData.rewardValue,
      validityType: rowData.validityType,
      validityValue: rowData.validityValue,
      isActive: rowData.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingVoucherId(null);
    setInitialValues({});
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const handleOpenDeleteDialog = (rowData) => {
    setDeletingVoucher(rowData);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingVoucher(null);
    setDeleteDialogOpen(false);
  };

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
          {formatMessage({id: 'admin.voucher.title'})}
        </Typography>
        <Button
          size='large'
          startIcon={<ExpandMoreOutlinedIcon />}
          onClick={() => setShowPopupColumn(true)}
        ></Button>
        <Button
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => reCallAPI()}
        ></Button>
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_voucher_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<Add />}
          onClick={handleOpenAddNewVoucher}
        >
          {formatMessage({id: 'admin.voucher.addNew'})}
        </Button>
      )}
    </Box>
  );

  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast}></Toast>
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              header={header}
              value={voucherDatabase?.length > 0 ? voucherDatabase : []}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              filters={filters}
              filterDisplay='row'
              loading={loading}
              emptyMessage={formatMessage({id: 'admin.voucher.empty'})}
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
              {(user.permission.includes(RoutePermittedRole2.admin_voucher_update) || 
                user.permission.includes(RoutePermittedRole2.admin_voucher_delete)) && (
                <Column
                  body={actionBodyTemplate}
                  header={formatMessage({id: 'admin.voucher.table.action'})}
                  exportable={false}
                  style={{maxWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <CreateVoucher
        open={openAddNewVoucher}
        onClose={handleCloseAddNewVoucher}
        reCallAPI={reCallAPI}
      />
      <EditVoucher
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        reCallAPI={reCallAPI}
        editingVoucherId={editingVoucherId}
        initialValues={initialValues}
      />
      <DeleteVoucher
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        reCallAPI={reCallAPI}
        deletingVoucher={deletingVoucher}
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

export default Voucher;