import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
// import IntlMessages from '@anran/utility/IntlMessages';
import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
// import TextField from '@mui/material/TextField';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
// import Hidden from '@mui/material/Hidden';
import {IconButton} from '@mui/material';
// import {styled} from '@mui/material/styles';
// import AppGridContainer from '@anran/core/AppGridContainer';
// import Grid from '@mui/material/Grid';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Typography from '@mui/material/Typography';
// import Card from '@mui/material/Card';
// import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useGetDataApi} from '@anran/utility/APIHooks';
import {useAuthUser} from '@anran/utility/AuthHooks';
import AddTaxRate from './AddTaxRate';
import AppInfoView from '@anran/core/AppInfoView';
import dayjs from 'dayjs';
import Alert from '@mui/material/Alert';
import {deleteDataApi} from '@anran/utility/APIHooks';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';

// const CheckedItemWrapper = styled('div')(() => {
//   return {
//     position: 'relative',
//     display: 'flex',
//     alignItems: 'center',
//     '& .icon-btn': {
//       transition: 'all 0.4s ease',
//       opacity: 0,
//       visibility: 'hidden',
//     },
//     '&:hover': {
//       '& .icon-btn': {
//         opacity: 1,
//         visibility: 'visible',
//       },
//     },
//   };
// });

const BranchTaxList = ({selectedBranch}) => {
  const {user} = useAuthUser();
  const [isAddTaxType, setAddTaxType] = React.useState(false);
  const [isEditTaxType, setEditTaxType] = React.useState(false);
  const [selectedTaxType, setSelectedTaxType] = React.useState(null);
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{apiData: taxData}, {reCallAPI}] = useGetDataApi(
    `api/tax/${selectedBranch?._id}`,
    undefined,
    {},
    true,
  );

  const onAddNewTaxType = () => {
    setAddTaxType(true);
  };

  const onEditTax = (taxType) => {
    console.log('onEditTax', taxType);
    setEditTaxType(true);
    setSelectedTaxType(taxType);
  };

  const onDeleteTax = (taxType) => {
    console.log('onDeleteTax', taxType);
    deleteDataApi(`/api/tax/${taxType}`, infoViewActionsContext, false, false, {
      'Content-Type': 'multipart/form-data',
    })
      .then(() => {
        reCallAPI();

        infoViewActionsContext.showMessage('Delete successfully!');
      })
      .catch((error) => {
        console.log(error);

        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <Box
      sx={{
        mb: 2,
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box component='h4'>Tax Rate Setting</Box>
        <Box
          sx={{
            ml: 'auto',
            pl: 2,
          }}
        >
          <Button
            variant='outlined'
            sx={{
              textTransform: 'capitalize',
              px: 4,
            }}
            onClick={() => onAddNewTaxType()}
          >
            Add
          </Button>
        </Box>
      </Box>
      {!selectedBranch?.hqStatus && (
        <Box>
          {taxData?.isHQData ? (
            <Alert
              sx={{backgroundColor: '#fdeded', mb: 2, fontWeight: 'bold'}}
              variant='outlined'
              severity='warning'
              color='warning'
            >
              By default this branch following HQ branch Setting. Only
              administrator and above can setup branch level setup
            </Alert>
          ) : (
            <Alert
              sx={{backgroundColor: '#fdeded', mb: 2, fontWeight: 'bold'}}
              variant='outlined'
              severity='warning'
              color='warning'
            >
              This branch following Own branch Setting
            </Alert>
          )}
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label='simple table' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Date Added</TableCell>
              <TableCell>Tax Category</TableCell>
              <TableCell>Tax Code</TableCell>
              <TableCell>Tax Rate (%)</TableCell>
              <TableCell>Effective From </TableCell>
              <TableCell>Until </TableCell>
              {(user.role == 'admin' ||
                user.role == 'management' ||
                user.role == 'supervisor') && (
                <TableCell align='center'>Action</TableCell>
              )}
            </TableRow>
          </TableHead>
          {taxData?.length > 0 && (
            <TableBody>
              {taxData?.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
                >
                  <TableCell component='th' scope='row'>
                    {dayjs(row.createdAt).format('DD-MM-YYYY')}
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.taxType}</TableCell>
                  <TableCell>{row.taxValue}</TableCell>
                  <TableCell>
                    {dayjs(row.effectiveDate).format('DD-MM-YYYY')}
                  </TableCell>
                  <TableCell>
                    {row.closeDate
                      ? dayjs(row.closeDate).format('DD-MM-YYYY')
                      : '-'}
                  </TableCell>
                  {(user.role == 'admin' ||
                    user.role == 'management' ||
                    user.role == 'supervisor') && (
                    <TableCell align='center'>
                      <Box
                        component='span'
                        sx={{
                          mb: 4,
                          ml: 3,
                        }}
                      >
                        {dayjs().isBefore(dayjs(row.effectiveDate)) && (
                          <IconButton
                            className='icon-btn'
                            onClick={() => onEditTax(row)}
                          >
                            <EditOutlined />
                          </IconButton>
                        )}

                        <IconButton
                          className='icon-btn'
                          onClick={() => onDeleteTax(row._id)}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <AddTaxRate
        isAddTaxType={isAddTaxType}
        handleAddTaxTypeClose={() => setAddTaxType(false)}
        reCallAPI={reCallAPI}
        selectedBranch={selectedBranch}
      />
      <AddTaxRate
        isAddTaxType={isEditTaxType}
        handleAddTaxTypeClose={() => setEditTaxType(false)}
        selectedTaxType={selectedTaxType}
        reCallAPI={reCallAPI}
        selectedBranch={selectedBranch}
      />
      <AppInfoView />
    </Box>
  );
};

export default BranchTaxList;

BranchTaxList.propTypes = {
  selectedBranch: PropTypes.object.isRequired,
};
