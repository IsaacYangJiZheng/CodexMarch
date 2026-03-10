const express = require("express");
const mongoose = require("mongoose");
const MemberDevice = require("../../models/memberDevice");
const MemberPackage = require("../../models/memberPackage");
const MemberBooking = require("../../models/memberBooking");
const Members = require("../../models/members");
const Branch = require("../../models/branch");
const Tax = require("../../models/tax");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const xlsx = require("xlsx");
const moment = require("moment");
const auth = require("./jwtfilter");
const Counter = require("../../models/counterSchema");
const Staff = require("../../models/staff");
const Package = require("../../models/package");
const Booking = require("../../models/booking");
const Orders = require("../../models/orders");
const OrderItems = require("../../models/ordersItem");
const OrderCancellation = require("../../models/orderCancellation");
const PaymentGateway = require("../../models/payment_gateway");
const Payments = require("../../models/payments");
const { generatePayRunningNumber } = require("../../routes/api/utils");
const { filterByBranchRol, generateRunningNumber } = require("./utils");
const {
  registerOnlineOrder,
  registerOfflinePaymentV2,
  registerCustomPayment,
  registerImportCorrections,
} = require("../../helper/functions");
const Razorpay = require("razorpay");
const {
  sendPurchaseConfirmNotification,
} = require("../../helper/notification");

// // This razorpayInstance will be used to
// // access any resource from razorpay
// const razorpayInstance = new Razorpay({
//   key_id: "rzp_test_1YlCyOghboqUHz",
//   key_secret: "EPA9P6OuMq0yRdlHn6KVYci1",
//   // key_id: "rzp_test_qWyxe8Jtn2Uedr",
//   // key_secret: "EOmwOAUhqb6zdXNe3FQZpk",
// });

router.post("/mobile-order", auth, async (req, res) => {
  try {
    if (true) {
      return res.status(400).json({
        message:
          "Currently Mobile Orders has been disabled until further notice. Sorry for any inconvenience caused. (目前移动订单功能已停用，直至另行通知。不便之处，敬请谅解)",
      });
    }

    // const memberDevices = await MemberDevice.find({ user: req.body.member });
    // const versions = memberDevices.map((dev) => {
    //   const parts = dev.version.split(".");
    //   return parseInt(parts[parts.length - 1], 10) || 0;
    // });
    // if (versions.length > 0 && versions.every((v) => v <= 8)) {
    //   return res.status(400).json({
    //     message:
    //       "Mobile Orders have been disabled for your app version. Please update your app.",
    //   });
    // }

    const branch = await Branch.findById(req.body.branchId);
    const gateway = await PaymentGateway.findOne({
      branch: req.body.branchId,
      isActive: true,
    });
    // req.body["member"] = "66ffa1566fb0199a595cfd76";
    // const member = await Members.findById(req.body.member);
    if (req.body && branch && gateway) {
      try {
        const razorpayInstance = new Razorpay({
          key_id: gateway.providerKey1,
          key_secret: gateway.providerKey2,
        });
        const order = await registerOnlineOrder(
          branch,
          req.body,
          razorpayInstance
        );
        const finalOrder = await Orders.findById({ _id: order._id }).populate({
          path: "orderBranch",
          select: { _id: 1, branchName: 1 },
        });
        res.status(200).send(finalOrder);
      } catch (e) {
        // console.log(e);
        res.status(404).send({ message: e.message ? e.message : e });
      }
    } else {
      if (!gateway)
        res
          .status(500)
          .send({ message: "No Payment Option Found for this branch" });
      else res.status(500).send({ message: "Branch not available" });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error?.message });
  }
});

