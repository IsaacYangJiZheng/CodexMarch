const express = require("express");
const Staff = require("../../models/staff");
const Branch = require("../../models/branch");
const Orders = require("../../models/orders");
const Payments = require("../../models/payments");
const Tax = require("../../models/tax");
const router = express.Router();
const dayjs = require('dayjs');

async function filterByBranchRol(users) {
  let branches = [];
  try {
    if (users && users.uid !== "admin") {
      const branch = getBranchesByUser(users.username);
      if (branch && !branch.all_branch) {
        branches = Branch.find({
          _id: { $in: branches },
          isDeleted: false,
        }).sort({ branchOrder: 1 });
      } else if (roles && roles.all_branch) {
        branches = Branch.find({ isDeleted: false }).sort({ branchOrder: 1 });
      }
      const roles = await getRolesByUser(users.username);
      if (roles && !roles.all_branch) {
        const branchIds = roles.branch
          ? roles.branch.map((branch) => branch._id)
          : [];
        branches = Branch.find({
          _id: { $in: branchIds },
          isDeleted: false,
        }).sort({ branchOrder: 1 });
      } else if (roles && roles.all_branch) {
        branches = Branch.find({ isDeleted: false }).sort({ branchOrder: 1 });
      }
    } else {
      branches = Branch.find({ isDeleted: false }).sort({ branchOrder: 1 });
    }
    return branches;
  } catch (error) {
    // console.error("Error fetching branches:", error);
    return branches;
  }
}

async function getRolesByUser(users) {
  try {
    const staff = await Staff.findOne({
      username: { $regex: new RegExp("^" + users + "$", "i") },
    })
      .select("roles")
      .populate({
        path: "roles",
        select: "branch all_branch",
        populate: {
          path: "branch",
        },
      });
    if (!staff || !staff.roles) {
      return [];
    }
    return {
      branch: staff.roles.branch || [],
      all_branch: staff.roles.all_branch || false,
    };
  } catch (error) {
    // console.error("Error fetching roles by user:", error);
    throw error;
  }
}

async function getBranchesByUser(users) {
  try {
    const staff = await Staff.findOne({
      userName: { $regex: new RegExp("^" + users + "$", "i") },
    });
    if (!staff) {
      return [];
    }
    if (staff.all_branch) {
      branches = Branch.find({
        isDeleted: false,
        branchStatus: true,
        hqStatus: false,
      }).sort({ branchOrder: 1 });
      return branches;
    } else {
      return staff.branch || [];
    }
  } catch (error) {
    // console.error("Error fetching roles by user:", error);
    throw error;
  }
}

const generateRunningNumber = async (branchCode) => {
  try {
    const letter = "I";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const latestBooking = await Orders.findOne({
      orderNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ orderNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestBooking) {
      const lastTransactionNo = latestBooking.orderNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

const generatePayRunningNumber = async (branchCode) => {
  try {
    const letter = "P";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const latestPayment = await Payments.findOne({
      paymentNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ paymentNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestPayment) {
      const lastTransactionNo = latestPayment.paymentNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

const generateRunningNumberCustomDate = async (branchCode, purchaseDate) => {
  try {
    const letter = "I";
    const patchedDate = dayjs(purchaseDate).add(1, 'day');
    const yyyyMMdd = patchedDate.format('YYYYMMDD');
    const latestBooking = await Orders.findOne({
      orderNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ orderNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestBooking) {
      const lastTransactionNo = latestBooking.orderNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

const generatePayRunningNumberCustomDate = async (branchCode, purchaseDate) => {
  try {
    const letter = "P";
    const patchedDate = dayjs(purchaseDate).add(1, 'day');
    const yyyyMMdd = patchedDate.format('YYYYMMDD');
    const latestPayment = await Payments.findOne({
      paymentNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ paymentNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestPayment) {
      const lastTransactionNo = latestPayment.paymentNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

const generateDepositRunningNumber = async (branchCode) => {
  try {
    const letter = "D";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const latestBooking = await Orders.findOne({
      orderNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ orderNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestBooking) {
      const lastTransactionNo = latestBooking.orderNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

const generateUseDepositRunningNumber = async (branchCode) => {
  try {
    const letter = "UD";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const latestBooking = await Orders.findOne({
      orderNumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ orderNumber: -1 });
    // const latestBooking = await MemberPackage.findOne({
    //   invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    // }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestBooking) {
      const lastTransactionNo = latestBooking.orderNumber;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }
    if (branchCode) {
      return `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    } else {
      return `${letter}-${yyyyMMdd}${sequence}`;
    }
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

async function calculateValidDate(memberPackages) {
  if (memberPackages.packageid && memberPackages.validdate === null) {
    const obj = await Package.findById(memberPackages.packageid).populate({
      path: "branch",
    });
    if (obj && obj.validtil === "1-Year") {
      const oneYearFromNow = moment().add(1, "years").format("YYYY-MM-DD");
      return oneYearFromNow;
    } else {
      return null;
    }
  } else {
    return memberPackages.validdate;
  }
}

async function getTodayBranchTaxRate(branchId) {
  var taxCode = "SST";
  var taxRate = 0.0;
  var taxValue = "0";
  if (branchId != null) {
    const taxData = await Tax.find({ branch: branchId }).sort({
      effectiveDate: -1,
    });
    for (const tax of taxData) {
      var effectiveDate = new Date(tax.effectiveDate);
      var today = new Date();
      if (today >= effectiveDate) {
        taxCode = tax.taxType;
        taxValue = tax.taxValue;
        var taxRateTemp = parseFloat(tax.taxValue).toFixed(2);
        taxRate = (taxRateTemp / 100).toFixed(3);
        break;
      }
    }
    return { taxCode: taxCode, taxRate: taxRate, taxValue: taxValue };
  } else {
    return { taxCode: taxCode, taxRate: taxRate, taxValue: taxValue };
  }
}

module.exports = {
  filterByBranchRol,
  getBranchesByUser,
  generateRunningNumber,
  generateRunningNumberCustomDate,
  generatePayRunningNumberCustomDate,
  generateDepositRunningNumber,
  generatePayRunningNumber,
  calculateValidDate,
  getTodayBranchTaxRate,
  generateUseDepositRunningNumber,
};
