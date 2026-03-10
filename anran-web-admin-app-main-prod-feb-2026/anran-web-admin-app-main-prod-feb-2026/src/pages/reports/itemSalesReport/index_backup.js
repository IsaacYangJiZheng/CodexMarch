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
  Select,
  MenuItem,
  InputLabel,
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
  const [packageCategoryOptions, setPackageCategoryOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedPackageCategory, setSelectedPackageCategory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch', {}, {}, true);
  const [{apiData: packageDatabase}] = useGetDataApi(
    'api/package',
    {},
    {},
    true,
  );

  useEffect(() => {
    if (packageDatabase?.length > 0) {
      const uniquePackageCategories = [
        ...new Set(packageDatabase.map((pkg) => pkg.packageCategory)),
      ];
      const opt = uniquePackageCategories.map((category) => ({
        packageCategory: category,
      }));
      setPackageCategoryOptions(opt);
    }
  }, [packageDatabase]);

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
    if (selectedBranch && selectedDate) {
      console.log(selectedBranch, selectedDate);
      const formData = new FormData();
      formData.append('selectedBranch', selectedBranch);
      formData.append('selectedPackageCategory', selectedPackageCategory);
      formData.append('selectedDate', dayjs(selectedDate).format('YYYY-MM-DD'));
      try {
        const response = await postDataApi(
          'api/report2/daily-category-item-sales',
          infoViewActionsContext,
          formData,
          false,
          false,
          {
            'Content-Type': 'multipart/form-data',
          },
        );
        setFilteredData(response);
        console.log(filteredData);
        console.log('response', response);
      } catch (error) {
        infoViewActionsContext.fetchError(error.message);
      }
    }
  };

  const exportToExcel = () => {
    const tableData = [
      // First row for the column headers
      [
        'Category',
        'Package',
        'Quantity',
        'Total Amount',
        'Discount Amount',
        'Tax',
        'Net Amount',
      ],

      // Add the data rows based on the filteredData
      ...filteredData.map((item) => [
        item._id.packageCategory, // Category
        item._id.packageName, // Package Name
        item.orderTotalQuantity, // Quantity
        `RM${item.orderTotalAmount.toFixed(2)}`, // Total Amount
        `RM${item.orderTotalDiscountAmount.toFixed(2)}`, // Discount Amount
        `RM${item.orderTotalTaxAmount.toFixed(2)}`, // Tax
        `RM${item.orderTotalNetAmount.toFixed(2)}`, // Net Amount
      ]),

      // Add the total sales row (based on the sum of net amounts)
      [
        'Total Sales',
        '',
        '',
        '',
        '',
        '',
        `RM${filteredData.reduce((total, item) => total + item.orderTotalNetAmount, 0).toFixed(2)}`,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(tableData);
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
          {data._id.packageCategory}
        </Typography>
      </Box>
    );
  };

  const footerTemplate = (data) => {
    return (
      <td colSpan='6'>
        <Box display='flex' justifyContent='flex-end'>
          <Typography variant='h5' sx={{fontWeight: 'bold'}}>
            Total Sales: RM {calculateCategoryTotal(data._id.packageCategory)}
          </Typography>
        </Box>
      </td>
    );
  };

  const calculateCategoryTotal = (packageCategory) => {
    let total = 0;
    if (filteredData) {
      for (let data of filteredData) {
        if (data._id.packageCategory === packageCategory) {
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
              <Typography variant='h1'>Item Sales Report</Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={handleClickOpen}
              >
                Export to Excel
              </Button>
            </Box>
          </Grid>
          <Grid size={3}>
            <FormControl fullWidth margin='dense'>
              <InputLabel>Select Branch</InputLabel>
              <Select
                name='branch'
                label='Select Branch'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
              >
                {branchOptions.map((branch) => (
                  <MenuItem key={branch._id} value={branch._id}>
                    {branch.branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={3}>
            <FormControl fullWidth margin='dense'>
              <Autocomplete
                multiple
                id='branch-autocomplete'
                options={packageCategoryOptions}
                getOptionLabel={(option) => option.packageCategory || ''}
                value={
                  Array.isArray(selectedPackageCategory)
                    ? packageCategoryOptions.filter((pkg) =>
                        selectedPackageCategory.includes(pkg.packageCategory),
                      )
                    : []
                }
                isOptionEqualToValue={(option, value) =>
                  option.packageCategory === value.packageCategory
                }
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) => {
                    const optionName = option.packageCategory || '';
                    return optionName
                      .toLowerCase()
                      .includes(params.inputValue.toLowerCase());
                  });
                  return filtered;
                }}
                onChange={(event, value) => {
                  const selectedCategories = value.map(
                    (pkg) => pkg.packageCategory,
                  );
                  setSelectedPackageCategory(selectedCategories);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    label={<IntlMessages id='common.selectPackageCategories' />}
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
              label='Purchase Date'
              name='purchasedate'
              value={selectedDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={(value) => setSelectedDate(value)}
              slotProps={{
                textField: {
                  margin: 'dense',
                },
              }}
              maxDate={dayjs().subtract(1, 'day').endOf('day')}
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
              disabled={!selectedBranch || !selectedDate}
            >
              Submit Filter
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={filteredData}
              rowGroupMode='subheader'
              groupRowsBy='_id.packageCategory'
              sortMode='single'
              sortField='_id.packageCategory'
              sortOrder={1}
              scrollable
              scrollHeight='400px'
              rowGroupHeaderTemplate={headerTemplate}
              rowGroupFooterTemplate={footerTemplate}
              tableStyle={{minWidth: '50rem'}}
              showGridlines
              stripedRows
            >
              <Column
                field='_id.packageName'
                header='Package Name'
                style={{minWidth: '200px'}}
              />
              <Column
                field='orderTotalQuantity'
                header='Quantity'
                style={{minWidth: '200px'}}
              />
              <Column
                field='orderTotalAmount'
                header='Total Amount'
                style={{minWidth: '200px'}}
                body={(data) => formatCurrency(data.orderTotalAmount)}
              />
              <Column
                field='orderDiscountAmount'
                header='Discount Amount'
                style={{minWidth: '200px'}}
                body={(data) => formatCurrency(data.orderTotalDiscountAmount)}
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

const ItemSalesReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
    </Box>
  );
};

export default ItemSalesReportTable;
