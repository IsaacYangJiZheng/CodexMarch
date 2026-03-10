import {alpha, Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import Select from '@mui/material/Select';

export const StyledSelect = styled(Select)(({theme}) => ({
  cursor: 'pointer',
  width: 'auto',
  '& .MuiOutlinedInput-input': {
    paddingBottom: 1,
    paddingTop: 1,
  },
  '& .MuiSelect-select': {
    paddingLeft: 10,
    '&:focus': {
      backgroundColor: 'transparent',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '&:hover': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
  },
  '&.Mui-focused': {
    backgroundColor: alpha(theme.palette.common.black, 0.03),
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
  },
}));

export const StyledBox = styled(Box)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    paddingLeft: 10,
    paddingRight: 10,
  },
}));
