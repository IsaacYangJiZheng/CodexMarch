import React from 'react';
import {Box, alpha} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import IntlMessages from '@anran/utility/IntlMessages';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import IconButton from '@mui/material/IconButton';
import {blue} from '@mui/material/colors';
// import DeleteIcon from '@mui/icons-material/Delete';
// import DeleteMember from './DeleteMember'; // Ensure this import is correct
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2} from 'shared/constants/AppConst';

const CardHeader = (props) => {
  const {user} = useAuthUser();
  const {member, isViewOnly, onViewOnly} = props;

  // State for managing delete confirmation dialog visibility
  //   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Function to handle delete confirmation
  //   const handleDeleteClick = () => {
  //     // Open the delete confirmation dialog
  //     setOpenDeleteDialog(true);
  //   };

  // Function to confirm deletion
  //   const confirmDelete = () => {
  //     if (onDelete) {
  //       onDelete(member._id); // Pass the member ID to the delete function
  //     }
  //     setOpenDeleteDialog(false); // Close the dialog
  //   };

  // Function to cancel deletion
  //   const cancelDelete = () => {
  //     setOpenDeleteDialog(false); // Close the dialog without deleting
  //   };

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
          alignItems: 'center', // Ensure items are centered vertically
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
            <IntlMessages id='common.personalInfo' />
          ) : (
            <IntlMessages id='schoolApp.editProfile' />
          )}
        </Box>

        {member?.hqStatus && (
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
        )}
      </Box>
      {user.permission.includes(RoutePermittedRole2.member_member_update) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconButton
            onClick={() => (isViewOnly ? onViewOnly(false) : onViewOnly(true))}
            sx={{
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {isViewOnly ? <EditOutlined /> : <CloseOutlinedIcon />}
          </IconButton>
          {/* <IconButton
            color='error'
              onClick={handleDeleteClick} // Call the handler for delete
          >
            <DeleteIcon />
          </IconButton> */}
        </Box>
      )}

      {/* Confirmation Dialog for Deletion */}
      {/* <DeleteMember
        member={member}
        isOpen={openDeleteDialog}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
      /> */}
    </Box>
  );
};

export default CardHeader;

CardHeader.propTypes = {
  onDelete: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onViewOnly: PropTypes.func,
  member: PropTypes.object.isRequired,
};