router.post("/create-order", auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body.branch);
    if (req.body && branch) {
      const nextInvoiceNumber = await generateRunningNumber(branch.branch_code);
      const data = req.body;
      data.invoicenumber = nextInvoiceNumber;
      let order = await Orders.create(data);
      res.send(order);
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.post("/custom-date-offline-order", auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body.branchName);
    // req.body["member"] = "66ffa1566fb0199a595cfd76";
    // const member = await Members.findById(req.body.member);
    if (req.body && branch) {
      try {
        const result = await registerCustomPayment(branch, req.body);
        res.status(200).send(result);
      } catch (e) {
        // console.log(e);
        res.status(401).send({ message: e.message });
      }
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/offline-payment", auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body.branchName);
    // req.body["member"] = "66ffa1566fb0199a595cfd76";
    // const member = await Members.findById(req.body.member);
    if (req.body && branch) {
      try {
        const result = await registerOfflinePaymentV2(branch, req.body);
        res.status(200).send(result);
      } catch (e) {
        // console.log(e);
        res.status(401).send({ message: e.message });
      }
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/import", uploads.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    let successCount = 0;
    const errors = [];
    const buffer = req.file.buffer;

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    for (const record of data) {
      try {
        const branch = await Branch.findOne({
          branchName: record["Branch Name"],
        });
        if (!branch) {
          errors.push({
            title: `Invalid Branch: ${record["Branch Name"]}`,
            error: `Branch with name ${record["Branch Name"]} not found.`,
          });
          continue;
        }

        let member = await Members.findOne({
          mobileNumber: record["Mobile No"],
        });
        if (!member) {
          errors.push({
            title: `Invalid Member: ${record["Member Name"]}`,
            error: `Member with name ${record["Member Name"]} not found.`,
          });
          continue;
        }

        let purchaseDate;
        if (typeof record["Purchase Date"] === "number") {
          // Excel serial date
          purchaseDate = new Date(
            (record["Purchase Date"] - 25569) * 86400 * 1000
          );
        } else if (typeof record["Purchase Date"] === "string") {
          let parsed = moment(record["Purchase Date"], "DD/MM/YYYY", true);
          if (!parsed.isValid()) {
            parsed = moment(record["Purchase Date"]);
          }
          if (parsed.isValid()) {
            purchaseDate = parsed.toDate();
          } else {
            errors.push({
              title: `Invalid Purchase Date: ${record["Purchase Date"]}`,
              error: `Could not parse a valid purchase date for record.`,
            });
            continue;
          }
        } else {
          errors.push({
            title: `Invalid Purchase Date: ${record["Purchase Date"]}`,
            error: `Could not parse a valid purchase date for record.`,
          });
          continue;
        }

        const nowMY = new Date();
        nowMY.setHours(nowMY.getHours() + 8, 0, 0, 0); // move to MY midnight
        const purchaseDateMY = new Date(
          purchaseDate.getTime() + 8 * 60 * 60 * 1000
        );
        purchaseDateMY.setHours(0, 0, 0, 0);

        if (purchaseDateMY.getTime() === nowMY.setHours(0, 0, 0, 0)) {
          errors.push({
            title: `Invalid Purchase Date: ${record["Purchase Date"]}`,
            error: `Purchase date cannot be today's date.`,
          });
          continue;
        }
        const carts = [
          {
            _id: null,
            package: await Package.findOne({
              packageCode: record["Package Code"],
            }),
            packagePrice: record["Price"],
            qty: record["Quantity"],
            packageAmount: record["Price"] * record["Quantity"],
          },
        ];

        const payments = [
          {
            name: record["Payment Method"],
            amount: record["Paid Amount"],
          },
        ];

        if (
          record["Correction"] &&
          record["Correction"].toLowerCase() === "add"
        ) {
          await registerImportCorrections(branch, {
            member: member._id,
            orderTotalAmount: record["Price"] * record["Quantity"],
            orderTotalDiscountAmount: 0,
            orderMode: "walk-in",
            status: record["Status"] || "Paid",
            description: "",
            orderDate: purchaseDate,
            carts: [
              {
                _id: carts[0].package._id,
                packagePrice: record["Price"],
                qty: record["Quantity"],
                packageAmount: record["Price"] * record["Quantity"],
              },
            ],
            payments: payments,
          });
          successCount++;
        } else {
          continue;
        }
      } catch (error) {
        errors.push({
          title: `Record: ${record["Member Name"]}`,
          error: `Error: ${error.message}`,
        });
        continue;
      }
    }
    res.status(201).json({
      message: "Data processing completed",
      successCount: successCount,
      errors: errors,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process file" });
  }
});

router.post(
  "/import/order-cancellation",
  uploads.single("file"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let successCount = 0;
      const errors = [];
      const buffer = req.file.buffer;

      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      for (const record of data) {
        try {
          let member = await Members.findOne({
            mobileNumber: record["Mobile No"],
          });
          if (!member) {
            errors.push({
              title: `Invalid Member: ${record["Member Name"]}`,
              error: `Member with name ${record["Member Name"]} not found.`,
            });
            continue;
          }

          if (
            record["Correction"] &&
            record["Correction"].toLowerCase() === "remove"
          ) {
            const order = await Orders.findOne({
              orderNumber: record["Invoice Number"],
            });
            if (!order) {
              errors.push({
                title: `Order Not Found: ${record["Invoice Number"]}`,
                error: `No matching order found for removal.`,
              });
              // console.log("here");
              continue;
            }
            const items = await OrderItems.find({ order: order._id });
            const payments = await Payments.find({
              orderNumber: order.orderNumber,
            });

            const recordResult = await recordCancelledOrder(
              {
                order,
                member,
                items,
                payments,
                reason: record["Cancel Reason"] || "Excel Import",
                user: req.user?.uid || "excel-import",
              },
              session
            );

            if (!recordResult.success) {
              errors.push({
                title: `Order Not Recorded: ${record["Invoice Number"]}`,
                error: `Failed to record cancelled order: ${
                  recordResult.error?.message || recordResult.error
                }`,
              });
              continue;
            }

            await Orders.deleteOne({ _id: order._id });
            await OrderItems.deleteMany({ order: order._id });
            await Payments.deleteMany({ orderNumber: order.orderNumber });
            const deletedMemberPackages = await MemberPackage.find({
              member: member._id,
              orderItem: { $in: items.map((i) => i._id) },
            }).distinct("_id");
            await MemberPackage.deleteMany({
              member: member._id,
              orderItem: { $in: items.map((i) => i._id) },
            });
            await MemberBooking.deleteMany({
              memberPackage: { $in: deletedMemberPackages },
            });

            successCount++;
          }
        } catch (error) {
          errors.push({
            title: `Record: ${record["Member Name"]}`,
            error: `Error: ${error.message}`,
          });
          continue;
        }
      }
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: "Order cancellation import completed",
        successCount,
        errors,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      // console.error("Order cancellation failed:", error);
      res
        .status(500)
        .send({ success: false, message: "Failed to cancel order", error });
    }
  }
);

async function recordCancelledOrder(
  { order, member, items, payments, reason, user },
  session
) {
  try {
    // Map payments and items to the required structure
    const mappedPayments = payments.map((payment) => ({
      paymentsNumber: payment.paymentNumber,
      paymentsDate: payment.payDate,
      paymentsType: payment.payType,
      paymentsMethod: payment.payMethod,
      paymentsAmount: payment.payAmount,
      paymentsReference: payment.payReference,
    }));

    const mappedItems = items.map((item) => ({
      orderItemsPackage: item.package,
      orderItemsUnitPrice: item.unitPrice,
      orderItemsQuantity: item.quantity,
    }));

    const cancelledOrder = new OrderCancellation({
      ordersId: order._id,
      ordersDate: order.orderDate,
      ordersNumber: order.orderNumber,
      ordersBranch: order.orderBranch,
      ordersTotalAmount: order.orderTotalAmount,
      ordersTotalDiscountAmount: order.orderTotalDiscountAmount,
      ordersTaxCode: order.taxCode,
      ordersTaxValue: order.taxValue,
      ordersTotalTaxAmount: order.orderTotalTaxAmount,
      ordersTotalNetAmount: order.orderTotalNetAmount,
      payments: mappedPayments,
      items: mappedItems,
      member: member._id,
      cancellationReason: reason || "Excel Import",
      status: "Cancelled",
      cancellationFrom: "Excel Import",
      createdBy: user,
      isCreated: new Date(),
    });

    await cancelledOrder.save({ session });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// router.post("/offline-payment", auth, async (req, res) => {
//   const session = await mongoose.startSession();
//   try {
//     const branch = await Branch.findById(req.body.branchName);
//     const member = await Members.findById("66ffa1566fb0199a595cfd76");
//     if (req.body && branch) {
//       await session.withTransaction(async () => {
//         const nextInvoiceNumber = await generateRunningNumber(
//           branch.branch_code
//         );
//         const data = req.body;
//         let paymentsData = [];
//         data.payments.map((item) => {
//           let obj = {
//             amount: item.amount,
//             method: item.name,
//           };
//           paymentsData.push(obj);
//         });
//         let order_obj = {
//           orderNumber: nextInvoiceNumber,
//           buyer: member,
//           orderBranch: branch,
//           orderTotalAmount: data.orderTotal,
//           orderTotalDiscountAmount: data.totalDiscount,
//           taxCode: "SST",
//           taxValue: 0,
//           orderTotalTaxAmount: data.totalTax,
//           orderTotalNetAmount: data.orderTotal,
//           orderMode: "walk-in",
//           status: "Paid",
//           description: "",
//           payments: paymentsData,
//         };
//         let order = await Orders.create(order_obj);
//         const carts = req.body.carts;
//         carts.map((item) => {
//           let obj = {
//             order: order,
//             package: item._id,
//             unitPrice: item.packagePrice,
//             quantity: item.qty,
//             discountType: "item",
//             discountPrice: 0,
//             unitAmount: item.packagePrice * item.qty,
//             taxCode: "SST",
//             taxValue: 0,
//             taxAmount: unitAmount,
//             netAmount: unitAmount,
//           };
//           OrderItems.create(obj);
//         });
//         session.endSession();
//         res.send(order);
//       });
//     } else {
//       await session.abortTransaction();
//       res.status(500).send("Branch not availables");
//     }
//   } catch (error) {
//     console.log(error);
//     await session.abortTransaction();
//     res.status(500).send(error);
//   }
// });

router.get("/walkin", auth, async (req, res) => {
  try {
    const obj = await Orders.find({ orderMode: { $eq: "walk-in" } })
      .populate({
        path: "member",
      })
      .populate({
        path: "orderBranch",
      })
      .sort({ orderDate: -1 });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/walkin/v2", auth, async (req, res) => {
  try {
    const obj = await Orders.aggregate([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            orderMode: "walk-in",
          },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            convertedId: {
              $toString: "$_id",
            },
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            orderDateStr: {
              $dateToString: { date: "$orderDate", format: "%Y-%m-%d" },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            ],
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "payments",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "payments",
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "branches",
            localField: "orderBranch",
            foreignField: "_id",
            as: "branch",
            pipeline: [
              {
                $project: {
                  branchName: 1,
                  branchAddress: 1,
                  branchCity: 1,
                  branchPostcode: 1,
                  branchState: 1,
                  branchContactNumber: 1,
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
            branch: {
              $arrayElemAt: ["$branch", 0],
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

router.get("/online/v2", auth, async (req, res) => {
  try {
    const obj = await Orders.aggregate([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            orderMode: "Online",
          },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            convertedId: {
              $toString: "$_id",
            },
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            orderDateStr: {
              $dateToString: { date: "$orderDate", format: "%Y-%m-%d" },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            ],
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "payments",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "payments",
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "branches",
            localField: "orderBranch",
            foreignField: "_id",
            as: "branch",
            pipeline: [
              {
                $project: {
                  branchName: 1,
                  branchAddress: 1,
                  branchCity: 1,
                  branchPostcode: 1,
                  branchState: 1,
                  branchContactNumber: 1,
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
            branch: {
              $arrayElemAt: ["$branch", 0],
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

router.get("/direct", auth, async (req, res) => {
  try {
    const obj = await Orders.find({ orderMode: { $eq: "Direct" } })
      .populate({
        path: "member",
      })
      .populate({
        path: "orderBranch",
      })
      .sort({ orderDate: -1 });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/detail", async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const id = req.query.id;
  try {
    // const obj = await OrderItems.find({ order: { $eq: id } });
    const obj = await OrderItems.aggregate([
      {
        $match: {
          order: { $eq: id },
        },
      },
    ]);
    const obj1 = await Orders.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      // { $set: { _id: { $toObjectId: "$_id" } } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "convertedId",
          foreignField: "order",
          as: "items",
        },
      },
      // {
      //   $lookup: {
      //     from: "OrderItems",
      //     localField: { $toString: "_id" },
      //     foreignField: "order",
      //     as: "items",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "OrderItems",
      //     let: { searchId: { $toString: "$_id" } },
      //     localField: "$$searchId",
      //     foreignField: "order",
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["order", "$$searchId"] },
      //         },
      //       },
      //     ],
      //     as: "items1",
      //   },
      // },
    ]);
    // const obj = await Orders.findById(id)
    //   .populate({
    //     path: "member",
    //   })
    //   .populate({
    //     path: "orderBranch",
    //   })
    //   .populate({
    //     path: "orderBranch",
    //   })
    //   .sort({ orderDate: -1 });
    res.send(obj1);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const memberPackages = req.body;
    let branchCode = "";
    if (memberPackages.length > 0) {
      const firstPackage = memberPackages[0];
      branchCode = firstPackage.branch.branch_code;
    }
    const nextInvoiceNumber = await generateRunningNumber(branchCode);
    const updatedMemberPackages = await Promise.all(
      memberPackages.map(async (item) => {
        return {
          ...item,
          invoicenumber: nextInvoiceNumber,
          validdate: null,
          paymentmethod: item.paymentmethod,
        };
      })
    );
    let mempackage = await MemberPackage.create(updatedMemberPackages);
    res.send(mempackage);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const valid = await calculateValidDate(req.body);
    req.body.validdate = valid;
    const obj = await MemberPackage.findByIdAndUpdate(id, req.body, {
      new: false,
    });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.findByIdAndDelete(id);
    res.status(200).send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const members = await MemberPackage.find({}).populate({
      path: "member",
    });
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/member/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.find({ $and: [{ member: { $eq: id } }] });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/memberid", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.find({
      $and: [{ member: { $eq: id } }, { balance: { $gt: 0 } }],
    });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/memberid", auth, async (req, res) => {
  try {
    const { member, first, rows } = req.body;
    const obj = {
      data: await MemberPackage.find({ $and: [{ member: { $eq: member } }] })
        .populate({
          path: "member",
        })
        .populate({
          path: "packageid",
        })
        .sort({ package_date: -1 })
        .limit(rows)
        .skip(first),
      totalRecords: await MemberPackage.find({
        $and: [{ member: { $eq: member } }],
      }).countDocuments(),
    };
    res.status(200).send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/roleBased/:users", auth, async (req, res) => {
  try {
    const { users } = req.params;
    let filterQuery = [];
    if (users) {
      const branchList = await filterByBranchRol(users);
      filterQuery.push({
        branch: { $in: branchList.map((branch) => branch._id) },
      });
    }
    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    const members = await MemberPackage.find(query);
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    //addPurchasemodeToDocuments()
    const {
      id,
      first,
      rows,
      filters,
      sortField,
      sortOrder,
      purchasemode,
      purchasetype,
      users,
    } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && filters[e].value && e === "package_date") {
          const dateStr = filters[e].value;
          const dt = formatDate(dateStr);
          const isValidDate = moment(dt, "YYYY-MM-DD", true).isValid();
          if (isValidDate) {
            const startDate = moment(dt).startOf("day").toDate();
            const endDate = moment(dt).endOf("day").toDate();
            filterQuery.push({
              package_date: { $gte: startDate, $lte: endDate },
            });
          }
        } else if (filters[e].value && filters[e].value && e === "package") {
          filterQuery.push({
            package: { $regex: ".*" + filters[e].value + ".*", $options: "i" },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "invoicenumber"
        ) {
          filterQuery.push({
            invoicenumber: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        }
      });
    }

    if (id) filterQuery.push({ member: id });
    if (purchasemode) filterQuery.push({ purchasemode });
    if (purchasetype) filterQuery.push({ purchasetype });

    if (filters && filters.member && filters.member.value) {
      const branchList = await Members.find({
        member_name: {
          $regex: ".*" + filters.member.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
    }

    if (filters && filters.branch && filters.branch.value) {
      const branchList = await Branch.find({
        branch_name: {
          $regex: ".*" + filters.branch.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ branch: { $in: branchList } });
    }

    if (filters && filters.mobileNumber && filters.mobileNumber.value) {
      const branchList = await Members.find({
        mobileNumber: {
          $regex: ".*" + filters.mobileNumber.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
    }

    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};

    let sortQuery = {};
    if (sortField) {
      sortQuery[sortField] = sortOrder === 1 ? "asc" : "desc";
    }
    if (users && users !== "admin") {
      const roles = await getRolesByUser(users);
      if (roles && !roles.all_branch) {
        const branches = roles.branch
          ? roles.branch.map((branch) => branch._id)
          : [];
        query = {
          ...query,
          branch: { $in: branches },
        };
      }
    }

    const data = await MemberPackage.find(query)
      .populate({ path: "member" })
      .populate({ path: "packageid" })
      .populate({ path: "branch" })
      .sort(sortQuery)
      .skip(first)
      .limit(rows);

    for (const memberpackage of data) {
      const checkinData = await Booking.findOne({
        package: memberpackage._id,
        bookingstatus: "Completed",
      }).sort({ checkin_date: -1 });
      memberpackage.booking_date = checkinData
        ? checkinData.checkin_date
        : null;
    }

    const totalRecords = await MemberPackage.countDocuments(query);

    res.send({ data, totalRecords });
  } catch (error) {
    // console.error("Error in '/findAll' route:", error);
    res.status(500).send(error);
  }
});

router.post("/findAllv2/today", auth, async (req, res) => {
  try {
    const { memberName, mobileNumber, orderNumber, orderBranch } = req.body;
    const filters = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    filters.orderDate = { $gte: todayStart, $lte: todayEnd };
    if (orderNumber) filters.orderNumber = new RegExp(orderNumber, "i");
    // if (startDate || endDate) {
    //   filters.orderDate = {};
    //   let startDateObj = new Date(startDate);
    //   let endDateObj = new Date(endDate);
    //   startDateObj.setUTCHours(0, 0, 0, 0);
    //   startDateObj.setHours(startDateObj.getHours() - 8);

    //   endDateObj.setUTCHours(23, 59, 59, 999);
    //   endDateObj.setHours(endDateObj.getHours() - 8);
    //   if (startDate) filters.orderDate.$gte = new Date(startDateObj);
    //   if (endDate) filters.orderDate.$lte = new Date(endDateObj);
    //   console.log(startDateObj, endDateObj);
    // }

    const orderBranchFilters = {};
    if (orderBranch) orderBranchFilters.orderBranch = orderBranch;

    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    if (
      req.user.uid !== "admin" &&
      !memberName &&
      !mobileNumber &&
      !orderBranch
    ) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters.orderBranch = { $in: branchIds };
    }

    const obj = await Orders.aggregate([
      { $match: { orderMode: "walk-in", ...filters } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: { $toString: "$orderBranch" },
          orderDateStr: {
            $dateToString: {
              date: "$orderDate",
              format: "%Y-%m-%d",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $match: {
          ...(orderBranchFilters.orderBranch
            ? { convertedBranchId: orderBranchFilters.orderBranch }
            : {}),
        },
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
                package: { $arrayElemAt: ["$packages", 0] },
              },
            },
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
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] },
        },
      },
      {
        $match: {
          ...(memberFilters.memberFullName
            ? { "member.memberFullName": memberFilters.memberFullName }
            : {}),
          ...(memberFilters.mobileNumber
            ? { "member.mobileNumber": memberFilters.mobileNumber }
            : {}),
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
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findAllv2", auth, async (req, res) => {
  try {
    const {
      memberName,
      mobileNumber,
      orderNumber,
      orderBranch,
      startDate,
      endDate,
    } = req.body;
    const filters = {};
    if (orderNumber) filters.orderNumber = new RegExp(orderNumber, "i");
    if (startDate || endDate) {
      filters.orderDate = {};
      let startDateObj = new Date(startDate);
      let endDateObj = new Date(endDate);
      startDateObj.setUTCHours(0, 0, 0, 0);
      startDateObj.setHours(startDateObj.getHours() - 8);

      endDateObj.setUTCHours(23, 59, 59, 999);
      endDateObj.setHours(endDateObj.getHours() - 8);
      if (startDate) filters.orderDate.$gte = new Date(startDateObj);
      if (endDate) filters.orderDate.$lte = new Date(endDateObj);
    }

    const orderBranchFilters = {};
    if (orderBranch) orderBranchFilters.orderBranch = orderBranch;

    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    if (
      req.user.uid !== "admin" &&
      !memberName &&
      !mobileNumber &&
      !orderBranch &&
      !startDate &&
      !endDate
    ) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters.orderBranch = { $in: branchIds };
    }

    const obj = await Orders.aggregate([
      { $match: { orderMode: "walk-in", ...filters } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: { $toString: "$orderBranch" },
          orderDateStr: {
            $dateToString: {
              date: "$orderDate",
              format: "%Y-%m-%d",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $match: {
          ...(orderBranchFilters.orderBranch
            ? { convertedBranchId: orderBranchFilters.orderBranch }
            : {}),
        },
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
                package: { $arrayElemAt: ["$packages", 0] },
              },
            },
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
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] },
        },
      },
      {
        $match: {
          ...(memberFilters.memberFullName
            ? { "member.memberFullName": memberFilters.memberFullName }
            : {}),
          ...(memberFilters.mobileNumber
            ? { "member.mobileNumber": memberFilters.mobileNumber }
            : {}),
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
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
                customerCode: 1,
                accountCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findAllOnlinev2/today", auth, async (req, res) => {
  try {
    const { memberName, mobileNumber, orderNumber, orderBranch } = req.body;
    const filters = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    filters.orderDate = { $gte: todayStart, $lte: todayEnd };
    if (orderNumber) filters.orderNumber = new RegExp(orderNumber, "i");
    // if (startDate || endDate) {
    //   filters.orderDate = {};
    //   let startDateObj = new Date(startDate);
    //   let endDateObj = new Date(endDate);
    //   startDateObj.setUTCHours(0, 0, 0, 0);
    //   startDateObj.setHours(startDateObj.getHours() - 8);

    //   endDateObj.setUTCHours(23, 59, 59, 999);
    //   endDateObj.setHours(endDateObj.getHours() - 8);
    //   if (startDate) filters.orderDate.$gte = new Date(startDateObj);
    //   if (endDate) filters.orderDate.$lte = new Date(endDateObj);
    //   console.log(startDateObj, endDateObj);
    // }

    const orderBranchFilters = {};
    if (orderBranch) orderBranchFilters.orderBranch = orderBranch;

    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    if (
      req.user.uid !== "admin" &&
      !memberName &&
      !mobileNumber &&
      !orderBranch
    ) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters.orderBranch = { $in: branchIds };
    }

    const obj = await Orders.aggregate([
      { $match: { orderMode: "Online", ...filters } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: { $toString: "$orderBranch" },
          orderDateStr: {
            $dateToString: {
              date: "$orderDate",
              format: "%Y-%m-%d",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $match: {
          ...(orderBranchFilters.orderBranch
            ? { convertedBranchId: orderBranchFilters.orderBranch }
            : {}),
        },
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
                package: { $arrayElemAt: ["$packages", 0] },
              },
            },
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
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] },
        },
      },
      {
        $match: {
          ...(memberFilters.memberFullName
            ? { "member.memberFullName": memberFilters.memberFullName }
            : {}),
          ...(memberFilters.mobileNumber
            ? { "member.mobileNumber": memberFilters.mobileNumber }
            : {}),
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
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findAllOnlinev2", auth, async (req, res) => {
  try {
    const {
      memberName,
      mobileNumber,
      orderNumber,
      orderBranch,
      startDate,
      endDate,
    } = req.body;
    const filters = {};
    if (orderNumber) filters.orderNumber = new RegExp(orderNumber, "i");
    if (startDate || endDate) {
      filters.orderDate = {};
      let startDateObj = new Date(startDate);
      let endDateObj = new Date(endDate);
      startDateObj.setUTCHours(0, 0, 0, 0);
      startDateObj.setHours(startDateObj.getHours() - 8);

      endDateObj.setUTCHours(23, 59, 59, 999);
      endDateObj.setHours(endDateObj.getHours() - 8);
      if (startDate) filters.orderDate.$gte = new Date(startDateObj);
      if (endDate) filters.orderDate.$lte = new Date(endDateObj);
    }

    const orderBranchFilters = {};
    if (orderBranch) orderBranchFilters.orderBranch = orderBranch;

    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    if (
      req.user.uid !== "admin" &&
      !memberName &&
      !mobileNumber &&
      !orderBranch &&
      !startDate &&
      !endDate
    ) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters.orderBranch = { $in: branchIds };
    }

    const obj = await Orders.aggregate([
      { $match: { orderMode: "Online", ...filters } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: { $toString: "$orderBranch" },
          orderDateStr: {
            $dateToString: {
              date: "$orderDate",
              format: "%Y-%m-%d",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $match: {
          ...(orderBranchFilters.orderBranch
            ? { convertedBranchId: orderBranchFilters.orderBranch }
            : {}),
        },
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
                package: { $arrayElemAt: ["$packages", 0] },
              },
            },
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
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] },
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
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] },
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/full-detail/:id", auth, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { id } = req.params;
  try {
    const orderItem = await OrderItems.findById(id);
    const obj = await Orders.aggregate([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            _id: new ObjectId(orderItem.order),
          },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            convertedId: {
              $toString: "$_id",
            },
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            orderDateStr: {
              $dateToString: { date: "$orderDate", format: "%Y-%m-%d" },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            ],
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "payments",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "payments",
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "branches",
            localField: "orderBranch",
            foreignField: "_id",
            as: "branch",
            pipeline: [
              {
                $project: {
                  branchName: 1,
                  branchAddress: 1,
                  branchCity: 1,
                  branchPostcode: 1,
                  branchState: 1,
                  branchContactNumber: 1,
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
            branch: {
              $arrayElemAt: ["$branch", 0],
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

router.get("/mobile/list/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const orderList = await Orders.find({ member: { $eq: id } })
      .populate({
        path: "orderBranch",
        select: { _id: 1, branchName: 1 },
      })
      .sort({ orderDate: -1 });
    res.send(orderList);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/mobile/full-detail/:id", auth, async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const { id } = req.params;
  try {
    const obj = await Orders.aggregate([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            _id: new ObjectId(id),
          },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            convertedId: {
              $toString: "$_id",
            },
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            orderDateStr: {
              $dateToString: { date: "$orderDate", format: "%Y-%m-%d" },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
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
                        packageCode: 1,
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
                    package: {
                      $arrayElemAt: ["$package", 0],
                    },
                  },
              },
            ],
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "payments",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "payments",
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "members",
            localField: "member",
            foreignField: "_id",
            as: "member",
            pipeline: [
              {
                $project: {
                  memberFullName: 1,
                  mobileNumber: 1,
                  address: 1,
                  city: 1,
                  postcode: 1,
                  states: 1,
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
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "branches",
            localField: "orderBranch",
            foreignField: "_id",
            as: "orderBranch",
            pipeline: [
              {
                $project: {
                  branchName: 1,
                  branchAddress: 1,
                  branchCity: 1,
                  branchPostcode: 1,
                  branchState: 1,
                  branchContactNumber: 1,
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
            orderBranch: {
              $arrayElemAt: ["$orderBranch", 0],
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

function formatDate(dateStr) {
  // Convert from 'DD/MM/YYYY' to 'YYYY-MM-DD'
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

router.post("/mobile/payment/verify", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Orders.findById(req.body.id);
    const obj = await PaymentGateway.findOne({
      branch: order.orderBranch._id,
      isActive: true,
    });
    const razorpayInstance = new Razorpay({
      key_id: obj.providerKey1,
      key_secret: obj.providerKey2,
    });
    if (order.status == "Pending") {
      const curlecOrders = await razorpayInstance.orders.fetchPayments(
        order.orderGateWayNo
      );
      if (curlecOrders.items.length > 0) {
        for await (const item of curlecOrders.items) {
          // await curlecOrders.items.forEach(async (item) => {
          if (
            item.status == "captured" &&
            item.order_id == order.orderGateWayNo
          ) {
            // console.log("check-2-pass");
            let payRecordIds = [];
            const nextPayNumber = await generatePayRunningNumber(
              order.orderBranch.branchCode
            );
            let pay_obj = {
              payDate: order.orderDate,
              paymentNumber: nextPayNumber,
              orderNumber: order.orderNumber,
              payer: order.member,
              payType: "Online",
              payMethod: item.method,
              payAmount: item.amount / 100,
            };
            const pay = new Payments(pay_obj);
            const pp = await pay.save({ session });
            payRecordIds.push(pp._id);
            await Orders.updateOne(
              { _id: order._id },
              { $set: { payments: payRecordIds, status: "Paid" } },
              { session }
            );
            const items = await OrderItems.find({ order: order._id });
            let mem_pack_array = [];
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
                mem_pack_array.push(member_package_obj);
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
                mem_pack_array.push(member_package_obj);
              }
            }
            let mpIds = await MemberPackage.insertMany(mem_pack_array, {
              session,
            });
            await Members.findByIdAndUpdate(
              { _id: order.member },
              { lastPurchaseDate: Date.now() },
              { session }
            );
          }
        }
      }
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).send("OK");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/order-cancellation", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { _id: orderId, member, payments, items } = req.body;

    const memberId = member?._id;
    const itemIds = items.map((item) => item._id);
    const paymentIds = payments.map((p) => p._id);

    // Delete payments
    await Payments.deleteMany({ _id: { $in: paymentIds } }).session(session);

    // Delete order items
    await OrderItems.deleteMany({ _id: { $in: itemIds } }).session(session);

    // Delete member packages (by both memberId and itemId)
    await MemberPackage.deleteMany({
      member: memberId,
      orderItem: { $in: itemIds },
    }).session(session);

    // Delete the order itself
    await Orders.deleteOne({ _id: orderId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      message: "Order cancelled and records deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // console.error("Order cancellation failed:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to cancel order", error });
  }
});

// router.post("/mobile/payment/check", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const order = await Orders.findById(req.body.id);
//     const obj = await PaymentGateway.findOne({
//       branch: order.orderBranch._id,
//       isActive: true,
//     });
//     const razorpayInstance = new Razorpay({
//       key_id: obj.providerKey1,
//       key_secret: obj.providerKey2,
//     });
//     let final_status = "Pending";
//     if (order.status == "Pending") {
//       const curlecOrders = await razorpayInstance.orders.fetchPayments(
//         order.orderGateWayNo
//       );
//       if (curlecOrders.items.length > 0) {
//         for await (const item of curlecOrders.items) {
//           // await curlecOrders.items.forEach(async (item) => {
//           if (
//             item.status == "captured" &&
//             item.order_id == order.orderGateWayNo
//           ) {
//             console.log("check-2-pass");
//             final_status = "Paid";
//             let payRecordIds = [];
//             const nextPayNumber = await generatePayRunningNumber(
//               order.orderBranch.branchCode
//             );
//             let pay_obj = {
//               payDate: order.orderDate,
//               paymentNumber: nextPayNumber,
//               orderNumber: order.orderNumber,
//               payer: order.member,
//               payType: "Online",
//               payMethod: item.method,
//               payAmount: item.amount / 100,
//             };
//             const pay = new Payments(pay_obj);
//             const pp = await pay.save({ session });
//             payRecordIds.push(pp._id);
//             await Orders.updateOne(
//               { _id: order._id },
//               { $set: { payments: payRecordIds, status: "Paid" } },
//               { session }
//             );
//             const items = await OrderItems.find({ order: order._id });
//             let mem_pack_array = [];
//             for await (const item of items) {
//               const pack = await Package.findById(item.package);
//               if (pack.packageValidity == "fixed") {
//                 let member_package_obj = {
//                   member: order.member,
//                   orderItem: item._id,
//                   package: pack._id,
//                   purchaseBranch: order.orderBranch,
//                   purchaseDate: order.orderDate,
//                   packageValidity: pack.packageValidity,
//                   validDate: pack.packageFixedValidityDate2,
//                   originalBalance: pack.packageUnlimitedStatus
//                     ? 99999
//                     : pack.packageUsageLimit * item.quantity,
//                   currentBalance: pack.packageUnlimitedStatus
//                     ? 99999
//                     : pack.packageUsageLimit * item.quantity,
//                 };
//                 mem_pack_array.push(member_package_obj);
//               } else {
//                 let member_package_obj = {
//                   member: order.member,
//                   orderItem: item._id,
//                   package: pack._id,
//                   purchaseBranch: order.orderBranch,
//                   purchaseDate: order.orderDate,
//                   packageValidity: pack.packageValidity,
//                   originalBalance: pack.packageUnlimitedStatus
//                     ? 99999
//                     : pack.packageUsageLimit * item.quantity,
//                   currentBalance: pack.packageUnlimitedStatus
//                     ? 99999
//                     : pack.packageUsageLimit * item.quantity,
//                 };
//                 mem_pack_array.push(member_package_obj);
//               }
//             }
//             let mpIds = await MemberPackage.insertMany(mem_pack_array, {
//               session,
//             });
//             await Members.findByIdAndUpdate(
//               { _id: order.member },
//               { lastPurchaseDate: Date.now() },
//               { session }
//             );
//             await sendPurchaseConfirmNotification(pp, mpIds[0]._id);
//           }
//         }
//       }
//     }
//     await session.commitTransaction();
//     session.endSession();
//     res.status(200).send(final_status);
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.log(error);
//     res.status(500).send(error);
//   }
// });

router.post("/mobile/payment/check", async (req, res) => {
  try {
    const order = await Orders.findById(req.body.id);
    res
      .status(200)
      .send({ status: order.status, description: order.description });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
