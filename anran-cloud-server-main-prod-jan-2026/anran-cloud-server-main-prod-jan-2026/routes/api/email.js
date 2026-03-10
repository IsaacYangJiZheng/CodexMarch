const express = require("express");
const MailController = require("../../controller/mailController");
const mongoose = require("mongoose");
const Orders = require("../../models/orders");
const MemberDeposits = require("../../models/memberDeposits");
const router = express.Router();
const auth = require("./jwtfilter");
const fs = require("fs");
const multer = require("multer");
// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./controller/Temp");
    // cb(null, "./root/Anran-Dev-Media/Images");
  },
  filename: (req, file, cb) => {
    let { invoiceNo } = req.body;
    cb(null, `${Date.now()}-${invoiceNo}.pdf`);
  },
});
const uploads = multer({ storage });

router.post("/send-invoice-pdf", uploads.single("mypdf"), async (req, res) => {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Something went wrong. Please try again" });
    }
    const { invoiceId, email } = req.body;
    const obj = await Orders.aggregate([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            _id: new ObjectId(invoiceId),
          },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            convertedId: {
              $toString: "$_id",
            },
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            orderDateStr: {
              $dateToString: { date: "$orderDate", format: "%Y-%m-%d" },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "orderitems",
            localField: "convertedId",
            foreignField: "order",
            as: "items",
            pipeline: [
              {
                $lookup: {
                  from: "packages",
                  localField: "package",
                  foreignField: "_id",
                  as: "packages",
                  pipeline: [
                    {
                      $project: {
                        packageName: 1,
                        packageCode: 1,
                      },
                    },
                  ],
                },
              },
              {
                $addFields:
                  /**
                   * newField: The new field name.
                   * expression: The new field expression.
                   */
                  {
                    package: {
                      $arrayElemAt: ["$packages", 0],
                    },
                  },
              },
            ],
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "payments",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "payments",
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "members",
            localField: "member",
            foreignField: "_id",
            as: "member",
            pipeline: [
              {
                $project: {
                  memberFullName: 1,
                  mobileNumber: 1,
                  address: 1,
                  city: 1,
                  postcode: 1,
                  states: 1,
                },
              },
            ],
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            member: {
              $arrayElemAt: ["$member", 0],
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "branches",
            localField: "orderBranch",
            foreignField: "_id",
            as: "branch",
            pipeline: [
              {
                $project: {
                  branchName: 1,
                  branchAddress: 1,
                  branchCity: 1,
                  branchPostcode: 1,
                  branchState: 1,
                  branchContactNumber: 1,
                },
              },
            ],
          },
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            branch: {
              $arrayElemAt: ["$branch", 0],
            },
          },
      },
    ]);
    let mailData = {
      memberName: obj[0].member.memberFullName,
      invoiceNo: obj[0].orderNumber,
      invoiceDate: obj[0].orderDate,
      branch: obj[0].branch.branchName,
      items: obj[0].items,
      total: obj[0].orderTotalAmount,
      email: email,
    };
    return await MailController.sendInvoicePDFMail(req.file, mailData)
      .then((value) => {
        return res.status(200).type("json").send("Email sent successfully");
      })
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

router.post(
  "/send-deposit-invoice-pdf",
  uploads.single("mypdf"),
  async (req, res) => {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Something went wrong. Please try again" });
      }
      const { invoiceId, email } = req.body;
      const obj = await MemberDeposits.aggregate([
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              _id: new ObjectId(invoiceId),
            },
        },
        { $sort: { createdAt: -1 } },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              convertedId: {
                $toString: "$_id",
              },
            },
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              payDateStr: {
                $dateToString: { date: "$payDate", format: "%Y-%m-%d" },
              },
            },
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: "members",
              localField: "payer",
              foreignField: "_id",
              as: "member",
              pipeline: [
                {
                  $project: {
                    memberFullName: 1,
                    mobileNumber: 1,
                    address: 1,
                    city: 1,
                    postcode: 1,
                    states: 1,
                  },
                },
              ],
            },
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              member: {
                $arrayElemAt: ["$member", 0],
              },
            },
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: "branches",
              localField: "branch",
              foreignField: "_id",
              as: "branch",
              pipeline: [
                {
                  $project: {
                    branchName: 1,
                    branchAddress: 1,
                    branchCity: 1,
                    branchPostcode: 1,
                    branchState: 1,
                    branchContactNumber: 1,
                  },
                },
              ],
            },
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              branch: {
                $arrayElemAt: ["$branch", 0],
              },
            },
        },
      ]);
      let mailData = {
        memberName: obj[0].member.memberFullName,
        invoiceNo: obj[0].depositNumber,
        invoiceDate: obj[0].payDateStr,
        branch: obj[0].branch.branchName,
        total: obj[0].payAmount,
        email: email,
        reference: obj[0].referenceNumber,
        payAmount: obj[0].payAmount,
      };
      return await MailController.sendDepositInvoicePDFMail(req.file, mailData)
        .then((value) => {
          return res.status(200).type("json").send("Email sent successfully");
        })
        .catch((err) => {
          return res.status(500).send({ message: err.message });
        });
    } catch (error) {
      res.status(500).send("Unknown error");
      throw error;
    }
  }
);

router.get("/send-mail", (req, res) => {
  try {
    MailController.sampleMail().then(() => {
      return res.status(200).type("json").send("Email sent successfully");
    });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

router.post("/send-pdf", uploads.single("mypdf"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // return res.status(200).type("json").send("Email sent successfully");
    MailController.samplePDFMail(req.file).then(() => {
      return res.status(200).type("json").send("Email sent successfully");
    });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

router.get("/send-html-mail", (req, res) => {
  try {
    MailController.htmlMail().then(() => {
      return res.status(200).type("json").send("HTML email sent successfully");
    });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

router.get("/attaching-pdf", (req, res) => {
  try {
    MailController.attachedFileMail().then(() => {
      return res
        .status(200)
        .type("json")
        .send("PDF attached and mail sent successfully");
    });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

router.get("/html-to-pdf", (req, res) => {
  try {
    MailController.htmlToPdfMail().then(() => {
      return res
        .status(200)
        .type("json")
        .send("PDF attached and mail sent successfully");
    });
  } catch (error) {
    res.status(500).send("Unknown error");
    throw error;
  }
});

module.exports = router;
