const mongoose = require("mongoose");
const {
  generateRunningNumber,
  generateDepositRunningNumber,
  generateUseDepositRunningNumber,
  generateRunningNumberCustomDate,
  generatePayRunningNumberCustomDate,
  generatePayRunningNumber,
  getTodayBranchTaxRate,
} = require("../routes/api/utils");
const MemberDeposits = require("../models/memberDeposits");
const Orders = require("../models/orders");
const OrderItems = require("../models/ordersItem");
const Payments = require("../models/payments");
const Package = require("../models/package");
const Members = require("../models/members");
const MemberPackage = require("../models/memberPackage");
const Booking = require("../models/booking");
const Tax = require("../models/tax");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

async function registerOnlineOrder(branch, body, razorpayInstance) {
  // Step 1: Start a Client Session
  const session = await mongoose.startSession();

  // Step 2: Optional. Define options for the transaction
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  try {
    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/ClientSession.html#withTransaction for the withTransaction() docs
    const transactionResults = await session.withTransaction(async () => {
      // Important:: You must pass the session to each of the operations

      const nextInvoiceNumber = await generateRunningNumber(branch.branchCode);
      //Start- Tax
      const branchTax = await getTodayBranchTaxRate(branch._id.toString());
      //End-Tax
      const orderDoc = createMobileOrderDocument(
        body,
        body.branchId,
        body.member,
        nextInvoiceNumber,
        branchTax
      );
      // Add a reservation to the reservations array for the appropriate document in the users collection
      const order = new Orders(orderDoc);
      const rr = await order.save({ session });
      const carts = JSON.parse(body.cart);
      let orderItems = [];
      if (carts.length == 1) {
        const item = carts[0];
        const package = await Package.findById(item.packageId);
        const orderItemDoc = createOrderItemFromCart(
          item,
          rr,
          nextInvoiceNumber,
          package,
          branchTax
        );
        orderItems.push(orderItemDoc);
        if (orderItems.length == carts.length) {
          const orderDetail = await OrderItems.insertMany(orderItems, {
            session,
          });
          // console.log("orderDetail:", orderDetail);
          // console.log("orderDetail successfully created.");
          const razorpayAmount = orderDoc.orderTotalNetAmount * 100; // for razorpay amount need to multiply by 100 ( Eg. RM 5 should be send as RM 500)
          const amount = Math.floor(razorpayAmount);
          const currency = "MYR";
          const receipt = nextInvoiceNumber;
          const notes = { branch: body.branchId, member: body.member };
          let payOrderId = null;
          await razorpayInstance.orders.create(
            { amount, currency, receipt, notes },
            async (err, result) => {
              if (err) {
                // console.log("razorpayInstance:", err?.error ? err?.error : err);
              } else {
                // console.log("razorpayInstance:", result);
                payOrderId = result.id;
                return result;
              }
            }
          );
          if (payOrderId) {
            await Orders.updateOne(
              { _id: order._id },
              { $set: { orderGateWayNo: payOrderId } },
              { session }
            );
            return order;
          } else {
            // await session.abortTransaction();
            // console.log(
            //   "The transaction was intentionally aborted. Due to razorpay order failed"
            // );
            throw "The transaction was intentionally aborted. Due to razorpay order creation failed";
          }
        } else {
          throw "Items not matching";
        }
      } else {
        throw "Items not matching";
      }
      // carts.map(async (item) => {
      //   await new Promise((resolve) => {
      //     const package = await Package.findById(item.packageId);
      //     console.log(package._id);
      //     const orderItemDoc = createOrderItemFromCart(
      //       item,
      //       rr,
      //       nextInvoiceNumber,
      //       package
      //     );
      //     orderItems.push(orderItemDoc);
      //     resolve(console.log("hello"));
      //   });
      //   console.log("hi");
      // });
      // if (orderItems.length != carts.length) {
      //   throw "Items not matching";
      //   // await session.abortTransaction();
      //   // console.log("The transaction was intentionally aborted.");
      // } else {
      //   const orderDetail = await OrderItems.insertMany(orderItems, {
      //     session,
      //   });
      //   console.log("orderDetail:", orderDetail);
      //   console.log("orderDetail successfully created.");
      //   const amount = body.finalTotal * 100;
      //   const currency = "MYR";
      //   const receipt = nextInvoiceNumber;
      //   const notes = { branch: body.branchId, key2: "value2" };
      //   let payOrderId = null;
      //   await razorpayInstance.orders.create(
      //     { amount, currency, receipt, notes },
      //     async (err, result) => {
      //       if (err) {
      //         console.log("razorpayInstance:", err?.error ? err?.error : err);
      //         // throw err;
      //         // await session.abortTransaction();
      //         // console.log(
      //         //   "The transaction was intentionally aborted. Due to razorpay order failed"
      //         // );
      //         // return "The transaction was intentionally aborted. Due to razorpay order creation failed";
      //         // throw "The transaction was intentionally aborted. Due to razorpay order failed";
      //       } else {
      //         console.log("razorpayInstance:", result);
      //         payOrderId = result.id;
      //         return result;
      //       }
      //     }
      //   );
      //   if (payOrderId) {
      //     await Orders.updateOne(
      //       { _id: order._id },
      //       { $set: { orderGateWayNo: payOrderId } },
      //       { session }
      //     );
      //     return order;
      //   } else {
      //     // await session.abortTransaction();
      //     // console.log(
      //     //   "The transaction was intentionally aborted. Due to razorpay order failed"
      //     // );
      //     throw "The transaction was intentionally aborted. Due to razorpay order creation failed";
      //   }
      // }
    }, transactionOptions);
    // console.log("transactionResults:", transactionResults);
    return transactionResults;
  } catch (e) {
    // console.log("The transaction was aborted due to an unexpected error: " + e);
    //await session.abortTransaction(); // not sure it is required or not
    throw e;
  } finally {
    // Step 4: End the session
    await session.endSession();
  }
}

