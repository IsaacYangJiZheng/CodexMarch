const express = require("express");
const FormData = require("form-data");
const axios = require("axios");
const OtpLog = require("../../models/otpLog");
const auth = require("./jwtfilter");

const router = express.Router();
const WORD_LIMIT = 30;

function countWords(message) {
  if (!message) {
    return 0;
  }
  return message.trim().split(/\s+/).filter(Boolean).length;
}

function isValidMalaysianNumber(number) {
  const malaysianRegex = /^(\+60|60|0)?(1[0-46-9]\d{7,8}|[2-9]\d{7,8})$/;
  return malaysianRegex.test(number);
}

function isValidIndianNumber(number) {
  const indianRegex = /^(\+91|91|0)?[789]\d{9}$/;
  return indianRegex.test(number);
}

function normalizePhoneNumber(phoneNumber) {
  const phoneNumberStr = String(phoneNumber).trim();
  return phoneNumberStr.startsWith("0")
    ? `6${phoneNumberStr}`
    : phoneNumberStr;
}

async function createLogEntry({
  customerName,
  phoneNumber,
  message,
  result,
  sentAt,
}) {
  const logEntry = new OtpLog({
    customerName,
    phoneNumber,
    message,
    result,
    sentAt,
  });
  await logEntry.save();
  return logEntry;
}

router.get("/result",auth , async (req, res) => {
  try {
    const logs = await OtpLog.find({}).sort({ sentAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/",auth, async (req, res) => {
  try {
    const { customerName, phoneNumber, message } = req.body;
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: "Customer name is required." });
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const trimmedMessage = message.trim();
    const wordCount = countWords(trimmedMessage);
    if (wordCount > WORD_LIMIT) {
      return res
        .status(400)
        .json({ message: `Message must be ${WORD_LIMIT} words or less.` });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const sentAt = new Date();

    if (
      !isValidMalaysianNumber(normalizedPhone) &&
      !isValidIndianNumber(normalizedPhone)
    ) {
      const logEntry = await createLogEntry({
        customerName: customerName.trim(),
        phoneNumber: normalizedPhone,
        message: trimmedMessage,
        result: "Invalid mobile number.",
        sentAt,
      });
      return res.status(200).json({
        status: false,
        result: "Invalid mobile number.",
        log: logEntry,
      });
    }

    if (process.env.SMS_PRODUCTION === "true") {
      const form = new FormData();
      form.append("user", `${process.env.SMS_USER}`);
      form.append("secret_key", `${process.env.SMS_SECRET_KEY}`);
      form.append("phone", normalizedPhone);
      form.append("message", trimmedMessage);

      try {
        const response = await axios.post(`${process.env.SMS_URL}`, form, {});
        const responseData = response?.data ?? {};
        let result = "Failed to send SMS.";
        let status = false;

        if (responseData.success === true) {
          result = "SMS sent successfully.";
          status = true;
        } else if (
          responseData.error_message &&
          responseData.error_message.length !== 0 &&
          responseData.error_message[0].includes("Insufficient credit")
        ) {
          result = "SMS provider reported insufficient credit.";
          status = false;
        } else if (responseData.error_message) {
          result = responseData.error_message.join(", ");
        }

        const logEntry = await createLogEntry({
          customerName: customerName.trim(),
          phoneNumber: normalizedPhone,
          message: trimmedMessage,
          result,
          sentAt,
        });

        return res.status(200).json({
          status,
          result,
          log: logEntry,
        });
      } catch (error) {
        const logEntry = await createLogEntry({
          customerName: customerName.trim(),
          phoneNumber: normalizedPhone,
          message: trimmedMessage,
          result: `Failed to send SMS: ${error.message}`,
          sentAt,
        });
        return res.status(200).json({
          status: false,
          result: `Failed to send SMS: ${error.message}`,
          log: logEntry,
        });
      }
    }

    const logEntry = await createLogEntry({
      customerName: customerName.trim(),
      phoneNumber: normalizedPhone,
      message: trimmedMessage,
      result: "SMS sending disabled in this environment.",
      sentAt,
    });

    return res.status(200).json({
      status: false,
      result: "SMS sending disabled in this environment.",
      log: logEntry,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;