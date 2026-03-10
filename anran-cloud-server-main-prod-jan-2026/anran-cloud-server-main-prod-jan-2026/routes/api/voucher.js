const express = require("express");
const Voucher = require("../../models/voucher");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      voucherType,
      // voucherName,
      voucherCode,
      voucherDescription,
      rewardType,
      rewardValue,
      validityType,
      validityValue,
      isActive,
    } = req.body;
    const obj = new Voucher({
      voucherType,
      // voucherName,
      voucherCode,
      voucherDescription,
      rewardType,
      rewardValue,
      validityType,
      validityValue,
      isActive,
    });
    await obj.save();
    res.status(200).send({ status: true, message: "Ok", obj });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      voucherType,
      // voucherName,
      voucherCode,
      voucherDescription,
      rewardType,
      rewardValue,
      validityType,
      validityValue,
      isActive,
    } = req.body;
    const obj = await Voucher.findByIdAndUpdate(
      id,
      {
        voucherType,
        // voucherName,
        voucherCode,
        voucherDescription,
        rewardType,
        rewardValue,
        validityType,
        validityValue,
        isActive,
      },
      { new: false }
    );
    res.status(200).send({ status: true, message: "Ok", obj });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all vouchers
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find({ isDeleted: false });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a voucher by ID
router.get("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a voucher
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Voucher.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!obj) {
      return res
        .status(404)
        .send({ status: false, message: "Voucher not found" });
    }
    res.status(200).send({ status: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
