var reportRouter = require("express").Router();

const {
  getBookingStatusCount,
  getMemberRegisterCount,
  getBranchCount,
  getTotalNetSales,
  getTop10SellingPackages,
  getMemberRegisterMonthlyByYear,
  getTop5SellingPackages,
} = require("../../controller/dashboard");

reportRouter.post("/booking", async (req, res) => {
  try {
    const result = await getBookingStatusCount(req.body);
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

reportRouter.post("/members/monthly", async (req, res) => {
  try {
    const result = await getMemberRegisterMonthlyByYear(req.body);
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
