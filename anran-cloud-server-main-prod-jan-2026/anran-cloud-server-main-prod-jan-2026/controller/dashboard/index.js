const Orders = require("../../models/orders");
const Payments = require("../../models/payments");
const ordersItem = require("../../models/ordersItem");
const Members = require("../../models/members");
const MemberPackage = require("../../models/memberPackage");
const MemberBooking = require("../../models/memberBooking");

module.exports = {
  getBookingStatusCount,
  getMemberRegisterCount,
  getBranchCount,
  getMemberRegisterMonthlyByYear,
  getTotalNetSales,
  getTop10SellingPackages,
  getTop5SellingPackages,
};

async function getBookingStatusCount(params) {
  try {
    const dateFilters = {};
    const branchFilters = {};
    if (params.selectedStartDate || params.selectedEndDate) {
      dateFilters.bookingDate = {};
      if (params.selectedStartDate)
        dateFilters.bookingDate.$gte = new Date(
          new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
        );
      if (params.selectedEndDate)
        dateFilters.bookingDate.$lte = new Date(
          new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
        );
    }
    if (params.selectedBranch && params.selectedBranch != "All") {
      branchFilters.convertedId = {};
      branchFilters["convertedId"].$in = params.selectedBranch.split(",");
    }

    const obj = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $match: {
          ...dateFilters,
          ...branchFilters,
        },
      },
      {
        $project: {
          branch: 1,
          bookingstatus: 1,
        },
      },
      {
        $sort: {
          bookingstatus: 1,
        },
      },
      {
        $group: {
          _id: {
            status: "$bookingstatus",
          },
          itemCount: { $count: {} },
        },
      },
      {
        $addFields: { status: { $toString: "$_id.status" } },
      },
      {
        $project: {
          _id: 0,
          status: 1,
          itemCount: 1,
        },
      },
    ]);
    const chartData = [
      {
        id: 1,
        key: "Complete",
        title: "Completed",
        value: 0,
        color: "#54B435",
      },
      {
        id: 2,
        key: "No Show",
        title: "No Show",
        value: 0,
        color: "#0A8FDC",
      },
      {
        id: 3,
        key: "Booked",
        title: "Booked",
        value: 0,
        color: "#ff9800",
      },
      {
        id: 4,
        key: "Cancel",
        title: "Cancelled",
        value: 0,
        color: "#F04F47",
      },
    ];
    obj.forEach(function ({ itemCount, status }) {
      if (status == "Complete") {
        chartData[0].value = itemCount;
      }
      if (status == "No Show") {
        chartData[1].value = itemCount;
      }
      if (status == "Booked") {
        chartData[2].value = itemCount;
      }
      if (status == "Cancel") {
        chartData[3].value = itemCount;
      }
    });
    return chartData;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getMemberRegisterMonthlyByYear(params) {
  try {
    const year = Number(params.selectedYear);
    if (!year || Number.isNaN(year)) {
      return { status: false, statusCode: 400, message: "selectedYear is required" };
    }

    const start = new Date(year, 0, 1, 0, 0, 0, 0);      // Jan 1
    const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);    // Jan 1 next year (exclusive)

    const result = await Members.aggregate([
      {
        $match: {
          memberDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $month: "$memberDate" }, // 1..12
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Optional: return all months (1..12) even if missing
    const filled = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const hit = result.find((x) => x.month === m);
      return { month: m, count: hit ? hit.count : 0 };
    });

    return filled;
  } catch (err) {
    return { status: false, statusCode: 500, message: err.message };
  }
}


