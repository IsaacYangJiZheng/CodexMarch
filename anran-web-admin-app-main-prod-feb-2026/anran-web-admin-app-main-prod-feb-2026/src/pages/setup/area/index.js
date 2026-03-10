import React, {useState, useRef} from 'react';
import {Box, Button, Card, Typography, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  postDataApi,
  useGetDataApi,
  deleteDataApi,
} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Toast} from 'primereact/toast';
import AddArea from './AddArea';
import EditArea from './EditArea';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import AppInfoView from '@anran/core/AppInfoView';
import {Fonts} from 'shared/constants/AppEnums';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';
import IntlMessages from '@anran/utility/IntlMessages';

const Area = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{apiData: areaData, loading}, {reCallAPI}] = useGetDataApi(
    'api/area',
    undefined,
    {},
    true,
  );

  // Dialog Actions
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const handleOpenAddDialog = () => {
    setAddNewDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddNewDialogOpen(false);
  };

  const handleOpenEditDialog = (rowData) => {
    setEditDialogOpen(true);
    setSelectedArea(rowData);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedArea(null);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedArea(rowData);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedArea(null);
  };

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/area/deletev2/${selectedArea._id}`,
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

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_area_update) && (
          <Grid size={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_area_delete) && (
          <Grid size={6}>
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

  const onRowReorder = (e) => {
    console.log('reorder:', e.value);
    let aa = [];
    for (var i = 0; i < e.value.length; i++) {
      aa.push(e.value[i]._id);
    }
    console.log('reorder-result:', aa);
    postDataApi(
      'api/area/reorder/',
      infoViewActionsContext,
      {areas: aa},
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
          summary: formatMessage({id: 'admin.area.displayOrderChanged'}),
          life: 3000,
        });
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    // setProducts(e.value);
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
          <IntlMessages id='admin.area.listing' />
        </Typography>
        <Button
          // variant='outlined'
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => reCallAPI()}
        ></Button>
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_area_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<AddLocationAltOutlinedIcon />}
          onClick={handleOpenAddDialog}
        >
          <IntlMessages id='admin.area.addNew' />
        </Button>
      )}
    </Box>
  );

  return (
    <Box>
      <Toast ref={toast}></Toast>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          {/* <Grid item xs={12} md={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='h1'>Area Table</Typography>
              <Button
                variant='outlined'
                startIcon={<AddLocationAltOutlinedIcon />}
                onClick={handleOpenAddDialog}
              >
                Add New
              </Button>
            </Box>
          </Grid> */}
          {/* Table */}
          <Grid size={12}>
            <DataTable
              header={header}
              value={areaData}
              paginator
              rows={10}
              dataKey='id'
              loading={loading}
              emptyMessage={formatMessage({id: 'admin.area.empty'})}
              reorderableRows
              onRowReorder={onRowReorder}
              showGridlines
              size={'small'}
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column
                field='areaOrder'
                header={formatMessage({id: 'admin.area.displayOrder'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='areaCode'
                header={formatMessage({id: 'anran.areaCode'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='areaName'
                header={formatMessage({id: 'anran.areaName'})}
                style={{minWidth: '12rem'}}
              />
              {(user.permission.includes(RoutePermittedRole2.admin_area_update) || 
                user.permission.includes(RoutePermittedRole2.admin_area_delete)) && (
                <Column
                  header={formatMessage({id: 'admin.area.action'})}
                  body={actionBodyTemplate}
                  exportable={false}
                  style={{ minWidth: '8rem' }}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AddArea
        isOpen={addNewDialogOpen}
        setOpenDialog={handleCloseAddDialog}
        reCallAPI={reCallAPI}
      />
      <EditArea
        rowData={selectedArea}
        isOpen={editDialogOpen}
        setOpenDialog={handleCloseEditDialog}
        reCallAPI={reCallAPI}
      />
      {/* <DeleteArea
        rowData={selectedArea}
        isOpen={deleteDialogOpen}
        setOpenDialog={handleCloseDeleteDialog}
        reCallAPI={reCallAPI}
      /> */}
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={formatMessage({id: 'admin.area.deleteTitle'})}
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
            {formatMessage({id: 'admin.area.deleteMessage'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
      <AppInfoView />
    </Box>
  );
};

export default Area;
