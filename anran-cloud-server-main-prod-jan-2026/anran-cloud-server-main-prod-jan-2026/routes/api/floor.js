const express = require("express");
const Floor = require("../../models/floor");
const Branch = require("../../models/branch");
const Rooms = require("../../models/rooms");
const router = express.Router();

// Create a new floor
router.post("/", async (req, res) => {
  try {
    const max = await Floor.find({
      $and: [
        { isDeleted: { $eq: false } },
        { branchName: { $eq: req.body.branchName } },
      ],
    })
      .sort({ floorOrder: -1 })
      .limit(1);
    if (max.length > 0) {
      req.body.floorOrder = max[0].floorOrder + 1;
    }
    const floor = new Floor(req.body);
    await floor.save();
    res.status(201).json(floor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all floors
router.get("/", async (req, res) => {
  try {
    const sort = { floorOrder: 1 };
    const floors = await Floor.find({ isDeleted: false }).sort(sort);
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// re-order floors
router.post("/reorder", async (req, res) => {
  const { floors } = req.body;
  try {
    for (var i = 0; i < floors.length; i++) {
      const floor = await Floor.findById(floors[i]);
      floor.floorOrder = i + 1;
      await floor.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get floor list by Branch
router.get("/branch/:id", async (req, res) => {
  try {
    const sort = { floorOrder: 1 };
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    const floor = await Floor.find({
      branchName: branch._id,
      isDeleted: false,
    }).sort(sort);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json(floor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get floor list by Branch
router.get("/by/branch", async (req, res) => {
  try {
    const sort = { floorOrder: 1 };
    if (req.query.id) {
      const branch = await Branch.findById(req.query.id);
      if (!branch) {
        return res.status(404).json({ error: "Branch not found" });
      }
      const floor = await Floor.find({
        branchName: branch._id,
        isDeleted: false,
      }).sort(sort);
      if (!floor) {
        return res.status(404).json({ error: "Floor not found" });
      }
      res.json(floor);
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get floor & rooms list by Branch
router.get("/rooms/branch/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    const floors = await Floor.find({
      branchName: branch._id,
      isDeleted: false,
    });
    const formattedResult = await Promise.all(
      floors.map(async ({ _id, floorNo, floorDetail, floorStatus }) => {
        const rooms = await Rooms.find({
          branch: branch._id,
          floor: _id,
          isDeleted: false,
        });
        return {
          _id,
          floorNo,
          floorDetail,
          floorStatus,
          rooms,
        };
      })
    );
    if (!formattedResult) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.status(200).json(formattedResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a floor by ID
router.get("/:id", async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json(floor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a floor
router.put("/:id", async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json(floor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a floor
router.delete("/:id", async (req, res) => {
  try {
    const floor = await Floor.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!floor) {
      return res.status(404).json({ error: "Floor not found" });
    }
    res.json({ message: "Floor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
