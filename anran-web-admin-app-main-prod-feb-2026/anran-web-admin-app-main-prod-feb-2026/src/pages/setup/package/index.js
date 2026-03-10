import React, {useState, useEffect, useRef,useMemo} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Image} from 'primereact/image';
import {useIntl} from 'react-intl';

import {
  useGetDataApi,
  postDataApi,
  deleteDataApi,
} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import AppInfoView from '@anran/core/AppInfoView';
import {Fonts} from 'shared/constants/AppEnums';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

import CreatePackage from './CreatePackage';
import EditPackage from './EditPackage';

import dayjs from 'dayjs';


const Package = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [filters, setFilters] = React.useState({
    packageCategory: '',
    packageName: '',
    packageCode: '',
    packagePrice: '',
    packagePublishStatus: '',
  });

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/package/findAll',
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

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch', {}, {}, true);
  // const [{apiData: branchDatabase}] = useGetDataApi(
  //   'api/branch/role-based',
  //   {},
  //   {},
  //   true,
  // );

  // Datatable Body Templates
  const packageNameBodyTemplate = (rowData) => {
    if (rowData.packageUnlimitedStatus) {
      return formatMessage(
        {id: 'admin.package.table.nameWithUnlimited'},
        {name: rowData.packageName},
      );
    }
    return formatMessage(
      {id: 'admin.package.table.nameWithTimes'},
      {name: rowData.packageName, count: rowData.packageUsageLimit},
    );
  };

  const displayPeriodBodyTemplate = (rowData) => {
     return rowData.isAlways
      ? formatMessage({id: 'admin.package.display.scheduled'})
      : formatMessage({id: 'admin.package.display.always'});
  };

  const packageUsageLimitBodyTemplate = (rowData) => {
    return rowData.packageUnlimitedStatus
      ? formatMessage({id: 'admin.package.usage.unlimited'})
      : rowData.packageUsageLimit;
  };

  const statusBodyTemplate = (rowData) => {
     return rowData.packagePublishStatus
      ? formatMessage({id: 'admin.package.status.active'})
      : formatMessage({id: 'admin.package.status.inactive'});
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        {user.permission.includes(RoutePermittedRole2.admin_package_update) && (
          <Grid item xs={6} md={6}>
            <IconButton
              color='success'
              onClick={() => handleOpenEditDialog(rowData)}
            >
              <EditIcon />
            </IconButton>
          </Grid>
        )}
        {user.permission.includes(RoutePermittedRole2.admin_package_delete) && (
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

  const imageBodyTemplate = (rowData) => {
    return (
      <Image
        src={rowData.packageImageURL}
        alt={rowData.packageImageData}
        width='100'
        preview
      />
    );
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-MY', {style: 'currency', currency: 'MYR'});
  };

  const packagePriceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.packagePrice);
    // return `RM ${rowData.packagePrice}`;
  };

  const applyFilters = async () => {
    const {
      packageCategory,
      packageName,
      packageCode,
      packagePrice,
      packagePublishStatus,
    } = filters;
    if (
      packageCategory ||
      packageName ||
      packageCode ||
      packagePrice ||
      packagePublishStatus
    ) {
      const formData = new FormData();
      if (packageCategory) formData.append('packageCategory', packageCategory);
      if (packageName) formData.append('packageName', packageName);
      if (packageCode) formData.append('packageCode', packageCode);
      if (packagePrice) formData.append('packagePrice', packagePrice);
      if (packagePublishStatus)
        formData.append('packagePublishStatus', packagePublishStatus);
      try {
        const response = await postDataApi(
          '/api/package/findAll',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log('Filtered branches:', response);
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
      packageCategory: '',
      packageName: '',
      packageCode: '',
      packagePrice: '',
      packagePublishStatus: '',
    });
    fetchData();
  };

  // Datatable Columns Set Up
  const columns = useMemo(
  () => [
    {
      field: 'packageCategory',
      header: formatMessage({id: 'admin.package.table.category'}),
      displayOrder: 1,
      sortable: true,
      style: {maxWidth: '10rem'},
    },
    {
      field: 'packageName',
      header: formatMessage({id: 'admin.package.table.name'}),
      displayOrder: 2,
      sortable: true,
      body: packageNameBodyTemplate,
    },
    {
      field: 'packageCode',
      header: formatMessage({id: 'admin.package.table.code'}),
      displayOrder: 3,
      sortable: true,
      style: {maxWidth: '10rem'},
    },
    {
      field: 'packagePrice',
      header: formatMessage({id: 'admin.package.table.price'}),
      displayOrder: 4,
      sortable: true,
      style: {maxWidth: '10rem'},
      body: packagePriceBodyTemplate,
    },
    {
      field: 'packageUsageLimit',
      header: formatMessage({id: 'admin.package.table.usageLimit'}),
      displayOrder: 5,
      body: packageUsageLimitBodyTemplate,
    },
    {
      field: 'packageValidity',
      header: formatMessage({id: 'admin.package.table.validity'}),
      displayOrder: 6,
    },
    {
      field: 'packageImageURL',
      header: formatMessage({id: 'admin.package.table.image'}),
      displayOrder: 7,
      body: imageBodyTemplate,
    },
    {
      field: 'isAlways',
      header: formatMessage({id: 'admin.package.table.display'}),
      displayOrder: 8,
      body: displayPeriodBodyTemplate,
    },
    {
      field: 'packagePublishStatus',
      header: formatMessage({id: 'admin.package.table.status'}),
      displayOrder: 9,
      body: statusBodyTemplate,
      style: {maxWidth: '10rem'},
    },
  ],
  // language changes will change formatMessage identity → recompute headers
  [formatMessage],
);

  useEffect(() => {
  setVisibleColumns(columns);
}, [columns]);

  const onRowReorder = (e) => {
    let packageId = [];
    for (var i = 0; i < e.value.length; i++) {
      packageId.push(e.value[i]._id);
    }
    postDataApi(
      'api/package/reorder/',
      infoViewActionsContext,
      {packages: packageId},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        fetchData();
        toast.current.show({
          severity: 'success',
          summary: formatMessage({id: 'admin.package.displayOrderChanged'}),
          life: 3000,
        });
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  // Dialog Actions
  const [openAddNewPackage, setOpenAddNewPackage] = useState(false);
  const handleOpenAddNewPackage = () => {
    setOpenAddNewPackage(true);
  };

  const handleCloseAddNewPackage = () => {
    setOpenAddNewPackage(false);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const handleOpenEditDialog = (rowData) => {
    setEditingPackageId(rowData._id);
    setInitialValues({
      packageName: rowData.packageName,
      packageCode: rowData.packageCode,
      packagePrice: rowData.packagePrice,
      packageCategory: rowData.packageCategory,
      packageOrder: rowData.packageOrder,
      packageValidity: rowData.packageValidity,
      packageFixedValidityDate1: rowData.packageFixedValidityDate1
        ? dayjs(rowData.packageFixedValidityDate1)
        : null,
      packageFixedValidityDate2: rowData.packageFixedValidityDate2
        ? dayjs(rowData.packageFixedValidityDate2)
        : null,
      isAlways: rowData.isAlways,
      startDate: rowData.startDate ? dayjs(rowData.startDate) : null,
      endDate: rowData.endDate ? dayjs(rowData.endDate) : null,
      branchGroup: rowData.branchGroup,
      noOfTime: rowData.packageUsageLimit,
      isUnlimited: rowData.packageUnlimitedStatus,
      isTransferable: rowData.packageTransferableStatus,
      imageUrl: rowData.packageImageURL,
      imageData: rowData.packageImageData,
      isAllBranch: rowData.allBranchStatus,
      branch: rowData.branchName,
      publishSwitch: rowData.packagePublishStatus,
      availabilityMode: rowData.packageAvailabilityMode,
      maxQtyType: rowData.maxQtyType,
      maxQty: rowData.maxQty,
      isWalkInSaleOnly: rowData.isWalkInSaleOnly,
      isInstant: rowData.isInstant,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingPackageId(null);
    setInitialValues({});
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const handleOpenDeleteDialog = (rowData) => {
    setDeletingPackage(rowData);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingPackage(null);
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
      <Box display='flex' alignItems='center' gap={2}>
        <Typography variant='h1'>
          {formatMessage({id: 'admin.package.table.title'})}
        </Typography>
        <Tooltip
          title={formatMessage({id: 'admin.package.tooltip.columnSelection'})}
          arrow
        >
          <IconButton onClick={() => setShowPopupColumn(true)} color='primary'>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        </Tooltip>
         <Tooltip
          title={formatMessage({id: 'admin.package.tooltip.refresh'})}
          arrow
        >
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
            ? formatMessage({id: 'admin.package.filter.hide'})
            : formatMessage({id: 'admin.package.filter.show'})}
        </Button>
        {user.permission.includes(RoutePermittedRole2.admin_package_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<Add />}
            onClick={handleOpenAddNewPackage}
          >
             {formatMessage({id: 'admin.package.addNew'})}
          </Button>
        )}
      </Box>
    </Box>
  );

  const onDeleteConfirm = () => {
    deleteDataApi(
      `/api/package/deletev2/${deletingPackage._id}`,
      infoViewActionsContext,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        fetchData();
        infoViewActionsContext.showMessage(
          formatMessage({id: 'admin.package.deleteSuccess'}),
        );
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
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
              {formatMessage({id: 'admin.package.filter.title'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
              {/* Filter by Package Category */}
              <Grid size={{md: 2.4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'admin.package.filter.category'})}
                  </InputLabel>
                  <Select
                   label={formatMessage({id: 'admin.package.filter.category'})}
                    value={filters.packageCategory || ''}
                    onChange={(e) =>
                      handleFilterChange('packageCategory', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'admin.package.filter.none'})}</em>
                    </MenuItem>
                    <MenuItem value='Standard'>
                      {formatMessage({
                        id: 'admin.package.category.standard',
                      })}
                    </MenuItem>
                    <MenuItem value='Promo'>
                      {formatMessage({id: 'admin.package.category.promo'})}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Package Name */}
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'admin.package.filter.name'})}
                  variant='outlined'
                  fullWidth
                  value={filters.packageName}
                  onChange={(e) =>
                    handleFilterChange('packageName', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Package Code */}
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'admin.package.filter.code'})}
                  variant='outlined'
                  fullWidth
                  value={filters.packageCode}
                  onChange={(e) =>
                    handleFilterChange('packageCode', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Package Price */}
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'admin.package.filter.price'})}
                  variant='outlined'
                  fullWidth
                  type='number'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>RM</InputAdornment>
                    ),
                    sx: {
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                        {
                          display: 'none',
                        },
                      '& input[type=number]': {
                        MozAppearance: 'textfield',
                      },
                    },
                  }}
                  onFocus={(e) =>
                    e.target.addEventListener(
                      'wheel',
                      function (e) {
                        e.preventDefault();
                      },
                      {passive: false},
                    )
                  }
                  value={filters.packagePrice}
                  onChange={(e) =>
                    handleFilterChange('packagePrice', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Publish Status */}
              <Grid size={{md: 2.4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'admin.package.filter.status'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'admin.package.filter.status'})}
                    value={filters.packagePublishStatus || ''}
                    onChange={(e) =>
                      handleFilterChange('packagePublishStatus', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'admin.package.filter.none'})}</em>
                    </MenuItem>
                    <MenuItem value='active'>
                      {formatMessage({id: 'admin.package.status.active'})}
                    </MenuItem>
                    <MenuItem value='inactive'>
                      {formatMessage({id: 'admin.package.status.inactive'})}
                    </MenuItem>
                  </Select>
                </FormControl>
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
                 <Tooltip
                  title={formatMessage({id: 'admin.package.tooltip.reset'})}
                  arrow
                >
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
                  {formatMessage({id: 'admin.package.filter.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast}></Toast>
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              header={header}
              value={filteredData?.length > 0 ? filteredData : []}
              // paginator
              // rows={10}
              size='small'
              dataKey='_id'
               emptyMessage={formatMessage({id: 'admin.package.table.empty'})}
              reorderableRows
              onRowReorder={onRowReorder}
              showGridlines
              stripedRows
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column
                field='packageOrder'
                header={formatMessage({id: 'admin.package.table.displayOrder'})}
                style={{minWidth: '2rem'}}
              />
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
              {(user.permission.includes(
                RoutePermittedRole2.admin_package_update,
              ) ||
                user.permission.includes(
                  RoutePermittedRole2.admin_package_delete,
                )) && (
                <Column
                  body={actionBodyTemplate}
                  header={formatMessage({id: 'admin.package.table.action'})}
                  exportable={false}
                  style={{maxWidth: '8rem'}}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <CreatePackage
        open={openAddNewPackage}
        onClose={handleCloseAddNewPackage}
        reCallAPI={fetchData}
        branchDatabase={branchDatabase}
      />
      <EditPackage
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        reCallAPI={fetchData}
        branchDatabase={branchDatabase}
        editingPackageId={editingPackageId}
        initialValues={initialValues}
      />
      <PopupColumnDialog
        isOpen={showPopupColumn}
        setOpenDialog={() => setShowPopupColumn(false)}
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
      />
      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={formatMessage({id: 'admin.package.deleteTitle'})}
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
            {formatMessage({id: 'admin.package.deleteMessage'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />
      <AppInfoView />
    </Box>
  );
};

export default Package;
