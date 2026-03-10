const Orders = require("../../models/orders");
const Payments = require("../../models/payments");
const ordersItem = require("../../models/ordersItem");
const Members = require("../../models/members");
const MemberPackage = require("../../models/memberPackage");
const MemberBooking = require("../../models/memberBooking");
// const { param } = require("../../routes/api/marketing");

module.exports = {
  getGenderCount,
  getMemberRegisterCount,
  getReferralSourceCount,
  getCustomerBookingUsage,
  getBranchCount,
  getTotalNetSales,
  getTop10SellingPackages,
  getTop5SellingPackages,
  getMemberAgeGroup,
  getResidentialAreaReport,
};



async function getGenderCount(params) {
  try {
    const branchFilters = {};
    if (params.selectedBranch && params.selectedBranch != "All") {
      branchFilters["convertedId"] = { $in: params.selectedBranch.split(",") };
    }

    const obj = await Members.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "preferredBranch",
          foreignField: "_id",
          pipeline: [
            { $project: { branchCode: 1, branchName: 1 } },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branches", 0] },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $match: {
          isDeleted: false,
          fullRegister: true,
          ...branchFilters,
        },
      },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          genders: { $push: { gender: "$_id", count: "$count" } },
        },
      },
      { $unwind: "$genders" },
      {
        $project: {
          _id: 0,
          gender: { $ifNull: ["$genders.gender", "Unknown"] },
          count: "$genders.count",
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$genders.count", "$total"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
        sortOrder: {
            $switch: {
            branches: [
                { case: { $eq: ["$gender", "Male"] }, then: 1 },
                { case: { $eq: ["$gender", "Female"] }, then: 2 },
                { case: { $eq: ["$gender", "Non-binary"] }, then: 3 },
            ],
            default: 4,
            },
        },
        },
      },
      { $sort: { sortOrder: 1 } },
    ]);
    const chartData = obj.map((item, index) => ({
      id: index + 1,
      key: item.gender,
      title: item.gender,
      value: item.count,
      percentage: item.percentage,
      color:
        item.gender === "Male"
          ? "#0A8FDC"
          : item.gender === "Female"
          ? "#F04F47"
          : item.gender === "Non-binary"
          ? "#ff9800"
          : "#9e9e9e",
    }));
    return chartData;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getMemberAgeGroup(params) {
  // console.log('[getMemberAgeGroup] params:', params);

  // --- your style: build branchFilters using convertedId (string) ---
  const branchFilters = {};
  if (params?.selectedBranch && params.selectedBranch !== 'All') {
    branchFilters['convertedId'] = {
      $in: params.selectedBranch.toString().split(',').filter(Boolean)
    };
  }
  // console.log('[getMemberAgeGroup] branchFilters:', branchFilters);

  try {
    const pipeline = [
      // Filter member flags first (faster)
      { $match: { isDeleted: false, fullRegister: true } },

      // Join branches
      {
        $lookup: {
          from: 'branches',
          localField: 'preferredBranch',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },

      // Ensure we have a string version of branch _id to match your filter
      { $addFields: { 'branch.convertedId': { $toString: '$branch._id' } } },

      // Optional branch filter with your branchFilters
      ...(branchFilters.convertedId
        ? [{ $match: { 'branch.convertedId': branchFilters.convertedId } }]
        : []),

      // Compute age strictly from dob
      {
        $addFields: {
          ageYears: {
            $cond: [
              { $ifNull: ['$dob', false] },
              { $dateDiff: { startDate: '$dob', endDate: '$$NOW', unit: 'year' } },
              null,
            ],
          },
        },
      },

      // Map to labeled age groups
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $and: [{ $ne: ['$ageYears', null] }, { $lt: ['$ageYears', 18] }] }, then: 'Teens (<18)' },
                { case: { $and: [{ $gte: ['$ageYears', 18] }, { $lte: ['$ageYears', 25] }] }, then: 'Young Adults (18–25)' },
                { case: { $and: [{ $gte: ['$ageYears', 26] }, { $lte: ['$ageYears', 35] }] }, then: 'Young Professionals (26–35)' },
                { case: { $and: [{ $gte: ['$ageYears', 36] }, { $lte: ['$ageYears', 45] }] }, then: 'Young Families / Mid Career (36–45)' },
                { case: { $and: [{ $gte: ['$ageYears', 46] }, { $lte: ['$ageYears', 59] }] }, then: 'Mature Adults (46–59)' },
                { case: { $gte: ['$ageYears', 60] }, then: 'Seniors (60+)' },
              ],
              default: 'Unknown DOB',
            },
          },
        },
      },

      // Count per (branch, ageGroup)
      {
        $group: {
          _id: {
            branchId: '$branch._id',
            branchName: '$branch.branchName',
            ageGroup: '$ageGroup',
          },
          count: { $sum: 1 },
        },
      },

      // Per-branch totals → percentage
      {
        $group: {
          _id: { branchId: '$_id.branchId', branchName: '$_id.branchName' },
          rows: { $push: { ageGroup: '$_id.ageGroup', count: '$count' } },
          branchTotal: { $sum: '$count' },
        },
      },
      { $unwind: '$rows' },
      {
        $project: {
          _id: 0,
          branchId: '$_id.branchId',
          branchName: '$_id.branchName',
          ageGroup: '$rows.ageGroup',
          count: '$rows.count',
          percentage: {
            $cond: [{ $gt: ['$branchTotal', 0] }, { $divide: ['$rows.count', '$branchTotal'] }, 0],
          },
        },
      },

      // Stable ordering
      {
        $addFields: {
          groupOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$ageGroup', 'Teens (<18)'] }, then: 1 },
                { case: { $eq: ['$ageGroup', 'Young Adults (18–25)'] }, then: 2 },
                { case: { $eq: ['$ageGroup', 'Young Professionals (26–35)'] }, then: 3 },
                { case: { $eq: ['$ageGroup', 'Young Families / Mid Career (36–45)'] }, then: 4 },
                { case: { $eq: ['$ageGroup', 'Mature Adults (46–59)'] }, then: 5 },
                { case: { $eq: ['$ageGroup', 'Seniors (60+)'] }, then: 6 },
                { case: { $eq: ['$ageGroup', 'Unknown DOB'] }, then: 99 },
              ],
              default: 99,
            },
          },
        },
      },
      { $sort: { branchName: 1, groupOrder: 1 } },
    ];

    const rows = await Members.aggregate(pipeline);
    // console.log('[getMemberAgeGroup] rows:', rows.length);

    const colorBy = {
      'Teens (<18)': '#0A8FDC',
      'Young Adults (18–25)': '#F04F47',
      'Young Professionals (26–35)': '#ff9800',
      'Young Families / Mid Career (36–45)': '#ff0000ff',
      'Mature Adults (46–59)': '#2bff00ff',
      'Seniors (60+)': '#e5ff00ff',
      'Unknown DOB': '#ff00eaff',
    };

    const chartData = rows.map((r, i) => ({
      id: i + 1,
      branchId: r.branchId,
      branchName: r.branchName,
      ageGroup: r.ageGroup,
      title: r.ageGroup,              // frontend folds by age group; title is the label
      value: r.count,
      percentage: Number(((r.percentage ?? 0) * 100).toFixed(2)),
      color: colorBy[r.ageGroup] || '#9e9e9e',
    }));

    // console.log('[getMemberAgeGroup] chartData:', chartData.length);
    return chartData;
  } catch (err) {
    console.error('[getMemberAgeGroup] ERROR:', err);
    throw err; // let the route send 500 with message
  }
}

