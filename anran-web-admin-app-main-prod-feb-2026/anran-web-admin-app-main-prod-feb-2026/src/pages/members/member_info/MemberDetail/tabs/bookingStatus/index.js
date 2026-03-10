import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Button,
  DialogActions,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Tag} from 'primereact/tag';

import CardHeader from './CardHeader';

import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';
import IntlMessages from '@anran/utility/IntlMessages';
import {useAuthUser} from '@anran/utility/AuthHooks';
import AppDialog from '@anran/core/AppDialog';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useIntl} from 'react-intl';

import dayjs from 'dayjs';

export default function BookingSession({selectedMember}) {
  const {formatMessage} = useIntl();
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const toast = useRef(null);
  const formData = new FormData();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [auditLogDialogOpen, setAuditLogDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = React.useState(false);
  const [editPax, setEditPax] = React.useState('');
  const [memberBookingSession, setMemberBookingSession] = React.useState(null);
  const [paxError, setPaxError] = React.useState('');
  formData.append('member', selectedMember._id);
  const [{apiData: bookingSession}, {reCallAPI}] = useGetDataApi(
    `/api/booking/memberbased/all/${selectedMember._id}`,
    {},
    {},
    true,
  );
  const [{apiData: auditLogData}, {reCallAPI: refetchAuditLog}] = useGetDataApi(
    `api/booking/memberbased/audit-log/${selectedMember._id}`,
    {},
    {},
    true,
  );
  const [{apiData: staffName}] = useGetDataApi(
    '/api/staff',
    {},
    {},
    true,
  );

  const handleOpenDeleteDialog = (rowData) => {
    setMemberBookingSession(rowData);
    setCancelReason(rowData.cancellationReason);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setMemberBookingSession(null);
    setCancelReason('');
    setDeleteDialogOpen(false);
  };

  const onDeleteConfirm = () => {
    const formData = new FormData();
    formData.append('_id', memberBookingSession._id); // MemberBooking _id
    formData.append('booking', memberBookingSession.booking._id); // Booking _id as object
    formData.append('cancellationReason', cancelReason);

    postDataApi(
      'api/booking/delete-completed-member-booking',
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.booking.deleteSuccess'}),
        );
        handleCloseDeleteDialog();
        setOpenConfirmationDialog(false);
        reCallAPI();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const handleOpenAuditLogDialog = () => {
    refetchAuditLog();
    setAuditLogDialogOpen(true);
  };

  const packageBodyTemplate = (rowData) => {
    const name = rowData.memberPackage?.package?.packageName;
    const code = rowData.memberPackage?.package?.packageCode;
    return `${name} (${code})`;
  };

  const userBodyTemplate = (rowData) => {
    if (!staffName || !Array.isArray(staffName)) return rowData.user;
    const staff = staffName.find(staff => staff._id === rowData.user);
    return staff ? staff.name || staff.fullName || staff.username || staff._id : rowData.user;
  };

  const beforeBodyTemplate = (rowData) => {
    const before = rowData.before;
    return formatMessage(
      {id: 'member.auditLog.balanceUsed'},
      {balance: before.currentBalance ?? '-', used: before.used ?? '-'},
    );
  };

  const afterBodyTemplate = (rowData) => {
    const after = rowData.after;
    return formatMessage(
      {id: 'member.auditLog.balanceUsed'},
      {balance: after.currentBalance ?? '-', used: after.used ?? '-'},
    );
  };

  const handleCloseAuditLogDialog = () => {
    setAuditLogDialogOpen(false);
  };

  const handleOpenEditDialog = (rowData) => {
    setMemberBookingSession(rowData);
    setEditPax(rowData.pax);
    setEditDialogOpen(true);
  };

  const handlePaxChange = (e) => {
    const value = e.target.value;
    setEditPax(value);
    if (Number(value) > Number(memberBookingSession?.pax)) {
      setPaxError(
        formatMessage(
          {id: 'member.booking.error.paxExceeds'},
          {count: memberBookingSession?.pax},
        ),
      );
    } else {
      setPaxError('');
    }
  };

  const handleCloseEditDialog = () => {
    setMemberBookingSession(null);
    setEditPax('');
    setEditDialogOpen(false);
  };

  const onEditConfirm = () => {
    const formData = new FormData();
    formData.append('_id', memberBookingSession._id);
    formData.append('booking', memberBookingSession.booking._id);
    formData.append('pax', editPax);

    postDataApi(
      'api/booking/edit-completed-member-booking',
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.booking.updateSuccess'}),
        );
        handleCloseEditDialog();
        reCallAPI();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  }

  // New: Request handlers for non-admin
  const onEditRequestConfirm = () => {
    const formData = new FormData();
    formData.append('_id', memberBookingSession._id);
    formData.append('booking', memberBookingSession.booking._id);
    formData.append('pax', editPax);

    postDataApi(
      'api/booking/request-edit-completed-member-booking',
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.booking.updateSuccess'}),
        );
        handleCloseEditDialog();
        reCallAPI();
        refetchAuditLog();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onDeleteRequestConfirm = () => {
    const formData = new FormData();
    formData.append('_id', memberBookingSession._id); // MemberBooking _id
    formData.append('booking', memberBookingSession.booking._id); // Booking _id as object
    formData.append('cancellationReason', cancelReason);

    postDataApi(
      'api/booking/request-delete-completed-member-booking',
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.booking.deleteSuccess'}),
        );
        handleCloseDeleteDialog();
        reCallAPI();
        refetchAuditLog();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const requestDateBodyTemplate = (rowData) => {
    return (
      <Typography>
        {dayjs(rowData.createdAt).format('DD-MM-YYYY h:mm A')}
      </Typography>
    );
  }

  const approvedDateBodyTemplate = (rowData) => {
    return (
      <Typography>
        {rowData.approvedAt ? dayjs(rowData.approvedAt).format('DD-MM-YYYY h:mm A') : '-'}
      </Typography>
    );
  }

  const bookingDateBodyTemplate = (rowData) => {
    return (
      <Typography>
        {dayjs(rowData.bookingDate).format('DD-MM-YYYY h:mm A')}
      </Typography>
    );
  };

  const bookingBookingDateBodyTemplate = (rowData) => {
    return <Typography>{dayjs(rowData.start).format('DD-MM-YYYY')}</Typography>;
  };

  const bookingBookingTimeBodyTemplate = (rowData) => {
    return (
      <Typography>
        {dayjs(rowData.start).format('h:mm A')} -
        {dayjs(rowData.end).format('h:mm A')}
      </Typography>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.bookingstatus} severity={getSeverity(rowData)}></Tag>
    );
  };

  const getSeverity = (rowData) => {
    switch (rowData.bookingstatus) {
      case 'Complete':
        return 'success';

      case 'Booked':
        return 'warning';

      case 'Cancel':
        return 'danger';

      default:
        return null;
    }
  };

  // Helper to get audit log entry for a row
  const getAuditLogEntry = (rowData) => {
    if (!auditLogData?.data) return null;
    return auditLogData.data.find(
      (entry) =>
        entry.memberPackage?._id === rowData.memberPackage?._id &&
        entry.memberBooking === rowData?._id
    );
  };

  // Action column: show Pending if request submitted and status is Pending, else show edit/delete
  const actionBodyTemplate = (rowData) => {
    if (rowData.bookingstatus !== 'Complete') return null;
    const auditLogEntry = getAuditLogEntry(rowData);
    if (auditLogEntry && auditLogEntry.status === 'Pending') {
      return (
        <Typography
          color="warning.main"
          sx={{fontWeight: 600, textAlign: 'center'}}
        >
          <IntlMessages id='common.pending' />
        </Typography>
      );
    }
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

  const handleAproveClick = (rowData) => {
    const formData = new FormData();
    formData.append('_id', rowData);

    postDataApi(
      'api/booking/approve-request-amendment',
      infoViewActionsContext,
      formData,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.booking.amendmentApproved'}),
        );
        reCallAPI();
        refetchAuditLog();
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  }

  // Amendment Approval column: show Approve button if audit log status is Pending
  const amendmentApprovalBodyTemplate = (rowData) => {
    const auditLogEntry = getAuditLogEntry(rowData);
    if (auditLogEntry && auditLogEntry.status === 'Pending') {
      return (
        <Button
          fullWidth
          color="warning"
          variant="outlined"
          onClick={() => handleAproveClick(auditLogEntry._id)}
        >
          <IntlMessages id='common.approve' />
        </Button>
      );
    }
    return (
      <Button
        disabled
        fullWidth
        color="warning"
        variant="outlined"
      >
        <IntlMessages id='common.approve' />
      </Button>
    )
  };

  return (
    <Box>
      <Toast ref={toast} />
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid size={12}>
            <Box
              component='h5'
              sx={{
                pr: 2,
                mt: 0,
                mb: 0,
                fontWeight: Fonts.BOLD,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IntlMessages id='anran.member.BookingSession' />

              <span>
                {formatMessage(
                  {id: 'member.booking.forMember'},
                  {
                    name: selectedMember.memberFullName.toUpperCase(),
                    mobile: selectedMember.mobileNumber,
                  },
                )}
              </span>
              {user.permission.includes(RoutePermittedRole2.member_booking_update) && (
                <Button sx={{ ml: 'auto', gap: 1 }} variant='outlined' onClick={handleOpenAuditLogDialog}>
                  <TextSnippetIcon />
                  <Typography>
                    <IntlMessages id='member.auditLog.title' />
                  </Typography>
                </Button>
              )}
            </Box>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={bookingSession.data ? bookingSession.data : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              // filterDisplay='row'
              emptyMessage={formatMessage({id: 'table.empty'})}
              showGridlines
              stripedRows
            >
              <Column
                field='bookingDate'
                header={formatMessage({id: 'member.booking.date'})}
                sortable
                // filter
                // filterPlaceholder='Filter by Date'
                style={{minWidth: '10rem'}}
                body={bookingDateBodyTemplate}
              />
              <Column
                field='memberPackage.package.packageCode'
                header={formatMessage({id: 'member.transfer.packageCode'})}
                style={{minWidth: '6rem'}}
              />
              <Column
                field='memberPackage.package.packageName'
                header={formatMessage({id: 'member.package.packageName'})}
                sortable
                // filter
                // filterPlaceholder='Filter by Package Name'
                style={{minWidth: '12rem'}}
              />
              {/* <Column
                field='member.memberFullName'
                header='Member Name'
                sortable
                filter
                filterPlaceholder='Filter by Member Name'
                style={{minWidth: '12rem'}}
              /> */}
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'member.booking.branch'})}
                sortable
                // filter
                // filterPlaceholder='Filter by Branch'
                style={{minWidth: '12rem'}}
              />
              <Column
                field='floor.floorNo'
                header={formatMessage({id: 'member.booking.floor'})}
                sortable
                // filter
                // filterPlaceholder='Filter by Floor'
                style={{minWidth: '6rem'}}
              />
              <Column
                field='room.room_no'
                header={formatMessage({id: 'member.booking.room'})}
                style={{minWidth: '6rem'}}
              />
              <Column
                field='bookingBookingDate'
                header={formatMessage({id: 'member.booking.slotDate'})}
                style={{minWidth: '8rem'}}
                body={bookingBookingDateBodyTemplate}
              />
              <Column
                field='bookingBookingTime'
                header={formatMessage({id: 'member.booking.slotTime'})}
                style={{minWidth: '10rem'}}
                body={bookingBookingTimeBodyTemplate}
              />
              <Column
                field='pax'
                header={formatMessage({id: 'member.booking.pax'})}
                style={{minWidth: '5rem'}}
              />
              <Column
                field='bookingstatus'
                header={formatMessage({id: 'table.header.status'})}
                sortable
                style={{minWidth: '6rem'}}
                body={statusBodyTemplate}
              />
              {user.permission.includes(RoutePermittedRole2.member_booking_update) && (
                <Column
                  header={formatMessage({id: 'table.header.action'})}
                  sortable
                  style={{minWidth: '7rem'}}
                  body={actionBodyTemplate}
                />
              )}
              {user.role === "admin" && (
                <Column
                  header={formatMessage({id: 'member.booking.amendmentApproval'})}
                  sortable
                  style={{minWidth: '7rem'}}
                  body={amendmentApprovalBodyTemplate}
                />
              )}
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AppDialog
        dividers
        maxWidth='lg'
        open={auditLogDialogOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseAuditLogDialog}
            title={formatMessage({id: 'member.auditLog.title'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <DataTable
              value={auditLogData.data ? auditLogData.data : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              emptyMessage={formatMessage({id: 'table.empty'})}
              showGridlines
              stripedRows
            >
              <Column
                field='memberPackage'
                header={formatMessage({id: 'member.transfer.package'})}
                style={{minWidth: '12rem'}}
                body={packageBodyTemplate}
              />
              <Column
                field='action'
                header={formatMessage({id: 'table.header.action'})}
                style={{minWidth: '6rem'}}
              />
              <Column
                field='user'
                header={formatMessage({id: 'member.auditLog.requestBy'})}
                style={{minWidth: '12rem'}}
                body={userBodyTemplate}
              />
              <Column
                field='createdAt'
                header={formatMessage({id: 'member.auditLog.requestDate'})}
                style={{minWidth: '10rem'}}
                body={requestDateBodyTemplate}
              />
              <Column
                field='approvedBy'
                header={formatMessage({id: 'member.auditLog.approvalBy'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='approvedDate'
                header={formatMessage({id: 'member.auditLog.approvalDate'})}
                style={{minWidth: '10rem'}}
                body={approvedDateBodyTemplate}
              />
              <Column
                field='before'
                header={formatMessage({id: 'member.auditLog.before'})}
                style={{minWidth: '12rem'}}
                body={beforeBodyTemplate}
              />
              <Column
                field='after'
                header={formatMessage({id: 'member.auditLog.after'})}
                style={{minWidth: '12rem'}}
                body={afterBodyTemplate}
              />
            </DataTable>
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={handleCloseAuditLogDialog}>
            <IntlMessages id='common.done' />
          </Button>
        </DialogActions>
      </AppDialog>
      <AppDialog
        dividers
        maxWidth='md'
        open={editDialogOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseEditDialog}
            title={formatMessage({id: 'member.booking.editTitle'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant='h4'>
              {formatMessage(
                {id: 'member.booking.packageName'},
                {
                  name: memberBookingSession?.memberPackage?.package?.packageName,
                  code: memberBookingSession?.memberPackage?.package?.packageCode,
                },
              )}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography>
              {formatMessage(
                {id: 'member.booking.branchName'},
                {name: memberBookingSession?.branch?.branchName},
              )}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography>
              {formatMessage(
                {id: 'member.booking.floorLabel'},
                {floor: memberBookingSession?.floor?.floorNo},
              )}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography>
              {formatMessage(
                {id: 'member.booking.roomLabel'},
                {room: memberBookingSession?.room?.room_no},
              )}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography>
              {formatMessage(
                {id: 'member.booking.dateLabel'},
                {
                  date:
                    memberBookingSession &&
                    new Date(memberBookingSession.bookingDate).toLocaleString(),
                },
              )}
            </Typography>
          </Grid>
          <Grid size={12}>
            <TextField
              label={formatMessage({id: 'member.booking.pax'})}
              type="number"
              value={editPax}
              onChange={handlePaxChange}
              fullWidth
              margin="dense"
              error={!!paxError}
              helperText={paxError}
              slotProps={{
                input: {
                  sx: {
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                      {
                        display: 'none',
                      },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                  },
                },
              }}
            />
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            <IntlMessages id='common.cancel' />
          </Button>
          <Button
            onClick={user.role !== 'admin' ? onEditRequestConfirm : onEditConfirm}
            color="primary"
            variant="contained"
            disabled={!!paxError}
          >
            {user.role !== 'admin' ? (
              <IntlMessages id='member.booking.sendRequest' />
            ) : (
              <IntlMessages id='common.save' />
            )}
          </Button>
        </DialogActions>
      </AppDialog>
      <AppDialog
        dividers
        maxWidth='md'
        open={deleteDialogOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={handleCloseDeleteDialog}
            title={formatMessage({id: 'member.booking.cancelTitle'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant='h1'>
              <IntlMessages id='member.booking.cancelPrompt' />
            </Typography>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={formatMessage({id: 'member.booking.cancelSpecify'})}
              variant="outlined"
              margin="normal"
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button onClick={handleCloseDeleteDialog} color="primary" variant='outlined'>
            <IntlMessages id='common.back' />
          </Button>
          <Button onClick={() => setOpenConfirmationDialog(true)} color="warning" variant='contained'>
            <IntlMessages id='member.booking.approveCancellation' />
          </Button>
        </Box>
      </AppDialog>
      <AppConfirmDialogV2
        dividers
        open={openConfirmationDialog}
        dialogTitle={formatMessage({id: 'member.booking.deleteTitle'})}
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
            {formatMessage({id: 'member.booking.deleteConfirm'})}
          </Typography>
        }
        onDeny={() => setOpenConfirmationDialog(false)}
        onConfirm={user.role !== 'admin' ? onDeleteRequestConfirm : onDeleteConfirm}
        confirmButtonProps={{
          children:
            user.role !== 'admin' ? (
              <IntlMessages id='member.booking.sendRequest' />
            ) : (
              <IntlMessages id='common.yes' />
            ),
        }}
      />
    </Box>
  );
}

BookingSession.propTypes = {
  selectedMember: PropTypes.object,
  rawData: PropTypes.object,
};