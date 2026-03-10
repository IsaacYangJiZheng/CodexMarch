import React from 'react';
import PropTypes from 'prop-types';
import {TextField, Box, Button} from '@mui/material';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import AppLoader from '@anran/core/AppLoader';
import {Fonts} from 'shared/constants/AppEnums';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

const EmailInputDialog = ({
  visible,
  setVisible,
  attachment,
  memberEmail,
  memberName,
  memberPhone,
  invoiceData,
}) => {
  console.log('EmailInputDialog:', visible);
  const [email, setEmail] = React.useState(memberEmail);
  const infoViewActionsContext = useInfoViewActionsContext();

  const sendEmailFormClick = async () => {
    var fd = new FormData(); // To carry on your data
    fd.append('invoiceId', invoiceData._id);
    fd.append('invoiceNo', invoiceData.orderNumber);
    fd.append('mypdf', attachment);
    await postDataApi(
      'api/email/send-invoice-pdf',
      infoViewActionsContext,
      fd,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        infoViewActionsContext.showMessage('Send successfully!');
        setVisible(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <AppDialog
      dividers
      fullHeight
      maxWidth='xs'
      maxHeight='100px'
      open={visible}
      hideClose
      title={
        <CardHeader
          onCloseAddCard={() => {
            setVisible(false);
          }}
          title={'Send Email : Invoice'}
        />
      }
    >
      {attachment?.type != null ? (
        <>
          <Box
            component='h5'
            sx={{
              pr: 2,
              m: 0,
              fontWeight: Fonts.BOLD,
              fontSize: 16,
              color: (theme) => theme.palette.primary.main,
            }}
          >
            To: {memberName}({memberPhone})
          </Box>
          <Box sx={{m: 4}}></Box>
          <TextField
            autoFocus
            margin='dense'
            label='Email Address'
            fullWidth
            variant='outlined'
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update file name state
          />
          <Button
            sx={{ml: 4, mt: 2, mb: 2}}
            variant='contained'
            onClick={() => {
              sendEmailFormClick();
              // navigator.clipboard.writeText(link);
              // infoViewActionsContext.showMessage('Copied successfully!');
            }}
          >
            Send
          </Button>
        </>
      ) : (
        <AppLoader page={'EmailInputDialog'} />
      )}
    </AppDialog>
  );
};

export default EmailInputDialog;

EmailInputDialog.propTypes = {
  setVisible: PropTypes.func,
  visible: PropTypes.bool,
  onCloseAddCard: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  isViewOnly: PropTypes.bool,
  memberEmail: PropTypes.string,
  memberName: PropTypes.string,
  memberPhone: PropTypes.string,
  invoiceData: PropTypes.object,
  attachment: PropTypes.any,
};
