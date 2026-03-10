import React from 'react';
import AppAnimate from '@anran/core/AppAnimate';
import {useGetDataApi} from '@anran/utility/APIHooks';
import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import OrderTabsHeader from './OrderTabsHeader';
import OnlinePurchase from './tabs/online';
import OfflinePurchase from './tabs/offline';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {Card} from '@mui/material';
import AppScrollbar from '@anran/core/AppScrollbar';
import OrdersDetail from '../invoice';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import AddCustomDateOfflineOrder from './tabs/offline/AddCustomDateOfflineOrder';
import {useIntl} from 'react-intl';

const PurchaseOrderList = () => {
  const {user} = useAuthUser();
  const {formatMessage} = useIntl();
  console.log('useAuthUser:', user);
  const [mainTabValue, setMainTabValue] = React.useState(0);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [customDateSaleDialogOpen, setCustomDateSaleDialogOpen] = React.useState(false);

  const [{apiData: branchData}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const onMainTabsChange = (newValue) => {
    setMainTabValue(newValue);
  };

  const onCustomDateSaleClick = () => {
    setCustomDateSaleDialogOpen(true);
  };

  return (
    <>
      <Card sx={{mt: 2, p: 5}}>
        <AppsHeaderWithImage>
          <OrderTabsHeader
            mainTabValue={mainTabValue}
            setMainTabValue={onMainTabsChange}
            onCustomDateSaleClick={onCustomDateSaleClick}
          />
        </AppsHeaderWithImage>
        <AppScrollbar
          sx={{
            height: {xs: 'calc(100% - 96px)', sm: 'calc(100% - 110px)'},
          }}
        >
          <AppAnimate animation='transition.slideUpIn' delay={200}>
            <>
              {mainTabValue === 0 && (
                <>
                  <Card sx={{mt: 2, p: 5}}>
                    <OfflinePurchase
                      setSelectedRow={setSelectedRow}
                      setVisible={setVisible}
                      branchOptions={branchData?.length > 0 ? branchData : []}
                    />
                  </Card>
                </>
              )}
              {mainTabValue === 1 && (
                <>
                  <Card sx={{mt: 2, p: 5}}>
                    <OnlinePurchase
                      setVisible={setVisible}
                      setSelectedRow={setSelectedRow}
                      branchOptions={branchData?.length > 0 ? branchData : []}
                    />
                  </Card>
                </>
              )}
            </>
          </AppAnimate>
        </AppScrollbar>
        {customDateSaleDialogOpen ? (
          <AddCustomDateOfflineOrder
            isOpen={customDateSaleDialogOpen}
            setOpenDialog={setCustomDateSaleDialogOpen}
            setMainTabValue={setMainTabValue}
          />
        ) : null}
      </Card>
      {visible ? (
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
              onCloseAddCard={() => {
                setVisible(false);
                setSelectedRow(null);
              }}
              title={formatMessage({id: 'member.invoice.title'})}
            />
          }
        >
          <OrdersDetail
            invoiceData={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        </AppDialog>
      ) : (
        <></>
      )}
    </>
  );
};

export default PurchaseOrderList;