import React from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Zoom from '@mui/material/Zoom';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import {QRCodeSVG} from 'qrcode.react';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom in ref={ref} {...props} />;
});

const QRImageViewer = ({isOpen, data, onClose}) => {
  function handlePrint() {
    window.print();
  }
  return (
    <Dialog
      maxWidth='md'
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paperFullScreen': {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      TransitionComponent={Transition}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'rgb(49, 53, 65)',
          color: (theme) => theme.palette.common.white,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          sx={{
            color: (theme) => theme.palette.common.white,
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
          }}
          onClick={onClose}
          size='large'
        >
          <HighlightOffIcon />
        </IconButton>
        <IconButton
          sx={{
            color: (theme) => theme.palette.common.white,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1,
          }}
          onClick={handlePrint}
          size='large'
        >
          <LocalPrintshopIcon />
        </IconButton>
        <Box sx={{p: 10}}>
          <QRCodeSVG
            value={data}
            size={512}
            imageSettings={{
              src: 'http://localhost:3000/assets/anran_logo.png',
              height: 150,
              width: 150,
              excavate: false,
            }}
          />
        </Box>

        {/* <img
          src={data.document}
          alt={data.docName ? data.docName : 'detail view'}
          style={{
            width: 'auto !important',
            maxHeight: '96vh',
            height: 'auto !important',
          }}
        /> */}
      </Box>
    </Dialog>
  );
};

export default QRImageViewer;
QRImageViewer.propTypes = {
  isOpen: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
};