async function getMemberRegisterCount(params) {
  try {
    const dateFilters = {};
    if (params.selectedStartDate || params.selectedEndDate) {
      dateFilters.memberDate = {};
      if (params.selectedStartDate)
        dateFilters.memberDate.$gte = new Date(
          new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
        );
      if (params.selectedEndDate)
        dateFilters.memberDate.$lte = new Date(
          new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
        );
    }

    const obj = await Members.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "preferredBranch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $addFields: {
          branchCode: {
            $toString: "$branch.branchCode",
          },
        },
      },
      {
        $match: {
          ...dateFilters,
        },
      },
      {
        $project: {
          branchCode: 1,
          memberFullName: 1,
        },
      },
      {
        $sort: {
          branchCode: -1,
        },
      },
      {
        $group: {
          _id: {
            branch: "$branchCode",
          },
          count: { $count: {} },
        },
      },
      {
        $addFields: {
          branchCode: { $toString: "$_id.branch" },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      // {
      //   $limit: 10,
      // },
      {
        $project: {
          _id: 0,
          branchCode: 1,
          count: 1,
        },
      },
    ]);
    return obj;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getBranchCount(params) {
  try {
    const dateFilters = {};
    if (params.selectedStartDate || params.selectedEndDate) {
      dateFilters.bookingDate = {};
      if (params.selectedStartDate)
        dateFilters.bookingDate.$gte = new Date(
          new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
        );
      if (params.selectedEndDate)
        dateFilters.bookingDate.$lte = new Date(
          new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
        );
    }

    const obj = await Members.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "preferredBranch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $addFields: {
          branchCode: {
            $toString: "$branch.branchCode",
          },
        },
      },
      {
        $project: {
          branchCode: 1,
          memberFullName: 1,
        },
      },
      {
        $sort: {
          branchCode: -1,
        },
      },
      {
        $group: {
          _id: {
            branch: "$branchCode",
          },
          itemCount: { $count: {} },
        },
      },
      {
        $addFields: {
          branchCode: { $toString: "$_id.branch" },
        },
      },
      {
        $sort: {
          itemCount: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          branchCode: 1,
          itemCount: 1,
        },
      },
    ]);
    return obj;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getTotalNetSales(params) {
  try {
    const dateFilters = {};
    const branchFilters = {};
    const selectedYear = Number.parseInt(params.selectedYear, 10);
    if (!Number.isNaN(selectedYear)) {
      dateFilters.orderDate = {
        $gte: new Date(selectedYear, 0, 1, 0, 0, 0, 0),
        $lte: new Date(selectedYear, 11, 31, 23, 59, 59, 999),
      };
    }

    if (params.selectedBranch && params.selectedBranch !== "All") {
      branchFilters.convertedBranchId = {
        $in: String(params.selectedBranch).split(","),
      };
    }
    const rr = await Orders.aggregate([
      {
        $addFields: {
          convertedBranchId: { $toString: "$orderBranch" },
        },
      },
      {
        $match: {
          status: "Paid",
          ...dateFilters,
          ...branchFilters,
        },
      },
      { $sort: { orderDate: 1 } },
      {
        $group: {
          _id: {
            orderDate: { $dateToString: { format: "%b", date: "$orderDate" } },
          },
          orderTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          count: { $count: {} },
        },
      },
      { $sort: { "_id.orderDate": 1 } }, // alphabetical, same as before
      { $addFields: { month: { $toString: "$_id.orderDate" } } },
      { $addFields: { amount: { $toString: "$orderTotalNetAmount" } } },
      { $project: { _id: 0, month: 1, count: 1, amount: 1 } },
    ]);

    return rr;
  } catch (err) {
    return { status: false, statusCode: 500, message: err.message };
  }
}

// async function getTotalNetSales(params) {
//   try {
//     const dateFilters = {};
//     const branchFilters = {};
//     const selectedYear = Number.parseInt(params.selectedYear, 10);
//     if (!Number.isNaN(selectedYear)) {
//       dateFilters.orderDate = {
//         $gte: new Date(selectedYear, 0, 1, 0, 0, 0, 0),
//         $lte: new Date(selectedYear, 11, 31, 23, 59, 59, 999),
//       };
//     }
//     if (params.selectedStartDate || params.selectedEndDate) {
//       dateFilters.orderDate = dateFilters.orderDate || {};
//       if (params.selectedStartDate)
//         dateFilters.orderDate.$gte = new Date(
//           new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
//         );
//       if (params.selectedEndDate)
//         dateFilters.orderDate.$lte = new Date(
//           new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
//         );
//     }
//     if (params.selectedBranch && params.selectedBranch != "All") {
//       branchFilters.convertedBranchId = {};
//       branchFilters["convertedBranchId"].$in = params.selectedBranch.split(",");
//     }
//     const rr = await Orders.aggregate([
//       {
//         $addFields: {
//           convertedBranchId: {
//             $toString: "$orderBranch",
//           },
//         },
//       },
//       {
//         $match: {
//           status: "Paid",
//           ...dateFilters,
//           ...branchFilters,
//         },
//       },
//       {
//         $sort: {
//           orderDate: 1,
//         },
//       },
//       {
//         $group: {
//           _id: {
//             // orderBranch: "$orderBranch",
//             orderDate: {
//               $dateToString: { format: "%b", date: "$orderDate" },
//             },
//           },
//           orderTotalNetAmount: { $sum: "$orderTotalNetAmount" },
//           count: { $count: {} },
//         },
//       },
//       {
//         $sort: {
//           "_id.orderDate": 1,
//         },
//       },
//       {
//         $addFields: {
//           month: { $toString: "$_id.orderDate" },
//         },
//       },
//       {
//         $addFields: {
//           amount: { $toString: "$orderTotalNetAmount" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           month: 1,
//           count: 1,
//           amount: 1,
//           // amount: { $concat: ["RM ", "$amount"] },
//         },
//       },
//     ]);

