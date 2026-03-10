import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Box, Card} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {useGetDataApi} from '@anran/utility/APIHooks';
import 'primeicons/primeicons.css';
// import InvoicePage from '../../../../../orders/invoice';
import dayjs from 'dayjs';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';

export default function VoucherInfo({selectedMember}) {
  const {formatMessage} = useIntl();
  const toast = useRef(null);
  const [visible, setVisible] = React.useState(false);

  console.log('Member Deposits', selectedMember);

  const [{apiData: memberData, loading}] = useGetDataApi(
    `api/memberDeposit/depositRecord/${selectedMember._id}`,
    //undefined,
    {},
    {},
    true,
  );

  console.log('Member Data', memberData);

  const headerElement = (
    <div className='inline-flex align-items-center justify-content-center gap-2'>
      <span className='font-bold white-space-nowrap'>
        {formatMessage({id: 'member.invoice.title'})}
      </span>
    </div>
  );

  const footerContent = (
    <div>
      <Button
        label={formatMessage({id: 'common.ok'})}
        icon='pi pi-check'
        onClick={() => setVisible(false)}
        autoFocus
      />
    </div>
  );

  const dateBodyTemplate = (rowData) => {
    return <>{dayjs(rowData.payDate).format('DD-MM-YYYY h:mm A')}</>;
  };

  const payAmountBodyTemplate = (rowData) => {
    return `RM ${parseFloat(rowData.payAmount).toFixed(2)}`;
  };

  return (
    <Box>
      <Toast ref={toast} />
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
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
              <IntlMessages id='anran.member.MemberDeposits' />
            </Box>
          </Grid>

          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={
                memberData?.deposits?.length > 0 ? memberData.deposits : []
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
                field='depositNumber'
                header={formatMessage({id: 'member.deposit.number'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='branch.branchName'
                header={formatMessage({id: 'member.deposit.branch'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='payDate'
                header={formatMessage({id: 'member.deposit.date'})}
                sortable
                style={{minWidth: '12rem'}}
                body={dateBodyTemplate}
              />
              <Column
                field='payMethod'
                header={formatMessage({id: 'member.deposit.payMethod'})}
                sortable
                style={{minWidth: '12rem'}}
              />
              <Column
                field='payAmount'
                header={formatMessage({id: 'member.deposit.amount'})}
                style={{minWidth: '12rem'}}
                body={payAmountBodyTemplate}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <Dialog
        visible={visible}
        modal
        header={headerElement}
        footer={footerContent}
        style={{width: '50rem'}}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        {/* <InvoicePage /> */}
      </Dialog>
    </Box>
  );
}

VoucherInfo.propTypes = {
  selectedMember: PropTypes.object,
  rawData: PropTypes.object,
};