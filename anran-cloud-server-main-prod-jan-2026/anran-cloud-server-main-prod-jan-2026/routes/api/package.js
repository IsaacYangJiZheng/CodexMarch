const express = require("express");
const mongoose = require("mongoose");
const Package = require("../../models/package");
const Branch = require("../../models/branch");
const Members = require("../../models/members");
const {
  getMemberTotalPurchaseQtyByPackage,
} = require("../../controller/reports/customer/booking_reports");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const router = express.Router();

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
          asset_folder: "anran", // Optional: specify a folder for the image
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
    // console.error(error);
    req.profile_image = null;
    return next();
  }
});

// Create a new package
router.post("/", uploads.single("image"), images_upload, async (req, res) => {
  try {
    if (req.profile_image) {
      req.body.packageImageURL = req.profile_image.url;
      req.body.packageImageData = req.profile_image.public_id;
    }
    const max = await Package.find({ $and: [{ isDeleted: { $eq: false } }] })
      .sort({ packageOrder: -1 })
      .limit(1);
    if (max.length > 0) {
      req.body.packageOrder = max[0].packageOrder + 1;
    }
    if (req.body.isAlways == "false") {
      req.body.startDate = null;
      req.body.endDate = null;
    } else {
      let displayEndDate = new Date(req.body.endDate);
      displayEndDate.setHours(15, 59, 59, 999);
      req.body.endDate = displayEndDate;
    }
    if (req.body.packageValidity != "fixed") {
      req.body.packageFixedValidityDate1 = null;
      req.body.packageFixedValidityDate2 = null;
    } else {
      let validityEndDate = new Date(req.body.packageFixedValidityDate2);
      validityEndDate.setHours(15, 59, 59, 999);
      req.body.packageFixedValidityDate1 = validityEndDate;
      req.body.packageFixedValidityDate2 = validityEndDate;
    }
    if (req.body.branchName) {
      const package = new Package({
        ...req.body,
        branchName: JSON.parse(req.body.branchName),
      });
      await package.save();
      res.status(201).json(package);
    } else {
      const package = new Package(req.body);
      await package.save();
      res.status(201).json(package);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new package
router.post("/reorder", async (req, res) => {
  const { packages } = req.body;
  try {
    for (var i = 0; i < packages.length; i++) {
      const package = await Package.findById(packages[i]);
      package.packageOrder = i + 1;
      await package.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all packages
router.get("/", async (req, res) => {
  try {
    const sort = { packageOrder: 1 };
    const packages = await Package.find({
      isDeleted: false,
      packagePublishStatus: true,
    })
      .sort(sort)
      .populate({
        path: "branchName",
        select: "branchName _id",
      });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all packages
router.get("/web", async (req, res) => {
  try {
    const sort = { packageOrder: 1 };
    const packages = await Package.find({})
      .sort(sort)
      .populate({
        path: "branchName",
        select: "branchName _id",
      });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/findAll", async (req, res) => {
  // await Package.updateMany(
  //   {},
  //   {
  //     $set: {
  //       maxQtyType: "unlimited",
  //       maxQty: 99999,
  //       packageFixedValidityDate1: null,
  //       packageFixedValidityDate2: null,
  //     },
  //   }
  // );
  try {
    const {
      packageCategory,
      packageName,
      packageCode,
      packagePrice,
      packagePublishStatus,
    } = req.body;
    // console.log(req.body);
    const filters = {};
    filters["isDeleted"] = false;
    if (packageCategory) filters["packageCategory"] = packageCategory;
    if (packageName) filters["packageName"] = new RegExp(packageName, "i");
    if (packageCode) filters["packageCode"] = new RegExp(packageCode, "i");
    if (packagePrice) filters["packagePrice"] = Number(packagePrice);
    if (packagePublishStatus)
      filters["packagePublishStatus"] =
        packagePublishStatus === "active" ? true : false;

    // Find packages based on the filters
    const sort = { packageOrder: 1 };
    const packages = await Package.find(filters).sort(sort).populate({
      path: "branchName",
      select: "branchName _id",
    });

    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a package by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const package = await Package.findById(req.params.id).populate({
//       path: "branchName",
//     });
//     if (!package) {
//       return res.status(404).json({ error: "Package not found" });
//     }
//     res.json(package);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get a package by Branch ID
router.get("/branch", async (req, res) => {
  // console.log(req.query.id);
  ids = new mongoose.Types.ObjectId(req.query.id);
  try {
    // const packages = await Package.find({
    //   $or: [{ allBranchStatus: true }, { branchName: [req.query.id] }],
    // });
    const packages = await Package.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $match: {
          $or: [{ allBranchStatus: true }, { branchName: { $in: [ids] } }],
        },
      },
      // {
      //   $match: {
      //     $or: [
      //       { allBranchStatus: true },
      //       { branchName: { $in: [req.query.id] } },
      //     ],
      //     $and: [{ isDeleted: false }],
      //   },
      // },
      { $addFields: { qty: 1 } },
    ]);

    if (!packages) {
      return res.status(404).json({ error: "packages not found" });
    }
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a package by Branch ID and by Member Id
router.get("/branch/member", async (req, res) => {
  let today = new Date();
  ids = new mongoose.Types.ObjectId(req.query.bid);
  try {
    // const packages = await Package.find({
    //   $or: [{ allBranchStatus: true }, { branchName: [req.query.id] }],
    // });
    const packages = await Package.aggregate([
      {
        $match: {
          isDeleted: false,
          packageAvailabilityMode: true,
        },
      },
      {
        $match: {
          $or: [{ packagePublishStatus: true }, { isWalkInSaleOnly: true }],
        },
      },
      {
        $match: {
          $or: [{ allBranchStatus: true }, { branchName: { $in: [ids] } }],
        },
      },
      {
        $match: {
          $or: [
            { isAlways: false },
            {
              $and: [
                { startDate: { $lte: today } }, // Start date is before or on today
                { endDate: { $gte: today } }, // End date is after or on today
              ],
            },
          ],
        },
      },
      { $addFields: { qty: 1 } },
    ]);

    if (!packages) {
      return res.status(404).json({ error: "packages not found" });
    } else {
      let result = [];
      for (let pp of packages) {
        if (pp.maxQtyType == "limited") {
          const dd = await getMemberTotalPurchaseQtyByPackage({
            packageId: pp._id.toString(),
            memberId: req.query.mid,
            maxQty: pp.maxQty,
          });
          pp["allowedQty"] = dd.allowedQty;
        } else {
          pp["allowedQty"] = 99999;
        }
        result.push(pp);
      }
      // console.log(result);
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a package
router.put("/:id", uploads.single("image"), images_upload, async (req, res) => {
  try {
    if (req.profile_image) {
      req.body.packageImageURL = req.profile_image.url;
      req.body.packageImageData = req.profile_image.public_id;
    }
    if (req.body.isAlways == "false") {
      req.body.startDate = null;
      req.body.endDate = null;
    } else {
      let displayEndDate = new Date(req.body.endDate);
      displayEndDate.setHours(15, 59, 59, 999);
      req.body.endDate = displayEndDate;
    }
    if (req.body.packageValidity != "fixed") {
      req.body.packageFixedValidityDate1 = null;
      req.body.packageFixedValidityDate2 = null;
    } else {
      let validityEndDate = new Date(req.body.packageFixedValidityDate2);
      validityEndDate.setHours(15, 59, 59, 999);
      req.body.packageFixedValidityDate1 = validityEndDate;
      req.body.packageFixedValidityDate2 = validityEndDate;
    }
    const jsonObject = JSON.parse(req.body.branchName);
    req.body.branchName = jsonObject;
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: false,
      runValidators: true,
    });
    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a package
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Package.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!obj) {
      return res
        .status(404)
        .send({ status: false, message: "Package not found" });
    }
    res.status(200).send({ status: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/deletev2/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the package to delete
    const package = await Package.findOne({ _id: req.params.id }).session(
      session
    );
    if (!package) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Package not found" });
    }

    // Mark the package as deleted
    await Package.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    ).session(session);

    // Shift subsequent packages' sort orders
    await Package.updateMany(
      { packageOrder: { $gt: package.packageOrder }, isDeleted: false },
      { $inc: { packageOrder: -1 } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Package deleted and display orders updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Get all packages
router.get("/mobile/list", async (req, res) => {
  try {
    // var isoDateString = new Date().toISOString();
    // let displayEndDate = new Date(isoDateString);
    let today = new Date();
    const sort = { packageOrder: 1 };
    // await Package.updateMany(
    //   {},
    //   { $set: { isAlways: false, startDate: null, endDate: null } }
    // );
    const packages = await Package.find({
      $and: [
        { isDeleted: { $eq: false } },
        { packagePublishStatus: { $eq: true } },
        { packageAvailabilityMode: { $eq: true } },
        {
          $or: [
            { isAlways: { $eq: false } },
            {
              $and: [
                {
                  startDate: {
                    $lte: today, // ex: 2020-11-25T23:59:59.00Z
                  },
                  endDate: {
                    $gte: today, // ex: 2020-11-25T23:59:59.00Z
                  },
                },
              ],
            },
          ],
        },
      ],
    })
      .select({
        packageName: 1,
        _id: 1,
        packageCode: 1,
        packagePrice: 1,
        packageImageURL: 1,
        packageOrder: 1,
        packageCategory: 1,
        packageUsageLimit: 1,
        packageUnlimitedStatus: 1,
        isAlways: 1,
        startDate: 1,
        endDate: 1,
      })
      .sort(sort);
    // const packages = await Package.find({
    //   isDeleted: false,
    //   packagePublishStatus: true,
    // })
    //   .select({
    //     packageName: 1,
    //     _id: 1,
    //     packageCode: 1,
    //     packagePrice: 1,
    //     packageImageURL: 1,
    //     packageOrder: 1,
    //     packageCategory: 1,
    //     packageUsageLimit: 1,
    //     packageUnlimitedStatus: 1,
    //   })
    //   .sort(sort);
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all packages
router.get("/mobile/detail/:id/:mid", async (req, res) => {
  try {
    const member = await Members.findById(req.params.mid);
    if (member && member.fullRegister) {
      const sort = { packageOrder: 1 };
      const packages = await Package.findById(req.params.id).populate({
        path: "branchName",
        select: "branchName _id",
      });
      if (packages.allBranchStatus) {
        const branches = await Branch.find().sort(sort).populate({
          path: "area",
          select: "areaName _id",
        });
        packages.branchName = branches;
      }

      if (packages.maxQtyType == "limited") {
        const dd = await getMemberTotalPurchaseQtyByPackage({
          packageId: packages._id.toString(),
          memberId: req.query.mid,
          maxQty: packages.maxQty,
        });
        packages.maxQty = dd.allowedQty;
      } else {
        packages.maxQty = 99999;
      }
      res.json(packages);
    } else {
      const sort = { packageOrder: 1 };
      const packages = await Package.findById(req.params.id).populate({
        path: "branchName",
        select: "branchName _id",
      });
      if (packages.allBranchStatus) {
        const branches = await Branch.find().sort(sort).populate({
          path: "area",
          select: "areaName _id",
        });
        packages.branchName = branches;
      }

      res.json(packages);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
