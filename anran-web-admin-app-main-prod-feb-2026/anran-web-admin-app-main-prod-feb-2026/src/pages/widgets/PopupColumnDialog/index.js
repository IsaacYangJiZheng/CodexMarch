import React from 'react';
import PropTypes from 'prop-types';
import {Box, Button} from '@mui/material';
import CardHeader from './CardHeader';
import AppDialog from '@anran/core/AppDialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Checkbox from '@mui/material/Checkbox';
import IntlMessages from '@anran/utility/IntlMessages';

const PopupColumnDialog = ({
  isOpen,
  setOpenDialog,
  columns,
  visibleColumns,
  setVisibleColumns,
}) => {
  const [checked, setChecked] = React.useState([]);

  React.useEffect(() => {
    setChecked(visibleColumns);
  }, [visibleColumns]);

  const handleToggle = (value) => () => {
    // const currentIndex = visibleColumns.indexOf(value);
    // const newChecked = [...visibleColumns];

    // if (currentIndex === -1) {
    //   newChecked.push(value);
    // } else {
    //   newChecked.splice(currentIndex, 1);
    // }

    // setVisibleColumns(newChecked);

    // if (visibleColumns.some((item) => item.field == value.field)) {
    //   setChecked(checked.filter((item) => item.field !== value.field));
    // setVisibleColumns(
    //   visibleColumns.filter((item) => item.field !== value.field),
    // );
    // } else {
    //   setChecked(checked.concat(value));
    // setVisibleColumns(visibleColumns.concat(value));
    // }
    let newChecked;

    if (checked.some((item) => item.field === value.field)) {
      newChecked = checked.filter((item) => item.field !== value.field);
    } else {
      newChecked = checked.concat(value);
    }
    setChecked(newChecked);
  };

  const onApplyClick = () => {
    if (checked.length > 0) {
      checked.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    setVisibleColumns(checked);
    setOpenDialog(false);
  };

  console.log('visibleColumns', visibleColumns);

  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='xs'
        open={isOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => setOpenDialog(false)}
            title={<IntlMessages id='common.columnSelection' />}
          />
        }
      >
        <List
          sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
          subheader={
            <ListSubheader component='div' id='nested-list-subheader'>
              <IntlMessages id='common.columnSelectionDescription' />
            </ListSubheader>
          }
        >
          {columns.map((value) => {
            const labelId = `checkbox-list-label-${value.field}`;

            return (
              <ListItem key={value.field} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(value)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge='start'
                      checked={
                        checked.some((item) => item.field == value.field)
                          ? true
                          : false
                      }
                      tabIndex={-1}
                      disableRipple
                      inputProps={{'aria-labelledby': labelId}}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={value.header} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button
            sx={{
              position: 'relative',
              minWidth: 100,
            }}
            color='primary'
            variant='contained'
            type='button'
            onClick={onApplyClick}
          >
            <IntlMessages id='common.apply' />
          </Button>
        </Box>
      </AppDialog>
    </Box>
  );
};

export default PopupColumnDialog;

PopupColumnDialog.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  columns: PropTypes.array,
  visibleColumns: PropTypes.array,
  setVisibleColumns: PropTypes.func,
};
