import React from 'react';
import Box from '@mui/material/Box';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// import IntlMessages from '@anran/utility/IntlMessages';
// import {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import IconButton from '@mui/material/IconButton';
import EditOutlined from '@mui/icons-material/EditOutlined';

const CardHeader = (props) => {
  const {onCloseAddCard, title, isViewOnly, onViewOnly} = props;

  return (
    <Box
      sx={{
        py: 2,
        px: {xs: 5, lg: 8, xl: 10},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.primary.main,
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
        {title}
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
          {isViewOnly ? (
            <IconButton
              onClick={() => onViewOnly(false)}
              sx={{
                color: (theme) => theme.palette.primary.contrastText,
              }}
            >
              <EditOutlined />
            </IconButton>
          ) : null}
          <IconButton
            onClick={() => onCloseAddCard()}
            sx={{
              color: (theme) => theme.palette.primary.contrastText,
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CardHeader;

CardHeader.propTypes = {
  onClickDeleteIcon: PropTypes.func,
  onAddAttachments: PropTypes.func,
  onCloseAddCard: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  isViewOnly: PropTypes.bool,
  onViewOnly: PropTypes.func,
};
