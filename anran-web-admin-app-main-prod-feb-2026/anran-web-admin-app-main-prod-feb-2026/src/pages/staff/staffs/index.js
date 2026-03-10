import clsx from 'clsx';
import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  IconButton,
  Avatar,
  MenuItem,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';

import {Fonts} from 'shared/constants/AppEnums';
import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import AppInfoView from '@anran/core/AppInfoView';
import CreateStaff from './CreateStaff';
import EditStaff from './EditStaff';
import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import ViewIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const Staffs = () => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const toast = useRef(null);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    staffCode: '',
    branch: '',
  });
  const [formData, setFormData] = useState(null);

  // const [{apiData: staffDatabase, loading}, {reCallAPI}] = useGetDataApi(
  //   'api/staff',
  //   {},
  //   {},
  //   true,
  // );

  // const filteredStaffDatabase = Array.isArray(staffDatabase)
  //   ? staffDatabase.filter((staff) => !staff.isDeleted)
  //   : [];

  // console.log('filteredStaffDatabase', filteredStaffDatabase);

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch/web', {}, {}, true);
  const [{apiData: roleDatabase}] = useGetDataApi('api/roles', {}, {}, true);

  // Retrieve Data
  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      setBranchOptions(opt);
    }
  }, [branchDatabase]);

  useEffect(() => {
    if (roleDatabase?.length > 0) {
      let opt = [];
      roleDatabase?.map((role) => {
        opt.push({role: role.role_name, _id: role._id});
      });
      setRoleOptions(opt);
    }
  }, [roleDatabase]);

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/staff/findallv2',
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

  useEffect(() => {
    fetchData();
  }, []);

  console.log(filteredData);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const applyFilters = async () => {
    const {name, staffCode, branch} = filters;
    if (name || staffCode || branch) {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (staffCode) formData.append('staffCode', staffCode);
      if (branch) formData.append('branch', branch);
      try {
        const response = await postDataApi(
          '/api/staff/findallv2',
          infoViewActionsContext, // Assuming you have this context
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log('Filtered members:', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message); // Handle error using context
      }
    } else {
      console.log('No filters applied');
      setFilteredData(null);
    }
  };

  // Handle changes in filter inputs
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      staffCode: '',
      branch: '',
    });
    fetchData();
  };

  // Body Templates
  const rolesBodyTemplate = (rowData) => {
    console.log(rowData);
    const roles = rowData.roles;

    return (
      <div className='flex align-items-center gap-2'>
        <span>{roles.role_name}</span>
      </div>
    );
  };

  const branchBodyTemplate = (rowData) => {
    return (
      <div className='flex align-items-center gap-2'>
        <span>
          {rowData.branch.map((branch) => branch.branchName).join(', ')}
        </span>
      </div>
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Avatar
          alt={rowData.profileImageData}
          src={rowData.profileImageUrl}
          sx={{width: 40, height: 40}}
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return rowData.statusActive
      ? formatMessage({id: 'staff.status.active'})
      : formatMessage({id: 'staff.status.inactive'});
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6}>
          <IconButton color='success' onClick={() => setSelectedStaff(rowData)}>
            <ViewIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  const columns = useMemo(
    () => [
      {
        field: 'name',
        header: formatMessage({id: 'staff.column.name'}),
        displayOrder: 1,
        style: {width: '15rem'},
        sortable: true,
      },
      {
        field: 'gender',
        header: formatMessage({id: 'staff.column.gender'}),
        style: {width: '14rem'},
        displayOrder: 2,
      },
      {
        field: 'roles',
        header: formatMessage({id: 'staff.column.role'}),
        displayOrder: 1,
        style: {width: '15rem'},
        body: rolesBodyTemplate,
        sortable: true,
      },
      {
        field: 'branch',
        header: formatMessage({id: 'common.branch'}),
        style: {width: '15rem'},
        body: branchBodyTemplate,
        displayOrder: 1,
      },
      {
        field: 'mobileNumber',
        header: formatMessage({id: 'staff.column.mobile'}),
        displayOrder: 1,
        style: {minWidth: '14rem'},
        sortable: true,
      },
      {
        field: 'statusActive',
        header: formatMessage({id: 'common.status'}),
        style: {width: '14rem'},
        displayOrder: 5,
        body: statusBodyTemplate,
      },
    ],
    [formatMessage],
  );
  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  // Dialog Actions
  const [addNewStaffDialogOpen, setAddNewStaffDialogOpen] = useState(false);
  const handleOpenAddNewStaffDialog = () => {
    setAddNewStaffDialogOpen(true);
  };

  const handleCloseAddNewStaffDialog = () => {
    setFormData(null);
    setAddNewStaffDialogOpen(false);
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
          {formatMessage({id: 'staff.table.title'})}
        </Typography>
        <Button
          size='large'
          startIcon={<ExpandMoreOutlinedIcon />}
          onClick={() => setShowPopupColumn(true)}
        />
        <Button
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => fetchData()}
        />
      </Box>
      <Box display='flex' alignItems='center' gap={2}>
        <Button
          size='large'
          variant='outlined'
          onClick={toggleFilters}
          startIcon={showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
        >
          {showFilters
            ? formatMessage({id: 'staff.filters.hide'})
            : formatMessage({id: 'staff.filters.show'})}
        </Button>
        {user.permission.includes(RoutePermittedRole2.admin_staff_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddNewStaffDialog}
          >
            {formatMessage({id: 'staff.action.addNew'})}
          </Button>
        )}
      </Box>
    </Box>
  );

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

  return selectedStaff ? (
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
            fontWeight: Fonts.SEMI_BOLD,
            mb: {
              xs: 2,
              lg: 1,
            },
          }}
        >
          {formatMessage(
            {id: 'staff.details.title'},
            {name: selectedStaff?.name?.toUpperCase()},
          )}
        </Box>
        <EditStaff
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          branchOptions={branchOptions}
          roleOptions={roleOptions}
          refresh={fetchData}
        />
      </Box>
    </Card>
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'staff.filters.title'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
              {/* Filter by Name */}
              <Grid size={{md: 4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'staff.filters.byName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </Grid>
              {/* Filter by Staff Code */}
              <Grid size={{md: 4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'staff.filters.byStaffCode'})}
                  variant='outlined'
                  fullWidth
                  value={filters.staffCode}
                  onChange={(e) =>
                    handleFilterChange('staffCode', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Branch */}
              <Grid size={{md: 4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'staff.filters.byBranch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'staff.filters.byBranch'})}
                    value={filters.branch || ''}
                    onChange={(e) =>
                      handleFilterChange('branch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'common.none'})}</em>
                    </MenuItem>
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.branch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems='center'
              justifyContent='flex-end'
              size={{md: 12, xs: 12}}
            >
              <Grid size={{xs: 'auto'}} sx={{textAlign: 'center'}}>
                <Tooltip
                  title={formatMessage({id: 'staff.filters.reset'})}
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
                  {formatMessage({id: 'staff.filters.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Toast ref={toast}></Toast>
        <Grid container spacing={2}>
          {/* Table */}
          <Grid size={{xs: 12, md: 12}}>
            <DataTable
              header={header}
              value={filteredData?.length > 0 ? filteredData : []}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              // loading={loading}
              emptyMessage={formatMessage({id: 'staff.table.empty'})}
              selectionMode='single'
              onSelectionChange={(e) => setSelectedStaff(e.value)}
              showGridlines
              stripedRows
            >
              <Column
                field='profileImageUrl'
                header={formatMessage({id: 'common.profile'})}
                style={{minWidth: '3rem'}}
                body={imageBodyTemplate}
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
              <Column
                body={actionBodyTemplate}
                header={formatMessage({id: 'staff.column.action'})}
                exportable={false}
                style={{maxWidth: '8rem'}}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      {/* Dialog Add New Branch */}
      <CreateStaff
        // filteredStaffDatabase={filteredStaffDatabase}
        formData={formData}
        setFormData={setFormData}
        open={addNewStaffDialogOpen}
        onClose={handleCloseAddNewStaffDialog}
        reCallAPI={fetchData}
        branchOptions={branchOptions}
        roleOptions={roleOptions}
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

export default Staffs;  