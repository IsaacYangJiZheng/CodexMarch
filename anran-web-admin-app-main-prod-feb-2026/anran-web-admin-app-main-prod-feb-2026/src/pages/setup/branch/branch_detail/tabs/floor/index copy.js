import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Tag} from 'primereact/tag';
import {Toast} from 'primereact/toast';
import {useGetDataApi, deleteDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Grid, Box, Typography} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddFloor from './AddFloor';
import EditFloor from './EditFloor';
import AddRoom from '../rooms/AddRoom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {IconButton} from '@mui/material';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';

export default function BranchFloors({selectedBranch}) {
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [expandedRows, setExpandedRows] = useState(null);
  // const [rooms, setRooms] = useState([]);

  // const [{apiData: floorData}, {reCallAPI}] = useGetDataApi(
  //   `api/floors/branch/${selectedBranch._id}`,
  //   undefined,
  //   {},
  //   true,
  // );

  const [{apiData: floorData}, {reCallAPI}] = useGetDataApi(
    `api/floors/rooms/branch/${selectedBranch._id}`,
    undefined,
    {},
    true,
  );

  // const [{apiData: roomData}] = useGetDataApi(
  //   `api/rooms/list/${selectedBranch._id}/${selectedBranch._id}`,
  //   undefined,
  //   {},
  //   false,
  // );

  //   useEffect(() => {
  //     ProductService.getProductsWithOrdersSmall().then((data) =>
  //       setProducts(data),
  //     );
  //   }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRowToggle = (e) => {
    console.log('e.data', e.data);
    setExpandedRows(e.data);
  };

  const onRowExpand = (event) => {
    setSelectedFloor(event.data);
    // setExpandedRows(event.data.rooms);
  };

  const onRowCollapse = () => {
    setSelectedFloor(null);
    // setExpandedRows(null);
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleOpenAddRoomDialog = () => {
    setAddRoomDialogOpen(true);
  };

  const handleOpenEditDialog = (rowData) => {
    setEditDialogOpen(true);
    setSelectedFloor(rowData);
  };

  const handleOpenEditRoomDialog = (rowData) => {
    setEditRoomDialogOpen(true);
    setSelectedFloor(rowData);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedFloor(null);
  };

  const handleCloseEditRoomDialog = () => {
    setEditRoomDialogOpen(false);
    setSelectedFloor(null);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedFloor(rowData);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedFloor(null);
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.floorStatus ? 'In Operation' : 'Not in Operation'}
        severity={rowData.floorStatus ? 'success' : 'warning'}
      ></Tag>
    );
  };

  const expandAll = () => {
    let _expandedRows = {};

    floorData?.rooms.forEach((p) => (_expandedRows[`${p.id}`] = true));

    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows(null);
  };

  const roomHeader = (
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
        <Typography variant='h4'>Rooms Listing</Typography>
      </Box>

      <Button
        variant='outlined'
        // startIcon={<AddLocationAltOutlinedIcon />}
        onClick={handleOpenAddRoomDialog}
      >
        Add Room
      </Button>
    </Box>
  );

  const rowClass = () => {
    return {
      'bg-primary': true,
    };
  };

  const rowExpansionTemplate = (data) => {
    return (
      <div className='p-3'>
        <h5>Rooms for {data.floorDetail}</h5>
        <DataTable
          value={data.rooms}
          header={roomHeader}
          reorderableRows
          rowClassName={rowClass}
          // onRowReorder={onRowReorder}
        >
          <Column rowReorder style={{width: '3rem'}} />
          <Column field='room_no' header='Room no' sortable></Column>
          <Column field='roomCapacity' header='Total persons'></Column>
          <Column field='room_gender' header='Room Gender'></Column>
          <Column field='status_active' header='Status'></Column>
          <Column
            header='action'
            body={roomActionBodyTemplate}
            exportable={false}
            style={{maxWidth: '8rem'}}
          />
        </DataTable>
      </div>
    );
  };

  const header = (
    <div className='flex flex-wrap justify-content-end gap-2'>
      <Button icon='pi pi-plus' label='Expand All' onClick={expandAll} text />
      <Button
        icon='pi pi-minus'
        label='Collapse All'
        onClick={collapseAll}
        text
      />
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6}>
          <IconButton
            color='success'
            onClick={() => handleOpenEditDialog(rowData)}
          >
            <EditIcon />
          </IconButton>
        </Grid>
        <Grid item xs={6} md={6}>
          <IconButton
            color='error'
            onClick={() => handleOpenDeleteDialog(rowData)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  const roomActionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6}>
          <IconButton
            color='primary'
            onClick={() => handleOpenEditRoomDialog(rowData)}
          >
            <EditIcon />
          </IconButton>
        </Grid>
        <Grid item xs={6} md={6}>
          <IconButton
            color='error'
            // onClick={() => handleOpenDeleteRoomDialog(rowData)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
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
            <Typography variant='h1'>Floors Table</Typography>
            <Button
              variant='outlined'
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add New
            </Button>
          </Box>
        </Grid>
      </Grid>
      <DataTable
        size='small'
        value={floorData}
        header={header}
        expandedRows={expandedRows}
        onRowExpand={onRowExpand}
        onRowCollapse={onRowCollapse}
        onRowToggle={onRowToggle}
        rowExpansionTemplate={rowExpansionTemplate}
        reorderableRows
        onRowReorder={(e) => console.log(e.value)}
        dataKey='id'
        tableStyle={{minWidth: '60rem'}}
      >
        <Column expander={true} style={{width: '5rem'}} />
        <Column field='floorNo' header='FloorNo' />
        <Column field='floorDetail' header='Floor Detail' />
        <Column
          field='floorStatus'
          header='Status'
          sortable
          body={statusBodyTemplate}
        />
        <Column
          header='action'
          body={actionBodyTemplate}
          exportable={false}
          style={{minWidth: '8rem'}}
        />
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
      {selectedFloor && (
        <AddRoom
          isOpen={addRoomDialogOpen}
          setOpenDialog={() => setAddRoomDialogOpen(false)}
          reCallAPI={reCallAPI}
          selectedBranch={selectedBranch}
          selectedFloor={selectedFloor}
        />
      )}

      <EditFloor
        rowData={selectedFloor}
        isOpen={editRoomDialogOpen}
        setOpenDialog={handleCloseEditRoomDialog}
        reCallAPI={reCallAPI}
        selectedBranch={selectedBranch}
      />
    </div>
  );
}

BranchFloors.propTypes = {
  selectedBranch: PropTypes.object,
};
