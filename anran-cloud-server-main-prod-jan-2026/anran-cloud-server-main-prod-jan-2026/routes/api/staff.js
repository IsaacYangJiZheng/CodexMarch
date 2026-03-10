const express = require("express");
const router = express.Router();
const Staff = require("../../models/staff");
const Branch = require("../../models/branch");
const Roles = require("../../models/role");
const auth = require("./jwtfilter");
const { getUserInfo } = require("../../controller/auth");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const cloudinary = require("cloudinary").v2;
const xlsx = require("xlsx");

router.post("/checkStaffCodeExist", async (req, res) => {
  try {
    const { code } = req.body;
    const obj = await Staff.findOne({ staffCode: code });
    if (!obj) {
      res.status(200).json({
        status: "ok",
        data: {},
        message: "Not avaliable",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: { name: obj.fullName },
        message: `Staff Code Already in Use. ${code}`,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/verify", auth, async (req, res) => {
  try {
    const user = await getUserInfo(req.user);
    res.status(200).json(user);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post("/findall", auth, async (req, res) => {
  try {
    const { first, rows, filters, sortField, sortOrder } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && e === "name") {
          filterQuery.push({
            name: { $regex: ".*" + filters[e].value + ".*", $options: "i" },
          });
        } else if (filters[e].value && e === "gender") {
          filterQuery.push({
            gender: { $regex: ".*" + filters[e].value + ".*", $options: "i" },
          });
        } else if (filters[e].value && e === "mobileNumber") {
          filterQuery.push({
            mobileNumber: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "statusActive"
        ) {
          let newObject = {};
          newObject[e] = { $eq: filters[e].value === "Active" };
          filterQuery.push(newObject);
        }
      });
    }
    let sortQuery = {};
    if (filters && filters.branch && filters.branch.value) {
      const branchList = await Branch.find({
        branchName: {
          $regex: ".*" + filters.branch.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ branch: { $in: branchList } });
    }
    if (filters && filters.roles && filters.roles.value) {
      const rolesList = await Roles.find({
        role_name: { $regex: ".*" + filters.roles.value + ".*", $options: "i" },
      }).select("_id");
      filterQuery.push({ roles: { $in: rolesList } });
    }
    if (sortField) {
      if (sortField === "name") {
        sortQuery["name"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "statusActive") {
        sortQuery["statusActive"] = sortOrder === 1 ? "asc" : "desc";
      }
    }
    if (filters && filterQuery.length > 0) {
      const obj = {
        data: await Staff.find({
          $and: filterQuery,
        })
          .populate({
            path: "branch",
          })
          .populate({
            path: "roles",
          })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Staff.find({
          $and: filterQuery,
        }).countDocuments(),
      };
      res.send(obj);
    } else {
      const obj = {
        data: await Staff.find({})
          .populate({
            path: "branch",
          })
          .populate({
            path: "roles",
          })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Staff.find({}).countDocuments(),
      };
      res.send(obj);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findallv2", auth, async (req, res) => {
  try {
    const { name, staffCode, branch } = req.body;

    const filters = { isDeleted: { $ne: true } };
    if (name) filters.name = new RegExp(name, "i");
    if (staffCode) filters.staffCode = new RegExp(staffCode, "i");
    if (branch) filters.branch = branch;

    if (req.user.uid !== "admin" && !name && !staffCode && !branch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters.branch = { $in: branchIds };
    }

    const staffs = await Staff.find(filters)
      .populate({
        path: "branch",
        select: "branchName _id",
      })
      .populate({
        path: "roles",
        select: "role_name _id",
      });

    res.send(staffs);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const obj = await Staff.find({ isDeleted: { $eq: false } })
      .populate({
        path: "branch",
        select: "branchName _id",
      })
      .populate({
        path: "roles",
        select: "role_name _id",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/mobile/list", auth, async (req, res) => {
  try {
    const branchId = req.headers["x-branch"];
    if (branchId) {
      const obj = await Staff.find({
        $and: [{ branch: { $in: [branchId] } }, { isDeleted: { $eq: false } }],
      })
        .populate({
          path: "branch",
          select: "branchName _id",
        })
        .populate({
          path: "roles",
          select: "role_name _id",
        });
      const result = {
        list: obj,
        total: obj.length,
      };
      res.send(result);
    } else {
      res.status(500).send({ message: "Branch Not Seleceted" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/mobile/details", async (req, res) => {
  try {
    const obj = await Staff.findById(req.query.staffId)
      .populate({
        path: "branch",
      })
      .populate({
        path: "roles",
      });
    res.json(obj);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const obj = await Staff.findById(req.params.id)
      .populate({
        path: "branch",
      })
      .populate({
        path: "roles",
      });
    res.json(obj);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/findallDash", auth, async (req, res) => {
  try {
    const { first, rows, branch } = req.body;
    let filterQuery = [];
    if (branch && branch.length > 0) {
      const branchList = await Branch.find({
        branchName: { $in: branch.map((b) => new RegExp(b, "i")) },
      }).select("_id");
      const branchIds = branchList.map((b) => b._id);
      filterQuery.push({ branch: { $in: branchIds } });
    }

    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    let sortQuery = {};
    sortQuery["createdAt"] = "desc";
    const data = await Staff.find(query)
      .populate({ path: "branch" })
      .populate({ path: "roles" })
      .skip(first)
      .sort(sortQuery)
      .limit(rows);

    const totalRecords = await Staff.countDocuments(query);
    res.send({ data, totalRecords });
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

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

// Create a new staff
router.post("/", uploads.single("image"), images_upload, async (req, res) => {
  try {
    if (req.profile_image) {
      req.body.profileImageUrl = req.profile_image.url;
      req.body.profileImageData = req.profile_image.public_id;
    }
    const staff = new Staff({
      ...req.body,
      branch: JSON.parse(req.body.branch),
    });
    // console.log(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/import", uploads.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    let successCount = 0;
    const errors = [];
    const buffer = req.file.buffer;

    const workbook = xlsx.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);
    for (const record of data) {
      try {
        const branchCodes = record.Branch.split(",").map((code) => code.trim());
        const branch = await Branch.find({ branchCode: { $in: branchCodes } });
        const role = await Roles.findOne({ role_name: record.roles });
        const gender =
          record.gender === "F"
            ? "Female"
            : record.gender === "M"
            ? "Male"
            : record.gender;
        const martial =
          record.martialstatus === "S"
            ? "Single"
            : record.martialstatus === "M"
            ? "Married"
            : record.martialstatus === "D"
            ? "Divorced"
            : record.martialstatus;
        const statusActive = record.status_active === "Active";
        const OTAllowance =
          record.ot_allowance === "Yes" ? "true" :
          record.ot_allowance === "No" ? "false":
          "undefined";

        const staff = new Staff({
          name: record.name,
          staffCode: record.staff_code,
          gender: gender,
          branch: branch.map((branch) => branch._id),
          roles: role ? role._id : null,
          joinDate: record.joindate,
          userName: record.staff_code,
          loginKey: record.password,
          statusActive: statusActive,
          emailAddress: record.emailaddress,
          positionDepartment: record.position_department,
          fullName: record.fullname,
          nric: record.nric,
          religion: record.religion,
          mobileNumber: record.mobilenumber,
          martialStatus: martial,
          currentAddress: record.currentaddress,
          bankName: record.bankname,
          bankAccountNumber: record.bankaccountnumber,
          bankEPFNo: record.epfno,
          bankSOCSONo: record.socsono,
          bankIncomeTaxNo: record.incometaxno,
          emergencyContactName: record.emergency_contactname,
          emergencyRelation: record.emergency_relation,
          emergencyContact: record.emergency_contact,
          allowOT: OTAllowance,
          isMigrated: true,
          migratedDate: new Date(),
        });
        await staff.save();
        successCount++;
      } catch (error) {
        errors.push({
          title: `Record: ${record.name} (Staff Code: ${record.staff_code})`,
          error: `Error: ${error.message}`,
        });
        // console.error(
        //   `Error processing record: ${record.name} (Staff Code: ${record.staff_code})`,
        //   error.message
        // );
        continue;
      }
    }
    res.status(201).json({
      message: "Data processing completed",
      successCount: successCount,
      errors: errors,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ error: "Failed to process file" });
  }
});

// Update a staff
router.put("/:id", uploads.single("image"), images_upload, async (req, res) => {
  try {
    if (req.profile_image) {
      req.body.profileImageUrl = req.profile_image.url;
      req.body.profileImageData = req.profile_image.public_id;
    }

    if (req.body.branch) {
      req.body.branch = JSON.parse(req.body.branch);
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a staff
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Staff.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!obj) {
      return res
        .status(404)
        .send({ status: false, message: "Staff not found" });
    }
    res.status(200).send({ status: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  "/picture/update",
  uploads.single("image"),
  images_upload,
  auth,
  async (req, res) => {
    try {
      const { id } = req.body;
      if (req.profile_image) {
        req.body.imageUrl = req.profile_image.url;
        req.body.imageData = req.profile_image.public_id;
      }
      const { imageUrl } = req.body;
      await Staff.findByIdAndUpdate(
        id,
        {
          profileImageUrl: imageUrl,
          // sufferedothers,
        },
        { new: false }
      );
      res.send({ url: imageUrl });
    } catch (error) {
      // console.error(error);
      res.status(500).send(error);
    }
  }
);

module.exports = router;