// async function registerDeposits(branch, body) {
//   const session = await MemberDeposits.startSession();
//   session.startTransaction();
//   try {
//     const depositNumber = await generateDepositRunningNumber(branch.branchCode); // Generate the deposit number
//     depositPromises = [];
//     for await (const item of body.payMethod) {
//       const deposit = new MemberDeposits({
//         depositNumber: depositNumber,
//         branch: body.branch,
//         payer: body.payer,
//         payDate: Date.now(),
//         payMethod: item.name,
//         payAmount: item.amount,
//         referenceNumber: item.reference,
//         createdBy: body.createdBy,
//       });
//       depositPromises.push(deposit.save({ session }));
//     }
//     await Promise.all(depositPromises);
//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error saving deposit:", error);
//     throw error;
//   }
// }

async function registerDeposits(branch, body) {
  const session = await MemberDeposits.startSession();
  try {
    await session.withTransaction(async () => {
      const depositNumber = await generateDepositRunningNumber(
        branch.branchCode
      );

      const depositPromises = body.payMethod.map(async (item) => {
        const deposit = new MemberDeposits({
          depositNumber: depositNumber,
          branch: body.branch,
          payer: body.payer,
          payDate: Date.now(),
          payMethod: item.name,
          payAmount: item.amount,
          referenceNumber: item.reference,
          createdBy: body.createdBy,
        });
        return deposit.save({ session });
      });

      await Promise.all(depositPromises);
    });
  } catch (error) {
    console.error("Error saving deposit:", error);
    throw error;
  } finally {
    session.endSession();
  }
}

async function registerUseDeposits(branch, body) {
  const session = await MemberDeposits.startSession();
  session.startTransaction();
  try {
    const depositNumber = await generateUseDepositRunningNumber(
      branch.branchCode
    ); // Generate the deposit number
    depositPromises = [];
    const negativeAmount = -Math.abs(body.payAmount);
    const deposit = new MemberDeposits({
      depositNumber: depositNumber,
      orderNumber: body.orderNumber,
      branch: body.branch,
      payer: body.payer,
      payDate: Date.now(),
      payMethod: "Deduction",
      payAmount: negativeAmount,
      referenceNumber: body.reference,
      createdBy: body.createdBy,
    });
    depositPromises.push(deposit.save({ session }));
    await Promise.all(depositPromises);
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving deposit:", error);
    throw error;
  }
}

