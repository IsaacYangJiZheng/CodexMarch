import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PropTypes from 'prop-types';
import CardHeader from './CardHeader';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {deleteDataApi} from '@anran/utility/APIHooks';
import AppDialog from '@anran/core/AppDialog';
import IntlMessages from '@anran/utility/IntlMessages';
import {useIntl} from 'react-intl';

const DeleteAttendance = ({open, onClose, reCallAPI, deletingAttendance}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const handleDeleteAttendance = async () => {
    try {
      const response = await deleteDataApi(
        `/api/attendance/${deletingAttendance._id}`,
        infoViewActionsContext,
      );
      console.log('Response from API:', response);
      reCallAPI();
      onClose();
      infoViewActionsContext.showMessage(
        formatMessage({id: 'attendance.message.deleted'}),
      );
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={open}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={onClose}
            title={formatMessage({id: 'attendance.dialog.delete.title'})}
          />
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Typography variant='h3'>
              {formatMessage(
                {id: 'attendance.dialog.delete.confirm'},
                {name: deletingAttendance?.staff?.name},
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} md={12}>
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
                color='error'
                variant='contained'
                onClick={handleDeleteAttendance}
              >
                <IntlMessages id='common.delete' />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AppDialog>
    </Box>
  );
};

export default DeleteAttendance;

DeleteAttendance.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deletingAttendance: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    staff: PropTypes.string.isRequired,
  }).isRequired,
};