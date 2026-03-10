import React, {useState, useEffect} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';
import * as XLSX from 'xlsx';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';

const ReportTable = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch', {}, {}, true);

  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      setBranchOptions(opt);
    }
  }, [branchDatabase]);

  const handleClickSubmit = async () => {
    if (selectedBranch && selectedStartDate && selectedEndDate) {
      console.log(selectedBranch, selectedStartDate, selectedEndDate);
      const formData = new FormData();
      formData.append('selectedBranch', selectedBranch);
      formData.append('selectedStartDate', dayjs(selectedStartDate).format('YYYY-MM-DD'));
      formData.append('selectedEndDate', dayjs(selectedEndDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          'api/report2/daily-category-sales',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  const exportToExcel = () => {
    const tableData = filteredData.map((item) => ({
      Category: item._id.packageCategory || 'N/A',
      Branch: item._id.branchName || 'Unknown Branch',
      Quantity: `RM${item.orderTotalAmount?.toFixed(2) || '0.00'}`,
      Tax: `RM${item.orderTotalTaxValue?.toFixed(2) || '0.00'}`,
      'Total Sales': `RM${item.orderTotalNetAmount?.toFixed(2) || '0.00'}`,
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (exportFile = false) => {
    setOpen(false);
    if (exportFile && fileName) {
      exportToExcel();
    }
  };

  const headerTemplate = (data) => {
    return (
      <Box alignItems='center'>
        <Typography variant='h4' sx={{fontWeight: 'bold'}}>
          {data._id.branchName}
        </Typography>
      </Box>
    );
  };

  const footerTemplate = (data) => {
    return (
      <td colSpan='5'>
        <Box display='flex' justifyContent='flex-end'>
          <Typography variant='h5' sx={{fontWeight: 'bold'}}>
            Total Sales: {calculateBranchTotal(data._id.branchId)}
          </Typography>
        </Box>
      </td>
    );
  };

  const calculateBranchTotal = (branchId) => {
    let total = 0;
    if (filteredData) {
      for (let data of filteredData) {
        if (data._id.branchId === branchId) {
          total += data.orderTotalNetAmount;
        }
      }
    }
    return total;
  };

  const formatCurrency = (value) => {
    if (value || value === 0) {
      const formattedValue = parseFloat(value).toFixed(2);
      return `RM${formattedValue}`;
    }
    return 'RM0.00';
  };

  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid size={12}>
            <Box display='flex' justifyContent='space-between' mb={2}>
              <Typography variant='h1'>Category Sales Report</Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={handleClickOpen}
                disabled={!filteredData}
              >
                Export to Excel
              </Button>
            </Box>
          </Grid>
          <Grid size={3}>
            <FormControl fullWidth margin='dense'>
              <Autocomplete
                multiple
                id='branch-autocomplete'
                options={branchOptions}
                getOptionLabel={(option) => option.branch || ''}
                value={
                  Array.isArray(selectedBranch)
                    ? branchOptions.filter((branch) =>
                        selectedBranch.includes(branch._id),
                      )
                    : []
                }
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) => {
                    const optionName = option.branch || '';
                    return optionName
                      .toLowerCase()
                      .includes(params.inputValue.toLowerCase());
                  });
                  return filtered;
                }}
                onChange={(event, value) => {
                  const branchIds = value.map((branch) => branch._id);
                  setSelectedBranch(branchIds);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    label={<IntlMessages id='common.selectBranches' />}
                    fullWidth
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={3}>
            <DatePicker
              sx={{width: '100%'}}
              variant='outlined'
              label='From Date'
              name='fromDate'
              value={selectedStartDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={(value) => setSelectedStartDate(value)}
              slotProps={{
                textField: {
                  margin: 'dense',
                },
              }}
              maxDate={dayjs().subtract(1, 'day').endOf('day')}
              format='DD/MM/YYYY'
            />
          </Grid>
          <Grid size={3}>
            <DatePicker
              sx={{width: '100%'}}
              variant='outlined'
              label='To Date'
              name='toDate'
              value={selectedEndDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={(value) => setSelectedEndDate(value)}
              slotProps={{
                textField: {
                  margin: 'dense',
                },
              }}
              maxDate={dayjs().subtract(1, 'day').endOf('day')}
              format='DD/MM/YYYY'
            />
          </Grid>
          <Grid size={1.5} sx={{marginLeft: 'auto'}}>
            <Button
              sx={{
                height: '54px',
                width: '100%',
                marginTop: '8px',
              }}
              variant='outlined'
              color='primary'
              onClick={handleClickSubmit}
              disabled={
                !selectedBranch || !selectedStartDate || !selectedEndDate
              }
            >
              Submit Filter
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={filteredData}
              rowGroupMode='subheader'
              groupRowsBy='_id.branchName'
              sortMode='single'
              sortField='_id.branchName'
              sortOrder={1}
              scrollable
              rowGroupHeaderTemplate={headerTemplate}
              rowGroupFooterTemplate={footerTemplate}
              tableStyle={{minWidth: '50rem'}}
              showGridlines
              stripedRows
            >
              <Column
                field='_id.packageCategory'
                header='Category'
                style={{minWidth: '200px'}}
              />
              <Column
                field='_id.date'
                header='Date'
                style={{minWidth: '200px'}}
              />
              <Column
                field='orderTotalAmount'
                header='Total Amount'
                style={{minWidth: '200px'}}
                body={(data) => formatCurrency(data.orderTotalAmount)}
              />
              <Column
                field='orderTotalTaxValue'
                header='Tax'
                style={{minWidth: '200px'}}
                body={(data) => formatCurrency(data.orderTotalTaxValue)}
              />
              <Column
                field='orderTotalNetAmount'
                header='Net Amount'
                style={{minWidth: '200px'}}
                body={(data) => formatCurrency(data.orderTotalNetAmount)}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>

      {/* Dialog for file name input */}
      <Dialog open={open} onClose={() => handleClose(false)}>
        <DialogTitle>Enter File Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the desired file name for the Excel file.
          </DialogContentText>
          <TextField
            autoFocus
            margin='dense'
            label='File Name'
            fullWidth
            variant='outlined'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)} // Update file name state
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={() => handleClose(true)} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CategorySalesReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default CategorySalesReportTable;
