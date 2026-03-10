import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Tag} from 'primereact/tag';
import {Toast} from 'primereact/toast';
import {
  useGetDataApi,
  deleteDataApi,
  postDataApi,
} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Box, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddFloor from './AddFloor';
import EditFloor from './EditFloor';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {IconButton} from '@mui/material';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

export default function BranchFloors({selectedBranch}) {
  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const [{apiData: floorData}, {reCallAPI}] = useGetDataApi(
    `api/floors/branch/${selectedBranch._id}`,
    undefined,
    {},
    true,
  );

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (rowData) => {
    setSelectedFloor(rowData);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedFloor(null);
    setEditDialogOpen(false);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setSelectedFloor(rowData);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedFloor(null);
    setDeleteDialogOpen(false);
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.floorStatus ? 'In Operation' : 'Not in Operation'}
        severity={rowData.floorStatus ? 'success' : 'warning'}
      ></Tag>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_branch_update) && (
          <Grid item xs={6} md={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_branch_delete) && (
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

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/floors/${selectedFloor._id}`,
      infoViewActionsContext,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage('Deleted successfully!');
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onRowReorder = (e) => {
    console.log('reorder:', e.value);
    let aa = [];
    for (var i = 0; i < e.value.length; i++) {
      aa.push(e.value[i]._id);
    }
    console.log('reorder-result:', aa);
    postDataApi(
      'api/floors/reorder/',
      infoViewActionsContext,
      {floors: aa},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        // setData(e.value);
        toast.current.show({
          severity: 'success',
          summary: 'Display Order Changed',
          life: 3000,
        });
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    // setProducts(e.value);
  };

  return (
    <div className='card'>
      <Toast ref={toast} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h1'>Floors Listing</Typography>
            {user.permission.includes(
              RoutePermittedRole2.admin_branch_create,
            ) && (
              <Button
                variant='outlined'
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddDialog}
              >
                Add Floor
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      <DataTable
        size='small'
        value={floorData}
        reorderableRows
        onRowReorder={onRowReorder}
        dataKey='id'
        tableStyle={{minWidth: '60rem'}}
      >
        <Column rowReorder style={{width: '3rem'}} />
        <Column field='floorOrder' header='Display Order' />
        <Column field='floorNo' header='FloorNo' />
        <Column field='floorDetail' header='Floor Detail' />
        <Column
          field='floorStatus'
          header='Status'
          sortable
          body={statusBodyTemplate}
        />
        {(user.permission.includes(RoutePermittedRole2.admin_branch_update) ||
          user.permission.includes(
            RoutePermittedRole2.admin_branch_delete,
          )) && (
          <Column
            header='action'
            body={actionBodyTemplate}
            exportable={false}
            style={{minWidth: '8rem'}}
          />
        )}
      </DataTable>
      {addDialogOpen && <></>}
      <AddFloor
        isOpen={addDialogOpen}
        setOpenDialog={() => setAddDialogOpen(false)}
        reCallAPI={reCallAPI}
        selectedBranch={selectedBranch}
      />
      <EditFloor
        rowData={selectedFloor}
        isOpen={editDialogOpen}
        setOpenDialog={handleCloseEditDialog}
        reCallAPI={reCallAPI}
        selectedBranch={selectedBranch}
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
        onConfirm={onDeleteConfirm}
      />
    </div>
  );
}

BranchFloors.propTypes = {
  selectedBranch: PropTypes.object,
};
