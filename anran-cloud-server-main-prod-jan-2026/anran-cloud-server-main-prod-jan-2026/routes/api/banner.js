const express = require("express");
const Banner = require("../../models/banner");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const router = express.Router();
const mongoose = require("mongoose");

//Updated Upload Function
const images_upload = asyncHandler(async (req, res, next) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: "dbvko8htd",
      api_key: "885224681677386",
      api_secret: "GsSiBCqOrCSYDA97WVZaaVuyFnc",
    });
    const file = req.file;
    if (!file) {
      return next();
    }
    const name = `${Date.now()}-${file.originalname}`.replace(/\.[^/.]+$/, "");

    // Upload the file buffer directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          asset_folder: "anran/banner", // Optional: specify a folder for the image
          resource_type: "image",
          public_id: `${name}`, // Set the public_id for the image
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the stream
      uploadStream.end(file.buffer);
    });

    const profile_image = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    req.profile_image = profile_image;
    return next();
  } catch (error) {
    console.error(error);
    req.profile_image = null;
    return next();
  }
});

// Create a new banner
router.post("/", uploads.single("image"), images_upload, async (req, res) => {
  try {
    const max = await Banner.find({ $and: [{ isDeleted: { $eq: false } }] })
      .sort({ sortorder: -1 })
      .limit(1);
    if (max.length > 0) {
      req.body.sortorder = max[0].sortorder + 1;
    }
    if (req.profile_image) {
      req.body.image_url = req.profile_image.url;
      req.body.image_data_url = req.profile_image.public_id;
    }
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// change sorting order banner
router.post("/reorder", async (req, res) => {
  const { banners } = req.body;
  try {
    for (var i = 0; i < banners.length; i++) {
      const banner = await Banner.findById(banners[i]);
      banner.sortorder = i + 1;
      await banner.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all banners
router.get("/", async (req, res) => {
  try {
    const sort = { sortorder: 1 };
    const banners = await Banner.find({ isDeleted: false, publish: true }).sort(
      sort
    );
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all banners
router.get("/web", async (req, res) => {
  try {
    const sort = { sortorder: 1 };
    const banners = await Banner.find({ isDeleted: false }).sort(
      sort
    );
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/old", async (req, res) => {
  try {
    const {
      image_url,
      image_data_url,
      startdate,
      enddate,
      status_active,
      always,
      sortorder,
    } = req.body;
    const srt = await Banner.find({
      $and: [{ sortorder: { $eq: sortorder } }],
    }).countDocuments();
    if (srt === 0) {
      const obj = new Banner({
        image_url,
        image_data_url,
        startdate,
        enddate,
        status_active,
        always,
        sortorder,
      });
      await obj.save();
      res.status(200).send({ status: true, message: "Ok" });
    } else {
      res.status(200).send({ status: false, message: "Order Already Exists" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", uploads.single("image"), images_upload, async (req, res) => {
  try {
    if (req.profile_image) {
      req.body.image_url = req.profile_image.url;
      req.body.image_data_url = req.profile_image.public_id;
    }
    const { id } = req.params;
    const {
      image_url,
      image_data_url,
      startdate,
      enddate,
      publish,
      always,
      sortorder,
    } = req.body;
    const obj = await Banner.findByIdAndUpdate(
      id,
      {
        image_url,
        image_data_url,
        startdate,
        enddate,
        publish,
        always,
        sortorder,
      },
      { new: true }
    );
    res.status(200).send({ status: true, message: "Ok" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Banner.findById(id);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findall", async (req, res) => {
  try {
    const { first, rows, filters, sortField, sortOrder } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && filters[e].value && e === "image_data_url") {
          let newObject = {};
          newObject[e] = {
            $regex: ".*" + filters[e].value + ".*",
            $options: "i",
          };
          filterQuery.push(newObject);
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
    let sortQuery = {};
    if (sortField) {
      if (sortField === "image_data_url") {
        sortQuery["image_data_url"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "status_active") {
        sortQuery["status_active"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "sortorder") {
        sortQuery["sortorder"] = sortOrder === 1 ? "asc" : "desc";
      }
    }
    if (filters && filterQuery.length > 0) {
      const obj = {
        data: await Banner.find({
          $and: filterQuery,
        })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Banner.find({
          $and: filterQuery,
        }).countDocuments(),
      };
      res.send(obj);
    } else {
      const obj = {
        data: await Banner.find({}).sort(sortQuery).limit(rows).skip(first),
        totalRecords: await Banner.find({}).countDocuments(),
      };
      res.send(obj);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/findallMobile", async (req, res) => {
  try {
    let sortQuery = { sortorder: "asc" };
    const obj = {
      data: await Banner.find({
        $and: [{ status_active: { $eq: true } }],
      }).sort(sortQuery),
    };
    res.send(obj);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a banner
router.delete("/:id", async (req, res) => {
  try {
    const banner = await Banner.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deletev2/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the banner to delete
    const banner = await Banner.findOne({ _id: req.params.id }).session(session);
    if (!banner) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Banner not found" });
    }

    // Mark the banner as deleted
    await Banner.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    ).session(session);

    // Shift subsequent banners' sort orders
    await Banner.updateMany(
      { sortorder: { $gt: banner.sortorder }, isDeleted: false },
      { $inc: { sortorder: -1 } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Banner deleted and display orders updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
