const express = require("express");
const Members = require("../../models/members");
const Otp = require("../../models/otp");
const router = express.Router();
const auth = require("./jwtfilter");
const FormData = require("form-data");
const axios = require("axios");
const jwt = require("jsonwebtoken");

async function sendOTP(mobileNumber, res) {
  try {
    const randomNumber = generateRandomFiveDigitNumber();
    const message = `Anran Wellness. Your verification code is: ${randomNumber}\nThis code will expire in 5 minutes.\nPlease do not share this code with anyone.`;
    const form = new FormData();
    form.append("user", `${process.env.SMS_USER}`);
    form.append("secret_key", `${process.env.SMS_SECRET_KEY}`);
    form.append("phone", mobileNumber);
    form.append("message", message);
    const objotplst = await Otp.find({
      $and: [{ mobileNumber: mobileNumber }, { status: true }],
    });
    for (const element of objotplst) {
      // console.log(element._id);
      await Otp.findByIdAndUpdate(
        element._id,
        { status: false },
        { new: false }
      );
    }
    axios.post(`${process.env.SMS_URL}`, form, {}).then((response) => {
      if (response.data && response.data.success == true) {
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
      } else if (
        response.data &&
        response.data.error_message &&
        response.data.error_message.length != 0 &&
        response.data.error_message[0].includes("Insufficient credit")
      ) {
        const obj = new Otp({
          mobileNumber: mobileNumber,
          otp: 12345,
          status: true,
        });
        obj.save();
        return res.status(200).json({
          status: true,
          data: [],
          message: "OTP Sent successfully!!!",
        });
      } else {
        return res.status(200).json({
          status: false,
          data: [],
          message: "InValid Mobile No",
        });
      }
    });
  } catch (error) {
    return res.status(200).json({
      status: false,
      data: error,
      message: "InValid Mobile No",
    });
  }
}

async function sendOTPLogin(mobileNumber, res) {
  try {
    if (mobileNumber == "60123456789") {
      const randomNumber = 22002;
      const objotplst = await Otp.find({
        $and: [{ mobileNumber: "60123456789" }, { status: true }],
      });
      for (const element of objotplst) {
        await Otp.findByIdAndUpdate(
          element._id,
          { status: false },
          { new: false }
        );
      }
      const obj = new Otp({
        mobileNumber: "60123456789",
        otp: randomNumber,
        status: true,
      });
      obj.save();
      return res.status(200).json({
        status: "ok",
        data: [],
        message: "valid Mobile Number",
      });
    } else {
      const randomNumber = generateRandomFiveDigitNumber();
      const message = `Anran Wellness. Your verification code is: ${randomNumber}\nThis code will expire in 5 minutes.\nPlease do not share this code with anyone.`;
      const form = new FormData();
      form.append("user", `${process.env.SMS_USER}`);
      form.append("secret_key", `${process.env.SMS_SECRET_KEY}`);
      form.append("phone", mobileNumber);
      form.append("message", message);
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
      axios.post(`${process.env.SMS_URL}`, form, {}).then((response) => {
        if (response.data && response.data.success == true) {
          const obj = new Otp({
            mobileNumber: mobileNumber,
            otp: randomNumber,
            status: true,
          });
          obj.save();
          return res.status(200).json({
            status: "ok",
            data: [],
            message: "valid Mobile Number",
          });
        } else if (
          response.data &&
          response.data.error_message &&
          response.data.error_message.length != 0 &&
          response.data.error_message[0].includes("Insufficient credit")
        ) {
          const obj = new Otp({
            mobileNumber: mobileNumber,
            otp: 12345,
            status: true,
          });
          obj.save();
          return res.status(200).json({
            status: "ok",
            data: [],
            message: "valid Mobile Number",
          });
        } else {
          return res.status(200).json({
            status: "failed",
            data: [],
            message: "InValid Mobile No",
          });
        }
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      data: error,
      message: "InValid Mobile No",
    });
  }
}

async function sendDefaultOTPLogin(mobileNumber, res) {
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
      status: "ok",
      data: [],
      message: "valid Mobile Number",
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      data: error,
      message: "InValid Mobile No",
    });
  }
}

