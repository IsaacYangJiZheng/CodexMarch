import React from 'react';
// import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import {Typography} from '@mui/material';
import {Fonts} from 'shared/constants/AppEnums';
import PropTypes from 'prop-types';
import SelectTasksDropdown from './SelectRoomDropdown';
import {useUserBranch, useUserBranchMethod} from '@anran/utility/AuthHooks';

const AppBranchSelect = (props) => {
  const {checkedBranch} = props;

  // const branchList = useSelector(({schoolApp}) => schoolApp.branchList);
  const {branches, selectedBranch} = useUserBranch();
  const {markSelectedBranch} = useUserBranchMethod();
  console.log('branches:', branches);
  console.log('selectedBranch:', selectedBranch);

  const onSelectBranch = (value) => {
    // setCheckedBranch(
    //   branches
    //     .filter((branch) => branch.id == value)
    //     .map((branch) => branch.id),
    // );
    markSelectedBranch(branches, value);
    console.log('checkedBranch:', checkedBranch);
  };

  if (branches == null) {
    return <></>;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flex: 2,
          alignItems: 'center',
        }}
      >
        <span>
          {' '}
          <Typography
            sx={{
              fontWeight: Fonts.BOLD,
              fontSize: 15,
              mb: 0,
            }}
          >
            {' '}
            Viewing Branch :
          </Typography>{' '}
        </span>
        {branches.length > 0 ? (
          <SelectTasksDropdown
            items={branches}
            seletedItem={selectedBranch}
            onSelectBranch={onSelectBranch}
          />
        ) : null}
      </Box>
    </>
  );
};

export default AppBranchSelect;

AppBranchSelect.defaultProps = {
  checkedBranch: [],
};

AppBranchSelect.propTypes = {
  checkedBranch: PropTypes.array,
};
