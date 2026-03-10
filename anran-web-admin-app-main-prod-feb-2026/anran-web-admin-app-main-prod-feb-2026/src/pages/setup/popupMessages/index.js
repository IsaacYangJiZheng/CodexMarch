import React, {useState, useRef, useMemo} from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  IconButton,
  Slide,
  Divider,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  postDataApi,
  useGetDataApi,
  deleteDataApi,
} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Toast} from 'primereact/toast';
import {Tag} from 'primereact/tag';
import {Image} from 'primereact/image';
import AddPopupMessage from './AddPopupMessage';
import AppInfoView from '@anran/core/AppInfoView';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import {useIntl} from 'react-intl';

const PopupMessage = () => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;

  const {user} = useAuthUser();
  const toast = useRef(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [{apiData: popupMessageData, loading}, {reCallAPI}] = useGetDataApi(
    'api/popup-message/web',
    undefined,
    {},
    true,
  );

  // Dialog Handlers
  const handleOpenAddDialog = () => setAddNewDialogOpen(true);
  const handleCloseAddDialog = () => setAddNewDialogOpen(false);

  const handleOpenEditDialog = (rowData) => {
    setEditDialogOpen(true);
    setSelectedMessage(rowData);
  };
  const handleCloseEditDialog = () => setEditDialogOpen(false);

  const handleOpenDeleteDialog = (rowData) => {
    setDeleteDialogOpen(true);
    setSelectedMessage(rowData);
  };
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

  const onDeleteConfirm = () => {
    deleteDataApi(
      `api/popup-message/delete/${selectedMessage._id}`,
      infoViewActionsContext,
      false,
      false,
      {'Content-Type': 'multipart/form-data'},
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage(
          formatMessage({id: 'popupMessage.toast.deletedSuccess'}),
        );
        setDeleteDialogOpen(false);
        setSelectedMessage(null);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  // Datatable Row Handlers
  const handleRowSelect = (e) => setSelectedMessage(e.data);

  const onRowReorder = (e) => {
    const ids = e.value.map((x) => x._id);

    postDataApi(
      'api/popup-message/reorder',
      infoViewActionsContext,
      {popupMessages: ids},
      false,
      false,
      {'Content-Type': 'multipart/form-data'},
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage(
          formatMessage({id: 'popupMessage.toast.reorderSuccess'}),
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  // Body Templates
  const actionBodyTemplate = (rowData) => (
    <Grid container spacing={2}>
      {user.permission.includes(RoutePermittedRole2.admin_message_update) && (
        <Grid size={6}>
          <IconButton color='success' onClick={() => handleOpenEditDialog(rowData)}>
            <EditIcon />
          </IconButton>
        </Grid>
      )}
      {user.permission.includes(RoutePermittedRole2.admin_message_delete) && (
        <Grid size={6}>
          <IconButton color='error' onClick={() => handleOpenDeleteDialog(rowData)}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );

  const messageTitleBodyTemplate = (rowData) => {
    if (!rowData.messageDetails || rowData.messageDetails.length === 0) return null;

    const detail =
      rowData.messageDetails.find((d) => d.country.toUpperCase() === 'EN') ||
      rowData.messageDetails[0];

    return <Typography>{detail.messageTitle}</Typography>;
  };

  const getSeverity = (rowData) => {
    switch (rowData.publish) {
      case true:
        return 'success';
      case false:
        return 'warning';
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={
        rowData.publish
          ? formatMessage({id: 'popupMessage.status.published'})
          : formatMessage({id: 'popupMessage.status.notPublished'})
      }
      severity={getSeverity(rowData)}
    />
  );

  const startDateBodyTemplate = (rowData) =>
    rowData.always
      ? formatMessage({id: 'popupMessage.date.always'})
      : dayjs(rowData.startDate).format('MMMM D, YYYY');

  const endDateBodyTemplate = (rowData) =>
    rowData.always
      ? formatMessage({id: 'popupMessage.date.always'})
      : dayjs(rowData.endDate).format('MMMM D, YYYY');

  const imageBodyTemplate = (rowData) => (
    <Image src={rowData.imageUrl} alt={rowData.imageDataUrl} width='100%' preview />
  );

  // Memoized headers (locale-safe)
  const headers = useMemo(
    () => ({
      pageTitle: formatMessage({id: 'popupMessage.title'}),
      addNew: formatMessage({id: 'popupMessage.action.addNew'}),
      empty: formatMessage({id: 'popupMessage.table.empty'}),
      detailsTitle: formatMessage({id: 'popupMessage.details.title'}),

      colDisplayOrder: formatMessage({id: 'popupMessage.table.col.displayOrder'}),
      colName: formatMessage({id: 'popupMessage.table.col.name'}),
      colStartDate: formatMessage({id: 'popupMessage.table.col.startDate'}),
      colEndDate: formatMessage({id: 'popupMessage.table.col.endDate'}),
      colType: formatMessage({id: 'popupMessage.table.col.type'}),
      colStatus: formatMessage({id: 'popupMessage.table.col.status'}),

      labelStartDate: formatMessage({id: 'popupMessage.details.label.startDate'}),
      labelEndDate: formatMessage({id: 'popupMessage.details.label.endDate'}),
      labelType: formatMessage({id: 'popupMessage.details.label.type'}),
      labelStatus: formatMessage({id: 'popupMessage.details.label.status'}),

      tooltipLanguage: formatMessage({id: 'popupMessage.details.tooltip.language'}),
      tooltipTitle: formatMessage({id: 'popupMessage.details.tooltip.title'}),
      tooltipShortDesc: formatMessage({id: 'popupMessage.details.tooltip.shortDescription'}),
      tooltipContent: formatMessage({id: 'popupMessage.details.tooltip.messageContent'}),

      fieldLanguage: formatMessage({id: 'popupMessage.details.field.language'}),
      fieldTitle: formatMessage({id: 'popupMessage.details.field.title'}),
      fieldShortDesc: formatMessage({id: 'popupMessage.details.field.shortDescription'}),
      fieldMessage: formatMessage({id: 'popupMessage.details.field.message'}),
    }),
    [formatMessage],
  );

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
        <Typography variant='h1'>{headers.pageTitle}</Typography>
        <Button
          size='large'
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => reCallAPI()}
          aria-label={formatMessage({id: 'common.refresh'})}
        />
      </Box>

      {user.permission.includes(RoutePermittedRole2.admin_message_create) && (
        <Button
          size='large'
          variant='outlined'
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          {headers.addNew}
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{display: 'flex', gap: 2, transition: 'all 0.3s ease', height: '100vh'}}>
      <Toast ref={toast} />

      <Card
        sx={{
          mt: 2,
          p: 5,
          flex: selectedMessage ? '0 0 60%' : '1 0 100%',
          transition: 'flex 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={2} sx={{flex: 1, overflow: 'auto'}}>
          <Grid size={12}>
            <DataTable
              header={header}
              value={popupMessageData?.length > 0 ? popupMessageData : []}
              dataKey='_id'
              loading={loading}
              emptyMessage={headers.empty}
              reorderableRows
              selectionMode='single'
              selection={selectedMessage}
              onRowSelect={handleRowSelect}
              onRowUnselect={() => setSelectedMessage(null)}
              onRowReorder={onRowReorder}
              showGridlines
              size='small'
              scrollable
              scrollHeight='100%'
            >
              <Column rowReorder style={{width: '3rem'}} />
              <Column field='displayOrder' header={headers.colDisplayOrder} style={{minWidth: '2rem'}} />
              <Column field='messageTitle' header={headers.colName} style={{minWidth: '12rem'}} body={messageTitleBodyTemplate} />
              <Column field='startDate' header={headers.colStartDate} body={startDateBodyTemplate} style={{minWidth: '12rem'}} />
              <Column field='endDate' header={headers.colEndDate} body={endDateBodyTemplate} style={{minWidth: '12rem'}} />
              <Column field='messageContentType' header={headers.colType} style={{minWidth: '12rem'}} />
              <Column field='publish' header={headers.colStatus} body={statusBodyTemplate} style={{minWidth: '12rem'}} />
            </DataTable>
          </Grid>
        </Grid>
      </Card>

      {selectedMessage && (
        <Slide direction='left' in={!!selectedMessage} mountOnEnter unmountOnExit>
          <Card
            sx={{
              mt: 2,
              p: 5,
              flex: '0 0 40%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='h1'>{headers.detailsTitle}</Typography>
              {(user.permission.includes(RoutePermittedRole2.admin_message_update) ||
                user.permission.includes(RoutePermittedRole2.admin_message_delete)) && (
                <Box>{actionBodyTemplate(selectedMessage)}</Box>
              )}
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 4,
              }}
            >
              <Typography>
                <span style={{fontWeight: 'bold'}}>{headers.labelStartDate}: </span>
                {startDateBodyTemplate(selectedMessage)}
              </Typography>
              <Typography>
                <span style={{fontWeight: 'bold'}}>{headers.labelEndDate}: </span>
                {endDateBodyTemplate(selectedMessage)}
              </Typography>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 4,
              }}
            >
              <Typography>
                <span style={{fontWeight: 'bold'}}>{headers.labelType}: </span>
                {selectedMessage.messageContentType}
              </Typography>
              <Typography>
                <span style={{fontWeight: 'bold'}}>{headers.labelStatus}: </span>
                {statusBodyTemplate(selectedMessage)}
              </Typography>
            </Box>

            <Box sx={{mt: 2, overflowY: 'auto', flex: 1}}>
              {imageBodyTemplate(selectedMessage)}

              {selectedMessage.messageDetails.map((detail, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 1,
                    border: '1px solid #eee',
                    borderRadius: 1,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', pb: 2, pt: 2}}>
                    <Typography variant='body1' fontWeight='bold' color='textSecondary'>
                      {headers.fieldLanguage}:
                    </Typography>
                    <Box sx={{ml: 2}} />
                    <Typography variant='body1' color='textSecondary'>
                      {detail.country.toUpperCase()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', pb: 2, pt: 2}}>
                    <Tooltip title={headers.tooltipTitle} arrow>
                      <Typography variant='body1' fontWeight='bold'>
                        {headers.fieldTitle}:
                      </Typography>
                    </Tooltip>
                    <Box sx={{ml: 12}} />
                    <Tooltip title={headers.tooltipTitle} arrow>
                      <Typography variant='body1'>{detail.messageTitle}</Typography>
                    </Tooltip>
                  </Box>

                  <Divider />

                  <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', pb: 2, pt: 2}}>
                    <Tooltip title={headers.tooltipShortDesc} arrow>
                      <Typography variant='body1' fontWeight='bold'>
                        {headers.fieldShortDesc}:
                      </Typography>
                    </Tooltip>
                    <Box sx={{ml: 4}} />
                    <Tooltip title={headers.tooltipShortDesc} arrow>
                      <Typography variant='body1'>{detail.messageShortDescription}</Typography>
                    </Tooltip>
                  </Box>

                  <Divider />

                  <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', pb: 2, pt: 2}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                      <Tooltip title={headers.tooltipContent} arrow>
                        <Typography variant='subtitle1' fontWeight='bold'>
                          {headers.fieldMessage}:
                        </Typography>
                      </Tooltip>
                      <Tooltip title={headers.tooltipContent} arrow>
                        <Typography variant='subtitle1'>{detail.messageContent}</Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Slide>
      )}

      {/* Dialogs */}
      {addNewDialogOpen ? (
        <AddPopupMessage
          isOpen={addNewDialogOpen}
          setOpenDialog={handleCloseAddDialog}
          reCallAPI={reCallAPI}
        />
      ) : null}

      {editDialogOpen ? (
        <AddPopupMessage
          isOpen={editDialogOpen}
          setOpenDialog={handleCloseEditDialog}
          reCallAPI={reCallAPI}
          isEdit={true}
          rowData={selectedMessage}
          setSelectedMessage={setSelectedMessage}
        />
      ) : null}

      <AppConfirmDialogV2
        dividers
        open={deleteDialogOpen}
        dialogTitle={formatMessage({id: 'popupMessage.confirm.delete.dialogTitle'})}
        title={
          <Typography
            component='h4'
            variant='h4'
            sx={{mb: 3, fontWeight: Fonts.SEMI_BOLD}}
            id='alert-dialog-title'
          >
            {formatMessage({id: 'popupMessage.confirm.delete.title'})}
          </Typography>
        }
        onDeny={handleCloseDeleteDialog}
        onConfirm={onDeleteConfirm}
      />

      <AppInfoView />
    </Box>
  );
};

export default PopupMessage;
