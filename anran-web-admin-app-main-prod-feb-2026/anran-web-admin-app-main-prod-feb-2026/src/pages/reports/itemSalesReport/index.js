import React, {useState, useEffect, useRef} from 'react';
import {useIntl} from 'react-intl';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  FormControl,
  Autocomplete,
  Modal,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {DatePicker} from '@mui/x-date-pickers';

import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

import AppInfoView from '@anran/core/AppInfoView';
import IntlMessages from '@anran/utility/IntlMessages';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, useGetDataApi} from '@anran/utility/APIHooks';
import { Warning } from '@mui/icons-material';

const ReportTable = () => {
  const loadingStartRef = useRef(null);
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false); // Warning dialog visibility
  const [branchOptions, setBranchOptions] = useState([]);
  const [packageCategoryOptions, setPackageCategoryOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedPackageCategory, setSelectedPackageCategory] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [flatData, setFlatData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0); // Track progress step
  const noOptionsText = formatMessage({ id: 'common.noOptionsAvailable' });

  const [{apiData: branchDatabase}] = useGetDataApi('api/branch/role-based', {}, {}, true);
  const [{apiData: packageDatabase}] = useGetDataApi(
    'api/package/web',
    {},
    {},
    true,
  );

  console.log('packageDatabase', packageDatabase);

  useEffect(() => {
    if (packageDatabase?.length > 0) {
      const uniquePackageCategories = [
        ...new Set(packageDatabase.map((pkg) => pkg.packageCategory)),
      ];
      const opt = uniquePackageCategories.map((category) => ({
        packageCategory: category,
      }));
      const allCategoriesOption = {
        packageCategory: 'All Categories',
        label: formatMessage({id: 'common.allCategories'}),
      };
      setPackageCategoryOptions([allCategoriesOption, ...opt]);
    }
  }, [packageDatabase, formatMessage]);


  useEffect(() => {
    if (packageDatabase?.length > 0 && selectedPackageCategory?.length > 0) {
      let filteredPackages = [];
  
      if (selectedPackageCategory.includes("All Categories")) {
        // If "All Categories" is selected, include all packages
        filteredPackages = packageDatabase;
      } else {
        // Otherwise, filter packages based on selected categories
        filteredPackages = packageDatabase.filter((pkg) =>
          selectedPackageCategory.includes(pkg.packageCategory)
        );
      }
  
      // Extract unique packages
      let uniquePackages = [];
      filteredPackages.forEach((pkg) => {
        if (!uniquePackages.some((p) => p.packageName === pkg.packageName)) {
          uniquePackages.push({ packageName: pkg.packageName, _id: pkg._id });
        }
      });
      const allPackagesOption = {
        packageName: 'All Packages',
        _id: 'all',
        label: formatMessage({id: 'common.allPackages'}),
      };
      setPackageOptions([allPackagesOption, ...uniquePackages]);
    } else {
      setPackageOptions([]); // Clear package options if no category is selected
    }
  }, [packageDatabase, formatMessage, selectedPackageCategory]);

  useEffect(() => {
    if (branchDatabase?.length > 0) {
      let opt = [];
      branchDatabase?.map((branch) => {
        opt.push({branch: branch.branchName, _id: branch._id});
      });
      const allBranchesOption = {
        branch: formatMessage({id: 'common.allBranches'}),
        _id: 'All Branch',
      };
      setBranchOptions([allBranchesOption, ...opt]);
    }
  }, [branchDatabase, formatMessage]);

  const handleClickSubmit = async () => {
    if (
      selectedBranch &&
      selectedPackageCategory &&
      selectedPackage &&
      selectedStartDate &&
      selectedEndDate
    ) {
      const dateDifference = dayjs(selectedEndDate).diff(dayjs(selectedStartDate), 'day');
      const isLargeData =
        dateDifference > 7 ||
        selectedBranch.length > 1 ||
        selectedPackageCategory.length > 1 ||
        selectedPackage.length > 1;

      if (isLargeData) {
        // Show warning dialog
        setIsWarningDialogOpen(true);
      } else {
        // Proceed with API call
        runAPI();
      }
    }
  };

  const runAPI = async () => {
    setIsWarningDialogOpen(false);
    setLoading(true);
    loadingStartRef.current = Date.now();
    setProgressStep(1);

    setFilteredData(null);
    setFlatData(null);

    const formData = new FormData();
    formData.append('selectedBranch', selectedBranch);
    formData.append('selectedPackageCategory', selectedPackageCategory);
    formData.append('selectedPackage', selectedPackage);
    formData.append('selectedStartDate', dayjs(selectedStartDate).format('YYYY-MM-DD'));
    formData.append('selectedEndDate', dayjs(selectedEndDate).format('YYYY-MM-DD'));

    try {
      const response = await postDataApi(
        'api/report2/daily-category-item-sales',
        infoViewActionsContext,
        formData,
        false,
        false,
        { 'Content-Type': 'multipart/form-data' },
      );

      setFilteredData(response);
      setProgressStep(2);
    } catch (error) {
      infoViewActionsContext.fetchError(error.message);
      setLoading(false);
  }
};

  const handleWarningDialogYes = () => {
    setIsWarningDialogOpen(false); // Close the warning dialog
    runAPI(); // Proceed with the API call
  };

  const handleWarningDialogNo = () => {
    setIsWarningDialogOpen(false); // Close the warning dialog without proceeding
  };

  useEffect(() => {
    if (filteredData) {
      if(filteredData.length > 0) {
        const isDataPopulated = filteredData.every((item) => item !== undefined && item !== null);
  
        if (isDataPopulated) {
          setProgressStep(3);
        }
      } else if (filteredData.length === 0) {
        setLoading(false);
        setProgressStep(3.5);
        infoViewActionsContext.showMessage(
          formatMessage({id: 'report.filters.noData'}),
        );
      }
    }
  }, [filteredData, formatMessage, infoViewActionsContext]);

  useEffect(() => {
    if (!flatData) return;
    if (!loadingStartRef.current) return; // no start time => ignore
    if (progressStep >= 4) return;        // already finalized => prevent repeated firing

    setLoading(false);
    setProgressStep(4);

    const timeDifference = ((Date.now() - loadingStartRef.current) / 1000).toFixed(2);
    loadingStartRef.current = null; // IMPORTANT: clear so it won’t keep updating

    infoViewActionsContext.showMessage(
      formatMessage(
        { id: 'report.data.loadedWithTime' },
        { seconds: timeDifference },
      ),
    );
}, [flatData, progressStep, formatMessage, infoViewActionsContext]);

  const exportToExcel = () => {
    const tableData = [
      [
        formatMessage({id: 'common.branch'}),
        formatMessage({id: 'report.itemSales.table.salesDate'}),
        formatMessage({id: 'report.itemSales.table.categoryName'}),
        formatMessage({id: 'report.itemSales.table.packageName'}),
        formatMessage({id: 'report.itemSales.table.member'}),
        formatMessage({id: 'report.itemSales.table.quantity'}),
        formatMessage({id: 'report.itemSales.table.totalAmount'}),
        formatMessage({id: 'report.itemSales.table.discountAmount'}),
        formatMessage({id: 'report.itemSales.table.tax'}),
        formatMessage({id: 'report.itemSales.table.netAmount'}),
        formatMessage({id: 'report.itemSales.table.salesDateTotal'}),
      ],
    ];
    // const titleRow = [
    //   `Item Sales Report: ${selectedBranch.map(branchId => 
    //     branchOptions.find(branch => branch._id === branchId)?.branch
    //   ).join(", ")} ${selectedPackageCategory.map(category =>
    //     packageCategoryOptions.find(pkg => pkg.packageCategory === category)?.packageCategory
    //   ).join(", ")} (${dayjs(selectedStartDate).format('DD/MM/YYYY')} - ${dayjs(selectedEndDate).format('DD/MM/YYYY')})`
    // ];

    const titleRow2 = [
      [formatMessage({id: 'report.itemSales.title'})],
      [
        formatMessage(
          {id: 'report.startDate'},
          {date: dayjs(selectedStartDate).format('DD/MM/YYYY')},
        ),
      ],
      [
        formatMessage(
          {id: 'report.endDate'},
          {date: dayjs(selectedEndDate).format('DD/MM/YYYY')},
        ),
      ],
      [
        formatMessage(
          {id: 'report.branch'},
          {
            name: selectedBranch
              .map(
                (branchId) =>
                  branchOptions.find((branch) => branch._id === branchId)?.branch,
              )
              .join(', '),
          },
        ),
      ],
      [
        formatMessage(
          {id: 'report.packageCategory'},
          {
            name: selectedPackageCategory
              .map(
                (category) =>
                  packageCategoryOptions.find(
                    (pkg) => pkg.packageCategory === category,
                  )?.packageCategory,
              )
              .join(', '),
          },
        ),
      ],
      [
        formatMessage(
          {id: 'report.generatedDateTime'},
          {dateTime: dayjs().format('DD/MM/YYYY HH:mm:ss')},
        ),
      ],
    ];
  
    // Empty row for spacing
    const emptyRow = [];
    const currentDateTime = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `ItemSalesReport_${currentDateTime}`;
    let previousBranchName = null;
    filteredData.forEach((branch) => {
      let branchNameShown = false;
      branch.orderdates.forEach((order) => {
        let orderDateShown = false;
        const totalItemsInOrder = order.categoryCodes.reduce(
          (sum, category) => sum + category.items.length,
          0,
        );
        let currentItemIndex = 0;
        order.categoryCodes.forEach((category) => {
          category.items.forEach((item) => {
            const isLastItem = ++currentItemIndex === totalItemsInOrder;
            const shouldDisplayBranchName = !branchNameShown && branch.branchName !== previousBranchName;
            if (shouldDisplayBranchName) {
              previousBranchName = branch.branchName;
            }
            tableData.push([
              shouldDisplayBranchName ? branch.branchName : '',
              orderDateShown ? '' : order.orderdate || formatMessage({id: 'common.notAvailable'}),
              category.categoryName || formatMessage({id: 'common.notAvailable'}),
              item.aaa || '', // Package
              item.ggg || '', // Member
              item.fff || 0, // Quantity
              item.bbb?.toFixed(2) || '0.00',
              item.eee?.toFixed(2) || '0.00',
              `${item.ccc?.toFixed(2) || '0.00'}%`,
              item.ddd?.toFixed(2) || '0.00',
              isLastItem
                ? order.orderDateTotal?.toFixed(2) || '0.00'
                : '',
            ]);
            orderDateShown = true;
          });
        });
      });
    });
    const ws = XLSX.utils.aoa_to_sheet([...titleRow2, emptyRow, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      formatMessage({id: 'report.sheet.data'}),
    );
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const flattenData = (data) => {
    return data
      .map((branch) => {
        let previousOrderDate = null;
        let previousBranchName = null;
        return branch.orderdates.map((orderdate) => {
          let previousCategoryName = null;

          return orderdate.categoryCodes.map((category) =>
            category.items.map((item) => {
              const currentOrderDate = orderdate.orderdate;
              const currentCategoryName = category.categoryName;

              const shouldDisplayOrderDate =
                currentOrderDate !== previousOrderDate;
              const shouldDisplayCategoryName =
                shouldDisplayOrderDate ||
                currentCategoryName !== previousCategoryName;
              const shouldDisplayBranchName = branch.branchName !== previousBranchName;

              if (shouldDisplayOrderDate) previousOrderDate = currentOrderDate;
              if (shouldDisplayCategoryName)
                previousCategoryName = currentCategoryName;
              if (shouldDisplayBranchName) previousBranchName = branch.branchName;

              return {
                branch: branch.branch,
                branchName: shouldDisplayBranchName ? branch.branchName : '',
                orderdate: shouldDisplayOrderDate ? currentOrderDate : '',
                orderDateTotal: orderdate.orderDateTotal,
                categoryName: shouldDisplayCategoryName
                  ? currentCategoryName
                  : '',
                categoryTotal: category.categoryTotal,
                item: item.aaa,
                itemTotal: item.bbb,
                taxValue: item.ccc,
                netAmount: item.ddd,
                discountPrice: item.eee,
                itemQuantity: item.fff,
                memberFullName: item.ggg,
              };
            }),
          );
        });
      })
      .flat(3);
  };

  useEffect(() => {
    if (!filteredData) return;

    // Let UI update first, then do heavy flattening
    const t = setTimeout(() => {
      setFlatData(flattenData(filteredData));
    }, 0);

    return () => clearTimeout(t);
  }, [filteredData]);

  console.log(flatData);

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
              <Typography variant='h1'>
                {formatMessage({id: 'report.itemSales.title'})}
              </Typography>
              <Button
                size='large'
                variant='contained'
                color='primary'
                onClick={exportToExcel}
                disabled={!filteredData}
                startIcon={<DownloadIcon />}
              >
                {formatMessage({id: 'common.exportToExcel'})}
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
                  noOptionsText={noOptionsText}
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
            <Grid size={{md: 12, xs: 12}}>
              <FormControl fullWidth margin='dense'>
                <Autocomplete
                  multiple
                  id='branch-autocomplete'
                  options={packageCategoryOptions}
                  noOptionsText={noOptionsText}
                  getOptionLabel={(option) =>
                    option.label || option.packageCategory || ''
                  }
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
                    const isAllCategoriesSelected = value.some(
                      (pkg) => pkg.packageCategory === 'All Categories',
                    );
                    if (isAllCategoriesSelected) {
                      const allCategories = packageCategoryOptions
                        .filter((pkg) => pkg.packageCategory !== 'All Categories')
                        .map((pkg) => pkg.packageCategory);
                      setSelectedPackageCategory(allCategories);
                    } else {
                      const selectedCategories = value.map(
                        (pkg) => pkg.packageCategory,
                      );
                      setSelectedPackageCategory(selectedCategories);
                    }
                    // const selectedCategories = value.map(
                    //   (pkg) => pkg.packageCategory,
                    // );
                    // setSelectedPackageCategory(selectedCategories);
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
            <Grid size={{md: 12, xs: 12}}>
              <FormControl fullWidth margin='dense'>
                <Autocomplete
                  multiple
                  id='package-autocomplete'
                  options={packageOptions}
                  noOptionsText={noOptionsText}
                  getOptionLabel={(option) =>
                    option.label || option.packageName || ''
                  }
                  value={
                    Array.isArray(selectedPackage)
                      ? packageOptions.filter((pkg) =>
                          selectedPackage.includes(pkg._id),
                        )
                      : []
                  }
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  filterOptions={(options, params) => {
                    const filtered = options.filter((option) => {
                      const optionName = option.packageName || '';
                      return optionName
                        .toLowerCase()
                        .includes(params.inputValue.toLowerCase());
                    });
                    return filtered;
                  }}
                  onChange={(event, value) => {
                    const isAllPackagesSelected = value.some((pkg) => pkg._id === "all");
                    if (isAllPackagesSelected) {
                      // Select all packages except "All Packages"
                      const allPackageIds = packageOptions
                        .filter((pkg) => pkg._id !== "all")
                        .map((pkg) => pkg._id);
                      setSelectedPackage(allPackageIds);
                    } else {
                      // Store selected package _ids
                      const selectedPackageIds = value.map((pkg) => pkg._id);
                      setSelectedPackage(selectedPackageIds);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='outlined'
                      label={<IntlMessages id='common.selectPackages' />}
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
                label={formatMessage({id: 'report.filters.fromDate'})}
                name='fromDate'
                value={selectedStartDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(value) => setSelectedStartDate(value)}
                slotProps={{
                  textField: {
                    margin: 'dense',
                    clearable: true,
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
                label={formatMessage({id: 'report.filters.toDate'})}
                name='toDate'
                value={selectedEndDate}
                renderInput={(params) => <TextField {...params} />}
                onChange={(value) => setSelectedEndDate(value)}
                slotProps={{
                  textField: {
                    margin: 'dense',
                    clearable: true,
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
                !selectedBranch ||
                !selectedPackageCategory ||
                !selectedPackage ||
                !selectedStartDate ||
                !selectedEndDate
              }
              startIcon={<FilterAltIcon />}
            >
              {formatMessage({id: 'report.filters.submit'})}
            </Button>
          </Grid>
          {/* Table */}
          <Grid size={12}>
            <DataTable
              value={flatData}
              loading={loading}
              emptyMessage={noOptionsText}
            >
              <Column
                field='branchName'
                header={formatMessage({id: 'common.branch'})}
              />
              <Column
                field='orderdate'
                header={formatMessage({id: 'report.itemSales.table.salesDate'})}
                body={(data) => {
                  return data.orderdate
                    ? dayjs(data.orderdate).format('DD-MM-YYYY')
                    : '';
                }}
              />
              <Column
                field='categoryName'
                header={formatMessage({id: 'report.itemSales.table.categoryName'})}
              />
              <Column
                field='item'
                header={formatMessage({id: 'report.itemSales.table.packageName'})}
              />
              <Column
                field='memberFullName'
                header={formatMessage({id: 'report.itemSales.table.member'})}
              />
              <Column
                field='itemQuantity'
                header={formatMessage({id: 'report.itemSales.table.quantity'})}
              />
              <Column
                field='itemTotal'
                header={formatMessage({id: 'report.itemSales.table.total'})}
                body={(data) => {
                  return data.itemTotal && !isNaN(data.itemTotal)
                    ? `RM ${parseFloat(data.itemTotal).toFixed(2)}`
                    : '';
                }}
              />
              <Column
                field='taxValue'
                header={formatMessage({id: 'report.itemSales.table.tax'})}
                body={(data) => {
                  return data.taxValue && !isNaN(data.taxValue)
                    ? `${parseFloat(data.taxValue).toFixed(2)}%`
                    : '0.00%';
                }}
              />
              <Column
                field='netAmount'
                header={formatMessage({id: 'report.itemSales.table.net'})}
                body={(data) => {
                  return data.netAmount && !isNaN(data.netAmount)
                    ? `RM ${parseFloat(data.netAmount).toFixed(2)}`
                    : '';
                }}
              />
              <Column
                field='discountPrice'
                header={formatMessage({id: 'report.itemSales.table.discount'})}
                body={(data) => {
                  return data.discountPrice && !isNaN(data.discountPrice)
                    ? `RM ${parseFloat(data.discountPrice).toFixed(2)}`
                    : 'RM0.00';
                }}
              />
            </DataTable>
          </Grid>
        </Grid>
      </Card>
      <Dialog
        open={isWarningDialogOpen}
        onClose={handleWarningDialogNo}
        aria-labelledby="warning-dialog-title"
        aria-describedby="warning-dialog-description"
      >
        <DialogTitle>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Warning fontSize="large" sx={{ mr: 1 }} color="error" />
            <Typography variant="h2" color="error" sx={{justifyContent: 'center'}}>
              {formatMessage({id: 'common.warning'})}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant='subtitle1'>
            {formatMessage({id: 'report.itemSales.warningMessage'})}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWarningDialogNo} color="secondary" variant='contained'>
            {formatMessage({id: 'common.no'})}
          </Button>
          <Button onClick={handleWarningDialogYes} color="primary" variant='outlined' autoFocus>
            {formatMessage({id: 'common.yes'})}
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={loading} onClose={() => {}}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {progressStep === 1 &&
              formatMessage({id: 'report.itemSales.progress.fetching'})}
            {progressStep === 2 &&
              formatMessage({id: 'report.itemSales.progress.arranging'})}
            {progressStep === 3 &&
              formatMessage({id: 'report.itemSales.progress.populating'})}
            {progressStep === 3.5 &&
              formatMessage({id: 'report.filters.noData'})}
            {progressStep === 4 &&
              formatMessage({id: 'report.itemSales.progress.finalizing'})}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressStep === 3.5 ? 100 : (progressStep / 4) * 100}
          />
          {(progressStep === 3.5 || progressStep === 4) && (
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setLoading(false)}
              >
                {formatMessage({id: 'common.close'})}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const ItemSalesReportTable = () => {
  return (
    <Box>
      <Card>
        <ReportTable />
      </Card>
      <AppInfoView />
    </Box>
  );
};

export default ItemSalesReportTable;