import React from 'react';
import PropTypes from 'prop-types';
import {TextField, Box, Button} from '@mui/material';
import {Dialog, DialogTitle} from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import AppScrollbar from '@anran/core/AppScrollbar';
import IconButton from '@mui/material/IconButton';
import {common} from '@mui/material/colors';
import {Fonts} from 'shared/constants/AppEnums';
import {postDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {useIntl} from 'react-intl';

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
  const {formatMessage} = useIntl();

  const sendEmailFormClick = async () => {
    var fd = new FormData(); // To carry on your data
    fd.append('invoiceId', invoiceData._id);
    fd.append('invoiceNo', invoiceData.orderNumber);
    fd.append('email', email);
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
        infoViewActionsContext.showMessage(
          formatMessage({id: 'member.invoice.email.success'}),
        );
        setVisible(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
        },
        '& .MuiDialogContent-root': {
          overflowY: 'hidden',
          marginTop: 4,
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}
      maxWidth={'xs'}
      open={open}
      onClose={() => setVisible(false)}
    >
      <DialogContent>
        <Box sx={{borderBottom: 0, borderColor: 'divider'}}>
          {/* <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='icon label tabs example'
          variant='fullWidth'
        >
          <Tab icon={<LinkIcon />} iconPosition='start' label='Share Link' />
          <Tab icon={<EmailIcon />} iconPosition='start' label='Email Link' />
        </Tabs> */}
        </Box>

        <>
          <DialogTitle
            sx={{
              fontSize: 14,
              fontWeight: Fonts.MEDIUM,
              padding: 0, // added
            }}
            id='app-dialog-title'
          >
            <IconButton
              aria-label='close'
              sx={{
                position: 'absolute',
                right: 4,
                top: 4,
                color: 'grey.500',
              }}
              onClick={() => setVisible(false)}
              size='large'
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <AppScrollbar
            sx={{
              paddingTop: 1,
              height: '100%',
              minHeight: '300px',
              maxHeight: '400px',
              paddingRight: 6,
              paddingLeft: 6,
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column', mt: 4}}>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Avatar sx={{bgcolor: '#005446'}}>
                  <EmailIcon sx={{color: common.white}} />
                </Avatar>
              </Box>

              <Box
                component='h6'
                sx={{
                  mb: 0,
                  mt: 4,
                  fontSize: 14,
                  fontWeight: Fonts.SEMI_BOLD,
                  textAlign: 'center',
                }}
              >
                {formatMessage({id: 'member.invoice.email.title'})}
              </Box>
              <Box
                component='h2'
                sx={{
                  mb: 3,
                  mt: 5,
                  fontSize: 14,
                  fontWeight: Fonts.LIGHT,
                  textAlign: 'center',
                }}
              >
                {formatMessage({id: 'member.invoice.email.subtitle'})}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                {formatMessage(
                  {id: 'member.invoice.email.recipient'},
                  {name: memberName, phone: memberPhone},
                )}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                <TextField
                  id='filled-basic'
                  label={formatMessage({id: 'member.invoice.email.address'})}
                  value={email}
                  variant='filled'
                  fullWidth
                  onChange={(e) => setEmail(e.target.value)} // Update email state
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
                  {formatMessage({id: 'member.invoice.email.send'})}
                </Button>
              </Box>
            </Box>
          </AppScrollbar>
          <DialogActions
            sx={{justifyContent: 'center', borderTop: '1px solid #d6d6d6'}}
          >
            <Button
              color='primary'
              variant='contained'
              onClick={() => setVisible(false)}
            >
              {formatMessage({id: 'common.done'})}
            </Button>
          </DialogActions>
        </>
      </DialogContent>
    </Dialog>
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