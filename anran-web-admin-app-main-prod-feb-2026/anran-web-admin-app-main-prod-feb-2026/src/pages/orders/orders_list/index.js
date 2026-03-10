import React from 'react';
import AppAnimate from '@anran/core/AppAnimate';
// import {MailDetailSkeleton} from '@anran/core/AppSkeleton/MailDetailSkeleton';
import {useGetDataApi} from '@anran/utility/APIHooks';
import AppsHeaderWithImage from '@anran/core/AppsContainer/AppsHeaderWithImage';
import OrderTabsHeader from './OrderTabsHeader';
import OnlinePurchase from './tabs/online';
import OfflinePurchase from './tabs/offline';
import {useAuthUser} from '@anran/utility/AuthHooks';
import AppInfoView from '@anran/core/AppInfoView';
import {Card} from '@mui/material';
import AppScrollbar from '@anran/core/AppScrollbar';
import AddOfflineOrder from './tabs/offline/AddOfflineOrder';
import OrdersDetail from '../invoice';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import { useLocation } from 'react-router-dom';

const PurchaseOrderList = () => {
  const {user} = useAuthUser();
  const infoViewActionsContext = useInfoViewActionsContext();
  const location = useLocation();
  console.log('useAuthUser:', user);
  const [mainTabValue, setMainTabValue] = React.useState(0);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [filteredData, setFilteredData] = React.useState(null);
  // const [branchOptions, setBranchOptions] = React.useState([]);

  const [{apiData: branchData}] = useGetDataApi(
    'api/branch/role-based',
    {},
    {},
    true,
  );

  const [
    {apiData: onlineOrdersData, loading: loading2},
    {reCallAPI: reCallAPI2},
  ] = useGetDataApi('api/order/online/v2', {}, {}, true);

  const onMainTabsChange = (newValue) => {
    setMainTabValue(newValue);
  };

  const onAddButtonClick = () => {
    setAddDialogOpen(true);
  };

  // const onAddDepositClick = () => {
  //   setAddDepositDialogOpen(true);
  // }
  const onAddButtonClick2 = () => {
    console.log('onAddButtonClick2');
    fetchData();
  };

  const fetchData = async () => {
    try {
      const response = await postDataApi(
        '/api/order/findAllv2/today',
        infoViewActionsContext,
        {},
        false,
        false,
      );
      setFilteredData(response);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    if (location.state?.openAddOfflineOrder) {
      setAddDialogOpen(true);
    }
  }, [location.state]);

  return (
    <>
      <Card sx={{mt: 2, p: 5}}>
        <AppsHeaderWithImage>
          <OrderTabsHeader
            mainTabValue={mainTabValue}
            setMainTabValue={onMainTabsChange}
            onAddButtonClick={onAddButtonClick}
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
                      reCallAPI={fetchData}
                      ordersData={filteredData}
                      setFilteredData={setFilteredData}
                      branchOptions={branchData?.length > 0 ? branchData : []}
                      // branchOptions={branchOptions}
                      user={user}
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
                      reCallAPI={reCallAPI2}
                      loading={loading2}
                      ordersData={onlineOrdersData}
                      branchOptions={branchData?.length > 0 ? branchData : []}
                    />
                  </Card>
                </>
              )}
            </>
          </AppAnimate>
        </AppScrollbar>
        {addDialogOpen ? (
          <AddOfflineOrder
            isOpen={addDialogOpen}
            setOpenDialog={setAddDialogOpen}
            setMainTabValue={setMainTabValue}
            ordersData={filteredData}
            reCallAPI={onAddButtonClick2}
          />
        ) : null}
        <AppInfoView />
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
              title={'Invoice'}
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
