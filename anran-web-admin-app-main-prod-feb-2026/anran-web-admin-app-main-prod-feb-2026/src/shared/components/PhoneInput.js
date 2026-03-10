import {forwardRef} from 'react';
import TextField from '@mui/material/TextField';
import {makeStyles} from '@mui/styles';
import {useField} from 'formik';

const useStyles = makeStyles(() => ({
  input: {
    backgroundColor: '#fff',
  },
}));

const phoneInput = (props, ref) => {
  const classes = useStyles();
  const [field, meta] = useField(props);
  const errorText = meta.error ? meta.error : '';
  return (
    <TextField
      {...props}
      {...field}
      InputProps={{
        className: classes.input,
      }}
      inputRef={ref}
      fullWidth
      //   size='small'
      label='Phone Number'
      variant='outlined'
      type='tel'
      //   name='phone'
      helperText={errorText}
      error={!!errorText}
    />
  );
};
export default forwardRef(phoneInput);
