import React, {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Tag} from 'primereact/tag';

import MemberDetail from './MemberDetail';
import AddNewMember from './AddNewMember';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import clsx from 'clsx';
import {Fonts} from 'shared/constants/AppEnums';
import dayjs from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {Replay as ReplayIcon} from '@mui/icons-material';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

import AppGridContainer from '@anran/core/AppGridContainer';
import {Form} from 'formik';
import AppDialog from '@anran/core/AppDialog';
import AppTextField from '@anran/core/AppFormComponents/AppTextField';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import {MuiTelInput} from 'mui-tel-input';
import IntlMessages from '@anran/utility/IntlMessages';
import * as yup from 'yup';
import AppInfoView from '@anran/core/AppInfoView';
import {useIntl} from 'react-intl';

const phoneRegExp = /^(\+?60?1)[0-46-9]-*[0-9]{7,8}$/;

const MembersInfo = () => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [page, setPage] = useState({ first: 0, rows: 10 });
  const [selection, setSelection] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [fastRegistrationOpen, setFastRegistrationOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '', // <-- merged search (name OR phone)
    preferredBranch: '',
    startDate: '',
    endDate: '',
  });

  const validationSchema = useMemo(
    () =>
      yup.object({
        memberFullName: yup
          .string()
          .required(formatMessage({id: 'common.required'})),
        mobileNumber: yup
          .string()
          .matches(
            phoneRegExp,
            formatMessage({id: 'member.validation.phoneInvalid'}),
          )
          .required(formatMessage({id: 'common.required'})),
        preferredBranch: yup
          .string()
          .required(formatMessage({id: 'common.required'})),
      }),
    [formatMessage],
  );

  const [{apiData: branchOptions}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/members/findallv3',
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
  }, [filteredData?.length === 0]);

  const handleFastRegistrationDialogOpen = () => {
    setFastRegistrationOpen(true);
  };

  const handleFastRegistrationDialogClose = () => {
    setFastRegistrationOpen(false);
  };

  const [addNewMemberDialogOpen, setAddNewMemberDialogOpen] = useState(false);
  const handleOpenAddNewMemberDialog = () => {
    setAddNewMemberDialogOpen(true);
  };

  const handleCloseAddNewMemberDialog = () => {
    setAddNewMemberDialogOpen(false);
  };

  // Datatable Templates
  const genderBodyTemplate = (rowData) => {
    switch (rowData.gender) {
      case 'Male':
        return formatMessage({id: 'member.gender.male'});
      case 'Female':
        return formatMessage({id: 'member.gender.female'});
      case 'None-Binary':
        return formatMessage({id: 'member.gender.nonBinary'});
      default:
        return formatMessage({id: 'member.gender.nonBinary'});
    }
  };

  const dateBodyTemplate = (rowData) => {
    return (
      <>
        <>{dayjs(rowData.memberDate).format('DD-MM-YYYY')}</>
        <br />
        {!rowData.fullRegister && (
          <Tag value={formatMessage({id: 'member.status.partialRegister'})} />
        )}
      </>
    );
  };

  const memberNameBodyTemplate = (rowData) => {
    return (
      <ListItem>
        <ListItemAvatar>
          <Avatar
            alt={rowData.memberFullName}
            src={rowData.profileImageUrl}
            sx={{width: 40, height: 40}}
          />
        </ListItemAvatar>
        <ListItemText
          primary={rowData.memberFullName}
          secondary={dayjs(rowData.dob).format('DD-MM-YYYY')}
        />
      </ListItem>
    );
  };

  const isForeignBodyTemplate = (rowData) => {
    return (
      <Tag
        value={
          rowData.isForeign
            ? formatMessage({id: 'member.type.foreign'})
            : formatMessage({id: 'member.type.local'})
        }
        severity={getSeverity(rowData)}
      />
    );
  };

  const isDeletedBodyTemplate = (rowData) => {
    return (
      <Tag
        value={
          rowData.isDeleted
            ? formatMessage({id: 'member.status.deactivate'})
            : formatMessage({id: 'member.status.active'})
        }
        severity={getSeverityStatus(rowData)}
      />
    );
  };

  const getSeverity = (rowData) => {
    switch (rowData.isForeign) {
      case false:
        return 'success';
      case true:
        return 'warning';
      default:
        return null;
    }
  };

  const getSeverityStatus = (rowData) => {
    switch (rowData.isDeleted) {
      case false:
        return 'success';
        
      case true:
        return 'danger';

      default:
        return null;
    }
  };

  const formatDate = (value) => {
    return value.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const lastPayDateBodyTemplate = (rowData) => {
    if (rowData.lastPurchaseDate instanceof Date) {
      return formatDate(rowData.lastPurchaseDate);
    }
    if (rowData.lastPurchaseDate) {
      return dayjs(rowData.lastPurchaseDate).format('MMM D, YYYY');
    }
    return '';
  };

  const lastCheckInDateBodyTemplate = (rowData) => {
    if (rowData.lastCheckinDate instanceof Date) {
      return formatDate(rowData.lastCheckinDate);
    }
    if (rowData.lastCheckinDate) {
      return dayjs(rowData.lastCheckinDate).format('MMM D, YYYY');
    }
    return '';
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const applyFilters = async () => {
    const {search, preferredBranch, startDate, endDate} = filters;

    if (search || preferredBranch || startDate || endDate) {
      try {
        const response = await postDataApi(
          '/api/members/findallv2',
          infoViewActionsContext,
          {
            search,
            preferredBranch,
            startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
            endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
          },
          false,
          false,
        );
        setFilteredData(response);
        console.log('Filtered members:', response);

        if (search && Array.isArray(response) && response.length === 0) {
          infoViewActionsContext.fetchError(
            formatMessage({id: 'member.filter.noMatch'}) ||
              'No members match the search.',
          );
        }
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    } else {
      console.log('No filters applied');
      await fetchData();
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
      search: '',
      preferredBranch: '',
      startDate: '',
      endDate: '',
    });
    fetchData();
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h1'>
          {formatMessage({id: 'member.table.title'})}
        </Typography>
        <Button
          // variant='outlined'
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={resetFilters}
        ></Button>
      </Box>
      <Box display='flex' alignItems='center' gap={2}>
        <Button
          size='large'
          variant='outlined'
          onClick={toggleFilters}
          startIcon={showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
        >
          {showFilters
            ? formatMessage({id: 'member.filter.hide'})
            : formatMessage({id: 'member.filter.show'})}
        </Button>
        {user.permission.includes(RoutePermittedRole2.member_member_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddNewMemberDialog}
          >
            {formatMessage({id: 'member.action.fullRegistration'})}
          </Button>
        )}
        {user.permission.includes(RoutePermittedRole2.member_member_create) && (
          <Button
            size='large'
            variant='outlined'
            startIcon={<BoltIcon />}
            onClick={handleFastRegistrationDialogOpen}
          >
            {formatMessage({id: 'member.action.fastRegistration'})}
          </Button>
        )}
      </Box>
    </Box>
  );

  return selectedMember ? (
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
          {formatMessage(
            {id: 'member.details.title'},
            {name: selectedMember?.memberFullName},
          )}
        </Box>
        <MemberDetail
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          infoViewActionsContext={infoViewActionsContext}
        />
      </Box>{' '}
    </Card>
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'member.filter.title'})}
            </Typography>
          </Box>
          <Grid container spacing={2} justifyContent='space-between'>
            <Grid
              container
              spacing={2}
              size={{xs: 12, md: 12}}
              alignItems='center'
            >
              {/* Start Date Picker */}
              <Grid size={{md: 2.4, xs: 12}}>
                <DatePicker
                  sx={{width: '100%'}}
                  label={formatMessage({
                    id: 'member.filter.registrationFrom',
                  })}
                  value={filters.startDate ? dayjs(filters.startDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'startDate',
                      newValue ? newValue.toISOString() : null,
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>
              {/* End Date Picker */}
              <Grid size={{md: 2.4, xs: 12}}>
                <DatePicker
                  sx={{width: '100%'}}
                  label={formatMessage({
                    id: 'member.filter.registrationTo',
                  })}
                  value={filters.endDate ? dayjs(filters.endDate) : null}
                  onChange={(newValue) => {
                    handleFilterChange(
                      'endDate',
                      newValue ? newValue.toISOString() : null,
                    );
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  format='DD/MM/YYYY'
                />
              </Grid>
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'member.filter.byNameOrMobile'})}
                  variant='outlined'
                  fullWidth
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Grid>

              {/* Filter by Branch */}
              <Grid size={{md: 2.4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'member.filter.byPreferredBranch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'member.filter.byPreferredBranch'})}
                    value={filters.preferredBranch || ''}
                    onChange={(e) =>
                      handleFilterChange('preferredBranch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'member.filter.none'})}</em>
                    </MenuItem>
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.branchName}
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
              size={{xs: 12, md: 12}}
              justifyContent='flex-end'
            >
              <Grid size={{xs: 'auto'}} sx={{textAlign: 'center'}}>
                <Tooltip title={formatMessage({id: 'common.reset'})} arrow>
                  <IconButton onClick={resetFilters} color='primary'>
                    <ReplayIcon label='Reset' />
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
                  {formatMessage({id: 'member.filter.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          {/* Table */}
          <Grid item size={12}>
            <DataTable
              header={header}
              value={Array.isArray(filteredData) ? filteredData : []}
              paginator
              // CONTROLLED PAGINATION
              rows={page.rows}
              first={page.first}
              onPage={(e) => setPage({ first: e.first, rows: e.rows })}
              rowsPerPageOptions={[10, 20, 50]}
              // -----
              size='small'
              dataKey='_id'                 // CHANGED: stable unique key
              emptyMessage={formatMessage({id: 'member.table.empty'})}
              selectionMode='single'
              // CONTROLLED SELECTION (keeps row highlighted after back)
              selection={selection}
              onSelectionChange={(e) => {
                setSelection(e.value);     // keep selected row in the table state
                setSelectedMember(e.value); // open detail view
              }}
              showGridlines
              stripedRows
            >
              <Column
                field='memberDate'
                header={formatMessage({id: 'member.table.registrationDate'})}
                style={{minWidth: '12rem'}}
                sortable
                body={dateBodyTemplate}
              />
              <Column
                field='preferredName'
                header={formatMessage({id: 'member.table.name'})}
                style={{minWidth: '12rem'}}
                sortable
                body={memberNameBodyTemplate}
              />
              <Column
                field='mobileNumber'
                header={formatMessage({id: 'member.table.mobile'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='email'
                header={formatMessage({id: 'member.table.email'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='gender'
                header={formatMessage({id: 'member.table.gender'})}
                body={genderBodyTemplate}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='preferredBranch.branchName'
                header={formatMessage({id: 'member.table.preferredBranch'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='lastPurchaseDate'
                header={formatMessage({id: 'member.table.lastPaymentDate'})}
                style={{minWidth: '12rem'}}
                body={lastPayDateBodyTemplate}
              />
              <Column
                field='lastCheckinDate'
                header={formatMessage({id: 'member.table.lastVisitDate'})}
                style={{minWidth: '12rem'}}
                body={lastCheckInDateBodyTemplate}
              />
              <Column
                field='isForeign'
                header={formatMessage({id: 'member.table.memberType'})}
                style={{minWidth: '12rem'}}
                body={isForeignBodyTemplate}
              />
              <Column
                field='isDeleted'
                header={formatMessage({id: 'member.table.status'})}
                style={{minWidth: '12rem'}}
                body={isDeletedBodyTemplate}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AddNewMember
        isOpen={addNewMemberDialogOpen}
        setOpenDialog={handleCloseAddNewMemberDialog}
        reCallAPI={fetchData}
      />
      <AppDialog
        dividers
        maxWidth='xs'
        open={fastRegistrationOpen}
        hideClose
        sx={{pt: 0}}
        title={
          <CardHeader
            onCloseAddCard={() => setFastRegistrationOpen(false)}
            title={formatMessage({id: 'member.partialRegistration.title'})}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            memberFullName: '',
            mobileNumber: '',
            preferredBranch: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, {setSubmitting}) => {
            console.log('values2', values);
            setSubmitting(true);
            const formData = new FormData();
            formData.append('memberFullName', values.memberFullName);
            formData.append('mobileNumber', values.mobileNumber);
            formData.append('preferredBranch', values.preferredBranch);

            try {
              const response = await postDataApi(
                '/api/members/web/partial-Register',
                infoViewActionsContext,
                formData,
                false,
                false,
                {'Content-Type': 'multipart/form-data'},
              );
              if (response.status === 'ok') {
                fetchData();
                handleFastRegistrationDialogClose();
                infoViewActionsContext.showMessage(
                  formatMessage({id: 'member.partialRegistration.success'}),
                );
              } else {
                infoViewActionsContext.fetchError(response.message);
              }
            } catch (error) {
              console.log(error);
              infoViewActionsContext.fetchError(error.message);
            }
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <Form>
                <AppGridContainer spacing={4}>
                  <Grid size={12}>
                    <AppTextField
                      label={formatMessage({
                        id: 'member.partialRegistration.fullName',
                      })}
                      variant='outlined'
                      fullWidth
                      name='memberFullName'
                      type='text'
                      margin='dense'
                      helperText={errors.memberFullName}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MuiTelInput
                      error={errors?.mobileNumber}
                      helperText={
                        errors?.mobileNumber
                          ? formatMessage({
                              id: 'member.partialRegistration.numberInvalid',
                            })
                          : ''
                      }
                      fullWidth
                      label={<IntlMessages id='anran.member.mobileNumber' />}
                      forceCallingCode
                      defaultCountry='MY'
                      onlyCountries={['MY']}
                      disableFormatting
                      margin='dense'
                      value={values.mobileNumber}
                      onChange={(newValue) => {
                        setFieldValue('mobileNumber', newValue);
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    {branchOptions.length > 0 && (
                      <FormControl fullWidth error={errors?.preferredBranch}>
                        <InputLabel id='demo-simple-select-label'>
                          {formatMessage({
                            id: 'member.partialRegistration.preferredBranch',
                          })}
                        </InputLabel>
                        <Select
                          name='preferredBranch'
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          label={formatMessage({
                            id: 'member.partialRegistration.preferredBranch',
                          })}
                          value={values.preferredBranch}
                          onChange={(event) =>
                            setFieldValue('preferredBranch', event.target.value)
                          }
                        >
                          {branchOptions?.map((item, index) => (
                            <MenuItem
                              key={index}
                              value={item._id}
                              sx={{
                                padding: 2,
                                cursor: 'pointer',
                                minHeight: 'auto',
                              }}
                            >
                              {item.branchName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Button
                        sx={{
                          position: 'relative',
                          minWidth: 100,
                        }}
                        color='primary'
                        variant='contained'
                        type='submit'
                      >
                        <IntlMessages id='common.save' />
                      </Button>
                    </Box>
                  </Grid>
                </AppGridContainer>
              </Form>
            );
          }}
        </Formik>
      </AppDialog>
      <AppInfoView />
    </Box>
  );
};

export default MembersInfo;