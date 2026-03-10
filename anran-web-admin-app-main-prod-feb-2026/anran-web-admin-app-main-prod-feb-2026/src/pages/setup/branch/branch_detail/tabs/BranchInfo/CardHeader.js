import React from 'react';
import {Box} from '@mui/material';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import IntlMessages from '@anran/utility/IntlMessages';
// import {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import {RoutePermittedRole2} from 'shared/constants/AppConst';
import IconButton from '@mui/material/IconButton';
import {useAuthUser} from '@anran/utility/AuthHooks';
// import {blue} from '@mui/material/colors';

const CardHeader = (props) => {
  const {user} = useAuthUser();
  const {branch, isViewOnly, onViewOnly} = props;

  return (
    <Box
      sx={{
        py: 2,
        px: {xs: 5, lg: 8, xl: 2},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
      >
        <Box
          component='h5'
          sx={{
            pr: 2,
            mt: 0,
            mb: 0,
            fontWeight: Fonts.BOLD,
            fontSize: 16,
          }}
        >
          {isViewOnly ? (
            <>
              <IntlMessages id='anran.branchInfo' />:{' '}
              {branch.branchName.toUpperCase()}
            </>
          ) : (
            <>
              <IntlMessages id='anran.branchInfo.edit' />:{' '}
              {branch.branchName.toUpperCase()}
            </>
          )}
        </Box>

        {/* {branch.hqStatus && (
          <Box
            component='span'
            sx={{
              px: 3,
              py: 0,
              mr: 3,
              color: blue[500],
              borderRadius: '30px',
              fontSize: 12,
              fontWeight: Fonts.SEMI_BOLD,
              bgcolor: alpha(blue[500], 0.1),
            }}
          >
            {'HQ'}
          </Box>
        )} */}
      </Box>
      {user.permission.includes(RoutePermittedRole2.admin_branch_update) && (
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
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                <EditOutlined />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => onViewOnly(true)}
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                <CloseOutlinedIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CardHeader;

CardHeader.propTypes = {
  onClickDeleteIcon: PropTypes.func,
  onAddAttachments: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onViewOnly: PropTypes.func,
  branch: PropTypes.object,
};
