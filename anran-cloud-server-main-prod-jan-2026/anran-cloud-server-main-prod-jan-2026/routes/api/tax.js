const express = require("express");
const Tax = require("../../models/tax");
const router = express.Router();

// Create a new Tax
router.post("/", async (req, res) => {
  try {
    const tax = new Tax(req.body);
    await tax.save();
    res.status(201).json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Tax
router.get("/:id", async (req, res) => {
  try {
    const tax = await Tax.find({
      isDeleted: false,
      branch: req.params.id,
    });
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a Tax
router.put("/:id", async (req, res) => {
  try {
    const tax = await Tax.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tax) {
      return res.status(404).json({ error: "Tax not found" });
    }
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a tax
router.delete("/:id", async (req, res) => {
  try {
    const tax = await Tax.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!tax) {
      return res.status(404).json({ error: "Tax not found" });
    }
    res.json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
