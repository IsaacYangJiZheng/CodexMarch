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
  const [expandedOrderRows, setExpandedOrderRows] = useState(null);
  const [expandedCategoryRows, setExpandedCategoryRows] = useState(null);

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
    const tableData = [];
    filteredData.forEach((branch) => {
      let branchItems = [];
      let branchNameShown = false;
    
      branch.orderdates.forEach((order) => {
        let orderDateShown = false;
        const totalItemsInOrder = order.categoryCodes.reduce((sum, category) => {
          return sum + category.items.length;
        }, 0);
        let currentItemIndex = 0;
    
        order.categoryCodes.forEach((category) => {
          category.items.forEach((item) => {
            const branchData = {
              Branch: branchNameShown ? "" : branch.branchname || "Unknown Branch",
              "Order Date": orderDateShown ? "" : order.orderdate || "N/A",
              "Category Name": category.categoryName || "N/A",
              Amount: `RM${item.bbb?.toFixed(2) || "0.00"}`,
              "Order Date Category Total": "",
            };
            if (!branchNameShown) {
              branchNameShown = true;
            }
            if (!orderDateShown) {
              orderDateShown = true;
            }
            if (++currentItemIndex === totalItemsInOrder) {
              branchData["Order Date Category Total"] = `RM${order.orderDateTotal?.toFixed(2) || "0.00"}`;
            }
    
            branchItems.push(branchData);
          });
        });
      });
      if (branchItems.length > 0) {
        branchItems[branchItems.length - 1]["Branch Category Total"] = `RM${branch.branchTotal?.toFixed(2) || "0.00"}`;
      }
      tableData.push(...branchItems);
    });
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

  const ordersExpansionTemplate = (data) => {
    return (
      <Box>
        <Typography variant='h4' gutterBottom fontWeight='bold'>Orders for {data.branchname}</Typography>
        <DataTable
          value={data.orderdates}
          expandedRows={expandedCategoryRows}
          onRowToggle={(e) => setExpandedCategoryRows(e.data)}
          rowExpansionTemplate={categoryExpansionTemplate}
        >
          <Column expander style={{ width: '5rem' }} />
          <Column field="orderdate" header="Order Date" sortable />
          <Column field="orderDateTotal" header="Order Total" sortable />
        </DataTable>
      </Box>
    );
  };

  const categoryExpansionTemplate = (data) => (
    <Box>
      <Typography variant='h4' gutterBottom fontWeight='bold'>Orders for {data.orderdate}</Typography>
      <DataTable value={data.categoryCodes}>
        <Column field="categoryName" header="Category Name" />
        <Column field="categoryTotal" header="Category Total" />
      </DataTable>
    </Box>
  );

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
              sortMode='single'
              sortField='branchname'
              sortOrder={1}
              scrollable
              tableStyle={{minWidth: '50rem'}}
              expandedRows={expandedOrderRows}
              onRowToggle={(e) => setExpandedOrderRows(e.data)}
              rowExpansionTemplate={ordersExpansionTemplate}
              showGridlines
              stripedRows
            >
              <Column expander style={{ width: '5rem' }} />
              <Column
                field='branchname'
                header='Branch Name'
                style={{minWidth: '200px'}}
              />
              <Column
                field='branchTotal'
                header='Branch Total'
                style={{minWidth: '200px'}}
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
