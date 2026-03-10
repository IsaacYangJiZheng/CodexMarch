const express = require("express");
const mongoose = require("mongoose");
var crypto = require("crypto");
const Razorpay = require("razorpay");
const Payments = require("../../models/payments");
const Orders = require("../../models/orders");
const OrderItems = require("../../models/ordersItem");
const PaymentGateway = require("../../models/payment_gateway");
const Package = require("../../models/package");
const Staff = require("../../models/staff");
const MemberPackage = require("../../models/memberPackage");
const Members = require("../../models/members");
const router = express.Router();
const { generatePayRunningNumber } = require("../../routes/api/utils");
const auth = require("./jwtfilter");
const {
  sendPurchaseConfirmNotification,
} = require("../../helper/notification");
const {
  registerOnlinePayment,
  registerOnlinePaymentError,
} = require("../../helper/payments/functions");

// Get a branch by ID
router.get("/keys/:id", async (req, res) => {
  try {
    const obj = await PaymentGateway.findOne({
      branch: req.params.id,
    });
    if (!obj) {
      return res.status(404).json({ error: "Keys not found" });
    }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/list/v2", async (req, res) => {
  try {
    const obj = await OrderItems.aggregate([
      {
        $addFields: {
          convertedId: {
            $toString: "$order",
          },
        },
      },
      {
        $addFields: {
          payDateStr: {
            $dateToString: { date: "$payDate", format: "%Y-%m-%d" },
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
        $addFields: {
          package: {
            $arrayElemAt: ["$package", 0],
          },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "order",
          pipeline: [
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
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                member: {
                  $arrayElemAt: ["$member", 0],
                },
              },
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
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                branch: {
                  $arrayElemAt: ["$branch", 0],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          order: {
            $arrayElemAt: ["$order", 0],
          },
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "orderNo",
          foreignField: "orderNumber",
          as: "payment",
        },
      },
      {
        $addFields: {
          payment: {
            $arrayElemAt: ["$payment", 0],
          },
        },
      },
      { $sort: { "payment.payDate": -1 } },
      {
        $lookup: {
          from: "members",
          localField: "order.member",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                MB_full_name: 1,
                MB_mobile_number: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$member", 0],
          },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/list", async (req, res) => {
  try {
    const obj = await Payments.aggregate([
      {
        $addFields: {
          convertedId: {
            $toString: "$_id",
          },
        },
      },
      {
        $addFields: {
          payDateStr: {
            $dateToString: { date: "$payDate", format: "%Y-%m-%d" },
          },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderNumber",
          foreignField: "orderNo",
          as: "items",
          pipeline: [
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                as: "packages",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$packages", 0],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "payer",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                MB_full_name: 1,
                MB_mobile_number: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$member", 0],
          },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/findAll/today", auth, async (req, res) => {
  try {
    const { memberName, mobileNumber, orderNumber, orderBranch, orderMode } =
      req.body;
    const dateFilters = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Filter to only include today's records
    dateFilters["payDate"] = { $gte: todayStart, $lte: todayEnd };
    const filters = {};
    if (orderNumber) filters.orderNo = new RegExp(orderNumber, "i");
    if (orderMode) filters["order.orderMode"] = new RegExp(orderMode);

    const orderBranchFilters = {};
    if (orderBranch)
      orderBranchFilters["order.convertedBranchId"] = orderBranch;

    const memberFilters = {};
    if (memberName)
      memberFilters["member.memberFullName"] = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters["member.mobileNumber"] = new RegExp(mobileNumber, "i");

    if (req.user.uid !== "admin" && !orderBranch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      orderBranchFilters["order.branch._id"] = { $in: branchIds };
    }

    const obj = await Payments.aggregate([
      {
        $match: { ...dateFilters },
      },
      {
        $lookup: {
          from: "members",
          localField: "payer",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$member", 0],
          },
        },
      },
      { $match: { ...memberFilters } },
      {
        $lookup: {
          from: "orders",
          localField: "orderNumber",
          foreignField: "orderNumber",
          as: "order",
          pipeline: [
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
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                branch: {
                  $arrayElemAt: ["$branch", 0],
                },
              },
            },
            {
              $addFields: {
                convertedBranchId: {
                  $toString: "$branch._id",
                },
              },
            },
            {
              $lookup: {
                from: "orderitems",
                localField: "orderNumber",
                foreignField: "orderNo",
                as: "items",
              },
            },
            {
              $addFields: {
                items: {
                  $arrayElemAt: ["$items", 0],
                },
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "items.package",
                foreignField: "_id",
                as: "package",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
            {
              $project: {
                orderMode: 1,
                branch: 1,
                convertedBranchId: 1,
                orderTotalAmount: 1,
                orderTotalDiscountAmount: 1,
                orderTotalTaxAmount: 1,
                orderTotalNetAmount: 1,
                status: 1,
                items: 1,
                package: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          order: { $arrayElemAt: ["$order", 0] },
        },
      },
      { $match: { ...filters, ...orderBranchFilters } },
      { $sort: { payDate: -1 } },
    ]);
    // console.log(obj);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

// router.post("/findAll/today-old-method", auth, async (req, res) => {
//   try {
//     const { memberName, mobileNumber, orderNumber, orderBranch, orderMode } =
//       req.body;
//     const filters = {};
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // Filter to only include today's records
//     filters["payment.payDate"] = { $gte: todayStart, $lte: todayEnd };
//     if (orderNumber) filters.orderNo = new RegExp(orderNumber, "i");
//     if (orderMode) filters["order.orderMode"] = new RegExp(orderMode);

//     const orderBranchFilters = {};
//     if (orderBranch)
//       orderBranchFilters["order.convertedBranchId"] = orderBranch;

//     const memberFilters = {};
//     if (memberName)
//       memberFilters["order.member.memberFullName"] = new RegExp(
//         memberName,
//         "i"
//       );
//     if (mobileNumber)
//       memberFilters["order.member.mobileNumber"] = new RegExp(
//         mobileNumber,
//         "i"
//       );

//     if (req.user.uid !== "admin") {
//       const staff = await Staff.findOne({ _id: req.user.uid }).populate(
//         "branch"
//       );
//       if (!staff || !staff.branch || !staff.branch.length) {
//         return res
//           .status(404)
//           .send({ message: "No branches found for the user" });
//       }

//       const branchIds = staff.branch.map((branch) => branch._id);
//       orderBranchFilters["order.orderBranch"] = { $in: branchIds };
//     }

//     const obj = await OrderItems.aggregate([
//       {
//         $addFields: {
//           convertedId: { $toString: "$order" },
//         },
//       },
//       {
//         $lookup: {
//           from: "packages",
//           localField: "package",
//           foreignField: "_id",
//           as: "package",
//         },
//       },
//       {
//         $addFields: {
//           package: { $arrayElemAt: ["$package", 0] },
//         },
//       },
//       {
//         $lookup: {
//           from: "orders",
//           localField: "orderNo",
//           foreignField: "orderNumber",
//           as: "order",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "members",
//                 localField: "member",
//                 foreignField: "_id",
//                 as: "member",
//                 pipeline: [
//                   {
//                     $project: {
//                       memberFullName: 1,
//                       mobileNumber: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $addFields: {
//                 member: { $arrayElemAt: ["$member", 0] },
//               },
//             },
//             {
//               $lookup: {
//                 from: "branches",
//                 localField: "orderBranch",
//                 foreignField: "_id",
//                 as: "branch",
//                 pipeline: [
//                   {
//                     $project: {
//                       branchName: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $addFields: {
//                 branch: { $arrayElemAt: ["$branch", 0] },
//               },
//             },
//             {
//               $addFields: {
//                 convertedBranchId: { $toString: "$branch._id" },
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           order: { $arrayElemAt: ["$order", 0] },
//         },
//       },
//       { $match: { ...orderBranchFilters } },
//       {
//         $lookup: {
//           from: "payments",
//           localField: "orderNo",
//           foreignField: "orderNumber",
//           as: "payment",
//         },
//       },
//       {
//         $addFields: {
//           payment: { $arrayElemAt: ["$payment", 0] },
//           paymentMethods: {
//             $cond: {
//               if: { $gt: [{ $size: "$payment" }, 0] },
//               then: {
//                 $reduce: {
//                   input: "$payment",
//                   initialValue: "",
//                   in: {
//                     $concat: [
//                       "$$value",
//                       { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
//                       "$$this.payMethod",
//                     ],
//                   },
//                 },
//               },
//               else: "",
//             },
//           },
//           paymentReferences: {
//             $cond: {
//               if: { $gt: [{ $size: "$payment" }, 0] },
//               then: {
//                 $reduce: {
//                   input: "$payment",
//                   initialValue: "",
//                   in: {
//                     $concat: [
//                       "$$value",
//                       { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
//                       "$$this.payReference",
//                     ],
//                   },
//                 },
//               },
//               else: "",
//             },
//           },
//         },
//       },
//       // {
//       //   $addFields: {
//       //     payment: { $arrayElemAt: ["$payment", 0] },
//       //   },
//       // },
//       { $sort: { "payment.payDate": -1 } },

//       // Apply filters here
//       { $match: { ...filters, ...memberFilters } },

//       {
//         $lookup: {
//           from: "members",
//           localField: "order.member",
//           foreignField: "_id",
//           as: "member",
//           pipeline: [
//             {
//               $project: {
//                 MB_full_name: 1,
//                 MB_mobile_number: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           member: { $arrayElemAt: ["$member", 0] },
//         },
//       },
//     ]);
//     console.log(obj);
//     res.send(obj);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.post("/findAll", auth, async (req, res) => {
  try {
    const {
      memberName,
      mobileNumber,
      orderNumber,
      orderBranch,
      startDate,
      endDate,
      orderMode,
    } = req.body;
    const dateFilters = {};
    // const orderFilters = {};
    const filters = {};
    if (orderNumber) filters.orderNumber = new RegExp(orderNumber, "i");
    if (startDate || endDate) {
      dateFilters["payDate"] = {};
      // filters["payDate"] = {};
      if (startDate)
        // filters["payDate"].$gte = new Date(
        //   new Date(startDate).setHours(0, 0, 0, 0)
        // );
        dateFilters["payDate"].$gte = new Date(
          new Date(startDate).setHours(0, 0, 0, 0)
        );
      if (endDate)
        // filters["payDate"].$lte = new Date(
        //   new Date(endDate).setHours(23, 59, 59, 999)
        // );
        dateFilters["payDate"].$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
    }
    if (orderMode) filters["order.orderMode"] = new RegExp(orderMode);

    const orderBranchFilters = {};
    if (orderBranch)
      orderBranchFilters["order.convertedBranchId"] = orderBranch;

    const memberFilters = {};
    if (memberName)
      memberFilters["member.memberFullName"] = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters["member.mobileNumber"] = new RegExp(mobileNumber, "i");

    if (req.user.uid !== "admin" && !orderBranch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      orderBranchFilters["order.orderBranch"] = { $in: branchIds };
    }

    const obj = await Payments.aggregate([
      {
        $match: { ...dateFilters },
      },
      {
        $lookup: {
          from: "members",
          localField: "payer",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$member", 0],
          },
        },
      },
      { $match: { ...memberFilters } },
      {
        $lookup: {
          from: "orders",
          localField: "orderNumber",
          foreignField: "orderNumber",
          as: "order",
          pipeline: [
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
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                branch: {
                  $arrayElemAt: ["$branch", 0],
                },
              },
            },
            {
              $addFields: {
                convertedBranchId: {
                  $toString: "$branch._id",
                },
              },
            },
            {
              $lookup: {
                from: "orderitems",
                localField: "orderNumber",
                foreignField: "orderNo",
                as: "items",
              },
            },
            {
              $addFields: {
                items: {
                  $arrayElemAt: ["$items", 0],
                },
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "items.package",
                foreignField: "_id",
                as: "package",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
            {
              $project: {
                orderMode: 1,
                branch: 1,
                convertedBranchId: 1,
                orderTotalAmount: 1,
                orderTotalDiscountAmount: 1,
                orderTotalTaxAmount: 1,
                orderTotalNetAmount: 1,
                status: 1,
                items: 1,
                package: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          order: { $arrayElemAt: ["$order", 0] },
        },
      },
      { $match: { ...filters, ...orderBranchFilters } },
      { $sort: { payDate: -1 } },
    ]);
    // console.log(obj);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

// router.post("/findAll-old-method", auth, async (req, res) => {
//   try {
//     const {
//       memberName,
//       mobileNumber,
//       orderNumber,
//       orderBranch,
//       startDate,
//       endDate,
//       orderMode,
//     } = req.body;
//     const filters = {};
//     if (orderNumber) filters.orderNo = new RegExp(orderNumber, "i");
//     if (startDate || endDate) {
//       filters["payment.payDate"] = {};
//       if (startDate)
//         filters["payment.payDate"].$gte = new Date(
//           new Date(startDate).setHours(0, 0, 0, 0)
//         );
//       if (endDate)
//         filters["payment.payDate"].$lte = new Date(
//           new Date(endDate).setHours(23, 59, 59, 999)
//         );
//     }
//     if (orderMode) filters["order.orderMode"] = new RegExp(orderMode);

//     const orderBranchFilters = {};
//     if (orderBranch)
//       orderBranchFilters["order.convertedBranchId"] = orderBranch;

//     const memberFilters = {};
//     if (memberName)
//       memberFilters["order.member.memberFullName"] = new RegExp(
//         memberName,
//         "i"
//       );
//     if (mobileNumber)
//       memberFilters["order.member.mobileNumber"] = new RegExp(
//         mobileNumber,
//         "i"
//       );

//     if (req.user.uid !== "admin") {
//       const staff = await Staff.findOne({ _id: req.user.uid }).populate(
//         "branch"
//       );
//       if (!staff || !staff.branch || !staff.branch.length) {
//         return res
//           .status(404)
//           .send({ message: "No branches found for the user" });
//       }

//       const branchIds = staff.branch.map((branch) => branch._id);
//       orderBranchFilters["order.orderBranch"] = { $in: branchIds };
//     }

//     const obj = await OrderItems.aggregate([
//       {
//         $addFields: {
//           convertedId: { $toString: "$order" },
//         },
//       },
//       {
//         $lookup: {
//           from: "packages",
//           localField: "package",
//           foreignField: "_id",
//           as: "package",
//         },
//       },
//       {
//         $addFields: {
//           package: { $arrayElemAt: ["$package", 0] },
//         },
//       },
//       {
//         $lookup: {
//           from: "orders",
//           localField: "orderNo",
//           foreignField: "orderNumber",
//           as: "order",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "members",
//                 localField: "member",
//                 foreignField: "_id",
//                 as: "member",
//                 pipeline: [
//                   {
//                     $project: {
//                       memberFullName: 1,
//                       mobileNumber: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $addFields: {
//                 member: { $arrayElemAt: ["$member", 0] },
//               },
//             },
//             {
//               $lookup: {
//                 from: "branches",
//                 localField: "orderBranch",
//                 foreignField: "_id",
//                 as: "branch",
//                 pipeline: [
//                   {
//                     $project: {
//                       branchName: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $addFields: {
//                 branch: { $arrayElemAt: ["$branch", 0] },
//               },
//             },
//             {
//               $addFields: {
//                 convertedBranchId: { $toString: "$branch._id" },
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           order: { $arrayElemAt: ["$order", 0] },
//         },
//       },
//       { $match: { ...orderBranchFilters } },
//       {
//         $lookup: {
//           from: "payments",
//           localField: "orderNo",
//           foreignField: "orderNumber",
//           as: "payment",
//         },
//       },
//       {
//         $addFields: {
//           payment: { $arrayElemAt: ["$payment", 0] },
//           paymentMethods: {
//             $cond: {
//               if: { $gt: [{ $size: "$payment" }, 0] },
//               then: {
//                 $reduce: {
//                   input: "$payment",
//                   initialValue: "",
//                   in: {
//                     $concat: [
//                       "$$value",
//                       { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
//                       "$$this.payMethod",
//                     ],
//                   },
//                 },
//               },
//               else: "",
//             },
//           },
//           paymentReferences: {
//             $cond: {
//               if: { $gt: [{ $size: "$payment" }, 0] },
//               then: {
//                 $reduce: {
//                   input: "$payment",
//                   initialValue: "",
//                   in: {
//                     $concat: [
//                       "$$value",
//                       { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
//                       "$$this.payReference",
//                     ],
//                   },
//                 },
//               },
//               else: "",
//             },
//           },
//         },
//       },
//       // {
//       //   $addFields: {
//       //     payment: { $arrayElemAt: ["$payment", 0] },
//       //   },
//       // },
//       { $sort: { "payment.payDate": -1 } },

//       // Apply filters here
//       { $match: { ...filters, ...memberFilters } },

//       {
//         $lookup: {
//           from: "members",
//           localField: "order.member",
//           foreignField: "_id",
//           as: "member",
//           pipeline: [
//             {
//               $project: {
//                 MB_full_name: 1,
//                 MB_mobile_number: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           member: { $arrayElemAt: ["$member", 0] },
//         },
//       },
//     ]);
//     console.log(obj);
//     res.send(obj);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.post("/payment-callback/order", async (req, res) => {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    // console.log(
    //   "payment-callback: Start : ",
    //   order_id,
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature
    // );
    const order = await Orders.findById(order_id).populate({
      path: "orderBranch",
      select: { _id: 1, branchName: 1, branchCode: 1 },
    });
    const obj = await PaymentGateway.findOne({
      branch: order.orderBranch._id,
      isActive: true,
    });
    const razorpayInstance = new Razorpay({
      key_id: obj.providerKey1,
      key_secret: obj.providerKey2,
    });
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    const generated_signature = crypto
      .createHmac("sha256", obj.providerKey2)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generated_signature === razorpay_signature) {
      // console.log("payment-callback: signature matched");
      let payRecordIds = [];
      const nextPayNumber = await generatePayRunningNumber(
        order.orderBranch.branchCode
      );
      let pay_obj = {
        paymentNumber: nextPayNumber,
        orderNumber: order.orderNumber,
        payer: order.member,
        payType: "Online",
        payMethod: payment.method,
        payAmount: payment.amount / 100,
      };
      const pay = new Payments(pay_obj);
      const pp = await pay.save();
      payRecordIds.push(pp._id);
      await Orders.updateOne(
        { _id: order._id },
        { $set: { payments: payRecordIds, status: "Paid" } }
      );
      const items = await OrderItems.find({ order: order_id });
      let orderItems2 = [];
      for await (const item of items) {
        const pack = await Package.findById(item.package);
        if (pack.packageValidity == "fixed") {
          let member_package_obj = {
            member: order.member,
            orderItem: item._id,
            package: pack._id,
            purchaseBranch: order.orderBranch,
            purchaseDate: order.orderDate,
            packageValidity: pack.packageValidity,
            validDate: pack.packageFixedValidityDate2,
            originalBalance: pack.packageUnlimitedStatus
              ? 99999
              : pack.packageUsageLimit * item.quantity,
            currentBalance: pack.packageUnlimitedStatus
              ? 99999
              : pack.packageUsageLimit * item.quantity,
          };
          orderItems2.push(member_package_obj);
        } else {
          let member_package_obj = {
            member: order.member,
            orderItem: item._id,
            package: pack._id,
            purchaseBranch: order.orderBranch,
            purchaseDate: order.orderDate,
            packageValidity: pack.packageValidity,
            originalBalance: pack.packageUnlimitedStatus
              ? 99999
              : pack.packageUsageLimit * item.quantity,
            currentBalance: pack.packageUnlimitedStatus
              ? 99999
              : pack.packageUsageLimit * item.quantity,
          };
          orderItems2.push(member_package_obj);
        }
      }
      let mpIds = await MemberPackage.insertMany(orderItems2);
      await Members.findByIdAndUpdate(
        { _id: order.member },
        { lastPurchaseDate: Date.now() }
      );
      await sendPurchaseConfirmNotification(pp, mpIds[0]._id);
      // for (mpid in mpIds) {
      //   await sendPurchaseConfirmNotification(pp, mpid._id);
      // }
      // console.log("payment-callback: Payment verified successfully");
      res.json({ status: "success", message: "Payment verified successfully" });
    } else {
      // console.log("payment-callback: signature failed");
      res.status(400).json({ status: "failed", message: "Invalid signature" });
    }
  } catch (error) {
    // console.log(error);
    // console.log("payment-callback: Failed :", error);
    res.status(500).send({ message: error.message });
  }
});

router.post("/payment-callback/error/order", async (req, res) => {
  try {
    const { order_id, razorpay_error_code, razorpay_error_message } = req.body;
    const order = await Orders.findById(order_id).populate({
      path: "orderBranch",
      select: { _id: 1, branchName: 1, branchCode: 1 },
    });
    let err_desc = [
      "Code:",
      razorpay_error_code,
      ",",
      "message:",
      razorpay_error_message,
    ].join("");
    await Orders.updateOne(
      { _id: order._id },
      { $set: { description: err_desc, status: "Failed" } }
    );
    res.json({ status: "Failed-OK", message: razorpay_error_message });
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error.message });
  }
});

router.post("/cancel/order", async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await Orders.findById(order_id).populate({
      path: "orderBranch",
      select: { _id: 1, branchName: 1, branchCode: 1 },
    });
    await Orders.updateOne(
      { _id: order._id },
      { $set: { description: "Member cancelled the order", status: "Failed" } }
    );
    res.json({ status: "Failed-OK", message: "Member cancelled the order" });
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error.message });
  }
});

router.post("/payment/success/callback", async (req, res) => {
  // https://curlec.com/docs/webhooks/payloads/payments/
  const { event, payload } = req.body;
  if (event == "payment.captured") {
    received_signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", "12345678");
    shasum.update(JSON.stringify(req.body));
    const expected_signature = shasum.digest("hex");
    if (expected_signature != received_signature) {
      // console.log("received signature is not valid");
    } else {
      const { payment } = payload;
      const { entity } = payment;
      if (entity.order_id != null) {
        // console.log(entity);
        registerOnlinePayment(entity.order_id, entity.id);
      } else {
        // console.log(req.body);
      }
    }
  }
  res.status(200).send("OK");
});

router.post("/payment/failed/callback", async (req, res) => {
  // https://curlec.com/docs/webhooks/payloads/payments/
  const { event, payload } = req.body;
  if (event == "payment.failed") {
    const { payment } = payload;
    const { entity } = payment;
    if (entity.order_id != null) {
      // console.log(entity);
      registerOnlinePaymentError(entity);
    } else {
      // console.log(req.body);
    }
  }
  res.status(200).send("OK");
});

module.exports = router;