//     return rr;
//   } catch (err) {
//     return {
//       status: false,
//       statusCode: 500,
//       message: err.message,
//     };
//   }
// }

async function getTop10SellingPackages(params) {
  try {
    const dateFilters = {};
    const branchFilters = {};
    if (params.selectedStartDate || params.selectedEndDate) {
      dateFilters.orderDate = {};
      if (params.selectedStartDate)
        dateFilters.orderDate.$gte = new Date(
          new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
        );
      if (params.selectedEndDate)
        dateFilters.orderDate.$lte = new Date(
          new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
        );
    }
    if (params.selectedBranch && params.selectedBranch != "All") {
      branchFilters.convertedBranchId = {};
      branchFilters["convertedBranchId"].$in = params.selectedBranch.split(",");
    }
    const rr = await ordersItem.aggregate([
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
          orderDate: {
            $toDate: "$order.orderDate",
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
          ...dateFilters,
          ...branchFilters,
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
          packageCode: {
            $toString: "$package.packageCode",
          },
        },
      },
      {
        $addFields: {
          status: {
            $toString: "$order.status",
          },
        },
      },
      {
        $project: {
          _id: 0,
          packageCode: 1,
          quantity: 1,
          status: 1,
          unitAmount: 1,
          // amount: { $concat: ["RM ", "$amount"] },
        },
      },
      {
        $match: {
          $and: [
            {
              status: {
                $eq: "Paid",
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            // orderBranch: "$orderBranch",
            packageCode: "$packageCode",
          },
          amount: {
            $sum: "$unitAmount",
          },
          count: { $count: {} },
        },
      },
      {
        $addFields: {
          packageCode: {
            $toString: "$_id.packageCode",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          packageCode: 1,
          count: 1,
          amount: 1,
        },
      },
    ]);
    // console.log(rr);
    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getTop5SellingPackages(params) {
  try {
    const dateFilters = {};
    const branchFilters = {};
    if (params.selectedStartDate || params.selectedEndDate) {
      dateFilters.orderDate = {};
      if (params.selectedStartDate)
        dateFilters.orderDate.$gte = new Date(
          new Date(params.selectedStartDate).setHours(0, 0, 0, 0)
        );
      if (params.selectedEndDate)
        dateFilters.orderDate.$lte = new Date(
          new Date(params.selectedEndDate).setHours(23, 59, 59, 999)
        );
    }
    if (params.selectedBranch && params.selectedBranch != "All") {
      branchFilters.convertedBranchId = {};
      branchFilters["convertedBranchId"].$in = params.selectedBranch.split(",");
    }
    const rr = await Orders.aggregate([
      {
        $match: {
          ...dateFilters,
          status: {
            $eq: "Paid"
          }
        }
      },
      {
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          ...branchFilters,
        }
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderNumber",
          foreignField: "orderNo",
          as: "orderItems",
          pipeline: [
            {
              $project: {
                package: 1,
                unitAmount: 1,
                quantity: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$orderItems"
      },
      {
        $addFields: {
          orderItems: "$orderItems"
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "orderItems.package",
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
        $unwind: "$package"
      },
      {
        $addFields: {
          package: "$package"
        }
      },
      {
        $project: {
          "package.packageCode": 1,
          "orderItems.quantity": 1,
          status: 1,
          "orderItems.unitAmount": 1
        }
      },
      {
        $group: {
          _id: {
            packageCode: "$package.packageCode"
          },
          amount: {
            $sum: "$orderItems.unitAmount"
          },
          count: { $count: {} }
        }
      },
      {
        $addFields: {
          packageCode: {
            $toString: "$_id.packageCode"
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          packageCode: 1,
          count: 1,
          amount: 1
        }
      }
    ]);
    // console.log(rr);
    return rr;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}
