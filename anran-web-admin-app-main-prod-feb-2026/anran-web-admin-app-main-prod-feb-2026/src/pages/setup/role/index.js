import React, {useState} from 'react';
import {Box, Button, Card, Typography, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Dropdown} from 'primereact/dropdown';
import {useIntl} from 'react-intl';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import CreateRole from './CreateRole';
import {useGetDataApi, deleteDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import EditRole from './EditRole';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import IntlMessages from '@anran/utility/IntlMessages';

const Role = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [filters, setFilters] = useState({
    role_name: {value: null, matchMode: 'contains'},
    status_active: {value: null, matchMode: 'equals'},
  });

  const [{apiData: roleDatabase, loading}, {reCallAPI}] = useGetDataApi(
    'api/roles',
    {},
    {},
    true,
  );
  const filteredRoleDatabase = Array.isArray(roleDatabase)
    ? roleDatabase.filter((role) => !role.isDeleted)
    : [];
  const [{apiData: branchDatabase}] = useGetDataApi('api/branch', {}, {}, true);

  // Role Checkboxes Generation
  const roles = [
    {title: 'Admin-Role', permission: ['View', 'Create', 'Update', 'Delete']},
    {title: 'Admin-Area', permission: ['View', 'Create', 'Update', 'Delete']},
    {title: 'Admin-Branch', permission: ['View', 'Create', 'Update', 'Delete']},
    {
      title: 'Admin-Package',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {title: 'Admin-Banner', permission: ['View', 'Create', 'Update', 'Delete']},
    {
      title: 'Admin-Message',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Admin-Voucher',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {title: 'Admin-Staff', permission: ['View', 'Create', 'Update', 'Delete']},
    {title: 'Admin-Room', permission: ['View', 'Create', 'Update', 'Delete']},
    {
      title: 'Member-Member',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Member-Booking',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Member-CheckIn',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Member-Transfer',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Member-Feedback',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Finance-Sales',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Finance-Payments',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'Finance-Report',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {
      title: 'HR-Attendance',
      permission: ['View', 'Create', 'Update', 'Delete'],
    },
    {title: 'Dashboard-Branch', permission: ['View']},
    {title: 'Dashboard-Management', permission: ['View']},
    {title: 'Dashboard-Finance', permission: ['View']},
    {title: 'Dashboard-Sales', permission: ['View']},
    {title: 'Dashboard-CRM', permission: ['View']},
    {title: 'Dashboard-Marketing', permission: ['View']},
  ];

  const initialPermissionsState = roles.reduce((acc, {title, permission}) => {
    const roleKey = title.replace(/-/g, '_').toLowerCase();
    // const parts = title.split('-');
    // const roleKey = parts[0].toLowerCase() + parts.slice(1).join('');
    acc[roleKey] = {};
    permission.forEach((perms) => {
      acc[roleKey][perms.toLowerCase()] = false;
    });
    return acc;
  }, {});

  console.log('initialPermissionsState', initialPermissionsState);

  const [permissions, setPermissions] = useState(initialPermissionsState);

  const statusBodyTemplate = (rowData) => {
    return rowData.status_active
      ? formatMessage({id: 'role.status.active'})
      : formatMessage({id: 'role.status.inactive'});
  };

  const statusFilterTemplate = () => {
    return (
      <Dropdown
        value={filters.status_active.value}
        options={[
          {label: formatMessage({id: 'role.status.active'}), value: true},
          {label: formatMessage({id: 'role.status.inactive'}), value: false},
        ]}
        onChange={(e) => {
          setFilters((prevFilters) => ({
            ...prevFilters,
            roleStatus: {value: e.value, matchMode: 'equals'},
          }));
        }}
        placeholder={formatMessage({id: 'role.table.selectStatus'})}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid size={6}>
          {user.permission.includes(RoutePermittedRole2.admin_role_update) && (
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          )}
        </Grid>
        <Grid size={6}>
          {user.permission.includes(RoutePermittedRole2.admin_role_delete) && (
            <IconButton
              color='error'
              onClick={() => handleOpenDeleteDialog(rowData)}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    );
  };

  const columns = [
    {
      field: 'role_name',
      header: formatMessage({id: 'role.table.roleName'}),
      filterMenuStyle: {minWidth: '12rem'},
      displayOrder: 1,
      filterField: 'role_name',
      showFilterMenu: false,
      filter: true,
      filterPlaceholder: formatMessage({id: 'role.table.filterByRole'}),
      sortable: true,
    },
    {
      field: 'status_active',
      header: formatMessage({id: 'role.table.status'}),
      filterMenuStyle: {minWidth: '8rem'},
      displayOrder: 2,
      filterField: 'status_active',
      showFilterMenu: false,
      body: statusBodyTemplate,
      filter: true,
      filterElement: statusFilterTemplate,
    },
  ];

  // Dialog Actions
  const [addNewRoleDialogOpen, setAddNewRoleDialogOpen] = useState(false);
  const handleOpenAddNewRoleDialog = () => {
    setAddNewRoleDialogOpen(true);
  };

  const handleCloseAddNewRoleDialog = () => {
    setAddNewRoleDialogOpen(false);
    setPermissions(initialPermissionsState);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const handleOpenEditDialog = (rowData) => {
    setEditingRoleId(rowData._id);
    const editingRole = {};
    for (const key in permissions) {
      if (!rowData[key]) {
        editingRole[key] = {
          view: permissions[key].view,
          create: permissions[key].create,
          update: permissions[key].update,
          delete: permissions[key].delete,
        };
      }
    }
    for (const key in rowData) {
      if (
        key !== '_id' &&
        key !== 'role_name' &&
        // key !== 'all_branch' &&
        // key !== 'branch' &&
        key !== 'status_active' &&
        key !== '__v' &&
        key !== 'createdAt'
      ) {
        if (key.includes('banner') || key.includes('message')) {
          editingRole[key] = {
            view: rowData[key].view,
            create: rowData[key].create,
            delete: rowData[key].delete,
            update: rowData[key].update,
          };
        } else {
          editingRole[key] = {
            view: rowData[key].view,
            create: rowData[key].create,
            update: rowData[key].update,
            delete: rowData[key].delete,
          };
        }
      }
    }
    setPermissions(editingRole);
    console.log('editingRole:', editingRole);
    setInitialValues({
      roleName: rowData.role_name,
      // allBranch: rowData.all_branch,
      // branch: Array.isArray(rowData.branch)
      //   ? rowData.branch[0]
      //   : rowData.branch,
      status_active: rowData.status_active,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingRoleId(null);
    setPermissions(initialPermissionsState);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const handleOpenDeleteDialog = (rowData) => {
    setDeletingRole(rowData);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingRole(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteRole = async () => {
    try {
      const response = await deleteDataApi(
        `/api/roles/${deletingRole._id}`,
        infoViewActionsContext,
      );
      console.log('Response from API:', response);
      reCallAPI(); // Refresh the role list
      setDeleteDialogOpen(false); // Close the dialog
      infoViewActionsContext.showMessage('Role deleted successfully!'); // Show success message
    } catch (error) {
      infoViewActionsContext.fetchError(error.message); // Show error message
    }
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
          <IntlMessages id='role.table.title' />
        </Typography>
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_role_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddNewRoleDialog}
        >
          <IntlMessages id='role.table.addNew' />
        </Button>
      )}
    </Box>
  );
  console.log('permissions:', permissions);
  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              header={header}
              value={
                filteredRoleDatabase?.length > 0 ? filteredRoleDatabase : []
              }
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              filters={filters}
              filterDisplay='row'
              loading={loading}
              emptyMessage={formatMessage({id: 'role.table.empty'})}
              selectionMode='single'
              showGridlines
              stripedRows
            >
              {columns.map((col) => (
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
              {(user.permission.includes(
                RoutePermittedRole2.admin_role_update,
              ) ||
                user.permission.includes(
                  RoutePermittedRole2.admin_role_delete,
                )) && (
                <Column
                  body={actionBodyTemplate}
                  header={formatMessage({id: 'role.table.action'})}
                  exportable={false}
                  style={{maxWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      {/* Dialog Add New Role */}
      <CreateRole
        open={addNewRoleDialogOpen}
        onClose={handleCloseAddNewRoleDialog}
        reCallAPI={reCallAPI}
        roles={roles}
        branchDatabase={branchDatabase}
        permissions={permissions}
        setPermissions={setPermissions}
      />
      {/* Dialog Edit Role */}
      <EditRole
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        reCallAPI={reCallAPI}
        roles={roles}
        branchDatabase={branchDatabase}
        permissions={permissions}
        setPermissions={setPermissions}
        editingRoleId={editingRoleId}
        initialValues={initialValues}
      />
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={'Delete Confirmation'}
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
            {'Are you sure you want to delete the record?'}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={handleDeleteRole}
      />
    </Box>
  );
};

export default Role;
