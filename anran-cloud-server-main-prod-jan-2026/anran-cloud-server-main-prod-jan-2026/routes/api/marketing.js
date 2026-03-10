var reportRouter = require("express").Router();

const {
  getGenderCount,
  getCustomerBookingUsage,
  getReferralSourceCount,
  getMemberRegisterCount,
  getBranchCount,
  getTotalNetSales,
  getTop10SellingPackages,
  getTop5SellingPackages,
  getMemberAgeGroup,
  getResidentialAreaReport
} = require("../../controller/marketing");

reportRouter.post("/gender", async (req, res) => {
  try {
    const result = await getGenderCount(req.body);
    // console.log(result);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post('/members/ageGroup', async (req, res) => {
  try {
    // 1) Log the incoming payload
    // console.log('[ageGroup] incoming body:', req.body);

    const result = await getMemberAgeGroup(req.body);

    // 2) Log summary + a small sample
    const isArr = Array.isArray(result);
    // console.log('[ageGroup] result type:', isArr ? 'Array' : typeof result);
    // console.log('[ageGroup] row count:', isArr ? result.length : 'n/a');

    if (isArr) {
      console.log(
        '[ageGroup] sample rows (first 5):',
        result.slice(0, 5).map(r => ({
          branchName: r.branchName,
          ageGroup: r.ageGroup || r.title,
          count: r.count ?? r.value
        }))
      );
    } else {
      console.log('[ageGroup] full result:', result);
    }

    // 3) (optional) shove row count into a header to see it in devtools
    if (isArr) res.set('X-Row-Count', String(result.length));

    return res.status(200).json(result);
  } catch (e) {
    // console.error('[ageGroup] ERROR:', e);
    return res.status(500).json({ message: e.message });
  }
});

reportRouter.post('/members/residentialArea', async (req, res) => {
  try {
    const data = await getResidentialAreaReport();
    res.json({ status: true, ...data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});


reportRouter.post("/referral", async (req, res) => {
  try {
    const result = await getReferralSourceCount(req.body);
    // console.log(result);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/customer-booking-usage", async (req, res) => {
  try {
    const result = await getCustomerBookingUsage(req.body);
    // console.log(result);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/members/count", async (req, res) => {
  try {
    const result = await getMemberRegisterCount(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});



reportRouter.post("/top10Branches", async (req, res) => {
  try {
    const result = await getBranchCount(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/sales-report", async (req, res) => {
  try {
    const result = await getTotalNetSales(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

reportRouter.post("/top10Packages", async (req, res) => {
  try {
    // const result = await getTop10SellingPackages(req.body);
    const result = await getTop5SellingPackages(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = reportRouter;
