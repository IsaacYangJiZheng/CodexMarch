import React from 'react';
import {Box} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PropTypes from 'prop-types';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';

const TransferOut = ({transferData, loading, dateBodyTemplate}) => {
  const {formatMessage} = useIntl();
  const transferFromBodyTemplate = (rowData) => {
    return (
      <div>{`${rowData.memberTo.memberFullName} - ${rowData.memberTo.mobileNumber}`}</div>
    );
  };
  return (
    <Grid container spacing={2}>
      {/* Transfer Out Header */}
      <Grid size={12}>
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
          <IntlMessages id='anran.member.TransferOut' />
        </Box>
      </Grid>
      {/* Transfer Out DataTable */}
      <Grid size={12}>
        <DataTable
          value={
            transferData?.transferOut?.length > 0
              ? transferData.transferOut
              : []
          }
          paginator
          rows={10}
          size='small'
          dataKey='id'
          loading={loading}
          emptyMessage={formatMessage({id: 'table.empty'})}
          showGridlines
          stripedRows
        >
          <Column
            field='transferDate'
            header={formatMessage({id: 'table.header.date'})}
            sortable
            style={{minWidth: '12rem'}}
            body={dateBodyTemplate}
          />
          <Column
            field='transactionNo'
            header={formatMessage({id: 'member.transfer.transferId'})}
            style={{minWidth: '12rem'}}
          />
          <Column
            field='originalPurchaseInvoice'
            header={formatMessage({id: 'member.transfer.purchaseInvoice'})}
            style={{minWidth: '12rem'}}
          />
          <Column
            field='memberTo.memberFullName'
            header={formatMessage({id: 'member.transfer.toMember'})}
            style={{minWidth: '12rem'}}
            body={transferFromBodyTemplate}
          />
          <Column
            field='fromMemberPackage.package.packageCode'
            header={formatMessage({id: 'member.transfer.packageCode'})}
            style={{minWidth: '12rem'}}
          />
          <Column
            field='fromMemberPackage.package.packageName'
            header={formatMessage({id: 'member.transfer.package'})}
            style={{minWidth: '12rem'}}
          />
          <Column
            field='transferSessionCount'
            header={formatMessage({id: 'member.transfer.sessionCount'})}
            style={{minWidth: '12rem'}}
          />
        </DataTable>
      </Grid>
    </Grid>
  );
};

export default TransferOut;

TransferOut.propTypes = {
  transferData: PropTypes.object,
  loading: PropTypes.func,
  dateBodyTemplate: PropTypes.func,
};