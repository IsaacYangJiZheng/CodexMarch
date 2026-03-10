import React from 'react';
import PropTypes from 'prop-types';
import {Typography, FormControlLabel, Checkbox} from '@mui/material';
import Grid from '@mui/material/Grid2';

const PermissionSection = ({title, permissions, state, setState}) => {
  const handleChange = (permission) => (e) => {
    // const parts = title.split('-');
    // const roleKey = parts[0].toLowerCase() + parts.slice(1).join('');
    const roleKey = title.replace(/-/g, '_').toLowerCase();
    setState((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permission.toLowerCase()]: e.target.checked,
      },
    }));
  };

  console.log('permissions', permissions, state);

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid size={{xs: 3}}>
        <Typography variant='h4'>{title}</Typography>
      </Grid>
      {permissions.map((permission) => {
        const roleKey = title.replace(/-/g, '_').toLowerCase();
        console.log('roleKey', permission, roleKey);
        // const parts = title.split('-');
        // const roleKey = parts[0].toLowerCase() + parts.slice(1).join('');
        return (
          <Grid size={{xs: 2.25}} key={permission}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state[roleKey][permission.toLowerCase()]}
                  onChange={handleChange(permission)}
                />
              }
              label={permission}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PermissionSection;

PermissionSection.propTypes = {
  title: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
  state: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired,
};