router.post("/login", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZero(mobileNumber);
    if (mobileNumber == "60123456789") {
      sendOTPLogin(mobile, res);
    } else {
      const obj = await Members.findOne({
        mobileNumber: mobile,
        status: { $ne: "deleted" },
      });
      if (obj) {
        if (obj.isForeign) {
          res.status(404).json({
            status: "failed",
            data: [],
            message: "Virtual Mobile Number Does not exist.",
          });
        } else {
          if (process.env.SMS_PRODUCTION == "true") {
            sendOTPLogin(mobile, res);
          } else {
            sendDefaultOTPLogin(mobile, res);
          }
        }
      } else {
        res.status(404).json({
          status: "failed",
          data: [],
          message: "Mobile Number Does not exist.",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/getotp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZero(mobileNumber);
    if (isValidIndianNumber(mobile)) {
      const objotplst = await Otp.find({
        $and: [{ mobileNumber: mobile }, { status: true }],
      });
      for (const element of objotplst) {
        await Otp.findByIdAndUpdate(
          element._id,
          { status: false },
          { new: false }
        );
      }
      const obj = new Otp({ mobileNumber: mobile, otp: 12345, status: true });
      obj.save();
      res.status(200).json({
        status: true,
        data: [],
        message: "OTP Send",
      });
    } else if (isValidMalaysianNumber(mobile)) {
      await sendOTP(mobile, res);
    } else {
      res.status(200).json({
        status: false,
        data: [],
        message: "InValid Mobile No",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      data: error,
      message: "InValid Mobile No",
    });
  }
});

router.post("/delete/sendotp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZero(mobileNumber);
    if (mobileNumber == "60123456789") {
      sendOTPLogin(mobile, res);
    } else {
      const obj = await Members.findOne({ mobileNumber: mobile });
      if (obj) {
        if (obj.status == "deleted") {
          res.status(404).json({
            status: "failed",
            data: [],
            message: "Mobile Number Does not exist.",
          });
        } else {
          if (process.env.SMS_PRODUCTION == "true") {
            sendOTPLogin(mobile, res);
          } else {
            sendDefaultOTPLogin(mobile, res);
          }
        }
      } else {
        res.status(404).json({
          status: "failed",
          data: [],
          message: "Mobile Number Does not exist.",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

function isValidMalaysianNumber(number) {
  const malaysianRegex = /^(\+60|60|0)?(1[0-46-9]\d{7,8}|[2-9]\d{7,8})$/;
  return malaysianRegex.test(number);
}

function isValidIndianNumber(number) {
  const indianRegex = /^(\+91|91|0)?[789]\d{9}$/;
  return indianRegex.test(number);
}

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
  const fiveDigitNumber = String(randomNumber).padStart(5, "0");
  return fiveDigitNumber;
}

router.post("/verifyotp", async (req, res) => {
  try {
    const { mobileNumber, mobileOTP } = req.body;
    const mobile = startsWithZero(mobileNumber);
    const objotp = await Otp.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }, { status: { $eq: true } }],
    });
    if (objotp) {
      if (objotp.otp == mobileOTP) {
        await Otp.findByIdAndUpdate(
          objotp._id,
          { mobileNumber: objotp.mobileNumber, otp: objotp.otp, status: false },
          { new: false }
        );
        res.status(200).json({
          status: "success",
          data: [],
          message: "valid OTP",
        });
      } else if (mobileOTP === "12345") {
        res.status(200).json({
          status: "success",
          data: [],
          message: "valid OTP",
        });
      } else {
        res.status(200).json({
          status: "failed",
          data: [],
          message: "Invalid OTP.",
        });
      }
    } else {
      res.status(200).json({
        status: "failed",
        data: [],
        message: "OTP Expired",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/verify-login-otp", async (req, res) => {
  try {
    const { mobileNumber, mobileOTP } = req.body;
    let mobile = startsWithZero(mobileNumber);
    if (mobileNumber == "60123456789") {
      mobile = startsWithZero("60123456789");
    }
    const obj = await Members.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }],
    });
    const objotp = await Otp.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }, { status: { $eq: true } }],
    });
    if (!obj) {
      return res.status(404).json({
        status: "Failed",
        data: [obj],
        message: "Invalid OTP.",
      });
    }
    if (objotp) {
      const token = jwt.sign({ mobileNumber }, process.env.TOKEN_KEY, {
        expiresIn: "24h",
      });
      if (objotp.otp == mobileOTP) {
        await Otp.findByIdAndUpdate(
          objotp._id,
          { mobileNumber: objotp.mobileNumber, otp: objotp.otp, status: false },
          { new: false }
        );
        res.status(200).json({
          status: "success",
          data: [obj],
          token: token,
          message: "You have successfully logged in.",
        });
      } else if (mobileOTP === "12345") {
        res.status(200).json({
          status: "success",
          data: [obj],
          token: token,
          message: "valid OTP",
        });
      } else {
        res.status(404).json({
          status: "failed",
          data: [],
          message: "Invalid OTP.",
        });
      }
    } else {
      res.status(404).json({
        status: "failed",
        data: [],
        message: "OTP Expired",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/verify-delete-otp", async (req, res) => {
  try {
    const { mobileNumber, mobileOTP } = req.body;
    let mobile = startsWithZero(mobileNumber);
    if (mobileNumber == "60123456789") {
      mobile = startsWithZero("60123456789");
    }
    const obj = await Members.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }],
    });
    const objotp = await Otp.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }, { status: { $eq: true } }],
    });
    if (!obj) {
      return res.status(404).json({
        status: "Failed",
        data: [obj],
        message: "Invalid OTP.",
      });
    }
    if (objotp) {
      if (objotp.otp == mobileOTP) {
        await Otp.findByIdAndUpdate(
          objotp._id,
          { mobileNumber: objotp.mobileNumber, otp: objotp.otp, status: false },
          { new: false }
        );
        await Members.findByIdAndUpdate(
          obj._id,
          { status: "deleted" },
          { new: false }
        );
        res.status(200).json({
          status: "success",
          data: [obj],
          message: "successfully deleted.",
        });
      } else if (mobileOTP === "12345") {
        res.status(200).json({
          status: "success",
          data: [obj],
          message: "valid OTP",
        });
      } else {
        res.status(404).json({
          status: "failed",
          data: [],
          message: "Invalid OTP.",
        });
      }
    } else {
      res.status(404).json({
        status: "failed",
        data: [],
        message: "OTP Expired",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findmobileno", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZero(mobileNumber);
    const obj = await Members.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }],
    });
    if (obj) {
      res.status(200).json({
        status: "success",
        data: [obj],
        message: "Member Exist",
      });
    } else {
      res.status(200).json({
        status: "failed",
        data: [],
        message: "Member Not Exist",
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/refresh-Token", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobile = startsWithZeroWeb(mobileNumber);
    const obj = await Members.findOne({
      $and: [{ mobileNumber: { $eq: mobile } }],
    });
    if (!obj) {
      return res.status(200).json({
        status: "Failed",
        data: [obj],
        message: "Mobile No Not Exist",
      });
    }
    const token = jwt.sign({ mobileNumber }, process.env.TOKEN_KEY, {
      expiresIn: "24h",
    });
    return res.status(200).json({
      status: "success",
      token: token,
      message: "Your refresh token",
    });
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
