var router = require("express").Router();
router.use("/login", require("./auth"));
router.use("/reports2", require("./reports2"));
router.use("/api/area", require("./area"));
router.use("/api/staff", require("./staff"));
router.use("/api/branch", require("./branch"));
router.use("/api/gateway", require("./gateway"));
router.use("/api/tax", require("./tax"));
router.use("/api/package", require("./package"));
router.use("/api/members", require("./members"));
router.use("/api/roles", require("./roles"));
router.use("/api/rooms", require("./rooms"));
router.use("/api/voucher", require("./voucher"));
router.use("/api/cart", require("./memberCart"));
router.use("/api/order", require("./orders"));
router.use("/api/memberDeposit", require("./memberDeposits"));
router.use("/api/payments", require("./payments"));
router.use("/api/memberpackage", require("./memberpackage"));
router.use("/api/booking", require("./booking"));
router.use("/api/transfer", require("./transfer"));
router.use("/api/attendance", require("./attendance"));
router.use("/api/file", require("./upload"));
router.use("/api/mobilelogin", require("./login"));
router.use("/api/banner", require("./banner"));
router.use("/api/messages", require("./messages"));
router.use("/api/floors", require("./floor"));
router.use("/api/printer", require("./printer"));
router.use("/api/report2", require("./reports2"));
router.use("/api/schedule", require("./schedule"));
router.use("/api/notification", require("./notification"));
router.use("/api/feedback", require("./feedback"));
router.use("/api/email", require("./email"));
router.use("/api/dashboard", require("./dashboard"));
router.use("/api/marketing", require("./marketing"));
router.use("/api/order-cancellation", require("./orderCancellation"));
router.use("/api/block-booking", require("./blockBooking"));
router.use("/api/popup-message", require("./popupMessages"));
router.use("/otp-testing", require("./otpTesting"));
// router.use('/api/financereport', require('./financereport'));
// router.use('/api/receipt', require('./generateReceipt'));
router.use(function (err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;
        return errors;
      }, {}),
    });
  }
  return next(err);
});
module.exports = router;
