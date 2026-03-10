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

  //   const [filters, setFilters] = useState({
  //     packageDate: {value: null, matchMode: 'contains'},
  //   });

  console.log('VoucherInfo', selectedMember);

  const [{apiData: memberData, loading}] = useGetDataApi(
    `api/members/voucher/${selectedMember._id}`,
    //undefined,
    {},
    {},
    true,
  );

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
    return <>{dayjs(rowData.issuedDate).format('DD-MM-YYYY h:mm A')}</>;
  };
  const exDateBodyTemplate = (rowData) => {
    return <>{dayjs(rowData.validDate).format('DD-MM-YYYY h:mm A')}</>;
  };
  const usedDateBodyTemplate = (rowData) => {
    if (rowData.usedDate) {
      return <>{dayjs(rowData.usedDate).format('DD-MM-YYYY h:mm A')}</>;
    }
    return <></>;
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
              <IntlMessages id='anran.member.VoucherInfo' />
            </Box>
          </Grid>

          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={memberData?.length > 0 ? memberData : []}
              paginator
              rows={10}
              size='small'
              dataKey='id'
              //   filters={filters}
              filterDisplay='row'
              loading={loading}
              emptyMessage={formatMessage({id: 'table.empty'})}
              showGridlines
              stripedRows
            >
              <Column
                field='voucher.voucherCode'
                header={formatMessage({id: 'member.voucher.code'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='voucher.voucherName'
                header={formatMessage({id: 'member.voucher.name'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='issuedDate'
                header={formatMessage({id: 'member.voucher.issuedDate'})}
                sortable
                style={{minWidth: '12rem'}}
                body={dateBodyTemplate}
              />
              <Column
                field='used'
                header={formatMessage({id: 'member.voucher.used'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='usedDate'
                header={formatMessage({id: 'member.voucher.usedDate'})}
                sortable
                style={{minWidth: '12rem'}}
                body={usedDateBodyTemplate}
              />
              <Column
                field='validDate'
                header={formatMessage({id: 'member.voucher.expiryDate'})}
                style={{minWidth: '12rem'}}
                body={exDateBodyTemplate}
              />
              <Column
                field='isExpired'
                header={formatMessage({id: 'member.voucher.isExpired'})}
                style={{minWidth: '12rem'}}
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