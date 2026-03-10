import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
// import {Tag} from 'primereact/tag';
import {Toast} from 'primereact/toast';
import {useGetDataApi, deleteDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Box, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import AddFloor from './AddFloor';
// import EditFloor from './EditFloor';
import AddRoom from '../rooms/AddRoom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {IconButton} from '@mui/material';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useAuthUser} from '@anran/utility/AuthHooks';

export default function BranchFloorRooms({selectedBranch}) {
  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  //   const [addDialogOpen, setAddDialogOpen] = useState(false);
  //   const [editDialogOpen, setEditDialogOpen] = useState(false);
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
    `api/rooms/branch/${selectedBranch._id}`,
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

  //   const onRowToggle = (e) => {
  //     console.log('e.data', e.data);
  //     setExpandedRows(e.data);
  //   };

  //   const onRowExpand = (event) => {
  //     setSelectedFloor(event.data);
  //     // setExpandedRows(event.data.rooms);
  //   };

  //   const onRowCollapse = () => {
  //     setSelectedFloor(null);
  //     // setExpandedRows(null);
  //   };

  //   const handleOpenAddDialog = () => {
  //     setAddDialogOpen(true);
  //   };

  const handleOpenAddRoomDialog = () => {
    setAddRoomDialogOpen(true);
  };

  //   const handleOpenEditDialog = (rowData) => {
  //     setEditDialogOpen(true);
  //     setSelectedFloor(rowData);
  //   };

  const handleOpenEditRoomDialog = (rowData) => {
    console.log('handleOpenEditRoomDialog', rowData);
    setEditRoomDialogOpen(true);
    setSelectedFloor(rowData);
  };

  //   const handleCloseEditDialog = () => {
  //     setEditDialogOpen(false);
  //     setSelectedFloor(null);
  //   };

  const handleCloseEditRoomDialog = () => {
    setEditRoomDialogOpen(false);
    setSelectedFloor(null);
  };

  const handleOpenDeleteRoomDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedFloor(rowData);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedFloor(null);
  };

  const roomActionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_room_update) && (
          <Grid size={{xs:6, md:6}}>
            <IconButton
              color='primary'
              onClick={() => handleOpenEditRoomDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_room_delete) && (
          <Grid size={{xs:6, md:6}}>
            <IconButton
              color='error'
              onClick={() => handleOpenDeleteRoomDialog(rowData)}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    );
  };

  const onDeleteConfirm = () => {
    console.log('onDeleteConfirm', selectedFloor);
    deleteDataApi(
      `/api/rooms/${selectedFloor._id}`,
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

  const headerTemplate = (data) => {
    return (
      <React.Fragment>
        <span className='vertical-align-middle ml-2 font-bold line-height-3'>
          {data.floor.floorDetail} [Total Rooms:{' '}
          {calculateCustomerTotal(data.floor.floorDetail)}]
        </span>
      </React.Fragment>
    );
  };

  // const footerTemplate = (data) => {
  //   return (
  //     <React.Fragment>
  //       <td colSpan={8}>
  //         <div className='flex justify-content-end font-bold w-full'>
  //           Total Rooms: {calculateCustomerTotal(data.floor.floorDetail)}
  //         </div>
  //       </td>
  //     </React.Fragment>
  //   );
  // };

  const calculateCustomerTotal = (name) => {
    let total = 0;

    if (floorData) {
      for (let data of floorData) {
        if (data.floor.floorDetail === name) {
          total++;
        }
      }
    }

    return total;
  };

  return (
    <div className='card'>
      <Toast ref={toast} />
      <Grid container spacing={2}>
        <Grid size={{xs: 12, md: 12}}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h1'>Rooms Listing</Typography>
            {user.permission.includes(RoutePermittedRole2.admin_room_create) && (
              <Button
                variant='outlined'
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddRoomDialog}
              >
                Add Room
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      <DataTable
        value={floorData}
        rowGroupMode='subheader'
        groupRowsBy='floor.floorDetail'
        sortMode='single'
        sortField='floor.floorOrder'
        sortOrder={1}
        expandableRowGroups
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowGroupHeaderTemplate={headerTemplate}
        // rowGroupFooterTemplate={footerTemplate}
        tableStyle={{minWidth: '50rem'}}
      >
        <Column style={{width: '3rem'}} />
        {/* <Column rowReorder style={{width: '3rem'}} /> */}
        <Column field='room_no' header='Room no' sortable></Column>
        <Column field='roomCapacity' header='Total persons'></Column>
        <Column field='room_gender' header='Room Gender'></Column>
        <Column field='status_active' header='Status'></Column>
        {(user.permission.includes(RoutePermittedRole2.admin_room_update) || 
          user.permission.includes(RoutePermittedRole2.admin_room_delete)) && (
          <Column
            header='action'
            body={roomActionBodyTemplate}
            exportable={false}
            style={{maxWidth: '8rem'}}
          />
        )}
      </DataTable>
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
      {addRoomDialogOpen && (
        <AddRoom
          isOpen={addRoomDialogOpen}
          setOpenDialog={() => setAddRoomDialogOpen(false)}
          reCallAPI={reCallAPI}
          selectedBranch={selectedBranch}
          selectedFloor={selectedFloor}
        />
      )}
      {editRoomDialogOpen && (
        <AddRoom
          isOpen={editRoomDialogOpen}
          setOpenDialog={handleCloseEditRoomDialog}
          reCallAPI={reCallAPI}
          selectedBranch={selectedBranch}
          selectedFloor={selectedFloor}
          isEdit={true}
          roomData={selectedFloor}
        />
      )}
    </div>
  );
}

BranchFloorRooms.propTypes = {
  selectedBranch: PropTypes.object,
};
