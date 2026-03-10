var reportRouter = require("express").Router();
const {
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
  getFinanceReport
} = require("../../controller/reports/daily/daily_sales_report");
const auth = require("./jwtfilter");
const MemberBooking = require("../../models/memberBooking");
const DailySalesReportLog = require("../../models/dailySalesReportLog");
const Staff = require("../../models/staff");
const mongoose = require("mongoose");

reportRouter.post("/daily-sales", async (req, res) => {
  try {
    const result = await getNetSalesInStore2(req.body);
    const result2 = await getNetPaymentInStore2(req.body);
    // console.log(result);
    // console.log(result2);
    let arr3 = result.map((item, i) => {
      const matchingItem = result2.find(
        (payment) => payment._id.toString() === item._id.toString()
      );
      if (matchingItem) {
        return Object.assign({}, item, matchingItem);
      } else {
        return item;
      }
    });
    // console.log("arr3", arr3);
    //let arr3 = result.map((item, i) => Object.assign({}, item, result2[i]));
    // const dd = {
    //   sales: result,
    //   payment: result2,
    //   arr: arr3,
    // };
    // let arr4 = arr3.map((item, i) => {
    //   let sales = item.salesHistory;
    //   sales.map((sale) => {
    //     item[sale._id.status] = sale.orderTotalNetAmount;
    //   });
    //   let payments = item.payHistory;
    //   payments.map((pay) => {
    //     item[pay._id.payMethod] = pay.payAmount;
    //   });
    //   delete item.payHistory;
    //   delete item.salesHistory;
    //   return item;
    // });
    let arr4 = arr3.map((item) => {
      let dailyGroupedData = [];
      
      // Process dailySales to group by date and accumulate amount
      if (item.dailySales) {
        item.dailySales.forEach((sale) => {
          const existingDate = dailyGroupedData.find(d => d.date === sale.date);
          if (existingDate) {
            // Accumulate amount if the date already exists
            existingDate.amount += sale.orderTotalNetAmount || 0;
          } else {
            // Add new entry for a new date
            dailyGroupedData.push({
              date: sale.date,
              amount: sale.orderTotalNetAmount || 0,
              payMethod: [] // Placeholder for payMethod
            });
          }
        });
      }
      
      // Process dailyPayments to group by date and accumulate payMethod
      if (item.dailyPayments) {
        item.dailyPayments.forEach((pay) => {
          const existingDate = dailyGroupedData.find(d => d.date === pay.date);
          if (existingDate) {
            // Add payment method to the payMethod array for the corresponding date
            let methodExists = existingDate.payMethod.find(p => p.method === pay.payMethod);
            if (methodExists) {
              methodExists.amount += pay.payAmount;
            } else {
              // Add a new payment method entry if it doesn't exist
              existingDate.payMethod.push({
                payMethod: pay.payMethod,
                payAmount: pay.payAmount
              });
            }
          } else {
            // If date doesn't exist, create a new entry with the payment method
            dailyGroupedData.push({
              date: pay.date,
              amount: 0, // No sale amount for this payment, so it's 0
              payMethod: [{
                payMethod: pay.payMethod,
                payAmount: pay.payAmount
              }]
            });
          }
        });
      }
      
      // Clean up unnecessary fields
      delete item.dailyPayments;
      delete item.dailySales;
      
      // Assign the grouped data to the item and return it
      item.dailyGroupedData = dailyGroupedData;
      
      return item;
    });
    // console.log("arr4", arr4);
    let startDate = new Date(req.body.selectedStartDate);
    let endDate = new Date(req.body.selectedEndDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    startDate.setHours(startDate.getHours() - 8);
    endDate.setHours(endDate.getHours() - 8);
    // console.log('date', startDate, endDate);
    const memberBookings = await MemberBooking.aggregate([
      {
        $match: {
          bookingstatus: "Complete",
          bookingDate: { 
            $gte: startDate,
            $lte: endDate,
          }
        }
      },
      {
        $group: {
          _id: "$branch",
          totalPax: { $sum: "$pax" }
        }
      }
    ]);

    // console.log("memberBookings:", memberBookings);

    arr4.forEach((item) => {
      const bookingData = memberBookings.find((b) => b._id.toString() === item._id.toString());
      item.pax = bookingData ? bookingData.totalPax : 0; // Default to 0 if no bookings found
    });
    // console.log("arr4 with pax", arr4);
    res.status(200).json(arr4);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/daily-category-sales", async (req, res) => {
  try {
    const result3 = await getCategorySalesInStore2(req.body);
    res.status(200).json(result3);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/daily-category-item-sales", async (req, res) => {
  try {
    const result3 = await getCategoryItemSalesInStore2(req.body);
    res.status(200).json(result3);
  } catch (e) {
    res.sendStatus(500);
  }
});

/* reportRouter.post("/finance-report", async (req, res) => {
  try {
    const result = await getFinanceReport(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
}); */

reportRouter.post('/finance-report', async (req, res) => {
  try {
    // Accept from body (preferred) or query (fallback)
    const {
      selectedBranch,
      selectedStartDate,
      selectedEndDate,
      includeItemsForExport: includeItemsForExportRaw,
    } = { ...req.query, ...req.body };  // body overrides query if both present

    // Basic validation (same as before)
    if (
      !Array.isArray(selectedBranch) || selectedBranch.length === 0 ||
      !selectedStartDate || !selectedEndDate
    ) {
      return res.status(400).json({
        ok: false,
        message: 'selectedBranch[] + selectedStartDate + selectedEndDate are required',
      });
    }

    // Guard: all branch ids must be strings
    if (!selectedBranch.every((x) => typeof x === 'string')) {
      return res.status(400).json({
        ok: false,
        message: 'selectedBranch must be array of strings',
      });
    }

    // Coerce the flag to boolean (true or "true" -> true)
    const includeItemsForExport =
      includeItemsForExportRaw === true || includeItemsForExportRaw === 'true';

    // Optional: quick visibility while testing
    // console.log('[finance-report] includeItemsForExport:', includeItemsForExport);

    const result = await getFinanceReport({
      selectedBranch,
      selectedStartDate,
      selectedEndDate,
      includeItemsForExport, // << forward the flag
    });

    return res.status(200).json(result);
  } catch (e) {
    // console.error('finance-report error:', e);
    return res.sendStatus(500);
  }
});

reportRouter.post("/inter-branch-cost", async (req, res) => {
  try {
    // console.log(req.body)
    const result1 = await getMemberPackageUsage(req.body);
    const result2 = await getMemberPackageUsageSummary(req.body);
    const result = {
      detail: result1,
      summary: result2,
    };
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/walk-in-report", async (req, res) => {
  try {
    let startDate = new Date(new Date(req.body.from_date).setHours(0, 0, 0));
    let endDate = new Date(
      new Date(req.body.to_date).setHours(23, 59, 59, 999)
    );
    const result = await MemberBooking.find({
      checkin_date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      branch: { $in: req.body.branch.split(",") },
      bookingType: "walk-in",
    })
      .populate({
        path: "member",
        select: "memberFullName mobileNumber",
      })
      .populate({
        path: "memberPackage",
        select: "package currentBalance",
        populate: { path: "package", select: "packageName packageCode" },
      })
      .populate({
        path: "branch",
        select: "branchName",
      })
      .populate({
        path: "floor",
        select: "floorNo",
      })
      .populate({
        path: "room",
        select: "room_no",
      });
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/check-in-report", async (req, res) => {
  try {
    const startDate = new Date(new Date(req.body.from_date).setHours(0, 0, 0, 0));
    const endDate = new Date(new Date(req.body.to_date).setHours(23, 59, 59, 999));

    const selectedBranches = Array.isArray(req.body.branch)
      ? req.body.branch
      : String(req.body.branch || "")
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean);

    const branchObjectIds = selectedBranches
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    // ✅ Filter by booking slot overlap (NOT checkin_date)
    const match = {
      start: { $lte: endDate },
      end: { $gte: startDate },
    };

    if (branchObjectIds.length > 0) {
      match.branch = { $in: branchObjectIds };
    }

    if (req.body.bookingType && req.body.bookingType !== "All") {
      match.bookingType = req.body.bookingType;
    }

    const contactNumber = String(req.body.contactNumber || "").trim();

    const pipeline = [
      { $match: match },

      // --- joins ---
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member",
        },
      },
      { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },

      ...(contactNumber
        ? [
            {
              $match: {
                "member.mobileNumber": { $regex: contactNumber, $options: "i" },
              },
            },
          ]
        : []),

      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          as: "memberPackage",
        },
      },
      { $unwind: { path: "$memberPackage", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "packages",
          localField: "memberPackage.package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "floors",
          localField: "floor",
          foreignField: "_id",
          as: "floor",
        },
      },
      { $unwind: { path: "$floor", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          memberPackage: {
            $cond: [
              { $ifNull: ["$memberPackage", false] },
              {
                $mergeObjects: [
                  "$memberPackage",
                  {
                    package: {
                      $cond: [{ $ifNull: ["$package", false] }, "$package", null],
                    },
                  },
                ],
              },
              null,
            ],
          },
        },
      },

      // ✅ NEW: compute effective check-in date
      {
        $addFields: {
          checkin_date_effective: {
            $ifNull: [
              "$checkin_date",
              {
                $ifNull: [
                  { $dateSubtract: { startDate: "$checkout_date", unit: "minute", amount: 90 } },
                  "$start",
                ],
              },
            ],
          },
        },
      },

      {
        $project: {
          package: 0,
          "member.password": 0,
          "member.token": 0,
          "member.__v": 0,
          "memberPackage.__v": 0,
          "branch.__v": 0,
          "floor.__v": 0,
          "room.__v": 0,
        },
      },
    ];

    const result = await MemberBooking.aggregate(pipeline);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/confirmation-daily-sales", auth, async (req, res) => {
  try {
    const {
      branch,
      totalAmount,
      totalDiscount,
      totalTax,
      totalReceived,
      confirmationStatus,
    } = req.body;

    const log = new DailySalesReportLog({
      branch,
      totalAmount,
      totalDiscount,
      totalTax,
      totalReceived,
      confirmedBy: req.user.uid,
      confirmationStatus,
    });

    await log.save();

    return res.json({ success: true });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ success: false, err });
  }
});

