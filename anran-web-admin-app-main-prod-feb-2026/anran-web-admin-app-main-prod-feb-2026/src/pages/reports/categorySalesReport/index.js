import React, {useState, useEffect} from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';

const ReportTable = () => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [flatData, setFlatData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch/role-based', {}, {}, true);

  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      const allBranchesOption = {branch: 'All Branch', _id: 'All Branch'};
      setBranchOptions([allBranchesOption, ...opt]);
    }
  }, [branchDatabase]);

  const handleClickSubmit = async () => {
    if (selectedBranch && selectedStartDate && selectedEndDate) {
      setLoading(true); // Set loading to true before fetching data
      const formData = new FormData();
      formData.append('selectedBranch', selectedBranch);
      formData.append(
        'selectedStartDate',
        dayjs(selectedStartDate).format('YYYY-MM-DD'),
      );
      formData.append(
        'selectedEndDate',
        dayjs(selectedEndDate).format('YYYY-MM-DD'),
      );
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
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    }
  };

  const exportToExcel = () => {
    const tableData = [];
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `CategorySalesReport_${currentDateTime}`;

    const titleRow = [
      `Category Sales Report: ${selectedBranch.map(branchId => 
        branchOptions.find(branch => branch._id === branchId)?.branch
      ).join(", ")} (${dayjs(selectedStartDate).format('DD/MM/YYYY')} - ${dayjs(selectedEndDate).format('DD/MM/YYYY')})`
    ];
  
    // Empty row for spacing
    const emptyRow = [];

    filteredData.forEach((branch) => {
      let branchItems = [];
      let branchNameShown = false;
      branch.orderdates.forEach((order) => {
        let orderDateShown = false;
        const totalItemsInOrder = order.categoryCodes.reduce(
          (sum, category) => {
            return sum + category.items.length;
          },
          0,
        );
        let currentItemIndex = 0;
        order.categoryCodes.forEach((category) => {
          category.items.forEach((item) => {
            const branchData = {
              Branch: branchNameShown
                ? ''
                : branch.branchname || 'Unknown Branch',
              'Sales Date': orderDateShown ? '' : order.orderdate || 'N/A',
              'Category Name': category.categoryName || 'N/A',
              Amount: item.bbb?.toFixed(2) || '0.00',
              'Order Date Category Total': '',
            };
            if (!branchNameShown) {
              branchNameShown = true;
            }
            if (!orderDateShown) {
              orderDateShown = true;
            }
            if (++currentItemIndex === totalItemsInOrder) {
              branchData['Order Date Category Total'] =
                order.orderDateTotal?.toFixed(2) || '0.00';
            }
            branchItems.push(branchData);
          });
        });
      });
      if (branchItems.length > 0) {
        branchItems[branchItems.length - 1]['Branch Category Total'] =
          branch.branchTotal?.toFixed(2) || '0.00';
      }
      tableData.push(...branchItems);
    });
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [titleRow, emptyRow], { origin: "A1" }); // Add title and empty row
    XLSX.utils.sheet_add_json(ws, tableData, { origin: "A3", skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const flattenData = (data) => {
    let previousBranchName = null;
    let previousOrderDate = null;

    return data
      .map((branch) =>
        branch.orderdates.map((orderdate) =>
          orderdate.categoryCodes.map((category) =>
            category.items.map((item) => {
              const currentBranchName = branch.branchname;
              const currentOrderDate = orderdate.orderdate;

              const shouldDisplayBranchName =
                currentBranchName !== previousBranchName;
              const shouldDisplayOrderDate =
                currentOrderDate !== previousOrderDate;
              const shouldDisplayBranchCategoryTotal =
                currentBranchName !== previousBranchName;
              const shouldDisplayOrderDateCategoryTotal =
                currentOrderDate !== previousOrderDate;

              previousBranchName = currentBranchName;
              previousOrderDate = currentOrderDate;

              return {
                branchname: shouldDisplayBranchName ? currentBranchName : '',
                orderdate: shouldDisplayOrderDate ? currentOrderDate : '',
                categoryName: category.categoryName,
                amount: item.bbb,
                orderDateCategoryTotal: shouldDisplayOrderDateCategoryTotal
                  ? orderdate.orderDateTotal
                  : '',
                branchCategoryTotal: shouldDisplayBranchCategoryTotal
                  ? branch.branchTotal
                  : '',
              };
            }),
          ),
        ),
      )
      .flat(3);
  };

  useEffect(() => {
    filteredData ? setFlatData(flattenData(filteredData)) : null;
  }, [filteredData]);

  return (
    <Box>
      <Card sx={{mt: 2, p: 5}}>
        <Grid container spacing={2} alignItems='center'>
          {/* Header */}
          <Grid size={12}>
            <Box
              display='flex'
              justifyContent='space-between'
              mb={2}
              alignItems='center'
            >
              <Typography variant='h1'>Category Sales Report</Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                disabled={!filteredData}
                startIcon={<DownloadIcon />}
              >
                Export to Excel
              </Button>
            </Box>
          </Grid>
          <Grid container size={{md: 10, xs: 12}}>
            <Grid size={{md: 12, xs: 12}}>
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
                    const isAllBranchesSelected = value.some(
                      (branch) => branch._id === 'All Branch',
                    );
                    if (isAllBranchesSelected) {
                      const allBranches = branchOptions
                        .filter((branch) => branch._id !== 'All Branch')
                        .map((branch) => branch._id);
                      setSelectedBranch(allBranches);
                    } else {
                      const selectedBranch = value.map(
                        (branch) => branch._id,
                      );
                      setSelectedBranch(selectedBranch);
                    }
                    // const branchIds = value.map((branch) => branch._id);
                    // setSelectedBranch(branchIds);
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
            <Grid size={{md: 6, xs: 12}}>
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
                // maxDate={dayjs().subtract(1, 'day').endOf('day')}
                maxDate={dayjs().endOf('day')}
                format='DD/MM/YYYY'
              />
            </Grid>
            <Grid size={{md: 6, xs: 12}}>
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
                // maxDate={dayjs().subtract(1, 'day').endOf('day')}
                maxDate={dayjs().endOf('day')}
                format='DD/MM/YYYY'
              />
            </Grid>
          </Grid>
          <Grid size={{md: 2, xs: 3}} sx={{marginLeft: 'auto'}}>
            <Button
              size='large'
              variant='outlined'
              color='primary'
              fullWidth
              onClick={handleClickSubmit}
              disabled={
                !selectedBranch || !selectedStartDate || !selectedEndDate
              }
              startIcon={<FilterAltIcon />}
            >
              Submit Filter
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable value={flatData} loading={loading}>
              <Column field='branchname' header='Branch' />
              <Column
                field='orderdate'
                header='Sales Date'
                body={(data) => {
                  return data.orderdate
                    ? dayjs(data.orderdate).format('DD-MM-YYYY')
                    : '';
                }}
              />
              <Column field='categoryName' header='Category Name' />
              <Column
                field='amount'
                header='Amount'
                body={(data) => {
                  return data.amount && !isNaN(data.amount)
                    ? `RM ${parseFloat(data.amount).toFixed(2)}`
                    : '';
                }}
              />
              <Column
                field='orderDateCategoryTotal'
                header='Sales Date Category Total'
                body={(data) => {
                  return data.orderDateCategoryTotal &&
                    !isNaN(data.orderDateCategoryTotal)
                    ? `RM ${parseFloat(data.orderDateCategoryTotal).toFixed(2)}`
                    : '';
                }}
              />
              <Column
                field='branchCategoryTotal'
                header='Branch Category Total'
                body={(data) => {
                  return data.branchCategoryTotal &&
                    !isNaN(data.branchCategoryTotal)
                    ? `RM ${parseFloat(data.branchCategoryTotal).toFixed(2)}`
                    : '';
                }}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
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
