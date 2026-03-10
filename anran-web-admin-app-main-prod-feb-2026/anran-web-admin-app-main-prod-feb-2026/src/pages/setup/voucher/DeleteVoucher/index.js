import React from 'react';
import {Box, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {deleteDataApi} from '@anran/utility/APIHooks';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';

const DeleteVoucher = ({open, onClose, reCallAPI, deletingVoucher}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const onDeleteConfirm = async () => {
    try {
      const response = await deleteDataApi(
        `/api/voucher/${deletingVoucher._id}`,
        infoViewActionsContext,
      );
      console.log('Response from API:', response);
      reCallAPI();
      onClose();
      infoViewActionsContext.showMessage(
        formatMessage({id: 'admin.voucher.delete.success'}),
      );
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  return (
    <Box flex={1}>
      <AppConfirmDialogV2
        dividers
        open={open}
        dialogTitle={formatMessage({id: 'admin.voucher.delete.title'})}
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
            {formatMessage({id: 'admin.voucher.delete.message'})}
          </Typography>
        }
        onDeny={onClose}
        onConfirm={onDeleteConfirm}
      />
    </Box>
  );
};

export default DeleteVoucher;

DeleteVoucher.propTypes = {
  reCallAPI: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  deletingVoucher: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    voucherName: PropTypes.string.isRequired,
  }).isRequired,
};