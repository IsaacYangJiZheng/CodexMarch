import React, {useState, useRef} from 'react';
import {Box, Button, Card, Typography, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Dropdown} from 'primereact/dropdown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  postDataApi,
  useGetDataApi,
  deleteDataApi,
} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Toast} from 'primereact/toast';
import AddMessage from './AddMessage';
// import EditBanner from './EditBanner';
// import DeleteArea from './DeleteArea';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {Image} from 'primereact/image';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const BannerV2 = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{apiData: bannerData, loading}, {reCallAPI}] = useGetDataApi(
    'api/messages/web',
    undefined,
    {},
    true,
  );

  // Dialog Actions
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filters, setFilters] = useState({
    image_url: {value: null, matchMode: 'contains'},
    sortorder: {value: null, matchMode: 'equals'},
    publish: {value: null, matchMode: 'equals'},
  });
  const handleOpenAddDialog = () => {
    setAddNewDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddNewDialogOpen(false);
  };

  const handleOpenEditDialog = (rowData) => {
    setEditDialogOpen(true);
    setSelectedMessage(rowData);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedMessage(null);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedMessage(rowData);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedMessage(null);
  };

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/messages/deletev2/${selectedMessage._id}`,
      infoViewActionsContext,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage(
          formatMessage({id: 'admin.message.delete.success'}),
        );
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_message_update) && (
          <Grid size={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_message_delete) && (
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

  const statusBodyTemplate = (rowData) => {
    return rowData.publish
      ? formatMessage({id: 'admin.message.status.published'})
      : formatMessage({id: 'admin.message.status.notPublished'});
  };

  const statusFilterTemplate = () => {
    return (
      <Dropdown
        value={filters.publish.value}
        options={[
          {
            label: formatMessage({id: 'admin.message.status.published'}),
            value: true,
          },
          {
            label: formatMessage({id: 'admin.message.status.notPublished'}),
            value: false,
          },
        ]}
        onChange={(e) => {
          setFilters((prevFilters) => ({
            ...prevFilters,
            publish: {value: e.value, matchMode: 'equals'},
          }));
        }}
        placeholder={formatMessage({id: 'admin.message.filter.status'})}
      />
    );
  };

  const messageTypeBodyTemplate = (rowData) => {
    return rowData.msgContentType === 'image'
      ? formatMessage({id: 'admin.message.type.image'})
      : formatMessage({id: 'admin.message.type.text'});
  };

  const imageBodyTemplate = (rowData) => {
    if (rowData.msgContentType == 'image') {
      return (
        <Image
          src={rowData.imageUrl}
          alt={rowData.imageDataUrl}
          width='100'
          preview
        />
      );
    } else {
      return rowData.msg;
    }
  };

  const effectiveDateBodyTemplate = (rowData) => {
    return rowData.always
      ? formatMessage({id: 'admin.message.always'})
      : dayjs(rowData.startDate).format('MMMM D, YYYY');
  };

  const enddateBodyTemplate = (rowData) => {
    return rowData.always
      ? formatMessage({id: 'admin.message.always'})
      : dayjs(rowData.endDate).format('MMMM D, YYYY');
  };

  const onRowReorder = (e) => {
    console.log('reorder:', e.value);
    let aa = [];
    for (var i = 0; i < e.value.length; i++) {
      aa.push(e.value[i]._id);
    }
    console.log('reorder-result:', aa);
    postDataApi(
      'api/messages/reorder/',
      infoViewActionsContext,
      {messages: aa},
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
          summary: formatMessage({id: 'admin.message.displayOrderChanged'}),
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
          {formatMessage({id: 'admin.message.title.listing'})}
        </Typography>
        <Button
          // variant='outlined'
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => reCallAPI()}
        ></Button>
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_message_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleOpenAddDialog}
        >
          {formatMessage({id: 'admin.message.addNew'})}
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
              value={bannerData}
              // paginator
              // rows={10}
              dataKey='id'
              loading={loading}
              emptyMessage={formatMessage({id: 'admin.message.empty'})}
              reorderableRows
              onRowReorder={onRowReorder}
              showGridlines
              size={'small'}
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column
                field='displayOrder'
                header={formatMessage({id: 'admin.message.table.displayOrder'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='msgName'
                header={formatMessage({id: 'admin.message.table.name'})}
                filter
                filterPlaceholder={formatMessage({
                  id: 'admin.message.filter.name',
                })}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='msg'
                header={formatMessage({id: 'admin.message.table.message'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='startDate'
                header={formatMessage({id: 'admin.message.table.effectiveDate'})}
                body={effectiveDateBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='endDate'
                header={formatMessage({id: 'admin.message.table.endDate'})}
                body={enddateBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='msgContentType'
                header={formatMessage({id: 'admin.message.table.type'})}
                body={messageTypeBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='imageUrl'
                header={formatMessage({id: 'admin.message.table.content'})}
                body={imageBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='publish'
                header={formatMessage({id: 'admin.message.table.status'})}
                body={statusBodyTemplate}
                filter
                filterElement={statusFilterTemplate}
                style={{minWidth: '12rem'}}
              />
              {(user.permission.includes(RoutePermittedRole2.admin_message_update) || 
                user.permission.includes(RoutePermittedRole2.admin_message_delete)) && (
                <Column
                  header={formatMessage({id: 'admin.message.table.action'})}
                  body={actionBodyTemplate}
                  exportable={false}
                  style={{minWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      {addNewDialogOpen ? (
        <AddMessage
          isOpen={addNewDialogOpen}
          setOpenDialog={handleCloseAddDialog}
          reCallAPI={reCallAPI}
        />
      ) : null}

      {editDialogOpen ? (
        <AddMessage
          isOpen={editDialogOpen}
          setOpenDialog={handleCloseEditDialog}
          reCallAPI={reCallAPI}
          isEdit={true}
          rowData={selectedMessage}
        />
      ) : null}

      {/* {editDialogOpen ? (
        <EditBanner
          rowData={selectedBanner}
          isOpen={editDialogOpen}
          setOpenDialog={handleCloseEditDialog}
          reCallAPI={reCallAPI}
        />
      ) : null} */}

      {/* <DeleteArea
        rowData={selectedArea}
        isOpen={deleteDialogOpen}
        setOpenDialog={handleCloseDeleteDialog}
        reCallAPI={reCallAPI}
      /> */}
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={formatMessage({id: 'admin.message.delete.title'})}
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
            {formatMessage({id: 'admin.message.delete.message'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
    </Box>
  );
};

export default BannerV2;