async function getReferralSourceCount(params) {
  try {
    const branchFilters = {};
    if (params.selectedBranch && params.selectedBranch != "All") {
      branchFilters["convertedId"] = { $in: params.selectedBranch.split(",") };
    }

    const obj = await Members.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "preferredBranch",
          foreignField: "_id",
          pipeline: [
            { $project: { branchCode: 1, branchName: 1 } },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branches", 0] },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $match: {
          isDeleted: false,
          fullRegister: true,
          ...branchFilters,
        },
      },
      {
        $group: {
          _id: "$aboutUs",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          sources: { $push: { source: "$_id", count: "$count" } },
        },
      },
      { $unwind: "$sources" },
      {
        $project: {
          _id: 0,
          source: { $ifNull: ["$sources.source", "Unknown"] },
          count: "$sources.count",
          percentage: {
            $round: [
              {
                $multiply: [{ $divide: ["$sources.count", "$total"] }, 100],
              },
              2,
            ],
          },
        },
      },
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$source", "Family"] }, then: 1 },
                { case: { $eq: ["$source", "Friend"] }, then: 2 },
                { case: { $eq: ["$source", "Facebook"] }, then: 3 },
                { case: { $eq: ["$source", "Advertisement"] }, then: 4 },
                { case: { $eq: ["$source", "Anran Outlet"] }, then: 5 },
                { case: { $eq: ["$source", "Others"] }, then: 6 },
              ],
              default: 7,
            },
          },
        },
      },
      { $sort: { sortOrder: 1 } },
    ]);

    const chartData = obj.map((item, index) => ({
      id: index + 1,
      key: item.source,
      title: item.source,
      value: item.count,
      percentage: item.percentage,
      color:
        item.source === "Family"
          ? "#42a5f5"
          : item.source === "Friend"
          ? "#66bb6a"
          : item.source === "Facebook"
          ? "#1976d2"
          : item.source === "Advertisement"
          ? "#ffb300"
          : item.source === "Anran Outlet"
          ? "#ab47bc"
          : "#9e9e9e",
    }));

    return chartData;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}


