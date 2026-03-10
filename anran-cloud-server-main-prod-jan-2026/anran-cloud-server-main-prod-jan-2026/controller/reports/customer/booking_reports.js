const MemberBooking = require("../../../models/memberBooking");
const MemberPackage = require("../../../models/memberPackage");

module.exports = {
  getBookingListByType,
  getMemberTotalPurchaseQtyByPackage,
};

async function getBookingListByType(query) {
  try {
    let startDate = new Date(new Date(query.from_date).setHours(0, 0, 0));
    let endDate = new Date(new Date(query.to_date).setHours(23, 59, 59, 999));
    const rr = await MemberBooking.aggregate([
      {
        $addFields: {
          checkInBranchId: {
            $toString: "$branch",
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
            { checkInBranchId: { $eq: query.branch } },
            { bookingType: { $eq: "Online" } },
          ],
        },
      },
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          as: "memberPackage",
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member",
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

async function getMemberTotalPurchaseQtyByPackage(query) {
  try {
    const rr = await MemberPackage.aggregate([
      {
        $addFields: {
          convertedPackageId: {
            $toString: "$package",
          },
          convertedMemberId: {
            $toString: "$member",
          },
        },
      },
      {
        $match: {
          convertedPackageId: {
            $eq: query.packageId,
          },
          convertedMemberId: {
            $eq: query.memberId,
          },
          isExpired: { $eq: false },
          isDeleted: { $eq: false },
        },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderItem",
          foreignField: "_id",
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $addFields: {
          purchasedQty: "$items.quantity",
        },
      },
      {
        $group: {
          _id: {
            package: "$package",
          },
          totalQty: { $sum: "$purchasedQty" },
        },
      },
      {
        $project: {
          totalQty: 1,
          _id: 0,
        },
      },
    ]);

    if (rr.length > 0) {
      if (rr[0].totalQty > query.maxQty) {
        return { allowedQty: 0 };
      } else {
        let allowedQty = query.maxQty - rr[0].totalQty;
        return { allowedQty: allowedQty };
      }
    } else {
      return { allowedQty: query.maxQty };
    }
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}
