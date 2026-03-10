import React from 'react';
import Button from '@mui/material/Button';
import IntlMessages from '../../utility/IntlMessages';
import PropTypes from 'prop-types';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  // Typography,
} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import IconButton from '@mui/material/IconButton';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});
const AppConfirmDialogV2 = ({
  open,
  onDeny,
  onConfirm,
  title,
  dialogTitle,
  dividers,
  // sxStyle,
}) => {
  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      onClose={() => onDeny(false)}
    >
      <DialogTitle
        sx={{
          fontSize: 14,
          fontWeight: Fonts.MEDIUM,
          padding: 0, // added
        }}
        id='app-dialog-title'
      >
        <Box
          sx={{
            py: 2,
            pl: 2,
            pr: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.warning.main,
          }}
        >
          <Box
            component='h5'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: (theme) => theme.palette.primary.contrastText,
            }}
          >
            {dialogTitle}
          </Box>
          <Box
            sx={{
              pl: 2,
              mr: {xs: -2, lg: -3, xl: -4},
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box>
              <IconButton
                onClick={() => onDeny(false)}
                sx={{
                  color: (theme) => theme.palette.primary.contrastText,
                }}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{color: 'text.secondary', fontSize: 14}}
        id='alert-dialog-description'
        dividers={dividers}
      >
        {title}
      </DialogContent>
      <DialogActions
        sx={{
          pb: 5,
          px: 6,
        }}
      >
        <Button
          variant='outlined'
          sx={{
            fontWeight: Fonts.MEDIUM,
          }}
          onClick={onConfirm}
          color='primary'
          autoFocus
        >
          <IntlMessages id='common.yes' />
        </Button>
        <Button
          variant='outlined'
          sx={{
            fontWeight: Fonts.MEDIUM,
          }}
          onClick={() => onDeny(false)}
          color='secondary'
        >
          <IntlMessages id='common.no' />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppConfirmDialogV2;

AppConfirmDialogV2.propTypes = {
  dialogTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  open: PropTypes.bool.isRequired,
  onDeny: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onConfirm: PropTypes.func.isRequired,
  sxStyle: PropTypes.object,
  dividers: PropTypes.bool,
};
