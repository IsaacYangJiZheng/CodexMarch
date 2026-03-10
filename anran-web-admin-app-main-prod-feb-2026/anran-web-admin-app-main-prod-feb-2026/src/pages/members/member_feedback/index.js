import React, {useEffect, useState} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Tooltip,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ReplayIcon from '@mui/icons-material/Replay';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Rating} from 'primereact/rating';
import {Tag} from 'primereact/tag';
import {Fonts} from 'shared/constants/AppEnums';

import FeedbackDetail from './FeedbackDetail/index';
import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import clsx from 'clsx';
import dayjs from 'dayjs';

import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
// import feedbackData from './feedbackData.json';
import {useIntl} from 'react-intl';

const MemberFeedback = () => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;
  const infoViewActionsContext = useInfoViewActionsContext();
  const [selectedMember, setSelectedMember] = useState(null);
  // const [setBranchOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    memberName: '',
    mobileNumber: '',
    branch: '',
    startDate: '',
    endDate: '',
  });
  const [{apiData: branchList}] = useGetDataApi(
      'api/branch/role-based',
      {},
      {},
      true,
    );

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/feedback/all',
        infoViewActionsContext,
      );
      setFilteredData(response);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const memberNameBodyTemplate = (rowData) => {
    const member = rowData?.member ?? {};
    const name = member?.memberFullName ?? '-';
    const dob = member?.dob
      ? dayjs(member.dob).format('DD-MM-YYYY')
      : formatMessage({id: 'member.feedback.dobNotAvailable'});
    const avatarSrc = rowData?.profileImageUrl ?? '';

    return (
      <ListItem>
        <ListItemAvatar>
          <Avatar alt={name} src={avatarSrc} sx={{width: 40, height: 40}} />
        </ListItemAvatar>
        <ListItemText
          primary={name}
          secondary={formatMessage({id: 'member.feedback.dob'}, {date: dob})}
        />
      </ListItem>
    );
  };


  const submissionDateTemplate = (rowData) => (
    <>{dayjs(rowData.createdAt).format('DD-MM-YYYY')}</>
  );

  const ratingBodyTemplate = (rowData) => {
    return <Rating value={rowData.satisfied_rate} readOnly cancel={false} />;
  };

  const contactRequestBodyTemplate = (rowData) => {
    return (
      <Tag
        value={
          rowData.contact_request === true
            ? formatMessage({id: 'common.yes'})
            : formatMessage({id: 'common.no'})
        }
        severity={getSeverity(rowData)}
      />
    );
  };

  const getSeverity = (rowData) => {
    switch (rowData.contact_request) {
      case true:
        return 'success';

      case false:
        return 'warning';

      default:
        return null;
    }
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const applyFilters = async () => {
    const {memberName, mobileNumber, branch, startDate, endDate} =
      filters;
    if (memberName || mobileNumber || branch || startDate || endDate) {
      const formData = new FormData();
      if (memberName) formData.append('memberName', memberName);
      if (mobileNumber) formData.append('mobileNumber', mobileNumber);
      if (branch) formData.append('branch', branch);
      if (startDate)
        formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'));
      if (endDate)
        formData.append('endDate', dayjs(endDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          '/api/feedback/all',
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
      memberName: '',
      mobileNumber: '',
      branch: '',
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
        justifyContent: 'space-between',
        alignItems: 'center',
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
        <Typography variant='h4' fontWeight='bold'>
          {formatMessage({id: 'member.feedback.title'})}
        </Typography>
        <Tooltip title={formatMessage({id: 'common.refresh'})}>
          <Button
            size='large'
            startIcon={<RefreshOutlinedIcon />}
            onClick={resetFilters}
          ></Button>
        </Tooltip>
      </Box>
      <Box display='flex' alignItems='center' gap={2}>
        <Button
          size='large'
          variant='outlined'
          onClick={toggleFilters}
          startIcon={showFilters ? <FilterAltOffIcon /> : <FilterAltIcon />}
        >
          {showFilters
            ? formatMessage({id: 'member.feedback.filter.hide'})
            : formatMessage({id: 'member.feedback.filter.show'})}
        </Button>
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
            fontWeight: Fonts.SEMI_BOLD,
            mb: {
              xs: 2,
              lg: 1,
            },
          }}
        >
          {formatMessage(
            {id: 'member.feedback.details.title'},
            {name: selectedMember?.member.memberFullName},
          )}
        </Box>
        <FeedbackDetail
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          feedbackData={filteredData}
        />
      </Box>{' '}
    </Card>
  ) : (
    <Box>
      {showFilters && (
        <Card sx={{mt: 2, p: 5}}>
          <Box sx={{pb: 4}}>
            <Typography variant='h1'>
              {formatMessage({id: 'member.feedback.filter.title'})}
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
                    id: 'member.feedback.filter.fromDate',
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
                  label={formatMessage({id: 'member.feedback.filter.toDate'})}
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
              {/* Filter by Name */}
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({id: 'member.feedback.filter.byName'})}
                  variant='outlined'
                  fullWidth
                  value={filters.memberName}
                  onChange={(e) =>
                    handleFilterChange('memberName', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Mobile No */}
              <Grid size={{md: 2.4, xs: 12}}>
                <TextField
                  label={formatMessage({
                    id: 'member.feedback.filter.byMobile',
                  })}
                  variant='outlined'
                  fullWidth
                  value={filters.mobileNumber}
                  onChange={(e) =>
                    handleFilterChange('mobileNumber', e.target.value)
                  }
                />
              </Grid>
              {/* Filter by Branch */}
              <Grid size={{md: 2.4, xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel>
                    {formatMessage({id: 'member.feedback.filter.byBranch'})}
                  </InputLabel>
                  <Select
                    label={formatMessage({id: 'member.feedback.filter.byBranch'})}
                    value={filters.branch || ''}
                    onChange={(e) =>
                      handleFilterChange('branch', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>{formatMessage({id: 'member.feedback.filter.none'})}</em>
                    </MenuItem>
                    {branchList.map((branch) => (
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
                  {formatMessage({id: 'member.feedback.filter.apply'})}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      )}
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              header={header}
              value={filteredData?.length > 0 ? filteredData : []}
              paginator
              rows={10}
              size='small'
              dataKey='_id'
              emptyMessage={formatMessage({id: 'member.feedback.table.empty'})}
              selectionMode='single'
              onSelectionChange={(e) => setSelectedMember(e.value)}
              showGridlines
              stripedRows
            >
              <Column
                field='createdAt'
                header={formatMessage({id: 'member.feedback.table.submissionDate'})}
                body={submissionDateTemplate}
                // style={{padding: 0}}
                sortable
              />
              <Column
                field='member.memberFullName'
                header={formatMessage({id: 'member.feedback.table.memberName'})}
                body={memberNameBodyTemplate}
                style={{padding: 0}}
                sortable
              />
              <Column
                field='member.mobileNumber'
                header={formatMessage({id: 'member.feedback.table.mobile'})}
                // style={{padding: 0}}
                sortable
              />
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'member.feedback.table.visitBranch'})}
                // style={{padding: 0}}
                sortable
              />
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'member.feedback.table.overallRating'})}
                body={ratingBodyTemplate}
                // style={{padding: 0}}
                sortable
              />
              <Column
                field='conatact_request'
                header={formatMessage({id: 'member.feedback.table.contactRequest'})}
                body={contactRequestBodyTemplate}
              />
              <Column
                field='internal_summary'
                header={formatMessage({id: 'member.feedback.table.summary'})}
              />
              <Column
                field='internal_remarks'
                header={formatMessage({id: 'member.feedback.table.remarks'})}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default MemberFeedback;