async function getResidentialAreaReport() {
  const pipeline = [
    // 1) base filter
    { $match: { isDeleted: false, fullRegister: true } },

    // 3) normalize city/states: trim & convert empty -> null
    {
      $addFields: {
        _city: {
          $let: {
            vars: { t: { $trim: { input: { $ifNull: ['$city', ''] } } } },
            in: { $cond: [{ $eq: ['$$t', ''] }, null, '$$t'] }
          }
        },
        _state: {
          $let: {
            vars: { t: { $trim: { input: { $ifNull: ['$states', ''] } } } },
            in: { $cond: [{ $eq: ['$$t', ''] }, null, '$$t'] }
          }
        }
      }
    },

    // 4) keep if either exists
    { $match: { $or: [{ _city: { $ne: null } }, { _state: { $ne: null } }] } },

    // 5) normalized for grouping
    {
      $addFields: {
        _city_norm: { $toLower: '$_city' },
        _state_norm: { $toLower: '$_state' }
      }
    },

    // 6) split views
    {
      $facet: {
        totals: [{ $count: 'considered' }],

        byState: [
          { $match: { _state_norm: { $ne: null } } },
          {
            $group: {
              _id: '$_state_norm', 
              state: { $first: '$_state' },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1, state: 1 } }
        ],

        byCity: [
          { $match: { _city_norm: { $ne: null } } },
          {
            $group: {
              _id: '$_city_norm',
              city: { $first: '$_city' },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1, city: 1 } }
        ],

        byStateCity: [
          { $match: { _state_norm: { $ne: null }, _city_norm: { $ne: null } } },
          {
            $group: {
              _id: { state: '$_state_norm', city: '$_city_norm' },
              state: { $first: '$_state' },
              city: { $first: '$_city' },
              count: { $sum: 1 }
            }
          },
          { $sort: { state: 1, count: -1, city: 1 } }
        ]
      }
    },

    // 7) unwrap totals
    {
      $project: {
        totals: { $ifNull: [{ $arrayElemAt: ['$totals', 0] }, { considered: 0 }] },
        byState: 1,
        byCity: 1,
        byStateCity: 1
      }
    }
  ];

  const [agg] = await Members.aggregate(pipeline).allowDiskUse(true);
  const totals = agg?.totals || { considered: 0 };
  const total = totals.considered || 0;

  const round2 = (n) => Math.round(n * 100) / 100;

  const byState = (agg?.byState || []).map((r) => ({
    state: r.state,
    count: r.count,
    percentage: total ? round2((r.count / total) * 100) : 0
  }));

  const byCity = (agg?.byCity || []).map((r) => ({
    city: r.city,
    count: r.count,
    percentage: total ? round2((r.count / total) * 100) : 0
  }));

  const byStateCity = (agg?.byStateCity || []).map((r) => ({
    state: r.state,
    city: r.city,
    count: r.count,
    percentage: total ? round2((r.count / total) * 100) : 0
  }));

  // simple palette
  const PALETTE = [
    '#0A8FDC','#F04F47','#ff9800','#8bc34a','#9c27b0',
    '#00bcd4','#795548','#607d8b','#3f51b5','#009688',
    '#ffc107','#e91e63','#4caf50','#673ab7','#2196f3',
  ];
  const colorAt = (i) => PALETTE[i % PALETTE.length];

  // chart-ready arrays
  const stateChartData = byState.map((r, i) => ({
    id: i + 1,
    key: r.state,
    title: r.state,
    value: r.count,
    percentage: r.percentage,
    color: colorAt(i)
  }));

  const cityChartData = byCity.map((r, i) => ({
    id: i + 1,
    key: r.city,
    title: r.city,
    value: r.count,
    percentage: r.percentage,
    color: colorAt(i)
  }));

  const stateCityChartData = byStateCity.map((r, i) => ({
    id: i + 1,
    key: `${r.state} • ${r.city}`,
    title: `${r.state} - ${r.city}`,
    value: r.count,
    percentage: r.percentage,
    color: colorAt(i)
  }));

  return {
    totals,
    byState,
    byCity,
    byStateCity,
    charts: { stateChartData, cityChartData, stateCityChartData }
  };
}

