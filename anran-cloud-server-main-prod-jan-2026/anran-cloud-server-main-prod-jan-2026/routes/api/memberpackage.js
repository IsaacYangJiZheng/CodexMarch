const express = require("express");
const MemberPackage = require("../../models/memberPackage");
const Members = require("../../models/members");
const Branch = require("../../models/branch");
const router = express.Router();
const moment = require("moment");
const auth = require("./jwtfilter");
const Counter = require("../../models/counterSchema");
const Staff = require("../../models/staff");
const Package = require("../../models/package");
const Booking = require("../../models/booking");
const { filterByBranchRol } = require("./utils");

router.post("/createpackage", auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body.branch);
    if (req.body && branch) {
      const nextInvoiceNumber = await generateRunningNumber(branch.branch_code);
      const memberPackages = req.body;
      memberPackages.invoicenumber = nextInvoiceNumber;
      memberPackages.validdate = null;
      let mempackage = await MemberPackage.create(memberPackages);
      res.send(mempackage);
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const memberPackages = req.body;
    let branchCode = "";
    if (memberPackages.length > 0) {
      const firstPackage = memberPackages[0];
      branchCode = firstPackage.branch.branch_code;
    }
    const nextInvoiceNumber = await generateRunningNumber(branchCode);
    const updatedMemberPackages = await Promise.all(
      memberPackages.map(async (item) => {
        return {
          ...item,
          invoicenumber: nextInvoiceNumber,
          validdate: null,
          paymentmethod: item.paymentmethod,
        };
      })
    );
    let mempackage = await MemberPackage.create(updatedMemberPackages);
    res.send(mempackage);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

const generateRunningNumber = async (branchCode) => {
  try {
    const letter = "I";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const latestBooking = await MemberPackage.findOne({
      invoicenumber: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ transaction_no: -1 });
    let sequence = "0001"; // Default starting sequence if no previous booking found
    if (latestBooking) {
      const lastTransactionNo = latestBooking.invoicenumber;
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

router.post("/transferpackage", auth, async (req, res) => {
  try {
    const {
      selectedMemberId,
      selectedMemberCurrentBalance,
      selectedMemberTransferedTimes,
      purchaseBranch,
      member,
      package: pkg,
      transferFrom,
      transferedTimes,
    } = req.body;
    // console.log(
    //   pkg,
    //   selectedMemberId,
    //   member,
    //   selectedMemberCurrentBalance,
    //   selectedMemberTransferedTimes
    // );
    await MemberPackage.findByIdAndUpdate(
      selectedMemberId,
      {
        currentBalance: selectedMemberCurrentBalance,
        transferedTimes: selectedMemberTransferedTimes,
      },
      { new: false }
    );
    const newMemberPackage = {
      purchaseBranch,
      member,
      package: pkg,
      transferFrom,
      currentBalance: transferedTimes,
      originalBalance: transferedTimes,
    };
    const mempackage = await MemberPackage.create(newMemberPackage);
    res.send(mempackage);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/transferSessions/:memberId", auth, async (req, res) => {
  try {
    // console.log("hi");
    const { memberId } = req.params;

    const transferIn = await MemberPackage.find({ transferFrom: memberId })
      .populate("member")
      .populate("package");

    const transferOut = await MemberPackage.find({
      member: memberId,
      transferFrom: { $ne: [] },
    })
      .populate("member")
      .populate("package");

    res.send({ transferIn, transferOut });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const valid = await calculateValidDate(req.body);
    req.body.validdate = valid;
    const obj = await MemberPackage.findByIdAndUpdate(id, req.body, {
      new: false,
    });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.findByIdAndDelete(id);
    res.status(200).send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const members = await MemberPackage.find({})
      .populate({ path: "member" })
      .populate({ path: "package" })
      .populate({ path: "transferFrom" });
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.find({ $and: [{ member: { $eq: id } }] });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/avail/:id", auth, async (req, res) => {
  try {
    const today = moment().startOf("day");
    const { id } = req.params;
    const memberPackages = await MemberPackage.find({
      member: id,
    })
      .populate({ path: "packageid" })
      .populate({ path: "branch" })
      .populate({ path: "transferfrom", populate: { path: "member" } })
      .sort({ package_date: -1 });

    // Filter the results based on the combined conditions
    const filteredPackages = memberPackages.filter((pkg) => {
      const unlimitedYearValid = pkg.packageid?.unlimitedyear === true; // Check if unlimitedyear is true
      const balanceValid = pkg.balance > 0; // Check if balance is greater than 0
      const validTilFuture = pkg.validdate && pkg.validdate > today.toDate(); // Check if validtil is a future date

      // Combine the conditions
      return (
        unlimitedYearValid || // Combined condition for package_date and unlimitedyear
        (balanceValid && (validTilFuture || !pkg.validdate))
      );
    });
    res.status(200).send(filteredPackages);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/findid/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.findById(id);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/memberid", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackage.find({
      $and: [{ member: { $eq: id } }, { balance: { $gt: 0 } }],
    });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/memberid", auth, async (req, res) => {
  try {
    const { member, first, rows } = req.body;
    const obj = {
      data: await MemberPackage.find({ $and: [{ member: { $eq: member } }] })
        .populate({
          path: "member",
        })
        .populate({
          path: "packageid",
        })
        .sort({ package_date: -1 })
        .limit(rows)
        .skip(first),
      totalRecords: await MemberPackage.find({
        $and: [{ member: { $eq: member } }],
      }).countDocuments(),
    };
    res.status(200).send(obj);
  } catch (error) {
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
        branch: { $in: branchList.map((branch) => branch._id) },
      });
    }
    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    const members = await MemberPackage.find(query);
    res.send(members);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    //addPurchasemodeToDocuments()
    const {
      id,
      first,
      rows,
      filters,
      sortField,
      sortOrder,
      purchasemode,
      purchasetype,
      users,
    } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && filters[e].value && e === "package_date") {
          const dateStr = filters[e].value;
          const dt = formatDate(dateStr);
          const isValidDate = moment(dt, "YYYY-MM-DD", true).isValid();
          if (isValidDate) {
            const startDate = moment(dt).startOf("day").toDate();
            const endDate = moment(dt).endOf("day").toDate();
            filterQuery.push({
              package_date: { $gte: startDate, $lte: endDate },
            });
          }
        } else if (filters[e].value && filters[e].value && e === "package") {
          filterQuery.push({
            package: { $regex: ".*" + filters[e].value + ".*", $options: "i" },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "invoicenumber"
        ) {
          filterQuery.push({
            invoicenumber: {
              $regex: ".*" + filters[e].value + ".*",
              $options: "i",
            },
          });
        }
      });
    }

    if (id) filterQuery.push({ member: id });
    if (purchasemode) filterQuery.push({ purchasemode });
    if (purchasetype) filterQuery.push({ purchasetype });

    if (filters && filters.member && filters.member.value) {
      const branchList = await Members.find({
        member_name: {
          $regex: ".*" + filters.member.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
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

    if (filters && filters.mobileNumber && filters.mobileNumber.value) {
      const branchList = await Members.find({
        mobileNumber: {
          $regex: ".*" + filters.mobileNumber.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
    }

    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};

    let sortQuery = {};
    if (sortField) {
      sortQuery[sortField] = sortOrder === 1 ? "asc" : "desc";
    }
    if (users && users !== "admin") {
      const roles = await getRolesByUser(users);
      if (roles && !roles.all_branch) {
        const branches = roles.branch
          ? roles.branch.map((branch) => branch._id)
          : [];
        query = {
          ...query,
          branch: { $in: branches },
        };
      }
    }

    const data = await MemberPackage.find(query)
      .populate({ path: "member" })
      .populate({ path: "packageid" })
      .populate({ path: "branch" })
      .sort(sortQuery)
      .skip(first)
      .limit(rows);

    for (const memberpackage of data) {
      const checkinData = await Booking.findOne({
        package: memberpackage._id,
        bookingstatus: "Completed",
      }).sort({ checkin_date: -1 });
      memberpackage.booking_date = checkinData
        ? checkinData.checkin_date
        : null;
    }

    const totalRecords = await MemberPackage.countDocuments(query);

    res.send({ data, totalRecords });
  } catch (error) {
    // console.error("Error in '/findAll' route:", error);
    res.status(500).send(error);
  }
});

router.post("/findAllDash", auth, async (req, res) => {
  try {
    const { first, rows, branch } = req.body;

    let filterQuery = [];

    if (branch && branch.length > 0) {
      const branchList = await Branch.find({
        branch_name: { $in: branch.map((b) => new RegExp(b, "i")) },
      }).select("_id");
      const branchIds = branchList.map((b) => b._id);
      filterQuery.push({ branch: { $in: branchIds } });
    }

    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    let sortQuery = {};
    sortQuery["createdAt"] = "desc";

    const data = await MemberPackage.find(query)
      .populate({ path: "member" })
      .populate({ path: "packageid" })
      .skip(first)
      .sort(sortQuery)
      .limit(rows);

    const totalRecords = await MemberPackage.countDocuments(query);

    res.send({ data, totalRecords });
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

function formatDate(dateStr) {
  // Convert from 'DD/MM/YYYY' to 'YYYY-MM-DD'
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
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
      // console.log("No roles found");
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

router.post("/updateValidDate", async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).send("Package ID is required.");
    }

    const packageDetails = await Package.findById(packageId);
    if (!packageDetails) {
      return res.status(404).send("Package not found.");
    }

    const { packageFixedValidityDate1, packageValidity } = packageDetails;

    const memberPackages = await MemberPackage.find({ package: packageId });

    if (!memberPackages || memberPackages.length === 0) {
      return res
        .status(404)
        .send("No member packages found for the given package ID.");
    }

    if (packageValidity == "fixed" && packageFixedValidityDate1 != null) {
      var newDate = new Date(packageFixedValidityDate1 + " UTC");
      const hoursToAdd = 16 * 60 * 60 * 1000;
      newDate.setTime(newDate.getTime() + hoursToAdd);
      await MemberPackage.updateMany(
        { package: packageId },
        { $set: { validDate: newDate } }
      );
      res.status(200).send({
        message: "Valid dates updated successfully.",
      });
    } else {
      return res.status(404).send("Package not found.");
    }
  } catch (error) {
    // console.error("Error updating valid dates:", error);
    res.status(500).send(error);
  }
});

router.post("/updateValidDateV2", async (req, res) => {
  try {
    const { packageId, fromDate, toDate } = req.body;

    if (!packageId) {
      return res.status(400).send("Package ID is required.");
    }

    const packageDetails = await Package.findById(packageId);
    if (!packageDetails) {
      return res.status(404).send("Package not found.");
    }

    const { packageFixedValidityDate1, packageValidity } = packageDetails;

    const memberPackages = await MemberPackage.find({ package: packageId });

    if (!memberPackages || memberPackages.length === 0) {
      return res
        .status(404)
        .send("No member packages found for the given package ID.");
    }

    if (packageValidity == "fixed" && packageFixedValidityDate1 != null) {
      let newDate = new Date(new Date(toDate).setUTCHours(15, 59, 59, 999));
      let ss = new Date(new Date(fromDate).setUTCHours(23, 59, 59, 999));
      const rr = await MemberPackage.updateMany(
        {
          package: packageId,
          packageValidity: "fixed",
          validDate: { $eq: ss },
        },
        { $set: { validDate: newDate } }
      );
      // console.log("Number of updated documents: ", rr.modifiedCount);
      res.status(200).send({
        message: `Valid dates updated successfully: ${rr.modifiedCount}`,
      });
    } else {
      return res.status(404).send("Package not found.");
    }
  } catch (error) {
    // console.error("Error updating valid dates:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
