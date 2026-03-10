const express = require("express");
const Gateway = require("../../models/payment_gateway");
const router = express.Router();

// Create a new gateway
router.post("/", async (req, res) => {
  try {
    const gateway = new Gateway(req.body);
    await gateway.save();
    res.status(201).json(gateway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all gateway
router.get("/:id", async (req, res) => {
  try {
    const gateway = await Gateway.findOne({
      isDeleted: false,
      branch: req.params.id,
    });
    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a gateway
router.put("/:id", async (req, res) => {
  try {
    const gateway = await Gateway.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!gateway) {
      return res.status(404).json({ error: "Gateway not found" });
    }
    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft delete a gateway
router.put("/delete/:id", async (req, res) => {
  try {
    // Find the gateway by ID and set isDeleted to true
    const gateway = await Gateway.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },  // Set isDeleted field to true
      { new: true }  // Return the updated document
    );

    // Check if the gateway exists
    if (!gateway) {
      return res.status(404).json({ error: "Gateway not found" });
    }

    // Return the updated gateway data with isDeleted set to true
    res.json(gateway);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