async function getCustomerBookingUsage(params) {
  try {
    const branchFilters = {};
    if (params.selectedBranch && params.selectedBranch !== "All") {
      branchFilters["convertedId"] = { $in: params.selectedBranch.split(",") };
    }

    const obj = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "memberData",
        },
      },
      { $unwind: "$memberData" },
      {
        $lookup: {
          from: "branches",
          localField: "memberData.preferredBranch",
          foreignField: "_id",
          pipeline: [{ $project: { branchCode: 1, branchName: 1 } }],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branches", 0] },
        },
      },
      {
        $addFields: {
          convertedId: { $toString: "$branch._id" },
        },
      },
      {
        $match: {
          "memberData.isDeleted": false,
          "memberData.fullRegister": true,
          ...branchFilters,
        },
      },
      {
        $group: {
          _id: "$member",
          bookingCount: { $sum: 1 },
        },
      },
      {
        $project: {
          usageType: {
            $cond: [
              { $eq: ["$bookingCount", 1] },
              "First Time",
              "Returning",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$usageType",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          usage: { $push: { type: "$_id", count: "$count" } },
        },
      },
      { $unwind: "$usage" },
      {
        $project: {
          _id: 0,
          type: "$usage.type",
          count: "$usage.count",
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$usage.count", "$total"] }, 100] },
              2,
            ],
          },
        },
      },
    ]);

    const chartData = obj.map((item, index) => ({
      id: index + 1,
      key: item.type,
      title: item.type,
      value: item.count,
      percentage: item.percentage,
      color:
        item.type === "First Time"
          ? "#4caf50"
          : "#2196f3",
    }));

    return chartData;
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
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
        $addFields: {
          convertedBranchId: {
            $toString: "$orderBranch",
          },
        },
      },
      {
        $match: {
          status: "Paid",
          ...dateFilters,
          ...branchFilters,
        },
      },
      {
        $sort: {
          orderDate: 1,
        },
      },
      {
        $group: {
          _id: {
            // orderBranch: "$orderBranch",
            orderDate: {
              $dateToString: { format: "%b", date: "$orderDate" },
            },
          },
          orderTotalNetAmount: { $sum: "$orderTotalNetAmount" },
          count: { $count: {} },
        },
      },
      {
        $sort: {
          "_id.orderDate": 1,
        },
      },
      {
        $addFields: {
          month: { $toString: "$_id.orderDate" },
        },
      },
      {
        $addFields: {
          amount: { $toString: "$orderTotalNetAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          count: 1,
          amount: 1,
          // amount: { $concat: ["RM ", "$amount"] },
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
