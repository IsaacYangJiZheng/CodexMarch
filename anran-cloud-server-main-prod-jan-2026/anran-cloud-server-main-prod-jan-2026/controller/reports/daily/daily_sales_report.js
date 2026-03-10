const Orders = require("../../../models/orders");
const Payments = require("../../../models/payments");
const ordersItem = require("../../../models/ordersItem");
const MemberPackage = require("../../../models/memberPackage");
const MemberBooking = require("../../../models/memberBooking");
const mongoose = require('mongoose'); 


module.exports = {
  getNetSalesInStore,
  getNetSalesInStore2,
  getNetPaymentInStore,
  getNetPaymentInStore2,
  getCategorySalesInStore,
  getCategorySalesInStore2,
  getCategoryItemSalesInStore,
  getCategoryItemSalesInStore2,
  getMemberPackageUsage,
  getMemberPackageUsageSummary,
  getFinanceReport,
};

async function getNetSalesInStore(query) {
  try {
    let startDate = new Date(
      new Date(query.selectedStartDate).setHours(0, 0, 0)
    );
    let endDate = new Date(
      new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    );
    // console.log(query.branch);
    // const obj = await Orders.find({
    //   $and: [
    //     { orderDate: { $gte: startDate } },
    //     { orderDate: { $lte: endDate } },
    //     { orderBranch: { $eq: query.branch } },
    //     { status: { $eq: "Paid" } },
    //   ],
    // });
    const rr = await Orders.aggregate([
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              orderDate: {
                $gte: startDate, // ex: 2020-11-25T00:00:00.00Z
                $lte: endDate, // ex: 2020-11-25T23:59:59.00Z
              },
            },
            { convertedBranchId: { $in: query.branch.split(",") } },
            // { status: { $eq: "Paid" } },
          ],
        },
      },
      // {
      //   $lookup: {
      //     from: "payments",
      //     localField: "orderNumber",
      //     foreignField: "orderNumber",
      //     as: "payments",
      //   },
      // },
      // {
      //   $unwind: "$payments",
      // },
      {
        $group: {
          _id: {
            // orderDate: "$orderDate",
            orderBranch: "$orderBranch",
            status: "$status",
          },
          orderTotalAmount: { $sum: "$orderTotalAmount" },
          orderTotalDiscountAmount: { $sum: "$orderTotalDiscountAmount" },
          orderTotalTaxAmount: { $sum: "$orderTotalTaxAmount" },
          orderTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          // orderTotalPayAmount: { $sum: "$payments.payAmount" },
          max: { $max: "$orderNumber" },
          min: { $min: "$orderNumber" },
          itemCount: { $count: {} },
        },
      },
      {
        $group: {
          _id: "$_id.orderBranch",
          SaleTotalAmount: { $sum: "$orderTotalAmount" },
          SaleTotalDiscountAmount: { $sum: "$orderTotalDiscountAmount" },
          SaleTotalTaxAmount: { $sum: "$orderTotalTaxAmount" },
          SaleTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          SaleAfterDiscountAmount: {
            $sum: { $add: ["$orderTotalAmount", "$orderTotalDiscountAmount"] },
          },
          invoiceCount: { $sum: "$itemCount" },
          firstInvoice: { $max: "$max" },
          lastInvoice: { $min: "$min" },
          salesHistory: {
            $push: "$$ROOT",
          },
        },
      },
      // {
      //   $project : {

      //   }
      // }
    ]);

    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getNetSalesInStore2(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    // Adjust to local time by setting hours to 00:00 for startDate and 23:59:59.999 for endDate (local time, UTC+8)
    // startDate.setHours(0, 0, 0, 0);  // Start of the day
    // endDate.setHours(23, 59, 59, 999);  // End of the day
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // Adjust for UTC +8 (i.e., local time zone)
    // startDate.setHours(startDate.getHours() + 8);  // Shift startDate by -8 hours (to UTC)
    // endDate.setHours(endDate.getHours() + 8); 
    // console.log(startDate, endDate, query.branch);
    // let startDate = new Date(new Date(query.selectedStartDate).setHours(0, 0, 0));
    // let endDate = new Date(new Date(query.selectedEndDate).setHours(23, 59, 59, 999));

    const rr = await Orders.aggregate([
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              orderDate: {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { convertedBranchId: { $in: query.branch.split(",") } },
            { status: { $eq: "Paid" } },
          ],
        },
      },
      {
        $addFields: {
          adjustedOrderDate: {
            $add: ["$orderDate", 8 * 60 * 60 * 1000]
          }
        }
      },
      {
        $group: {
          _id: {
            orderBranch: "$orderBranch",
            orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$adjustedOrderDate" } },
          },
          orderTotalAmount: { $sum: "$orderTotalAmount" },
          orderTotalDiscountAmount: { $sum: "$orderTotalDiscountAmount" },
          orderTotalTaxAmount: { $sum: "$orderTotalTaxAmount" },
          orderTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          maxInvoice: { $max: "$orderNumber" },
          minInvoice: { $min: "$orderNumber" },
          itemCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.orderBranch",
          SaleTotalAmount: { $sum: "$orderTotalAmount" },
          SaleTotalDiscountAmount: { $sum: "$orderTotalDiscountAmount" },
          SaleTotalTaxAmount: { $sum: "$orderTotalTaxAmount" },
          SaleTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          invoiceCount: { $sum: "$itemCount" },
          firstInvoice: { $min: "$minInvoice" },
          lastInvoice: { $max: "$maxInvoice" },
          dailySales: {
            $push: {
              date: "$_id.orderDate",
              orderTotalAmount: "$orderTotalAmount",
              orderTotalNetAmount: "$orderTotalNetAmount",
              itemCount: "$itemCount",
            },
          },
        },
      },
    ]);

    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getNetPaymentInStore(query) {
  try {
    let startDate = new Date(
      new Date(query.selectedStartDate).setHours(0, 0, 0)
    );
    let endDate = new Date(
      new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    );
    // console.log(startDate, endDate);
    // const obj = await Orders.find({
    //   $and: [
    //     { orderDate: { $gte: startDate } },
    //     { orderDate: { $lte: endDate } },
    //     { orderBranch: { $eq: query.branch } },
    //     { status: { $eq: "Paid" } },
    //   ],
    // });
    const rr = await Orders.aggregate([
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              orderDate: {
                $gte: startDate, // ex: 2020-11-25T00:00:00.00Z
                $lte: endDate, // ex: 2020-11-25T23:59:59.00Z
              },
            },
            { convertedBranchId: { $in: query.branch.split(",") } },
            { status: { $eq: "Paid" } },
          ],
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "orderNumber",
          foreignField: "orderNumber",
          as: "payments",
        },
      },
      {
        $unwind: "$payments",
      },
      {
        $lookup: {
          from: "branches",
          localField: "orderBranch",
          foreignField: "_id",
          as: "branches",
        },
      },
      {
        $unwind: "$branches",
      },
      {
        $group: {
          _id: {
            // orderDate: "$orderDate",
            orderBranch: "$orderBranch",
            payMethod: "$payments.payMethod",
          },
          payAmount: { $sum: "$payments.payAmount" },
          itemCount: { $count: {} },
        },
      },
      {
        $group: {
          _id: "$_id.orderBranch",
          payTotalAmount: { $sum: "$payAmount" },
          count: { $sum: "$itemCount" },
          payHistory: {
            $push: "$$ROOT",
          },
        },
      },
    ]);

    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getNetPaymentInStore2(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // Adjust to local time by setting hours to 00:00 for startDate and 23:59:59.999 for endDate (local time, UTC+8)
    // startDate.setHours(0, 0, 0, 0);  // Start of the day
    // endDate.setHours(23, 59, 59, 999);  // End of the day

    // // Adjust for UTC +8 (i.e., local time zone)
    // startDate.setHours(startDate.getHours() + 8);  // Shift startDate by -8 hours (to UTC)
    // endDate.setHours(endDate.getHours() + 8); 
    // let startDate = new Date(new Date(query.selectedStartDate).setHours(0, 0, 0));
    // let endDate = new Date(new Date(query.selectedEndDate).setHours(23, 59, 59, 999));

    const rr = await Orders.aggregate([
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              orderDate: {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { convertedBranchId: { $in: query.branch.split(",") } },
            { status: { $eq: "Paid" } },
          ],
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "orderNumber",
          foreignField: "orderNumber",
          as: "payments",
        },
      },
      {
        $unwind: "$payments",
      },
      {
        $addFields: {
          adjustedOrderDate: {
            $add: ["$orderDate", 8 * 60 * 60 * 1000]
          }
        }
      },
      {
        $group: {
          _id: {
            orderBranch: "$orderBranch",
            orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$adjustedOrderDate" } },
            payMethod: "$payments.payMethod",
          },
          payAmount: { $sum: "$payments.payAmount" },
          itemCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.orderBranch",
          payTotalAmount: { $sum: "$payAmount" },
          count: { $sum: "$itemCount" },
          dailyPayments: {
            $push: {
              date: "$_id.orderDate",
              payMethod: "$_id.payMethod",
              payAmount: "$payAmount",
            },
          },
        },
      },
    ]);

    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getCategorySalesInStore(query) {
  try {
    let startDate = new Date(new Date(query.selectedStartDate).setHours(0, 0, 0));
    let endDate = new Date(new Date(query.selectedEndDate).setHours(23, 59, 59, 999));
    // console.log(startDate, endDate);
    const aa = await ordersItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$order.orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              "order.orderDate": {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { convertedBranchId: { $in: query.selectedBranch.split(",") } },
          ],
        },
      },
      {
        $addFields: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$order.orderDate" } },
          convertedBranchObjectId: {
            $toObjectId: "$convertedBranchId", // Convert back to ObjectId for further lookups
          },
          packageId: {
            $toObjectId: "$package",
          },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "packageId",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $lookup: {
          from: "branches",
          localField: "convertedBranchObjectId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: "$branch",
      },
      {
        $group: {
          _id: {
            date: "$date",
            packageCategory: "$package.packageCategory",
            branchName: "$branch.branchName",
            branchId: "$branch._id",
          },
          orderTotalAmount: { $sum: "$unitAmount" },
          orderTotalTaxValue: { $sum: "$taxValue" },
          orderTotalNetAmount: { $sum: "$netAmount" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getCategorySalesInStore2(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // let startDate = new Date(
    //   new Date(query.selectedStartDate).setHours(0, 0, 0)
    // );
    // let endDate = new Date(
    //   new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    // );
    // console.log(startDate, endDate);
    const aa = await ordersItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$order.orderDate",
            },
          },
        },
      },
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$order.orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              "order.orderDate": {
                $gte: startDate,
                $lte: endDate,
              },
            },
            {
              convertedBranchId: {
                $in: query.selectedBranch.split(","),
              },
            },
            { "order.status": { $eq: "Paid" } },
          ],
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "order.orderBranch",
          foreignField: "_id",
          as: "branches",
        },
      },
      {
        $unwind: "$branches",
      },
      {
        $addFields: {
          convertedBranchName: {
            $toString: "$branches.branchName",
          },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $addFields: {
          packageCategory: {
            $toString: "$package.packageCategory",
          },
        },
      },
      {
        $project: {
          convertedBranchId: 1,
          convertedBranchName: 1,
          convertedDate: 1,
          packageCategory: 1,
          unitAmount: 1,
        },
      },
      {
        $sort: {
          convertedDate: 1,
        },
      },
      {
        $unset: ["_id"],
      },
      {
        $group: {
          _id: {
            branch: "$convertedBranchId",
            branchName: "$convertedBranchName",
            orderdate: "$convertedDate",
            category: "$packageCategory",
          },
          categoryCodes: {
            $push: {
              aaa: "$packageCategory",
              bbb: "$unitAmount",
            },
          },
          categoryTotal: { $sum: "$unitAmount" },
        },
      },
      {
        $group: {
          _id: {
            branch: "$_id.branch",
            branchName: "$_id.branchName",
            orderDate: "$_id.orderdate",
          },
          categoryCodes: {
            $push: {
              categoryName: "$_id.category",
              items: "$categoryCodes",
              categoryTotal: "$categoryTotal",
            },
          },
          orderDateTotal: { $sum: "$categoryTotal" },
        },
      },
      {
        $group: {
          // _id: "$_id.branch",
          _id: {
            branch: "$_id.branch",
            branchName: "$_id.branchName",
          },
          orderdates: {
            $push: {
              orderdate: "$_id.orderDate",
              orderDateTotal: "$orderDateTotal",
              categoryCodes: "$categoryCodes",
            },
          },
          branchTotal: { $sum: "$orderDateTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          branch: "$_id.branch",
          branchname: "$_id.branchName",
          branchTotal: 1,
          // orderdates: 1,
          orderdates: {
            $sortArray: {
              input: "$orderdates",
              sortBy: { orderdate: 1 },
            },
          },
        },
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getCategoryItemSalesInStore(query) {
  try {
    let startDate = new Date(
      new Date(query.selectedStartDate).setHours(0, 0, 0)
    );
    let endDate = new Date(
      new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    );
    const aa = await ordersItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$order.orderDate",
            },
          },
        },
      },
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$order.orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              "order.orderDate": {
                $gte: startDate,
                $lte: endDate,
              },
            },
            { convertedBranchId: { $eq: query.selectedBranch } },
          ],
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $match: {
          $and: [
            {
              "package.packageCategory": {
                $in: query.selectedPackageCategory.split(","),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            packageCategory: "$package.packageCategory",
            packageName: "$package.packageName",
          },
          categoryCodes: { 
            $push: { aaa: "$packageName", bbb: "$unitAmount" } 
          },
          categoryTotal: { $sum: "$unitAmount" },
          orderTotalAmount: { $sum: "$unitAmount" },
          orderTotalTaxAmount: { $sum: "$taxValue" },
          orderTotalNetAmount: { $sum: "$netAmount" },
          orderTotalDiscountAmount: { $sum: "$discountPrice" },
          orderTotalQuantity: { $sum: "$quantity" },
        },
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getCategoryItemSalesInStore2(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);

    // console.log(startDate, endDate);
    // let startDate = new Date(
    //   new Date(query.selectedStartDate).setHours(0, 0, 0)
    // );
    // let endDate = new Date(
    //   new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    // );
    const aa = await ordersItem.aggregate([
      {
        $addFields: {
          convertedPackageId: {
            $toString: "$package",
          },
        },
      },
      {
        $match: {
          convertedPackageId: {
            $in: query.selectedPackage.split(","),
          },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$order.orderDate",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$order.orderBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              "order.orderDate": {
                $gte: startDate,
                $lte: endDate,
              },
            },
            {
              convertedBranchId: {
                $in: query.selectedBranch.split(","),
              },
            },
            { "order.status": { $eq: "Paid" } },
          ],
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "order.orderBranch",
          foreignField: "_id",
          as: "branches",
        },
      },
      {
        $unwind: "$branches",
      },
      {
        $addFields: {
          convertedBranchName: {
            $toString: "$branches.branchName",
          },
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "package",
        },
      },
      {
        $unwind: "$package",
      },
      {
        $match: {
          $and: [
            {
              "package.packageCategory": {
                $in: query.selectedPackageCategory.split(","),
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "order.member", // 👈 correct reference
          foreignField: "_id",
          as: "memberInfo",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$memberInfo"
      },
      {
        $group: {
          _id: {
            branch: "$convertedBranchId",
            branchName: "$convertedBranchName",
            orderDate: "$convertedDate",
            category: "$package.packageCategory",
          },
          categoryCodes: { 
            $push: { aaa: "$package.packageName", bbb: "$unitAmount", ccc: "$taxValue", ddd: "$netAmount", eee: "$discountPrice", fff: "$quantity", ggg: "$memberInfo.memberFullName", hhh: "$memberInfo.mobileNumber"  } 
          },
          categoryTotal: { $sum: "$unitAmount" },
        },
      },
      {
        $group: {
          _id: { branch: "$_id.branch", branchName: "$_id.branchName", orderDate: "$_id.orderDate" },
          categoryCodes: {
            $push: { categoryName: "$_id.category", items: "$categoryCodes", categoryTotal: "$categoryTotal" }
          },
          orderDateTotal: { $sum: "$categoryTotal" },
        },
      },
      {
        $group: {
          _id: { branch: "$_id.branch", branchName: "$_id.branchName" },
          orderdates: { 
            $push: { orderdate: "$_id.orderDate", orderDateTotal: "$orderDateTotal", categoryCodes: "$categoryCodes" }
          },
          branchTotal: { $sum: "$orderDateTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          branch: "$_id.branch",
          branchName: "$_id.branchName",
          branchTotal: 1,
          orderdates: { 
            $sortArray: { input: "$orderdates", sortBy: { orderdate: 1 } }
          },
        },
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getFinanceReport(query) {
  console.time('financeReport');

  const { selectedBranch, selectedStartDate, selectedEndDate, includeItemsForExport } = query || {};
  if (!Array.isArray(selectedBranch) || !selectedStartDate || !selectedEndDate) {
    throw new Error('selectedBranch[] + selectedStartDate + selectedEndDate are required');
  }

  const startDate = new Date(selectedStartDate);
  const endDate = new Date(selectedEndDate);
  startDate.setUTCHours(0,0,0,0);
  endDate.setUTCHours(23,59,59,999);

  startDate.setHours(startDate.getHours() - 8); 
  endDate.setHours(endDate.getHours() - 8);

  const branchIds = selectedBranch
    .filter(Boolean)
    .map((s) => new mongoose.Types.ObjectId(s));
  if (!branchIds.length) throw new Error('No valid branch ids');

  const base = [
    { $match: { orderBranch: { $in: branchIds }, orderDate: { $gte: startDate, $lte: endDate } } },
    { $sort: { orderDate: -1, _id: -1 } },
    { $project: {
        orderNumber: 1, orderDate: 1, orderBranch: 1, member: 1,
        orderTotalAmount: 1, orderTotalDiscountAmount: 1,
        orderTotalTaxAmount: 1, orderTotalNetAmount: 1,
      }
    },
    { $lookup: {
        from: 'payments',
        localField: 'orderNumber',
        foreignField: 'orderNumber',
        as: 'payments',
      }
    },
    { $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'member',
        pipeline: [{ $project: { memberFullName: 1, mobileNumber: 1, address: 1, city: 1, states: 1, postcode: 1 } }],
      }
    },
    { $addFields: { member: { $arrayElemAt: ['$member', 0] } } },
    { $lookup: {
        from: 'branches',
        localField: 'orderBranch',
        foreignField: '_id',
        as: 'branch',
        pipeline: [{ $project: { branchName: 1, branchCode: 1, customerCode: 1, accountCode: 1 } }],
      }
    },
    { $addFields: { branch: { $arrayElemAt: ['$branch', 0] } } },
  ];

const withExportArrays = [
  {
    $lookup: {
      from: 'orderitems',
      localField: 'orderNumber',      // "BT-I-202510270001"
      foreignField: 'orderNo',
      as: 'items',
      pipeline: [
        {
          $lookup: {
            from: 'packages',
            localField: 'package',
            foreignField: '_id',
            as: 'pkg',
            pipeline: [{ $project: { packageName: 1, packageCode: 1 } }],
          },
        },
        { $addFields: { pkg: { $arrayElemAt: ['$pkg', 0] } } },
        {
          $project: {
            _id: 0,
            // 🔹 expose packageCode & packageName
            itemCode: { $ifNull: ['$pkg.packageCode', ''] },
            itemName: { $ifNull: ['$pkg.packageName', 'ITEM'] },
            unitPrice: { $ifNull: ['$unitPrice', 0] },
            quantity:  { $ifNull: ['$quantity', 1] },
            taxCode:   { $ifNull: ['$taxCode', ''] },
            taxAmount: { $ifNull: ['$taxAmount', 0] },
            netAmount: {
              $ifNull: [
                '$netAmount',
                { $multiply: [{ $ifNull: ['$unitPrice', 0] }, { $ifNull: ['$quantity', 1] }] },
              ],
            },
          },
        },
      ],
    },
  },
  { $addFields: { items: { $ifNull: ['$items', []] } } },
  {
    $addFields: {
      exportSql: {
        SEQ:       { $size: '$items' },
        Package:   { $map: { input: '$items', as: 'it', in: '$$it.itemName' } },
        Unit:      { $map: { input: '$items', as: 'it', in: '$$it.quantity' } },
        UnitPrice: { $map: { input: '$items', as: 'it', in: '$$it.unitPrice' } },
        // 🔹 include codes for frontend
        ItemCode:  { $map: { input: '$items', as: 'it', in: '$$it.itemCode' } },
      },
    },
  },
  // optionally: { $project: { items: 0 } }
];

  const pipeline = includeItemsForExport ? [...base, ...withExportArrays] : base;

  try {
    const result = await Orders.aggregate(pipeline, { allowDiskUse: true }).option({ maxTimeMS: 60000 });
    console.timeEnd('financeReport');
    return result;
  } catch (err) {
    console.timeEnd('financeReport');
    console.error('Aggregation failed:', err);
    throw err;
  }
}


/* async function getFinanceReport(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);

    // console.log(startDate, endDate);

    const aa = await Orders.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: {
            $toString: "$orderBranch"
          },
          orderDateStr: {
            $dateToString: {
              date: "$orderDate",
              format: "%Y-%m-%d",
              timezone: "+08:00"
            }
          }
        }
      },
      {
        $match: {
          $and: [
            {
              convertedBranchId: {
                $in: query.selectedBranch.split(","),
              },
            },
          ]
        }
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "convertedId",
          foreignField: "order",
          as: "items",
          pipeline: [
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                as: "package",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0]
                }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "payments",
          localField: "orderNumber",
          foreignField: "orderNumber",
          as: "payments"
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                email: 1,
                address: 1,
                city: 1,
                postcode: 1,
                states: 1,
              }
            }
          ]
        }
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "orderBranch",
          foreignField: "_id",
          as: "branch",
          pipeline: [
            {
              $project: {
                branchName: 1,
                branchCode: 1,
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
                customerCode: 1,
                accountCode: 1,
              }
            }
          ]
        }
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] }
        }
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
} */

async function getMemberPackageUsage(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // let startDate = new Date(new Date(query.selectedStartDate).setHours(0, 0, 0));
    // let endDate = new Date(
    //   new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    // );
    // console.log(startDate, endDate);
    // const memberpackages = await MemberPackage.find({ purchaseBranch: "" });
    // checkin_date;
    const aa = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          as: "memberPackage",
        },
      },
      {
        $unwind: "$memberPackage",
      },
      {
        $addFields: {
          homeBranchId: {
            $toString: "$memberPackage.purchaseBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              bookingDate: {
                $gte: startDate, // ex: 2020-11-25T00:00:00.00Z
                $lte: endDate, // ex: 2020-11-25T23:59:59.00Z
              },
            },
            { homeBranchId: { $in: query.selectedBranch.split(",") } },
            // { status: { $eq: "Paid" } },
          ],
        },
      },
      // {
      //   $addFields: {
      //     packageId: {
      //       $toObjectId: "$member",
      //     },
      //   },
      // },
      {
        $lookup: {
          from: "branches",
          localField: "memberPackage.purchaseBranch",
          foreignField: "_id",
          as: "homeBranch",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            homeBranch: {
              $arrayElemAt: ["$homeBranch", 0],
            },
          },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "checkInBranch",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            checkInBranch: {
              $arrayElemAt: ["$checkInBranch", 0],
            },
          },
      },
      // {
      //   $unwind: "$homeBranch",
      // },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      // {
      //   $unwind: "$member",
      // },
      {
        $lookup: {
          from: "packages",
          localField: "memberPackage.package",
          foreignField: "_id",
          as: "packages",
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            package: {
              $arrayElemAt: ["$packages", 0],
            },
          },
      },
      {
        $project: {
          // homeBranchId: 1,
          // homeBranch: 1,
          "homeBranch.branchName": 1,
          "checkInBranch.branchName": 1,
          "member._id": 1,
          "member.memberFullName": 1,
          "member.mobileNumber": 1,
          checkin_date: 1,
          bookingNo: 1,
          branch: 1,
          pax: 1,
          "package._id": 1,
          "package.packageName": 1,
          "package.packageCode": 1,
          "package.packageCategory": 1,
          "package.packagePrice": 1,
          totalCost: { $multiply: ["$package.packagePrice", "$pax"] },
        },
      },
      // { out: "agg_res_temp" },
      // {
      //   $group: {
      //     _id: {
      //       packageCategory: "$package.packageCategory",
      //       packageName: "$package.packageName",
      //     },
      //     orderTotalAmount: { $sum: "$unitAmount" },
      //     orderTotalTaxAmount: { $sum: "$taxAmount" },
      //     orderTotalNetAmount: { $sum: "$netAmount" },
      //   },
      // },
      // {
      //   $group: {
      //     _id: {
      //       packageCategory: "$package.packageCategory",
      //       packageName: "$package.packageName",
      //     },
      //     orderTotalAmount: { $sum: "$order.orderTotalAmount" },
      //     orderTotalTaxAmount: { $sum: "$order.orderTotalTaxAmount" },
      //     orderTotalNetAmount: { $sum: "$order.orderTotalNetAmount" },unitPrice, quantity, discountPrice, unitAmount, taxAmount, netAmount
      //   },
      // },
      // {
      //   $group: {
      //     _id: {
      //       packageCategory: "$packageCategory",
      //     },
      //     orderTotalAmount: { $sum: "$order.orderTotalAmount" },
      //     orderTotalTaxAmount: { $sum: "$order.orderTotalTaxAmount" },
      //     orderTotalNetAmount: { $sum: "$order.orderTotalNetAmount" },
      //   },
      // },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getMemberPackageUsageSummary(query) {
  try {
    let startDate = new Date(query.selectedStartDate);
    let endDate = new Date(query.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // let startDate = new Date(new Date(query.selectedStartDate).setHours(0, 0, 0));
    // let endDate = new Date(
    //   new Date(query.selectedEndDate).setHours(23, 59, 59, 999)
    // );
    // const memberpackages = await MemberPackage.find({ purchaseBranch: "" });
    // checkin_date;
    const aa = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          as: "memberPackage",
        },
      },
      {
        $unwind: "$memberPackage",
      },
      {
        $addFields: {
          homeBranchId: {
            $toString: "$memberPackage.purchaseBranch",
          },
        },
      },
      {
        $match: {
          $and: [
            {
              bookingDate: {
                $gte: startDate, // ex: 2020-11-25T00:00:00.00Z
                $lte: endDate, // ex: 2020-11-25T23:59:59.00Z
              },
            },
            { homeBranchId: { $in: query.selectedBranch.split(",") } },
            // { status: { $eq: "Paid" } },
          ],
        },
      },
      // {
      //   $addFields: {
      //     packageId: {
      //       $toObjectId: "$member",
      //     },
      //   },
      // },
      {
        $lookup: {
          from: "branches",
          localField: "memberPackage.purchaseBranch",
          foreignField: "_id",
          as: "homeBranch",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            homeBranch: {
              $arrayElemAt: ["$homeBranch", 0],
            },
          },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "checkInBranch",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            checkInBranch: {
              $arrayElemAt: ["$checkInBranch", 0],
            },
          },
      },
      // {
      //   $unwind: "$homeBranch",
      // },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      // {
      //   $unwind: "$member",
      // },
      {
        $lookup: {
          from: "packages",
          localField: "memberPackage.package",
          foreignField: "_id",
          as: "packages",
        },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            package: {
              $arrayElemAt: ["$packages", 0],
            },
          },
      },
      {
        $project: {
          // homeBranchId: 1,
          // homeBranch: 1,
          "homeBranch.branchName": 1,
          "checkInBranch.branchName": 1,
          "member._id": 1,
          "member.memberFullName": 1,
          "member.mobileNumber": 1,
          checkin_date: 1,
          branch: 1,
          pax: 1,
          "package._id": 1,
          "package.packageName": 1,
          "package.packageCode": 1,
          "package.packageCategory": 1,
          "package.packagePrice": 1,
          totalCost: { $multiply: ["$package.packagePrice", "$pax"] },
        },
      },
      {
        $group: {
          _id: {
            home: "$homeBranch.branchName",
            checkIn: "$checkInBranch.branchName",
          },
          orderTotalAmount: { $sum: "$totalCost" },
        },
      },
    ]);
    return aa;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}
