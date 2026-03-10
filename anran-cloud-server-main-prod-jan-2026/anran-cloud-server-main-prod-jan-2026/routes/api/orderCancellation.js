const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("./jwtfilter");
const Orders = require("../../models/orders");
const OrderItems = require("../../models/ordersItem");
const Payments = require("../../models/payments");
const MemberPackage = require("../../models/memberPackage");
const MemberBooking = require("../../models/memberBooking");
const OrderCancellation = require("../../models/orderCancellation");
const Staff = require("../../models/staff");

router.post("/cancel-order", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { _id: orderId, member, payments, items } = req.body;

    const memberId = member?._id;
    const itemIds = items.map((item) => item._id);
    const paymentIds = payments.map((p) => p._id);

    // Check if the order is already in the OrderCancellation collection
    const existingCancellation = await OrderCancellation.findOne({ ordersId: orderId });
    if (existingCancellation) {
      return res.status(400).send({
        success: false,
        message: "Order has already been sent for approval."
      });
    }

    const recordResult = await cancelOrder(req, session);
    if (!recordResult.success) {
      throw new Error("Failed to record cancelled order");
    }

    // Delete payments
    await Payments.deleteMany({ _id: { $in: paymentIds } }).session(session);

    // Delete order items
    await OrderItems.deleteMany({ _id: { $in: itemIds } }).session(session);

    // Delete member packages (by both memberId and itemId)
    const deletedMemberPackages = await MemberPackage.find({
      member: memberId,
      orderItem: { $in: itemIds },
    }).session(session);

    await MemberPackage.deleteMany({
      member: memberId,
      orderItem: { $in: itemIds }
    }).session(session);

    const memberPackageIds = deletedMemberPackages.map((pkg) => pkg._id);
    // console.log("Deleted Member Packages:", memberPackageIds);
    await MemberBooking.deleteMany({
      memberPackage: { $in: memberPackageIds },
    }).session(session);

    // Delete the order itself
    await Orders.deleteOne({ _id: orderId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ success: true, message: "Order cancelled and records deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // console.error("Order cancellation failed:", error);
    res.status(500).send({ success: false, message: "Failed to cancel order", error });
  }
});

router.post("/cancel-order-request", auth, async (req, res) => {
  try {
    const { _id: orderId } = req.body;
    const existingCancellation = await OrderCancellation.findOne({ ordersId: orderId });
    if (existingCancellation) {
      return res.status(400).send({
        success: false,
        message: "Order has already been sent for approval."
      });
    }
    const recordResult = await cancelOrderRequest(req);
    if (!recordResult.success) {
      throw new Error("Failed to record cancelled order");
    }
    // console.log("Order cancellation request recorded successfully.");
    res.status(200).send({ success: true, message: "Order cancellation request is sent successfully." });
  } catch (error) {
    // console.error("Order cancellation failed:", error);
    res.status(500).send({ success: false, message: "Failed to cancel order", error });
  }
});

router.post("/cancel-order-request-approval", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { _id, ordersId, member, payments, items } = req.body;
    const memberId = member?._id;
    const itemIds = items.map((item) => item._id);
    const paymentIds = payments.map((p) => p._id);

    const updateResult = await OrderCancellation.updateOne(
      { _id },
      { $set: { status: "Cancelled" } },
      { session }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update OrderCancellation status to 'Cancelled'");
    }

    // Delete payments
    await Payments.deleteMany({ _id: { $in: paymentIds } }).session(session);

    // Delete order items
    await OrderItems.deleteMany({ _id: { $in: itemIds } }).session(session);

    const deletedMemberPackages = await MemberPackage.find({
      member: memberId,
      orderItem: { $in: itemIds },
    }).session(session);

    // Delete member packages (by both memberId and itemId)
    await MemberPackage.deleteMany({
      member: memberId,
      orderItem: { $in: itemIds }
    }).session(session);

    const memberPackageIds = deletedMemberPackages.map((pkg) => pkg._id);
    // console.log("Deleted Member Packages:", memberPackageIds);
    await MemberBooking.deleteMany({
      memberPackage: { $in: memberPackageIds },
    }).session(session);

    // Delete the order itself
    await Orders.deleteOne({ _id: ordersId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ success: true, message: "Order cancelled and records deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // console.error("Order cancellation failed:", error);
    res.status(500).send({ success: false, message: "Failed to cancel order", error });
  }
});

