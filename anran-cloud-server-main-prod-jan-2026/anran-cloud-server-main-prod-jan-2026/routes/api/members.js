const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const Members = require("../../models/members");
const Branch = require("../../models/branch");
const Booking = require("../../models/booking");
const MemberPackage = require("../../models/memberPackage");
const MemberVoucher = require("../../models/memberVoucher");
const Orders = require("../../models/orders");
const OrderItems = require("../../models/ordersItem");
const Package = require("../../models/package");
const router = express.Router();
const auth = require("./jwtfilter");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const Staff = require("../../models/staff");
const { filterByBranchRol } = require("./utils");
const { generateNewMemberVoucher } = require("../../controller/voucher");
const xlsx = require("xlsx");
const Otp = require("../../models/otp");
const FormData = require("form-data");
const axios = require("axios");
const {
  sendMobileNumberChangedConfirmNotification,
} = require("../../helper/notification");
const {
  getMemberTotalPurchaseQtyByPackage,
} = require("../../controller/reports/customer/booking_reports");

const escapeRegexValue = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildContainsRegex = (value) =>
  new RegExp(escapeRegexValue(value), "i");

const appendCondition = (filters, condition) => {
  if (!condition) return filters || {};
  if (!filters || Object.keys(filters).length === 0) return condition;
  if (filters.$and) return { $and: [...filters.$and, condition] };
  return { $and: [filters, condition] };
};


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