reportRouter.get("/confirmation-daily-sales/today", async (req, res) => {
  try {
    const now = new Date();

    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    start.setHours(start.getHours() - 8);

    const end = new Date(now);
    end.setUTCHours(23, 59, 59, 999);
    end.setHours(end.getHours() - 8);

    const logs = await DailySalesReportLog.find({
      confirmedAt: {
        $gte: start,
        $lte: end,
      },
    }).populate("branch");

    return res.json({ success: true, data: logs });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ success: false, err });
  }
});

reportRouter.post("/confirmation-daily-sales/all", auth, async (req, res) => {
  try {
    const { startDate, endDate, branch } = req.body;
    // console.log("Request body:", req.body);
    const filters = {};
    if (startDate || endDate) {
      filters.confirmedAt = {};
      let startDateObj = new Date(startDate);
      let endDateObj = new Date(endDate);
      startDateObj.setUTCHours(0, 0, 0, 0);
      startDateObj.setHours(startDateObj.getHours() - 8);
      endDateObj.setUTCHours(23, 59, 59, 999);
      endDateObj.setHours(endDateObj.getHours() - 8);
      if (startDate) filters.confirmedAt.$gte = new Date(startDateObj);
      if (endDate) filters.confirmedAt.$lte = new Date(endDateObj);
    }
    const branchFilters = {};
    if (branch) branchFilters.branch = branch;

    if (
      req.user.uid !== "admin" && !branch
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
      filters.branch = { $in: branchIds };
    }

    const logs = await DailySalesReportLog.aggregate([
      { $match: filters },
      { $sort: { confirmedAt: -1 } },
      {
        $addFields: {
          convertedBranchId: { $toString: "$branch" },
        },
      },
      {
        $match: {
          ...(branchFilters.branch
            ? { convertedBranchId: branchFilters.branch }
            : {}),
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branch",
          pipeline: [
            {
              $project: {
                branchName: 1,
                branchCode: 1,
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
    return res.json({ success: true, data: logs });
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ success: false, err });
  }
});

module.exports = reportRouter;