router.post("/findAll", auth, async (req, res) => {
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
    if (orderNumber) filters.ordersNumber = new RegExp(orderNumber, "i");
    if (startDate || endDate) {
      filters.isCreated = {};
      let startDateObj = new Date(startDate);
      let endDateObj = new Date(endDate);
      startDateObj.setUTCHours(0, 0, 0, 0);
      startDateObj.setHours(startDateObj.getHours() - 8);

      endDateObj.setUTCHours(23, 59, 59, 999);
      endDateObj.setHours(endDateObj.getHours() - 8);
      if (startDate) filters.isCreated.$gte = new Date(startDateObj);
      if (endDate) filters.isCreated.$lte = new Date(endDateObj);
      // console.log(startDateObj, endDateObj);
    }

    const orderBranchFilters = {};
    if (orderBranch) orderBranchFilters.ordersBranch = orderBranch;

    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    if (
      req.user.uid !== "admin" && !orderBranch
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
      filters.ordersBranch = { $in: branchIds };
    }

    const obj = await OrderCancellation.aggregate([
      { $match: { ...filters } },
      {
        $addFields: {
          convertedId: { $toString: "$_id" },
          convertedBranchId: { $toString: "$ordersBranch" },
          orderDateStr: {
            $dateToString: {
              date: "$ordersDate",
              format: "%Y-%m-%d",
              timezone: "+08:00",
            },
          },
        },
      },
      {
        $match: {
          ...(orderBranchFilters.ordersBranch
            ? { convertedBranchId: orderBranchFilters.ordersBranch }
            : {}),
        },
      },
      {
        $unwind: {
          path: "$items",
        },
      },
      {
        $lookup: {
          from: "packages",
          localField: "items.orderItemsPackage",
          foreignField: "_id",
          as: "items.orderItemsPackage",
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
          "items.orderItemsPackage": {
            $arrayElemAt: ["$items.orderItemsPackage", 0],
          },
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
          localField: "ordersBranch",
          foreignField: "_id",
          as: "ordersBranch",
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
          ordersBranch: { $arrayElemAt: ["$ordersBranch", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          ordersId: { $first: "$ordersId" },
          ordersDate: { $first: "$ordersDate" },
          ordersNumber: { $first: "$ordersNumber" },
          ordersBranch: { $first: "$ordersBranch" },
          ordersTotalAmount: { $first: "$ordersTotalAmount" },
          ordersTotalDiscountAmount: { $first: "$ordersTotalDiscountAmount" },
          ordersTaxCode: { $first: "$ordersTaxCode" },
          ordersTaxValue: { $first: "$ordersTaxValue" },
          ordersTotalTaxAmount: { $first: "$ordersTotalTaxAmount" },
          ordersTotalNetAmount: { $first: "$ordersTotalNetAmount" },
          payments: { $first: "$payments" },
          items: { $push: "$items" }, // Reconstruct the items array
          member: { $first: "$member" },
          status: { $first: "$status" },
          createdBy: { $first: "$createdBy" },
          isCreated: { $first: "$isCreated" },
          isDeleted: { $first: "$isDeleted" },
          convertedId: { $first: "$convertedId" },
          convertedBranchId: { $first: "$convertedBranchId" },
          orderDateStr: { $first: "$orderDateStr" },
          cancellationReason: { $first: "$cancellationReason" },
          otherReason: { $first: "$otherReason" },
        },
      },
      {
        $sort: { isCreated: -1 } // Reapply sorting after grouping
      }
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

async function cancelOrder(req, session) {
  try {
    const {
      _id,
      orderDate,
      orderNumber,
      orderBranch,
      orderTotalAmount,
      orderTotalDiscountAmount,
      taxCode,
      taxValue,
      orderTotalTaxAmount,
      orderTotalNetAmount,
      payments,
      items,
      member,
      cancelReason,
      otherReason,
    } = req.body;
    // console.log(req.body);
    // Map payments array to the required structure
    const mappedPayments = payments.map((payment) => ({
      _id: payment._id,
      paymentsNumber: payment.paymentNumber,
      paymentsDate: payment.payDate,
      paymentsType: payment.payType,
      paymentsMethod: payment.payMethod,
      paymentsAmount: payment.payAmount,
      paymentsReference: payment.payReference,
    }));

    // Map items array to the required structure
    const mappedItems = items.map((item) => ({
      _id: item._id,
      orderItemsPackage: item.package,
      orderItemsUnitPrice: item.unitPrice,
      orderItemsQuantity: item.quantity,
    }));
    
    // Record the cancelled order in the database
    const cancelledOrder = new OrderCancellation({
      ordersId: _id,
      ordersDate: orderDate,
      ordersNumber: orderNumber,
      ordersBranch: orderBranch,
      ordersTotalAmount: orderTotalAmount,
      ordersTotalDiscountAmount: orderTotalDiscountAmount,
      ordersTaxCode: taxCode,
      ordersTaxValue: taxValue,
      ordersTotalTaxAmount: orderTotalTaxAmount,
      ordersTotalNetAmount: orderTotalNetAmount,
      payments: mappedPayments,
      items: mappedItems,
      member: member._id,
      cancellationReason: cancelReason,
      otherReason: otherReason,
      status: "Cancelled",
      cancellationFrom: "Web",
      createdBy: req.user.uid,
      isCreated: new Date(),
    });

    await cancelledOrder.save({ session });  
    return { success: true };
  } catch (error) {
    // console.error("Failed to record cancelled order:", error);
    return { success: false, error };
  }
}

async function cancelOrderRequest(req) {
  try {
    const {
      _id,
      orderDate,
      orderNumber,
      orderBranch,
      orderTotalAmount,
      orderTotalDiscountAmount,
      taxCode,
      taxValue,
      orderTotalTaxAmount,
      orderTotalNetAmount,
      payments,
      items,
      member,
      cancelReason,
      otherReason,
    } = req.body;
    // console.log(req.body);
    // Map payments array to the required structure
    const mappedPayments = payments.map((payment) => ({
      _id: payment._id,
      paymentsNumber: payment.paymentNumber,
      paymentsDate: payment.payDate,
      paymentsType: payment.payType,
      paymentsMethod: payment.payMethod,
      paymentsAmount: payment.payAmount,
      paymentsReference: payment.payReference,
    }));

    // Map items array to the required structure
    const mappedItems = items.map((item) => ({
      _id: item._id,
      orderItemsPackage: item.package,
      orderItemsUnitPrice: item.unitPrice,
      orderItemsQuantity: item.quantity,
    }));

    // Record the cancelled order in the database
    const cancelledOrder = new OrderCancellation({
      ordersId: _id,
      ordersDate: orderDate,
      ordersNumber: orderNumber,
      ordersBranch: orderBranch,
      ordersTotalAmount: orderTotalAmount,
      ordersTotalDiscountAmount: orderTotalDiscountAmount,
      ordersTaxCode: taxCode,
      ordersTaxValue: taxValue,
      ordersTotalTaxAmount: orderTotalTaxAmount,
      ordersTotalNetAmount: orderTotalNetAmount,
      payments: mappedPayments,
      items: mappedItems,
      member: member._id,
      cancellationReason: cancelReason,
      otherReason: otherReason,
      status: "Pending",
      cancellationFrom: "Web",
      createdBy: req.user.uid,
      isCreated: new Date(),
    });

    // Save the cancellation request to the database
    await cancelledOrder.save();

    return { success: true };
  } catch (error) {
    // console.error("Failed to record cancelled order:", error);
    return { success: false, error };
  }
}
  
module.exports = router;