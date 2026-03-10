import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  IconButton,
  MenuItem,
  Tooltip,
  Select,
  FormControl,
  TextField,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AddBusinessOutlined from '@mui/icons-material/AddBusinessOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';
import {Toast} from 'primereact/toast';

import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import AppInfoView from '@anran/core/AppInfoView';
import {Fonts} from 'shared/constants/AppEnums';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import {useIntl} from 'react-intl';
import IntlMessages from '@anran/utility/IntlMessages';

import AddBranch from './AddBranch';
import BranchDetail from './branch_detail';

import clsx from 'clsx';

const Branch = () => {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [hqStatusError, setHqStatusError] = useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  const [filters, setFilters] = React.useState({
    area: '',
    branchName: '',
    branchStatus: '',
    hqStatus: '',
  });

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/branch/findAll',
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

  const [{apiData: areaData}] = useGetDataApi('api/area', {}, {}, true);

  // Retrieve Data
  useEffect(() => {
    if (areaData?.length > 0) {
      let opt = [];
      areaData?.map((area) => {
        opt.push({areaName: area.areaName, _id: area._id});
      });
      setAreaOptions(opt);
    }
  }, [areaData]);

  useEffect(() => {
    if (filteredData) {
      const isHqExists = Object.values(filteredData).some(
        (branch) => branch.hqStatus === true,
      );
      if (isHqExists) {
        setHqStatusError(true);
      } else {
        setHqStatusError(false); // Reset error when no HQ exists
      }
    }
  }, [filteredData]);

  // Datatable Templates
  const statusBodyTemplate = (rowData) => {
    return rowData.branchStatus
      ? formatMessage({id: 'admin.branch.status.active'})
      : formatMessage({id: 'admin.branch.status.inactive'});
  };

  const nameBodyTemplate = (rowData) => {
    if (rowData.hqStatus) {
      return (
        <div>
          <span style={{paddingRight: '12px'}}>{rowData.branchName}</span>
          <Tag
            value={formatMessage({id: 'admin.branch.tag.hq'})}
            severity={'success'}
          />
        </div>
      );
    } else {
      if (rowData.isFranchise) {
        return (
          <div className='flex align-items-center gap-2'>
            <span style={{paddingRight: '12px'}}>{rowData.branchName}</span>
            <Tag
              value={formatMessage({id: 'admin.branch.tag.franchise'})}
              severity={'info'}
            />{' '}
          </div>
        );
      } else {
        return <span>{rowData.branchName}</span>;
      }
    }
  };

  const areaBodyTemplate = (rowData) => {
    console.log(rowData);
    const area = rowData?.area;

    return (
      <div className='flex align-items-center gap-2'>
        <span>{area?.areaName ?? '-'}</span>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{xs: 6, md: 6}}>
          <IconButton
            color='success'
            onClick={() => setSelectedBranch(rowData)}
          >
            <ViewIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  const applyFilters = async () => {
    const {area, branchName, branchStatus, hqStatus} = filters;
    if (area || branchName || branchStatus || hqStatus) {
      const formData = new FormData();
      if (area) formData.append('area', area);
      if (branchName) formData.append('branchName', branchName);
      if (branchStatus) formData.append('branchStatus', branchStatus);
      if (hqStatus) formData.append('hqStatus', hqStatus);
      try {
        const response = await postDataApi(
          '/api/branch/findAll',
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
      area: '',
      branchName: '',
      branchStatus: '',
      hqStatus: '',
    });
    fetchData();
  };

  const columns = useMemo(
  () => [
    {
      field: 'area',
      header: formatMessage({id: 'admin.branch.table.area'}),
      body: areaBodyTemplate,
      displayOrder: 1,
    },
    {
      field: 'branchName',
      header: formatMessage({id: 'anran.branchName'}),
      body: nameBodyTemplate,
      style: {minWidth: '12rem'},
      displayOrder: 2,
    },
    {
      field: 'branchContactNumber',
      header: formatMessage({id: 'admin.branch.table.contact'}),
      style: {minWidth: '12rem'},
      displayOrder: 3,
    },
    {
      field: 'branchStatus',
      header: formatMessage({id: 'admin.branch.table.status'}),
      style: {minWidth: '12rem'},
      body: statusBodyTemplate,
      displayOrder: 4,
    },
  ],
  [formatMessage],
);

  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
  setVisibleColumns(columns);
}, [columns]);

  // Dialog Actions
  const [addNewBranchDialogOpen, setAddNewBranchDialogOpen] = useState(false);

  const handleOpenAddNewBranchDialog = () => {
    setAddNewBranchDialogOpen(true);
  };

  const handleCloseAddNewBranchDialog = () => {
    setAddNewBranchDialogOpen(false);
  };

  const onRowReorder = (e) => {
    console.log('reorder:', e.value);
    let aa = [];
    for (var i = 0; i < e.value.length; i++) {
      aa.push(e.value[i]._id);
    }
    console.log('reorder-result:', aa);
    postDataApi(
      'api/branch/reorder/',
      infoViewActionsContext,
      {branches: aa},
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        fetchData();
        // setData(e.value);
        toast.current.show({
          severity: 'success',
          summary: formatMessage({id: 'admin.branch.displayOrderChanged'}),
          life: 3000,
        });
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    // setProducts(e.value);
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
          <IntlMessages id='admin.branch.listing' />
        </Typography>
        <Tooltip title={formatMessage({id: 'admin.branch.tooltip.columnSelection'})} arrow>
          <IconButton onClick={() => setShowPopupColumn(true)} color='primary'>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage({id: 'admin.branch.tooltip.refresh'})} arrow>
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
          {showFilters ? (
            <IntlMessages id='admin.branch.filter.hide' />
          ) : (
            <IntlMessages id='admin.branch.filter.show' />
          )}  
        </Button>
        {user.permission.includes(RoutePermittedRole2.admin_branch_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<AddBusinessOutlined />}
            onClick={handleOpenAddNewBranchDialog}
          >
           <IntlMessages id='admin.branch.addNew' />
          </Button>
        )}
      </Box>
    </Box>
  );

  console.log('selectedBranch', selectedBranch, areaOptions);

  return selectedBranch ? (
    <Card sx={{mt: 2, p: 5}}>
      <Box
        sx={{
          transition: 'all 0.5s ease',
          transform: 'translateX(100%)',
          opacity: 0,
          visibility: 'hidden',
          '&.show': {
            transform: 'translateX(0)',
            opacity: 1,
            visibility: 'visible',
          },
        }}
        className={clsx({
          show: 1,
        })}
      >
        <Box
          component='h2'
          variant='h2'
          sx={{
            fontSize: 16,
            // color: 'white',
            fontWeight: Fonts.SEMI_BOLD,
            mb: {
              xs: 2,
              lg: 1,
            },
          }}
        >
          {formatMessage({id: 'admin.branch.detail.title'})} :{' '}
          {selectedBranch?.branchName.toUpperCase()}
          {selectedBranch?.hqStatus && (
            <Tag
              style={{marginLeft: 10}}
              value={formatMessage({id: 'admin.branch.tag.hq'})}
              severity={'success'}
            />
          )}
          {selectedBranch?.isFranchise && (
            <Tag
              style={{marginLeft: 10}}
              value={formatMessage({id: 'admin.branch.tag.franchise'})}
              severity={'info'}
            />
          )}
        </Box>
        <BranchDetail
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          hqStatusError={hqStatusError}
          refresh={fetchData}
        />
      </Box>{' '}
    </Card>
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              <IntlMessages id='admin.branch.filter.title' />
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
              {/* Filter by Area */}
              <Grid size={{md: 3, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    <IntlMessages id='admin.branch.filter.byArea' />
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'admin.branch.filter.byArea'})}
                    value={filters.area || ''}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                  >
                    <MenuItem value=''>
                      <em>
                        <IntlMessages id='admin.branch.filter.none' />
                      </em>
                    </MenuItem>
                    {areaData.map((area) => (
                      <MenuItem key={area._id} value={area._id}>
                        {area.areaName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Branch Name */}
              <Grid size={{md: 3, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'admin.branch.filter.byBranchName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.branchName}
                  onChange={(e) =>
                    handleFilterChange('branchName', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Branch Type */}
              <Grid size={{xs: 12, md: 3}}>
                <FormControl fullWidth>
                  <InputLabel>
                    <IntlMessages id='admin.branch.filter.byBranchType' />
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'admin.branch.filter.byBranchType'})}
                    value={filters.hqStatus || ''}
                    onChange={(e) =>
                      handleFilterChange('hqStatus', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>
                        <IntlMessages id='admin.branch.filter.none' />
                      </em>
                    </MenuItem>
                    <MenuItem value='hq'>
                      <IntlMessages id='admin.branch.filter.type.hq' />
                    </MenuItem>
                    <MenuItem value='franchise'>
                      <IntlMessages id='admin.branch.filter.type.franchise' />
                    </MenuItem>

                  </Select>
                </FormControl>
              </Grid>
              {/* Filter by Branch Status */}
              <Grid size={{xs: 12, md: 3}}>
                <FormControl fullWidth>
                  <InputLabel>
                    <IntlMessages id='admin.branch.filter.byBranchStatus' />
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'admin.branch.filter.byBranchStatus'})}
                    value={filters.branchStatus || ''}
                    onChange={(e) =>
                      handleFilterChange('branchStatus', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>
                        <IntlMessages id='admin.branch.filter.none' />
                      </em>
                    </MenuItem>
                    <MenuItem value='active'>
                      <IntlMessages id='admin.branch.filter.status.active' />
                    </MenuItem>
                    <MenuItem value='inactive'>
                      <IntlMessages id='admin.branch.filter.status.inactive' />
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
                <Tooltip title={formatMessage({id: 'admin.branch.tooltip.reset'})} arrow>
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
                  <IntlMessages id='admin.branch.filter.apply' />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast}></Toast>
        <Grid container spacing={2}>
          {/* Header */}

          {/* Table */}
          <Grid size={{xs: 12, md: 12}}>
            <DataTable
              header={header}
              value={filteredData?.length > 0 ? filteredData : []}
              // paginator
              // rows={10}
              size='small'
              dataKey='_id'
             emptyMessage={formatMessage({id: 'admin.branch.table.empty'})}
              selectionMode='single'
              onSelectionChange={(e) => setSelectedBranch(e.value)}
              // selection={selectedProduct}
              reorderableRows
              onRowReorder={onRowReorder}
              showGridlines
              stripedRows
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column
                field='branchOrder'
                header={formatMessage({id: 'admin.branch.displayOrder'})}
                // filter
                // filterPlaceholder='Filter by Order'
                style={{minWidth: '3rem'}}
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
              {/* <Column
                header='Area'
                filterField='area'
                showFilterMenu={false}
                filterMenuStyle={{width: '14rem'}}
                style={{minWidth: '12rem'}}
                body={areaBodyTemplate}
                filter
                filterElement={areaFilterTemplate}
              />
              <Column
                field='branchName'
                header='Branch Name'
                body={nameBodyTemplate}
                filter
                filterPlaceholder='Filter by Branch'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='staffName'
                header='Contact'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='imageUrl'
                header='QR Code'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='branchStatus'
                header='Status'
                showFilterMenu={false}
                body={statusBodyTemplate}
                filter
                filterElement={statusFilterTemplate}
                style={{maxWidth: '12rem'}}
              /> */}
              <Column
                body={actionBodyTemplate}
                header={formatMessage({id: 'admin.branch.table.action'})}
                exportable={false}
                style={{maxWidth: '8rem'}}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      {/* Dialog Add New Branch */}
      <AddBranch
        isOpen={addNewBranchDialogOpen}
        setOpenDialog={handleCloseAddNewBranchDialog}
        reCallAPI={fetchData}
        hqStatusError={hqStatusError}
      />
      <PopupColumnDialog
        isOpen={showPopupColumn}
        setOpenDialog={() => setShowPopupColumn(false)}
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
      />
      <AppInfoView />
    </Box>
  );
};

export default Branch;
