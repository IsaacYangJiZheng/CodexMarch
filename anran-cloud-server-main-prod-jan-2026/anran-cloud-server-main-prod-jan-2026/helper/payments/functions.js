const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const BlockBooking = require("../../models/blockBooking");
const Payments = require("../../models/payments");
const Orders = require("../../models/orders");
const OrderItems = require("../../models/ordersItem");
const PaymentGateway = require("../../models/payment_gateway");
const Package = require("../../models/package");
const MemberPackage = require("../../models/memberPackage");
const Members = require("../../models/members");
const { sendPurchaseConfirmNotification } = require("../notification");
const { generatePayRunningNumber } = require("../../routes/api/utils");

async function registerOnlinePayment(orderId, razorpay_payment_id) {
  try {
    // console.log("payment-callback: Start : ", orderId);
    const order = await Orders.findOne({ orderGateWayNo: orderId }).populate({
      path: "orderBranch",
      select: { _id: 1, branchName: 1, branchCode: 1 },
    });
    if (order != null) {
      const obj = await PaymentGateway.findOne({
        branch: order.orderBranch._id,
        isActive: true,
      });
      const razorpayInstance = new Razorpay({
        key_id: obj.providerKey1,
        key_secret: obj.providerKey2,
      });
      const payment = await razorpayInstance.payments.fetch(
        razorpay_payment_id
      );
      // console.log("payment-callback: payment found");
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
      const items = await OrderItems.find({ order: order._id.toString() });
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
      // console.log("payment-callback: Payment successfully registered");
      return "OK";
    } else {
      // console.log("Order Not Found");
      return "OK";
    }
  } catch (error) {
    // console.log(error);
    // console.log("payment-callback: Failed :", error);
    return error.message;
    // res.status(500).send({ message: error.message });
  }
}

async function registerOnlinePaymentError(entity) {
  try {
    const order = await Orders.findOne({
      orderGateWayNo: entity.order_id,
    }).populate({
      path: "orderBranch",
      select: { _id: 1, branchName: 1, branchCode: 1 },
    });
    if (order != null) {
      let err_desc = [
        "Code:",
        entity.error_code,
        ",",
        "message:",
        entity.error_description,
        "source:",
        entity.error_source,
      ].join("");
      await Orders.updateOne(
        { _id: order._id },
        { $set: { description: err_desc, status: "Failed" } }
      );
      // await sendPurchaseConfirmNotification(pp, mpIds[0]._id);
      return "OK";
    } else {
      // console.log("Order Not Found");
      return "OK";
    }
  } catch (error) {
    // console.log(error);
    // console.log("payment-callback-error: Failed :", error);
    return error.message;
  }
}

module.exports = {
  registerOnlinePayment,
  registerOnlinePaymentError,
};