router.post("/checkmobileExist", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZero(mobileNumber);
    const obj = await Members.findOne({ mobileNumber: mobile });
    if (!obj) {
      res.status(200).json({
        status: "ok",
        data: {},
        message: "Not avaliable",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: { name: obj.memberFullName, memberId: obj._id },
        message: `Member Already Exist with same mobile number. ${mobileNumber}`,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/partial-Register", async (req, res) => {
  try {
    const { memberFullName, mobileNumber } = req.body;

    const mobile = startsWithZero(mobileNumber);

    // Check if a member with the given mobile number already exists
    const obj = await Members.findOne({ mobileNumber: mobile });

    if (!obj) {
      // If not, create a new member
      const members = new Members({ memberFullName, mobileNumber: mobile });
      await members.save();
      res.status(200).json({
        status: "ok",
        data: [members],
        message: "User registered",
      });
    } else {
      // If a member already exists with delete status
      if (obj.status == "deleted") {
        res.status(200).json({
          status: "Failed",
          data: [],
          message: "Deleted Account",
        });
      } else {
        // If a member already exists, return a failure message
        if (obj.fullRegister) {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Full Register. Please login",
          });
        } else {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Register. Please login",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post("/web/partial-Register", async (req, res) => {
  try {
    const { memberFullName, mobileNumber, preferredBranch } = req.body;

    const mobile = startsWithZero(mobileNumber);

    // Check if a member with the given mobile number already exists
    const obj = await Members.findOne({ mobileNumber: mobile });

    if (!obj) {
      // If not, create a new member
      const members = new Members({
        memberFullName,
        mobileNumber: mobile,
        preferredBranch,
      });
      await members.save();
      res.status(200).json({
        status: "ok",
        data: [members],
        message: "User registered",
      });
    } else {
      // If a member already exists with delete status
      if (obj.status == "deleted") {
        res.status(200).json({
          status: "Failed",
          data: [],
          message: "Deleted Account",
        });
      } else {
        // If a member already exists, return a failure message
        if (obj.fullRegister) {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Full Register. Please login",
          });
        } else {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Register. Please login",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/mobile/partial-Register", async (req, res) => {
  try {
    const { memberFullName, mobileNumber, preferredBranch } = req.body;

    const mobile = startsWithZero(mobileNumber);

    // Check if a member with the given mobile number already exists
    const obj = await Members.findOne({ mobileNumber: mobile });

    if (!obj) {
      // If not, create a new member
      const members = new Members({
        memberFullName,
        mobileNumber: mobile,
        preferredBranch,
      });
      await members.save();
      res.status(200).json({
        status: "ok",
        data: [members],
        message: "User registered",
      });
    } else {
      // If a member already exists with delete status
      if (obj.status == "deleted") {
        res.status(200).json({
          status: "Failed",
          data: [],
          message: "Deleted Account",
        });
      } else {
        // If a member already exists, return a failure message
        if (obj.fullRegister) {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Full Register. Please login",
          });
        } else {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Already Register. Please login",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

function startsWithZero(mobileNumber) {
  return mobileNumber.startsWith("0") ? "6" + mobileNumber : +mobileNumber;
}

function startsWithZeroWeb(mobileNumber) {
  const mobileNumberStr = String(mobileNumber);
  return mobileNumberStr.startsWith("0")
    ? "6" + mobileNumberStr
    : Number(mobileNumberStr);
}

function generateRandomFiveDigitNumber() {
  const randomNumber = Math.floor(Math.random() * 100000);
  return String(randomNumber).padStart(5, "0");
}

async function sendOTPTest(mobileNumber, res) {
  try {
    const randomNumber = generateRandomFiveDigitNumber();
    const message = `Isaac testing form Visualogic.\n Random code is: ${randomNumber}\nThis code will expire in 5 minutes.`;

    const form = new FormData();
    form.append("user", process.env.SMS_USER);
    form.append("secret_key", process.env.SMS_SECRET_KEY);
    form.append("phone", mobileNumber);
    form.append("message", message);

    // deactivate old OTPs
    await Otp.updateMany(
      { mobileNumber, status: true },
      { $set: { status: false } }
    );

    // IMPORTANT: await axios + headers
    const response = await axios.post(process.env.SMS_URL, form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });

    // return the provider payload to Postman for debugging
    if (response.data?.success === true) {
      await Otp.create({ mobileNumber, otp: randomNumber, status: true });

      return res.status(200).json({
        status: true,
        message: "SMS sent",
        provider: response.data,
      });
    }

    return res.status(400).json({
      status: false,
      message: "SMS failed",
      provider: response.data,
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "SMS request error",
      error: err?.message || err,
    });
  }
}


async function sendDefaultOTPTest(mobileNumber, res) {
  try {
    const randomNumber = 12345;
    const objotplst = await Otp.find({
      $and: [{ mobileNumber: mobileNumber }, { status: true }],
    });
    for (const element of objotplst) {
      await Otp.findByIdAndUpdate(
        element._id,
        { status: false },
        { new: false }
      );
    }
    const obj = new Otp({
      mobileNumber: mobileNumber,
      otp: randomNumber,
      status: true,
    });
    obj.save();
    return res.status(200).json({
      status: true,
      data: [],
      message: "OTP Sent successfully!!!",
    });
  } catch (error) {
    return res.status(200).json({
      status: false,
      data: error,
      message: "InValid Mobile No",
    });
  }
}

router.post("/OTPTest", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({
        status: false,
        data: [],
        message: "Mobile Number is required.",
      });
    }
    const mobile = startsWithZero(mobileNumber);

    console.log("OTPTEST SMS_PRODUCTION:", process.env.SMS_PRODUCTION);
    console.log("OTPTEST SMS_URL:", process.env.SMS_URL);
    console.log("OTPTEST SMS_USER:", process.env.SMS_USER);
    console.log("OTPTEST original phone:", mobileNumber, typeof mobileNumber);
    console.log("OTPTEST converted phone:", mobile, typeof mobile);


    if (process.env.SMS_PRODUCTION == "true") {

      await sendOTPTest(mobile, res);
    } else {
      await sendDefaultOTPTest(mobile, res);
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: error,
      message: "InValid Mobile No",
    });
  }
});


router.post("/full-Register", async (req, res) => {
  try {
    const {
      memberFullName,
      status,
      // existingmobileno,
      preferredBranch,
      // paymentmethod,
      // legalFullName,
      preferredName,
      chineseName,
      age,
      gender,
      dob,
      address,
      city,
      postcode,
      states,
      mobileNumber,
      email,
      passport,
      aboutUs,
      othersAboutUs,
      medicalHistory,
      suffered,
      otherHealthRelatedIssue,
      isForeign,
      foreignMobileNumber,
      // healthrelatedissue,
      emergencyName,
      emergencyMobile,
      emergencyRelationship,
      profileImageUrl,
      // sufferedothers,
    } = req.body;
    const mobile = startsWithZeroWeb(mobileNumber);
    const obj = await Members.findOne({ mobileNumber: mobile });
    if (!obj) {
      const fullRegister = true;
      const members = new Members({
        // member_date,
        memberFullName,
        status,
        // existingmobileno,
        preferredBranch,
        // paymentmethod,
        legalFullName: memberFullName,
        preferredName,
        chineseName,
        age,
        gender,
        dob,
        address,
        city,
        postcode,
        states,
        mobileNumber: mobile,
        email,
        passport,
        aboutUs,
        othersAboutUs,
        medicalHistory,
        suffered,
        isForeign,
        foreignMobileNumber,
        otherHealthRelatedIssue,
        // healthrelatedissue,
        emergencyName,
        emergencyMobile,
        emergencyRelationship,
        fullRegister,
        profileImageUrl,
        // sufferedothers,
      });
      await members.save();
      // await generateNewMemberVoucher(members);
      res.status(200).json({
        status: "ok",
        data: [members],
        message: "User registered",
      });
    } else {
      // If a member already exists with delete status
      if (obj.status == "deleted") {
        res.status(200).json({
          status: "Failed",
          data: [],
          message: "Deleted Account",
        });
      } else {
        if (obj.fullRegister) {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Mobile No Already Exist",
          });
        } else {
          // update for full registration
          const fullRegister = true;
          const members = await Members.findByIdAndUpdate(
            obj._id,
            {
              // memberDate,
              memberFullName,
              status,
              // existingmobileno,
              preferredBranch,
              // paymentmethod,
              legalFullName: memberFullName,
              preferredName,
              chineseName,
              age,
              gender,
              dob,
              address,
              city,
              postcode,
              states,
              mobileNumber,
              email,
              passport,
              aboutUs,
              medicalHistory,
              suffered,
              isForeign,
              foreignMobileNumber,
              otherHealthRelatedIssue,
              // healthRelatedIssue,
              emergencyName,
              emergencyMobile,
              emergencyRelationship,
              fullRegister,
              profileImageUrl,
              // sufferedothers,
            },
            { new: false }
          );
          // await generateNewMemberVoucher(members);
          res.status(200).json({
            status: "ok",
            data: [members],
            message: "User registered",
          });
        }
      }
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      member_date,
      member_name,
      status,
      existingmobileno,
      preferredbranch,
      paymentmethod,
      legalFullname,
      preferredname,
      chinesename,
      age,
      gender,
      dob,
      address,
      city,
      postcode,
      states,
      mobileNumber,
      email,
      passport,
      aboutUs,
      medicalhistory,
      suffered,
      healthrelatedissue,
      emergencyName,
      emergencymobile,
      emergencyrelationship,
      profileimageurl,
    } = req.body;
    const mobile = startsWithZeroWeb(mobileNumber);
    const obj = await Members.findOne({ mobileNumber: mobile });
    if (!obj) {
      const fullregister = true;
      const members = new Members({
        member_date,
        member_name,
        status,
        existingmobileno,
        preferredbranch,
        paymentmethod,
        legalFullname,
        preferredname,
        chinesename,
        age,
        gender,
        dob,
        address,
        city,
        postcode,
        states,
        mobileNumber: mobile,
        email,
        passport,
        aboutUs,
        medicalhistory,
        suffered,
        healthrelatedissue,
        emergencyName,
        emergencymobile,
        emergencyrelationship,
        fullregister,
        profileimageurl,
      });
      await members.save();
      res.status(200).json({
        status: "ok",
        data: [members],
        message: "User registered",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Mobile No Already Exist",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const members = await Members.find({}).populate({
      path: "preferredBranch",
      options: { strictPopulate: false },
    });
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/dropdown", auth, async (req, res) => {
  try {
    // const members = await Members.find({}).populate({
    //   path: "preferredbranch",
    // });
    const members = await Members.aggregate([
      {
        $match: { isDeleted: { $ne: true } },
      },
      {
        $project: {
          memberFullName: 1,
          mobileNumber: 1,
          // fullRegister: 1,
        },
      },
    ]);
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/newdropdown", auth, async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    if (!search) {
      return res.send([]);
    }

    const sanitizedSearch = escapeRegex(search);
    const members = await Members.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { memberFullName: { $regex: sanitizedSearch, $options: "i" } },
          { mobileNumber: { $regex: sanitizedSearch, $options: "i" } },
        ],
      },
      {
        memberFullName: 1,
        mobileNumber: 1,
      }
    )
      .sort({ memberFullName: 1 })
      .limit(100)
      .lean();

    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/fullregister", auth, async (req, res) => {
  try {
    const members = await Members.find({ fullregister: true }).populate({
      path: "preferredBranch",
    });
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/detail/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const members = await Members.findById(id).populate({
      path: "preferredBranch",
      options: { strictPopulate: false },
      populate: {
        path: "area",
      },
    });
    // await generateNewMemberVoucher(members);
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/findAllmember", auth, async (req, res) => {
  try {
    const members = await Members.find({}).select(
      "member_name mobileNumber gender _id"
    );
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/findbyid/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const members = await Members.findById(id).populate({
      path: "preferredbranch",
    });
    const token = jwt.sign(req.body, process.env.TOKEN_KEY, {
      expiresIn: "5m",
    });
    res.status(200).json({
      status: true,
      data: [members],
      message: "Member Data",
      token,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).send(error);
  }
});

router.put(
  "/:id",
  uploads.single("image"),
  images_upload,
  auth,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.profile_image) {
        req.body.imageUrl = req.profile_image.url;
        req.body.imageData = req.profile_image.public_id;
      }
      const {
        memberDate,
        memberFullName,
        preferredName,
        chineseName,
        status,
        // existingmobileno,
        preferredBranch,
        // paymentmethod,
        // legalFullname,
        age,
        gender,
        dob,
        address,
        city,
        postcode,
        states,
        mobileNumber,
        email,
        passport,
        aboutUs,
        isForeign,
        foreignMobileNumber,
        othersAboutUs,
        medicalHistory,
        suffered,
        otherHealthRelatedIssue,
        healthRelatedIssue,
        emergencyName,
        emergencyMobile,
        emergencyRelationship,
        imageUrl,
        isDeleted,
        // sufferedothers,
      } = req.body;
      const mobile = startsWithZeroWeb(mobileNumber);
      const fullRegister = true;
      const existingMember = await Members.findById(id);
      if (!existingMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      const isDeletedBool = isDeleted === true || isDeleted === "true";
      let updatedStatus = isDeletedBool ? "deleted" : "New Member";
      const members = await Members.findByIdAndUpdate(
        id,
        {
          memberDate,
          memberFullName,
          status: updatedStatus,
          // existingmobileno,
          preferredBranch,
          // paymentmethod,
          legalFullMame: memberFullName,
          preferredName,
          chineseName,
          age,
          gender,
          dob,
          address,
          city,
          postcode,
          states,
          mobileNumber: mobile,
          email,
          passport,
          aboutUs,
          isForeign,
          foreignMobileNumber,
          othersAboutUs,
          medicalHistory,
          suffered,
          otherHealthRelatedIssue,
          healthRelatedIssue,
          emergencyName,
          emergencyMobile,
          emergencyRelationship,
          fullRegister,
          profileImageUrl: imageUrl,
          isDeleted,
          // sufferedothers,
        },
        { new: false }
      );

      if (existingMember.mobileNumber !== mobile) {
        const now = new Date();
        await sendMobileNumberChangedConfirmNotification(members, now);
      }

      res.send(members);
    } catch (error) {
      // console.error(error);
      res.status(500).send(error);
    }
  }
);

router.put(
  "/image/update",
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
      await Members.findByIdAndUpdate(
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

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMember = await Members.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { status: "deleted" },
      { new: false }
    );

    if (!updatedMember) {
      return res.status(404).send({ message: "Member not found" });
    }

    res.send(updatedMember);
  } catch (error) {
    // console.error(error);
    res.status(500).send(error);
  }
});

router.post("/roleBased/:users", auth, async (req, res) => {
  try {
    const { users } = req.params;
    let filterQuery = [];
    if (users) {
      const branchList = await filterByBranchRol(users);
      filterQuery.push({
        preferredbranch: { $in: branchList.map((branch) => branch._id) },
      });
    }
    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    const members = await Members.find(query).populate({
      path: "preferredbranch",
    });
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/findall", auth, async (req, res) => {
  try {
    const { first, rows, filters, sortField, sortOrder, username } = req.body;

    const andFilters = [];

    // Exact match filters for name and Mobile (backend side)
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && e === "name") {
          andFilters.push({
            member_name: buildExactMatchRegex(filters[e].value),
          });
        } else if (filters[e].value && e === "Mobile") {
          andFilters.push({
            mobileNumber: buildExactMatchRegex(filters[e].value),
          });
        }
      });
    }

    // Base query from name/Mobile filters
    let query =
      andFilters.length > 1
        ? { $and: andFilters }
        : andFilters.length === 1
        ? andFilters[0]
        : {};

    // Other filters: member_date, gender, email
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && e === "member_date") {
          const dateStr = filters[e].value;
          const dt = formatDate(dateStr);
          const isValidDate = moment(dt, "YYYY-MM-DD", true).isValid();

          if (isValidDate) {
            const startDate = moment(dt).startOf("day").toDate();
            const endDate = moment(dt).endOf("day").toDate();

            query = appendCondition(query, {
              member_date: { $gte: startDate, $lte: endDate },
            });
          }
        } else if (filters[e].value && e === "gender") {
          query = appendCondition(query, {
            gender: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        } else if (filters[e].value && e === "email") {
          query = appendCondition(query, {
            email: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        }
      });
    }

    // Branch filter
    if (filters && filters.branch && filters.branch.value) {
      const branchList = await Branch.find({
        branch_name: {
          $regex: ".*" + filters.branch.value + ".*",
          $options: "i",
        },
      }).select("_id");

      query = appendCondition(query, {
        preferredbranch: { $in: branchList },
      });
    }

    // Role-based branch restriction (non-admin)
    if (username && username !== "admin") {
      const branchList = await filterByBranchRol(username); // assuming this returns [{ _id: ... }]
      query = appendCondition(query, {
        preferredbranch: { $in: branchList.map((branch) => branch._id) },
      });
    }

    // Sort
    const sortQuery = {};
    if (sortField) {
      if (sortField === "name") {
        sortQuery["member_name"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "member_date") {
        sortQuery["member_date"] = sortOrder === 1 ? "asc" : "desc";
      }
    }

    // Main query
    const data = await Members.find(query)
      .populate({ path: "preferredbranch" })
      .sort(sortQuery)
      .skip(first)
      .limit(rows);

    // Enrich each member with latest package_date and checkin_date
    for (const member of data) {
      const memberPackageData = await MemberPackage.findOne({
        member: member._id,
      }).sort({ package_date: -1 });

      member.package_date = memberPackageData
        ? memberPackageData.package_date
        : null;

      const checkinData = await Booking.findOne({
        member: member._id,
      }).sort({ checkin_date: -1 });

      member.checkin_date = checkinData ? checkinData.checkin_date : null;
    }

    const totalRecords = await Members.countDocuments(query);

    res.send({ data, totalRecords });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.post("/findallv2", auth, async (req, res) => {
  try {
    const { search, preferredBranch, startDate, endDate } = req.body;

    let filters = {};


    if (search && String(search).trim()) {
      const s = String(search).trim();
      const rx = buildContainsRegex(s);

      filters = appendCondition(filters, {
        $or: [{ memberFullName: rx }, { mobileNumber: rx }],
      });
    }


    if (preferredBranch) {
      filters = appendCondition(filters, { preferredBranch });
    }


    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      filters = appendCondition(filters, { memberDate: dateFilter });
    }


    if (req.user.uid !== "admin" && !preferredBranch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters = appendCondition(filters, {
        preferredBranch: { $in: branchIds.concat([null]) },
      });
    }

    const members = await Members.find(filters)
      .populate({
        path: "preferredBranch",
        options: { strictPopulate: false },
      })
      .sort({ memberDate: -1 });

    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findallv3", auth, async (req, res) => {
  try {
    const { search, preferredBranch, startDate, endDate } = req.body;

    let filters = {};


    if (search && String(search).trim()) {
      const s = String(search).trim();
      const rx = buildContainsRegex(s);

      filters = appendCondition(filters, {
        $or: [{ memberFullName: rx }, { mobileNumber: rx }],
      });
    }


    if (preferredBranch) {
      filters = appendCondition(filters, { preferredBranch });
    }


    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      filters = appendCondition(filters, { memberDate: dateFilter });
    }


    if (req.user.uid !== "admin" && !preferredBranch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters = appendCondition(filters, {
        preferredBranch: { $in: branchIds.concat([null]) },
      });
    }

    const members = await Members.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: "branches",
          localField: "preferredBranch",
          foreignField: "_id",
          as: "preferredBranch",
        },
      },
      {
        $unwind: {
          path: "$preferredBranch",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { memberDate: -1 } },
      {
        $project: {
          memberDate: 1,
          memberFullName: 1,
          profileImageUrl: 1,
          mobileNumber: 1,
          fullRegister: 1,
          email: 1,
          gender: 1,
          "preferredBranch.branchName": 1,
          lastPurchaseDate: 1,
          lastCheckinDate: 1,
          isForeign: 1,
          isDeleted: 1,
        },
      },
    ]);

    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post("/findallDash", auth, async (req, res) => {
  try {
    const { first, rows, branch } = req.body;
    let filterQuery = [];
    if (branch && branch.length > 0) {
      const branchList = await Branch.find({
        branch_name: { $in: branch.map((b) => new RegExp(b, "i")) },
      }).select("_id");
      const branchIds = branchList.map((b) => b._id);
      filterQuery.push({ preferredbranch: { $in: branchIds } });
    }
    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    let sortQuery = {};
    sortQuery["member_date"] = "desc";
    const data = await Members.find(query)
      .populate({ path: "preferredbranch" })
      .skip(first)
      .sort(sortQuery)
      .limit(rows);

    const totalRecords = await Members.countDocuments(query);

    res.send({ data, totalRecords });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/package/:id", auth, async (req, res) => {
  try {
    const members = await MemberPackage.find({
      member: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate({
        path: "member",
        select: "memberFullName",
      })
      .populate({
        path: "orderItem",
        select: "orderNo",
      })
      .populate({
        path: "package",
        select:
          "packageName packageCode allBranchStatus branchName packageImageURL",
        populate: { path: "branchName", select: "branchName" },
      })
      .populate({
        path: "purchaseBranch",
        select: "branchName",
      })
      .populate({
        path: "firstUsedBranch",
        select: "branchName",
      })
      .populate({
        path: "lastUsedBranch",
        select: "branchName",
      })
      .populate({
        path: "transferId",
        select: "transactionNo transferDate memberFrom",
      })
      // .populate({ path: "transferFrom" })
      .sort({
        purchaseDate: -1,
      });
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/package/detail/:id", async (req, res) => {
  try {
    // just for testing purpose only
    // const mpobj = await MemberPackage.findById(req.params.id);
    // if (mpobj && mpobj.validDate == null) {
    //   if (mpobj.validDate == null && mpobj.firstUsedDate != null) {
    //     const valid = await calculateValidDate(mpobj);
    //     await MemberPackage.findByIdAndUpdate(mpobj._id, {
    //       validDate: valid,
    //     });
    //   }
    // }
    const members = await MemberPackage.findById(req.params.id)
      .populate({
        path: "member",
        select: "memberFullName",
      })
      .populate({
        path: "orderItem",
        select: "orderNo order",
      })
      .populate({
        path: "package",
        select:
          "packageName packageCode packageUnlimitedStatus packageUsageLimit packageTransferableStatus packageValidity",
      })
      .populate({
        path: "purchaseBranch",
        select: "branchName",
      })
      .populate({
        path: "firstUsedBranch",
        select: "branchName",
      })
      .populate({
        path: "lastUsedBranch",
        select: "branchName",
      })
      .populate({
        path: "transferId",
        select: "transactionNo transferDate memberFrom",
        populate: {
          path: "memberFrom",
          select: "memberFullName mobileNumber",
          model: "members",
        },
      })
      .sort({
        purchaseDate: -1,
      });
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/package", auth, async (req, res) => {
  try {
    const members = await MemberPackage.find({
      member: req.query.id,
    })
      .populate({
        path: "member",
        select: "memberFullName",
      })
      .populate({
        path: "orderItem",
        select: "orderNo",
      })
      .populate({
        path: "package",
      })
      .populate({
        path: "purchaseBranch",
        select: "branchName",
      })
      .sort({
        purchaseDate: -1,
      });
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/voucher/:id", auth, async (req, res) => {
  try {
    const members = await MemberVoucher.find({
      member: req.params.id,
    })
      .populate({
        path: "member",
        select: "memberFullName",
      })
      .populate({
        path: "voucher",
        select: "voucherName voucherCode",
      })
      .populate({
        path: "issuedBranch",
        select: "branchName",
      });
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

const imgUrl = `${process.env.PUBLIC_FILE_PROFILE_URL}`;

// Set up storage for uploaded files
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imgUrl);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

function formatDate(dateStr) {
  // Convert from 'DD/MM/YYYY' to 'YYYY-MM-DD'
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// Initialize multer with the storage configuration
const upload = multer({ storage: storage2 });

// Define a route for file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID is required",
      });
    }

    const profileimageurl = path.join(imgUrl, req.file.filename);
    await Members.findByIdAndUpdate(id, { profileimageurl: profileimageurl });
    res.status(200).json({
      status: "ok",
      data: req.file,
      message: "File uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "File upload failed",
      error: error.message,
    });
  }
});

async function calculateValidDate(memberPackages) {
  if (memberPackages.package && memberPackages.validDate == null) {
    const obj = await Package.findById(memberPackages.package._id);
    // if (obj && obj.packageUnlimitedStatus === true) {
    //   return null;
    // }
    if (obj && obj.packageValidity === "1 Year") {
      const oneYearFromNow = moment(memberPackages.firstUsedDate).add(
        1,
        "years"
      );
      // console.log(oneYearFromNow);
      return oneYearFromNow;
    } else {
      return null;
    }
  } else {
    return memberPackages.validDate;
  }
}

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
      // console.log("record", record);
      try {
        const branch = await Branch.findOne({
          branchCode: record.preferredBranch,
        });

        if (!branch) {
          errors.push({
            title: `Invalid Branch: ${record.memberName}`,
            error: `Branch with code ${record.preferredBranch} not found.`,
          });
          // console.warn(
          //   `Invalid Branch: Branch code ${record.preferredBranch} not found for member ${record.memberName}`
          // );
          continue;
        }

        const mobileNumberValidation = await validateAndFormatMobileNumber(
          record.mobileNumber
        );
        const duplicateMember = await Members.findOne({
          mobileNumber: mobileNumberValidation,
        });
        if (duplicateMember) {
          errors.push({
            title: `Duplicate record: ${record.memberName}`,
            error: `Mobile number ${mobileNumberValidation} already exists.`,
          });
          // console.warn(
          //   `Duplicate record detected: ${record.memberName} - Mobile number ${mobileNumberValidation}`
          // );
          continue;
        }
        const member = new Members({
          memberDate: record.memberDate,
          status: record.status,
          memberFullName: record.memberName,
          mobileNumber: mobileNumberValidation,
          preferredBranch: branch ? branch._id : null,
          legalFullName: record.memberName,
          preferredName: record.memberName,
          packageBalance: record.packageBalance,
          isMigrated: true,
          migratedDate: new Date(),
        });
        await member.save();
        successCount++;
      } catch (error) {
        errors.push({
          title: `Record: ${record.memberName}`,
          error: `Error: ${error.message}`,
        });
        // console.error(
        //   `Error processing record: ${record.memberName}`,
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
    // console.error("Error processing file:", error.message);
    res.status(500).json({ error: "Failed to process file" });
  }
});

router.get("/package/max_qty/:id/:pkId", async (req, res) => {
  try {
    const pack = await Package.findById(req.params.pkId);
    // console.log("maxQtyType", pack._id);
    if (pack.maxQtyType == "unlimited") {
      res.send({ allowedQty: 99999 });
    } else {
      const result = await getMemberTotalPurchaseQtyByPackage({
        packageId: req.params.pkId,
        memberId: req.params.id,
        maxQty: pack.maxQty,
      });

      res.send(result);
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

async function validateAndFormatMobileNumber(mobileNumber) {
  let formattedNumber = mobileNumber.toString();

  if (formattedNumber.startsWith("0")) {
    formattedNumber = "6" + formattedNumber;
  }

  if (!formattedNumber.startsWith("60")) {
    throw new Error(`Only Malaysia numbers starting with 60 are allowed: ${mobileNumber}`);
  }

  if (formattedNumber.startsWith("6")) {
    const withoutCountryCode = formattedNumber.substring(1);

    if (withoutCountryCode.length !== 10 && withoutCountryCode.length !== 11) {
      throw new Error(`Invalid mobile number: ${mobileNumber}`);
    }
  } else {
    throw new Error(`Invalid mobile number format: ${mobileNumber}`);
  }

  return formattedNumber;
}

module.exports = router;
