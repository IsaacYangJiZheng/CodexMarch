const express = require("express");
const Rooms = require("../../models/rooms");
const router = express.Router();
const Branch = require("../../models/branch");
const Floor = require("../../models/floor");
const auth = require("./jwtfilter");

router.post("/", auth, async (req, res) => {
  try {
    const {
      branch,
      room_no,
      floor,
      roomCapacity,
      room_floor_url,
      room_floor_plan,
      room_gender,
      status_active,
    } = req.body;
    let sortorder = 1;
    const max = await Rooms.find({
      $and: [{ isDeleted: { $eq: false } }, { floor: { $eq: floor } }],
    })
      .sort({ sortorder: -1 })
      .limit(1);
    if (max.length > 0) {
      sortorder = max[0].sortorder + 1;
    }
    const obj = new Rooms({
      branch,
      room_no,
      floor,
      roomCapacity,
      room_floor_url,
      room_floor_plan,
      room_gender,
      sortorder,
      status_active,
    });
    await obj.save();
    res.status(200).send({ status: true, message: "Ok" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findall", auth, async (req, res) => {
  try {
    const { first, rows, filters, sortField, sortOrder } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && e === "noof_persons") {
          filterQuery.push({
            noof_persons: Number(filters.noof_persons.value),
          });
        } else if (filters[e].value && e === "room_no") {
          filterQuery.push({
            room_no: { $regex: ".*" + filters[e].value + ".*", $options: "i" },
          });
        } else if (filters[e].value && e === "room_gender") {
          filterQuery.push({
            room_gender: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "status_active"
        ) {
          let newObject = {};
          newObject[e] = { $eq: filters[e].value === "Active" };
          filterQuery.push(newObject);
        } else if (filters[e].value && filters[e].value && e === "sortorder") {
          let newObject = {};
          newObject[e] = { $eq: filters[e].value };
          filterQuery.push(newObject);
        }
      });
    }
    if (filters && filters.branch && filters.branch.value) {
      const branchList = await Branch.find({
        branch_name: {
          $regex: ".*" + filters.branch.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ branch: { $in: branchList } });
    }
    if (filters && filters.floor && filters.floor.value) {
      const floorList = await Floor.find({
        floor_no: { $regex: ".*" + filters.floor.value + ".*", $options: "i" },
      }).select("_id");
      filterQuery.push({ floor: { $in: floorList } });
    }
    let sortQuery = {};
    if (sortField) {
      if (sortField === "noof_persons") {
        sortQuery["noof_persons"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "status_active") {
        sortQuery["status_active"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "sortorder") {
        sortQuery["sortorder"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "room_no") {
        sortQuery["room_no"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "room_gender") {
        sortQuery["room_gender"] = sortOrder === 1 ? "asc" : "desc";
      }
    }
    if (filters && filterQuery.length > 0) {
      const obj = {
        data: await Rooms.find({
          $and: filterQuery,
        })
          .populate({
            path: "branch",
          })
          .populate({
            path: "floor",
          })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Rooms.find({
          $and: filterQuery,
        }).countDocuments(),
      };
      res.send(obj);
    } else {
      const obj = {
        data: await Rooms.find({})
          .populate({
            path: "branch",
          })
          .populate({
            path: "floor",
          })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Rooms.find({}).countDocuments(),
      };
      res.send(obj);
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const obj = await Rooms.find({ status_active: true })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/block-booking-rooms-options", auth, async (req, res) => {
  try {
    const obj = await Rooms.find({ status_active: true, isDeleted: false })
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/branch/:bid", auth, async (req, res) => {
  try {
    const { bid } = req.params;
    const obj = await Rooms.find({
      isDeleted: false,
      // status_active: true,
      branch: bid,
    }).populate({
      path: "floor",
    });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Rooms.findById(id)
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/by/floor", auth, async (req, res) => {
  try {
    const { fid, bid } = req.query;
    const obj = await Rooms.find({
      isDeleted: false,
      status_active: true,
      branch: bid,
      floor: fid,
    });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      branch,
      room_no,
      floor,
      roomCapacity,
      room_floor_url,
      room_floor_plan,
      room_gender,
      sortorder,
      status_active,
    } = req.body;
    const obj = await Rooms.findByIdAndUpdate(
      id,
      {
        branch,
        room_no,
        floor,
        roomCapacity,
        room_floor_url,
        room_floor_plan,
        room_gender,
        sortorder,
        status_active,
      },
      { new: true }
    );
    res.status(200).send({ status: true, message: "Ok" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/floorroom/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Rooms.find({
      floor: id,
      status_active: true,
    })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(obj);
  } catch (error) {
    // console.error(error);
    res.status(500).send(error);
  }
});

router.get("/branchroom/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Rooms.find({
      branch: id,
      status_active: true,
    })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(obj);
  } catch (error) {
    // console.error(error);
    res.status(500).send(error);
  }
});

// Delete a room
router.delete("/:id", async (req, res) => {
  try {
    const room = await Rooms.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// re-order rooms with in floor
router.post("/reorder", async (req, res) => {
  const { floor, rooms } = req.body;
  try {
    for (var i = 0; i < rooms.length; i++) {
      const room = await Rooms.findOne({ floor: floor, _id: rooms[i] });
      if (room) {
        room.sortorder = i + 1;
        await room.save();
      }
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
