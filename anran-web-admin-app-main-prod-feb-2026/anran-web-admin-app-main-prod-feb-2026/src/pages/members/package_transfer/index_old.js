import React, {useState} from 'react';
import {Box, Card, Typography, Button, IconButton} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import dayjs from 'dayjs';

import {useGetDataApi, postDataApi} from '@anran/utility/APIHooks';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';

import PopupColumnDialog from '../../widgets/PopupColumnDialog';
import AppConfirmDialogV2 from '@anran/core/AppConfirmDialogV2';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {Fonts} from 'shared/constants/AppEnums';

import AddNewPackageTransfer from './AddNewPackageTransfer';

const PackageTransfer = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPopupColumn, setShowPopupColumn] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);

  const [{apiData: memberPackage, loading}, {reCallAPI}] = useGetDataApi(
    'api/transfer',
    {},
    {},
    true,
  );

  const [{apiData: memberDatabase}] = useGetDataApi(
    'api/members',
    {},
    {},
    true,
  );

  const purchaseDateBodyTemplate = (rowData) => (
    <div>{dayjs(rowData.purchaseDate).format('DD-MM-YYYY')}</div>
  );

  const transferFromBodyTemplate = (rowData) => {
    return <div>{rowData.transferFrom}</div>;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Grid container spacing={2}>
        <Grid size={{xs: 6, md: 6}}>
          <IconButton
            color='error'
            onClick={() => handleOpenDeletePackageTransferDialog(rowData)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  const columns = [
    {
      field: 'purchaseDate',
      header: 'Purchase Date',
      displayOrder: 1,
      style: {width: '15rem'},
      body: purchaseDateBodyTemplate,
      sortable: true,
    },
    {
      field: 'transferFrom',
      header: 'Transfer From',
      style: {width: '14rem'},
      displayOrder: 2,
      body: transferFromBodyTemplate,
      sortable: true,
    },
    {
      field: 'member.memberFullName',
      header: 'Transfer To',
      style: {width: '14rem'},
      displayOrder: 3,
      sortable: true,
    },
    {
      field: 'package.packageName',
      header: 'Package',
      style: {width: '14rem'},
      displayOrder: 4,
      sortable: true,
    },
    {
      field: 'currentBalance',
      header: 'Current Balance',
      style: {width: '14rem'},
      displayOrder: 5,
      sortable: true,
    },
  ];

  React.useEffect(() => {
    setVisibleColumns(columns);
  }, [memberPackage]);

  const [openAddPackageTransferDialog, setOpenAddPackageTransferDialog] =
    useState(false);
  const handleOpenAddPackageTransferDialog = () => {
    setOpenAddPackageTransferDialog(true);
  };

  const handleCloseAddPackageTransferDialog = () => {
    setOpenAddPackageTransferDialog(false);
  };

  const [openDeletePackageTransferDialog, setOpenDeletePackageTransferDialog] =
    useState(false);
  const [deletingPackageTransfer, setDeletingPackageTransfer] = useState(null);
  const handleOpenDeletePackageTransferDialog = (rowData) => {
    setDeletingPackageTransfer(rowData);
    setOpenDeletePackageTransferDialog(true);
  };

  const onDeleteConfirm = () => {
    postDataApi(
      `/api/memberpackage/delete/${deletingPackageTransfer._id}`,
      infoViewActionsContext,
      false,
      false,
      {
        'Content-Type': 'multipart/form-data',
      },
    )
      .then(() => {
        reCallAPI();
        infoViewActionsContext.showMessage('Deleted successfully!');
        setOpenDeletePackageTransferDialog(false);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const handleCloseDeletePackageTransferDialog = () => {
    setDeletingPackageTransfer(null);
    setOpenDeletePackageTransferDialog(false);
  };

  console.log('selectedMember', selectedMember);

  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Box display='flex' justifyContent='space-between' mb={2}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant='h1'>Package Transfer</Typography>
                <Button
                  size='large'
                  startIcon={<ExpandMoreOutlinedIcon />}
                  onClick={() => setShowPopupColumn(true)}
                />
                <Button
                  size='large'
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={() => reCallAPI()}
                />
              </Box>
              <Button
                variant='outlined'
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAddPackageTransferDialog}
              >
                Add Package Transfer
              </Button>
            </Box>
          </Grid>
          {/* Table */}
          <Grid item size={12}>
            <DataTable
              value={memberPackage?.length > 0 ? memberPackage : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              loading={loading}
              emptyMessage='No member found.'
              selectionMode='single'
              onSelectionChange={(e) => setSelectedMember(e.value)}
              // selection={selectedProduct}
              showGridlines
              stripedRows
            >
              {visibleColumns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  showFilterMenu={col.showFilterMenu ? true : false}
                  filter={col.filter ? true : false}
                  filterElement={col.filterElement ? col.filterElement : null}
                  filterPlaceholder={
                    col.filterPlaceholder ? col.filterPlaceholder : null
                  }
                  style={col.style ? col.style : null}
                  sortable={col.sortable ? true : false}
                  body={col.body ? col.body : null}
                />
              ))}
              <Column
                body={actionBodyTemplate}
                header='Action'
                exportable={false}
                style={{maxWidth: '8rem'}}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AddNewPackageTransfer
        open={openAddPackageTransferDialog}
        onClose={handleCloseAddPackageTransferDialog}
        reCallAPI={reCallAPI}
        memberPackage={memberPackage}
        memberDatabase={memberDatabase}
      />
      <AppConfirmDialogV2
        dividers
        open={openDeletePackageTransferDialog}
        dialogTitle={'Delete Confirmation'}
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
            {'Are you sure you want to delete the record?'}
          </Typography>
        }
        onDeny={handleCloseDeletePackageTransferDialog}
        onConfirm={onDeleteConfirm}
      />
      <PopupColumnDialog
        isOpen={showPopupColumn}
        setOpenDialog={() => setShowPopupColumn(false)}
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
      />
    </Box>
  );
};

export default PackageTransfer;