async function registerCustomPayment(branch, body) {
  const session = await mongoose.startSession();

  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  try {
    const transactionResults = await session.withTransaction(async () => {
      // Parse and normalize orderDate
      // const orderDate = new Date(body.orderDate);
      // const orderDate = dayjs(body.orderDate).tz("Asia/Kuala_Lumpur");
       const orderDate =  new Date(body.orderDate);
       orderDate.setUTCHours(0, 0, 0, 999)
      const nextInvoiceNumber = await generateRunningNumberCustomDate(
        branch.branchCode,
        // orderDate.toDate()
        orderDate
      );

      const orderDoc = createCustomOrderDocument(
        body,
        body.branchName,
        body.member,
        nextInvoiceNumber
      );
      // Set the custom orderDate
      // orderDoc.orderDate = new Date(body.orderDate);
      orderDoc.orderDate = orderDate;

      const order = new Orders(orderDoc);
      const rr = await order.save({ session });
      const carts = body.carts;
      let orderItems = [];
      carts.map((item) => {
        const orderItemDoc = createOrderItemDocument(
          item,
          rr,
          nextInvoiceNumber
        );
        orderItems.push(orderItemDoc);
      });
      if (orderItems.length != carts.length) {
        await session.abortTransaction();
        throw new Error("The transaction was intentionally aborted.");
      } else {
        const orderDetail = await OrderItems.insertMany(orderItems, {
          session,
        });
        let orderItems2 = [];
        for await (const item of orderDetail) {
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
        await MemberPackage.insertMany(orderItems2, { session });

        const payments = body.payments;
        let payRecordIds = [];
        for await (const item of payments) {
          const nextPayNumber = await generatePayRunningNumberCustomDate(
            branch.branchCode,
            orderDate
          );
          let pay_obj = {
            paymentNumber: nextPayNumber,
            orderNumber: nextInvoiceNumber,
            payer: order.member,
            payType: "Direct",
            payMethod: item.name,
            payAmount: item.amount,
            payReference: item.reference,
            payDate: orderDate,
          };
          const pay = new Payments(pay_obj);
          const pp = await pay.save({ session });
          payRecordIds.push(pp._id);
        }
        await Orders.updateOne(
          { _id: order._id },
          { $set: { payments: payRecordIds } },
          { session }
        );

        await Members.findByIdAndUpdate(
          { _id: order.member },
          { lastPurchaseDate: Date.now() },
          { session }
        );
        return nextInvoiceNumber;
      }
    }, transactionOptions);
    return transactionResults;
  } catch (e) {
    // console.log("The transaction was aborted due to an unexpected error: " + e);
    throw e;
  } finally {
    await session.endSession();
  }
}

async function registerOfflinePaymentV2(branch, body) {
  // Step 1: Start a Client Session
  const session = await mongoose.startSession();

  // Step 2: Optional. Define options for the transaction
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  try {
    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/ClientSession.html#withTransaction for the withTransaction() docs
    const transactionResults = await session.withTransaction(async () => {
      // Important:: You must pass the session to each of the operations

      const nextInvoiceNumber = await generateRunningNumber(branch.branchCode);
      const orderDoc = createOrderDocument(
        body,
        body.branchName,
        body.member,
        nextInvoiceNumber
      );
      // Add a reservation to the reservations array for the appropriate document in the users collection
      const order = new Orders(orderDoc);
      const rr = await order.save({ session });
      const carts = body.carts;
      let orderItems = [];
      carts.map((item) => {
        const orderItemDoc = createOrderItemDocument(
          item,
          rr,
          nextInvoiceNumber
        );
        orderItems.push(orderItemDoc);
      });
      if (orderItems.length != carts.length) {
        await session.abortTransaction();
        // console.log("The transaction was intentionally aborted.");
      } else {
        const orderDetail = await OrderItems.insertMany(orderItems, {
          session,
        });
        // console.log("orderDetail:", orderDetail);
        let orderItems2 = [];
        for await (const item of orderDetail) {
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
        const orderDetail2 = await MemberPackage.insertMany(orderItems2, {
          session,
        });
        // console.log("MemberPackage successfully created.");
        const payments = body.payments;
        let payRecordIds = [];
        for await (const item of payments) {
          const nextPayNumber = await generatePayRunningNumber(
            branch.branchCode
          );
          let pay_obj = {
            paymentNumber: nextPayNumber,
            orderNumber: nextInvoiceNumber,
            payer: order.member,
            payType: "Direct",
            payMethod: item.name,
            payAmount: item.amount,
            payReference: item.reference,
          };
          const pay = new Payments(pay_obj);
          const pp = await pay.save({ session });
          payRecordIds.push(pp._id);
        }
        await Orders.updateOne(
          { _id: order._id },
          { $set: { payments: payRecordIds } },
          { session }
        );
        // await Members.update(
        //   { _id: order.member },
        //   { $set: { lastPurchaseDate: order.orderDate } },
        //   { session }
        // );
        await Members.findByIdAndUpdate(
          { _id: order.member },
          { lastPurchaseDate: Date.now() },
          { session }
        );
        // console.log("Payments successfully created.");
        return nextInvoiceNumber;
      }
    }, transactionOptions);
    return transactionResults;
  } catch (e) {
    // console.log("The transaction was aborted due to an unexpected error: " + e);
    // await session.abortTransaction();  not sure it is required or not
    throw e;
  } finally {
    // Step 4: End the session
    await session.endSession();
  }
}

async function registerOfflinePayment(branch, member, body) {
  // Step 1: Start a Client Session
  const session = await mongoose.startSession();

  // Step 2: Optional. Define options for the transaction
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };

  try {
    // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
    // Note: The callback for withTransaction MUST be async and/or return a Promise.
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/ClientSession.html#withTransaction for the withTransaction() docs
    const transactionResults = await session.withTransaction(async () => {
      // Important:: You must pass the session to each of the operations

      const nextInvoiceNumber = await generateRunningNumber(branch.branch_code);
      const orderDoc = createOrderDocument(
        body,
        body.branchName,
        body.member,
        nextInvoiceNumber
      );

      // Add a reservation to the reservations array for the appropriate document in the users collection
      const order = new Orders(orderDoc);
      const rr = await order.save({ session });
      // const order = await Orders.create([orderDoc], { session });
      if (rr) {
        // console.log("The order was successfully created.");
      } else {
        await session.abortTransaction();
      }

      const carts = body.carts;
      let orderItems = [];
      carts.map((item) => {
        const orderItemDoc = createOrderItemDocument(
          item,
          rr,
          nextInvoiceNumber
        );
        orderItems.push(orderItemDoc);
      });
      if (orderItems.length != carts.length) {
        await session.abortTransaction();
        // console.log("The transaction was intentionally aborted.");
      } else {
        const orderDetail = await OrderItems.insertMany(orderItems, {
          session,
        });
        // console.log("orderDetail:", orderDetail);
        await createMemberPackageDocument(orderDetail, rr, session);
        // let memberPackageList = [];
        // await orderDetail.map(async (item) => {
        //   console.log("item:", item);
        //   const result = await createMemberPackageDocument(item, rr);
        //   memberPackageList.push(result);
        //   const memberpackage = new MemberPackage(result);
        //   await memberpackage.save({ session });
        //   console.log("MemberPackage successfully created.");
        // });
        // console.log("The reservation was successfully created.");
      }
    }, transactionOptions);

    if (transactionResults) {
      await session.commitTransaction();
      // console.log("The reservation was successfully created.");
    } else {
      // await session.abortTransaction();
      // console.log("The transaction was intentionally aborted.");
      console.log("The reservation was successfully created.");
    }
  } catch (e) {
    // console.log("The transaction was aborted due to an unexpected error: " + e);
    // await session.abortTransaction();  not sure it is required or not
    throw e;
  } finally {
    // Step 4: End the session
    await session.endSession();
  }
}

async function registerImportCorrections(branch, body) {
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  try {
    const transactionResults = await session.withTransaction(async () => {
      let purchaseDate;
      if (typeof body.orderDate === "number") {
        purchaseDate = new Date((body.orderDate - 25569) * 86400 * 1000);
        // console.log("purchaseDate", purchaseDate);
      } else {
        purchaseDate = new Date(body.orderDate);
        // console.log("purchaseDate", purchaseDate);
      }
      purchaseDate = new Date(purchaseDate.getTime() + 15 * 60 * 60 * 1000);

      const taxInfo = await Tax.findOne({
        branch: branch._id,
        isDeleted: false,
      });
      const taxValue = taxInfo ? taxInfo.taxValue : 0;
      const taxCode = taxInfo ? taxInfo.taxType : "SST";
      // console.log("taxValue", taxValue);

      const nextInvoiceNumber = await generateRunningNumberCustomDate(
        branch.branchCode,
        purchaseDate
      );

      const { payments, ...orderBodyWithoutPayments } = body;
      const orderTotalAmount =
        parseFloat(orderBodyWithoutPayments.orderTotalAmount) || 0;
      const taxValueNum = parseFloat(taxValue) || 0;
      const orderTotalTaxAmount = (orderTotalAmount * taxValueNum) / 100;
      const orderTotalNetAmount = orderTotalAmount + orderTotalTaxAmount;
      const orderDoc = {
        ...orderBodyWithoutPayments,
        orderNumber: nextInvoiceNumber,
        orderBranch: branch._id,
        remarks: "Corrected",
        status: "Paid",
        orderDate: purchaseDate,
        taxValue: taxValue,
        taxCode: taxCode,
        orderTotalTaxAmount: orderTotalTaxAmount,
        orderTotalNetAmount: orderTotalNetAmount,
      };

      const order = new Orders(orderDoc);
      const rr = await order.save({ session });

      const carts = body.carts;
      let orderItems = [];
      carts.forEach((item) => {
        const orderItemDoc = createOrderItemDocument(
          item,
          rr,
          nextInvoiceNumber
        );
        orderItems.push(orderItemDoc);
      });
      if (orderItems.length !== carts.length) {
        await session.abortTransaction();
        throw new Error("Items not matching");
      }
      const orderDetail = await OrderItems.insertMany(orderItems, { session });

      let memberPackages = [];
      for await (const item of orderDetail) {
        const pack = await Package.findById(item.package);
        const purchaseDate = order.orderDate;
        let validDate = null;
        if (pack.packageValidity === "fixed") {
          const endOfMonth = new Date(
            purchaseDate.getFullYear(),
            purchaseDate.getMonth() + 1,
            0
          );
          endOfMonth.setHours(23, 59, 59, 999);
          validDate = endOfMonth;
        }
        let member_package_obj = {
          member: order.member,
          orderItem: item._id,
          package: pack._id,
          purchaseBranch: order.orderBranch,
          purchaseDate: order.orderDate,
          packageValidity: pack.packageValidity,
          validDate: validDate,
          originalBalance: pack.packageUnlimitedStatus
            ? 99999
            : pack.packageUsageLimit * item.quantity,
          currentBalance: pack.packageUnlimitedStatus
            ? 99999
            : pack.packageUsageLimit * item.quantity,
        };
        memberPackages.push(member_package_obj);
      }
      await MemberPackage.insertMany(memberPackages, { session });

      const paymentsArr = payments || [];
      let payRecordIds = [];
      for await (const item of paymentsArr) {
        const nextPayNumber = await generatePayRunningNumberCustomDate(
          branch.branchCode,
          purchaseDate
        );
        let pay_obj = {
          paymentNumber: nextPayNumber,
          orderNumber: nextInvoiceNumber,
          payer: order.member,
          payType: "Direct",
          payMethod: item.name,
          payAmount: item.amount,
          payReference: item.reference,
          payDate: purchaseDate,
        };
        const pay = new Payments(pay_obj);
        const pp = await pay.save({ session });
        payRecordIds.push(pp._id);
      }
      await Orders.updateOne(
        { _id: order._id },
        { $set: { payments: payRecordIds } },
        { session }
      );
      await Members.findByIdAndUpdate(
        { _id: order.member },
        { lastPurchaseDate: order.orderDate },
        { session }
      );
      return nextInvoiceNumber;
    }, transactionOptions);
    return transactionResults;
  } catch (e) {
    // console.log("The transaction was aborted due to an unexpected error: " + e);
    throw e;
  } finally {
    await session.endSession();
  }
}

function createOrderDocument(data, branch, member, nextInvoiceNumber) {
  // let paymentsData = [];
  // data.payments.map((item) => {
  //   let obj = {
  //     amount: item.amount,
  //     method: item.name,
  //   };
  //   paymentsData.push(obj);
  // });
  let order_obj = {
    orderNumber: nextInvoiceNumber,
    member: member,
    orderBranch: branch,
    orderTotalAmount: data.orderTotal,
    orderTotalDiscountAmount: data.totalDiscount,
    taxCode: data.taxCode,
    taxValue: data.taxValue,
    orderTotalTaxAmount: data.totalTax,
    orderTotalNetAmount:
      parseFloat(data.orderTotal) + parseFloat(data.totalTax),
    orderMode: "walk-in",
    status: "Paid",
    description: "",
    // payments: paymentsData,
  };
  // console.log("order_obj", order_obj);
  return order_obj;
}

function createCustomOrderDocument(data, branch, member, nextInvoiceNumber) {
  let order_obj = {
    orderNumber: nextInvoiceNumber,
    member: member,
    orderBranch: branch,
    orderTotalAmount: data.orderTotal,
    orderTotalDiscountAmount: data.totalDiscount,
    taxCode: data.taxCode,
    taxValue: data.taxValue,
    orderTotalTaxAmount: data.totalTax,
    orderTotalNetAmount:
      parseFloat(data.orderTotal) + parseFloat(data.totalTax),
    orderMode: "walk-in",
    status: "Paid",
    description: "",
    remarks: "Custom Date Order",
    // payments: paymentsData,
  };
  // console.log("order_obj", order_obj);
  return order_obj;
}

function createMobileOrderDocument(
  data,
  branch,
  member,
  nextInvoiceNumber,
  branchTax
) {
  // let paymentsData = [];
  // data.payments.map((item) => {
  //   let obj = {
  //     amount: item.amount,
  //     method: item.name,
  //   };
  //   paymentsData.push(obj);
  // });
  let Total = parseFloat(data.orderTotal) - parseFloat(data.totalDiscount);
  let taxTotal = Total * branchTax.taxRate;
  let order_obj = {
    orderNumber: nextInvoiceNumber,
    member: member,
    orderBranch: branch,
    orderTotalAmount: Total,
    orderTotalDiscountAmount: data.totalDiscount,
    taxCode: branchTax.taxCode ?? "SST",
    taxValue: branchTax.taxValue ?? 0,
    orderTotalTaxAmount: taxTotal,
    orderTotalNetAmount: Total + taxTotal,
    orderMode: "Online",
    status: "Pending",
    description: "",
    // payments: paymentsData,
  };
  // console.log("order_obj", order_obj);
  return order_obj;
}

function createOrderItemFromCart(
  item,
  order,
  nextInvoiceNumber,
  package,
  branchTax
) {
  if (package) {
    const uamount = package.packagePrice * item.quantity;
    let Total = parseFloat(uamount) - parseFloat(item.discountPrice);
    let taxTotal = Total * branchTax.taxRate;

    let order_item_obj = {
      order: order._id.toString(),
      orderNo: nextInvoiceNumber,
      package: package._id,
      unitPrice: package.packagePrice,
      quantity: item.quantity,
      discountType: item.discountType,
      discountPrice: item.discountPrice,
      unitAmount: uamount,
      taxCode: branchTax.taxCode ?? "SST",
      taxValue: branchTax.taxValue ?? 0,
      taxAmount: taxTotal,
      netAmount: Total + taxTotal,
    };
    return order_item_obj;
  }
}

function createPaymentDocument(data, member, nextInvoiceNumber, type) {
  let paymentsData = [];
  data.payments.map((item) => {
    let obj = {
      paymentNumber: nextPayNumber,
      orderNumber: nextInvoiceNumber,
      payer: member,
      payType: type,
      payMethod: item.name,
      PayAmount: item.amount,
    };
    paymentsData.push(obj);
  });
  return paymentsData;
}

function createOrderItemDocument(item, order, nextInvoiceNumber) {
  // console.log(order);
  const taxAmount = (parseFloat(item.packageAmount) * order.taxValue) / 100;
  const netAmount = parseFloat(item.packageAmount) + parseFloat(taxAmount);
  let order_item_obj = {
    order: order._id.toString(),
    orderNo: nextInvoiceNumber,
    package: item._id,
    unitPrice: item.packagePrice,
    quantity: item.qty,
    discountType: "item",
    discountPrice: order.orderTotalDiscountAmount,
    unitAmount: item.packageAmount,
    taxCode: order.taxCode,
    taxValue: order.taxValue,
    taxAmount: taxAmount,
    netAmount: netAmount,
  };
  return order_item_obj;
}

async function createMemberPackageDocument(orderDetail, order, session) {
  orderDetail.map(async (item) => {
    // console.log("item:", item);
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
          : pack.packageUsageLimit,
        currentBalance: pack.packageUnlimitedStatus
          ? 99999
          : pack.packageUsageLimit,
      };
      const memberpackage = new MemberPackage(member_package_obj);
      await memberpackage.save({ session });
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
          : pack.packageUsageLimit,
        currentBalance: pack.packageUnlimitedStatus
          ? 99999
          : pack.packageUsageLimit,
      };
      const memberpackage = new MemberPackage(member_package_obj);
      await memberpackage.save({ session });
    }

    console.log("MemberPackage successfully created.");
  });
}

