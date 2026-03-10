const express = require("express");
const Area = require("../../models/area");
const auth = require("./jwtfilter");
const router = express.Router();
const mongoose = require("mongoose");

// Create a new area
router.post("/", auth, async (req, res) => {
  try {
    const max = await Area.find({ $and: [{ isDeleted: { $eq: false } }] })
      .sort({ areaOrder: -1 })
      .limit(1);
    if (max.length > 0) {
      req.body.areaOrder = max[0].areaOrder + 1;
    }
    const area = new Area(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all areas
router.get("/", auth, async (req, res) => {
  try {
    const sort = { areaOrder: 1 };
    const areas = await Area.find({ isDeleted: false }).sort(sort);
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a area by ID
router.get("/:id", async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a area
router.put("/:id", async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!area) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a area
router.delete("/:id", async (req, res) => {
  try {
    const area = await Area.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!area) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deletev2/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the area to delete
    const area = await Area.findOne({ _id: req.params.id }).session(session);
    if (!area) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Area not found" });
    }

    // Mark the area as deleted
    await Area.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    ).session(session);

    // Shift subsequent areas' sort orders
    await Area.updateMany(
      { areaOrder: { $gt: area.areaOrder }, isDeleted: false },
      { $inc: { areaOrder: -1 } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Area deleted and display orders updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Create a new branch
router.post("/reorder", async (req, res) => {
  const { areas } = req.body;
  try {
    for (var i = 0; i < areas.length; i++) {
      const area = await Area.findById(areas[i]);
      area.areaOrder = i + 1;
      await area.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
