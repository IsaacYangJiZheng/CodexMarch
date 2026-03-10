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
import AddBanner from './AddBanner';
import EditBanner from './EditBanner';
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
    'api/banner/web',
    undefined,
    {},
    true,
  );

  // Dialog Actions
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
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
    setSelectedBanner(rowData);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedBanner(null);
  };

  const handleOpenDeleteDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedBanner(rowData);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBanner(null);
  };

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/banner/deletev2/${selectedBanner._id}`,
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
          formatMessage({id: 'admin.banner.delete.success'}),
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
        {user.permission.includes(RoutePermittedRole2.admin_banner_update) && (
          <Grid size={{xs: 6, md: 6}}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_banner_delete) && (
          <Grid size={{xs: 6, md: 6}}>
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
      ? formatMessage({id: 'admin.banner.status.published'})
      : formatMessage({id: 'admin.banner.status.notPublished'});
  };

  const statusFilterTemplate = () => {
    return (
      <Dropdown
        value={filters.publish.value}
        options={[
          {
            label: formatMessage({id: 'admin.banner.status.published'}),
            value: true,
          },
          {
            label: formatMessage({id: 'admin.banner.status.notPublished'}),
            value: false,
          },
        ]}
        onChange={(e) => {
          setFilters((prevFilters) => ({
            ...prevFilters,
            publish: {value: e.value, matchMode: 'equals'},
          }));
        }}
       placeholder={formatMessage({id: 'admin.banner.filter.status'})}
      />
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <Image
        src={rowData.image_url}
        alt={rowData.image_data_url}
        width='100'
        preview
      />
      //   <img
      //     src={rowData.image_url}
      //     alt={rowData.image_data_url}
      //     style={{width: '100px'}}
      //   />
    );
  };

  const effectiveDateBodyTemplate = (rowData) => {
    return rowData.always
      ? formatMessage({id: 'admin.banner.always'})
      : dayjs(rowData.startdate).format('MMMM D, YYYY h:mm A');
  };

  const enddateBodyTemplate = (rowData) => {
    return rowData.always
      ? formatMessage({id: 'admin.banner.always'})
      : dayjs(rowData.enddate).format('MMMM D, YYYY');
  };

  const onRowReorder = (e) => {
    console.log('reorder:', e.value);
    let aa = [];
    for (var i = 0; i < e.value.length; i++) {
      aa.push(e.value[i]._id);
    }
    console.log('reorder-result:', aa);
    postDataApi(
      'api/banner/reorder/',
      infoViewActionsContext,
      {banners: aa},
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
          summary: formatMessage({id: 'admin.banner.displayOrderChanged'}),
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
          {formatMessage({id: 'admin.banner.title.listing'})}
        </Typography>
        <Button
          // variant='outlined'
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => reCallAPI()}
        ></Button>
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_banner_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleOpenAddDialog}
        >
          {formatMessage({id: 'admin.banner.addNew'})}
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
          <Grid size={{xs: 12, md: 12}}>
            <DataTable
              header={header}
              value={bannerData}
              // paginator
              // rows={10}
              dataKey='id'
              loading={loading}
              emptyMessage={formatMessage({id: 'admin.banner.empty'})}
              reorderableRows
              onRowReorder={onRowReorder}
              showGridlines
              size={'small'}
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column
                field='sortorder'
                header='Display Order'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='image_data_url'
                header={formatMessage({id: 'admin.banner.table.name'})}
                filter
                filterPlaceholder='Filter by Name'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='startdate'
                header={formatMessage({id: 'admin.banner.table.effectiveDate'})}
                body={effectiveDateBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='enddate'
                header={formatMessage({id: 'admin.banner.table.endDate'})}
                body={enddateBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='image_url'
                header={formatMessage({id: 'admin.banner.table.view'})}
                body={imageBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='publish'
                header={formatMessage({id: 'admin.banner.table.status'})}
                body={statusBodyTemplate}
                filter
                filterElement={statusFilterTemplate}
                style={{minWidth: '12rem'}}
              />
              {(user.permission.includes(RoutePermittedRole2.admin_banner_update) || 
                user.permission.includes(RoutePermittedRole2.admin_banner_delete)) && (
                <Column
                  header='action'
                  body={actionBodyTemplate}
                  exportable={false}
                  style={{minWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AddBanner
        isOpen={addNewDialogOpen}
        setOpenDialog={handleCloseAddDialog}
        reCallAPI={reCallAPI}
      />
      {editDialogOpen ? (
        <EditBanner
          rowData={selectedBanner}
          isOpen={editDialogOpen}
          setOpenDialog={handleCloseEditDialog}
          reCallAPI={reCallAPI}
        />
      ) : null}

      {/* <DeleteArea
        rowData={selectedArea}
        isOpen={deleteDialogOpen}
        setOpenDialog={handleCloseDeleteDialog}
        reCallAPI={reCallAPI}
      /> */}
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={formatMessage({id: 'admin.banner.delete.title'})}
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
            {formatMessage({id: 'admin.banner.delete.message'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
    </Box>
  );
};

export default BannerV2;