// async function createMemberPackageDocument(item, order) {
//   const pack = await Package.findById(item.package);
//   let member_package_obj = {
//     member: order.member,
//     orderItem: item._id,
//     package: pack._id,
//     purchaseBranch: order.orderBranch,
//     purchaseDate: order.orderDate,
//     packageValidity: pack.packageValidity,
//     originalBalance: pack.packageUnlimitedStatus
//       ? 99999
//       : pack.packageUsageLimit,
//     currentBalance: pack.packageUnlimitedStatus
//       ? 99999
//       : pack.packageUsageLimit,
//   };
//   console.log("member_package_obj", member_package_obj);
//   return member_package_obj;
// }

async function checkBookingCount(roomId, start) {
  if (!roomId || !start) {
    throw new Error("Please provide room ID, start time, and end time");
  }
  let end = new Date(start);
  end.setHours(start.getHours(), start.getMinutes() + 60);
  let startUTC = new Date(start).toISOString();
  let endUTC = new Date(end).toISOString();
  // console.log("dd", startUTC, endUTC);
  const existingBooking = await Booking.findOne({
    $and: [
      { room: { $eq: roomId } },
      { start: { $eq: new Date(startUTC) } },
      { end: { $eq: new Date(endUTC) } },
    ],
  }).populate({
    path: "members",
  });
  // console.log("existingBooking", existingBooking?._id);
  let blockedMaleCount = 0;
  let blockedFemaleCount = 0;
  existingBooking?.members.forEach((member) => {
    console.log("member", member);
    if (member.bookingstatus === "Booked") {
      // console.log("memberBookingStatus", member.bookingstatus);
      blockedMaleCount += member.malePax || 0;
      blockedFemaleCount += member.femalPax || 0;
    } else {
      blockedMaleCount += 0;
      blockedFemaleCount += 0;
    }
  });
  return { blockedMaleCount, blockedFemaleCount, bookingId: existingBooking };
}

module.exports = {
  registerOnlineOrder,
  registerOfflinePayment,
  registerOfflinePaymentV2,
  registerCustomPayment,
  registerDeposits,
  registerUseDeposits,
  checkBookingCount,
  registerImportCorrections,
};
