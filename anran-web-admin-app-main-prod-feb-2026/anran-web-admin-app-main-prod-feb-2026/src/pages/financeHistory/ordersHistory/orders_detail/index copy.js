import React from 'react';
import PropTypes from 'prop-types';
import {useGetDataApi} from '@anran/utility/APIHooks';
const OrderDetails = ({selectedRow}) => {
  const [{apiData: orderDetailData}, {setQueryParams}] = useGetDataApi(
    'api/order/detail',
    undefined,
    {id: selectedRow._id},
    true,
  );
  React.useEffect(() => {
    if (selectedRow) {
      setQueryParams({id: selectedRow._id});
    }
  }, [selectedRow]);

  console.log(orderDetailData);

  return <div>index</div>;
};

export default OrderDetails;

OrderDetails.propTypes = {
  selectedRow: PropTypes.object,
  setSelectedRow: PropTypes.func,
};
