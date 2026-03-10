import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {Box, Card} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {Button} from 'primereact/button';
// import {Dialog} from 'primereact/dialog';
import {useGetDataApi} from '@anran/utility/APIHooks';
import 'primeicons/primeicons.css';
import InvoicePage from './invoice';
import dayjs from 'dayjs';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import AppInfoView from '@anran/core/AppInfoView';
import IntlMessages from '@anran/utility/IntlMessages';
import {Fonts} from 'shared/constants/AppEnums';
import {useIntl} from 'react-intl';

export default function PackageInfo({selectedMember}) {
  const {formatMessage} = useIntl();
  const toast = useRef(null);
  const [visible, setVisible] = React.useState(false);
  const [selectedInv, setSelectedInv] = React.useState(null);

  //   const [filters, setFilters] = useState({
  //     packageDate: {value: null, matchMode: 'contains'},
  //   });

  console.log('PackageInfo', selectedMember);

  const [{apiData: memberData, loading}] = useGetDataApi(
    `api/members/package/${selectedMember._id}`,
    //undefined,
    {},
    {},
    true,
  );

  console.log('memberData', memberData);

  // const headerElement = (
  //   <div className='inline-flex align-items-center justify-content-center gap-2'>
  //     <span className='font-bold white-space-nowrap'>Invoice</span>
  //   </div>
  // );

  // const footerContent = (
  //   <div>
  //     <Button
  //       label='Ok'
  //       icon='pi pi-check'
  //       onClick={() => setVisible(false)}
  //       autoFocus
  //     />
  //   </div>
  // );

  const invoiceBodyTemplate = (rowData) => {
    const representative = rowData.orderItem;

    return (
      <div className='flex align-items-center gap-2'>
        <span>{representative?.orderNo}</span>
        <Button
          type='button'
          icon='pi pi-external-link'
          outlined
          text
          severity='success'
          onClick={() => {
            setVisible(true);
            setSelectedInv(representative._id);
          }}
        ></Button>
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return <>{dayjs(rowData.purchaseDate).format('DD-MM-YYYY h:mm A')}</>;
  };

  return (
    <Box>
      <Toast ref={toast} />
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          {/* Header */}
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
              <IntlMessages id='anran.member.PackageInfo' />
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
              loading={loading}
              emptyMessage={formatMessage({id: 'table.empty'})}
              showGridlines
              stripedRows
            >
              <Column
                field='purchaseDate'
                header={formatMessage({id: 'table.header.date'})}
                sortable
                style={{minWidth: '12rem'}}
                body={dateBodyTemplate}
              />
              <Column
                field='firstUsedDate'
                header={formatMessage({id: 'member.package.firstUsedDate'})}
                style={{minWidth: '12rem'}}
                body={(rowData) =>
                  rowData.firstUsedDate
                    ? dayjs(rowData.firstUsedDate).format('DD-MM-YYYY h:mm A')
                    : '-'
                }
              />
              <Column
                field='validDate'
                header={formatMessage({id: 'member.package.expiryDate'})}
                style={{minWidth: '12rem'}}
                body={(rowData) =>
                  rowData.validDate
                    ? dayjs(rowData.validDate).format('DD-MM-YYYY h:mm A')
                    : '-'
                }
              />
              <Column
                field='package.packageCode'
                header={formatMessage({id: 'member.package.packageId'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='package.packageName'
                header={formatMessage({id: 'member.package.packageName'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='used'
                header={formatMessage({id: 'member.package.used'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='currentBalance'
                header={formatMessage({id: 'member.package.currentBalance'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='purchaseType'
                header={formatMessage({id: 'member.package.purchaseType'})}
                style={{minWidth: '12rem'}}
              />
              <Column
                field='orderItem.orderNo'
                header={formatMessage({id: 'member.package.invoiceNo'})}
                style={{minWidth: '12rem'}}
                body={invoiceBodyTemplate}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <AppDialog
        dividers
        fullHeight
        isDocumentView
        maxWidth='1200px'
        maxHeight='700px'
        open={visible}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setVisible(false)}
            title={formatMessage({id: 'member.invoice.title'})}
          />
        }
      >
        <InvoicePage invoiceId={selectedInv} />
      </AppDialog>
      {/* <Dialog
        visible={visible}
        modal
        header={headerElement}
        // footer={footerContent}
        style={{width: '50rem'}}
        onHide={() => {
          setSelectedInv(null);
          if (!visible) return;
          setVisible(false);
        }}
      >
        <InvoicePage invoiceId={selectedInv} />
      </Dialog> */}
      <AppInfoView />
    </Box>
  );
}

PackageInfo.propTypes = {
  selectedMember: PropTypes.object,
  rawData: PropTypes.object,
};