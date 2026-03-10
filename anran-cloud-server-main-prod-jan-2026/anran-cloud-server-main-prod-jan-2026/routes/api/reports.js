const express = require("express");
const MemberPackage = require("../../models/memberPackage");
const Booking = require("../../models/booking");
const Branch = require("../../models/branch");
const router = express.Router();
const ExcelJS = require("exceljs");
const auth = require("./jwtfilter");
const moment = require("moment");
//const { PDFDocument, rgb ,StandardFonts} = require('pdf-lib');
const PDFDocument = require("pdfkit-table");

router.post("/generate-Packagereport", auth, async (req, res) => {
  const { fromDate, toDate } = req.body;
  try {
    const todt = new Date(
      moment(toDate).add(1, "days").endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    const data = await fetchData(fromDate, todt);
    const transformedData = transformData(data);
    if (req.query.action === "view") {
      res.json(transformedData); // Send data as JSON for viewing
    } else if (req.query.action === "download") {
      const fileType = req.query.fileType; // 'excel' or 'pdf'
      if (fileType === "pdf") {
        await generatePdfPackage(transformedData, res);
      } else {
        await generateExcel(transformedData, res); // Default to Excel
      }
    }
  } catch (error) {
    // console.error("Error generating report:", error);
    res.status(500).send("Internal Server Error");
  }
});

const fetchData = async (fromDate, toDate) => {
  try {
    const data = await MemberPackage.find({
      package_date: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
    })
      .populate("member")
      .populate("packageid")
      .populate("branch");

    return data;
  } catch (error) {
    // console.error("Error fetching data:", error);
    throw error;
  }
};

const formatDate = (date) => {
  return moment(date).format("DD-MM-YY");
};

const transformData = (data) => {
  return data.map((record) => ({
    PurchaseDateTime: formatDate(record.package_date),
    PackageCode: record.packageid ? record.packageid.package_code : "",
    PackageName: record.packageid ? record.packageid.package_name : "",
    PackageType: record.purchasemode,
    PaymentType: record.paymenttype,
    PurchaseQty: record.quantity,
    BranchCode: record.branch ? record.branch.branch_code : "",
    BranchName: record.branch ? record.branch.branch_name : "",
    MemberPhone: record.member ? record.member.mobileNumber : "",
    MemberName: record.member ? record.member.member_name : "",
    Price: record.price,
    OriginalPrice: record.price,
    TaxCode: "",
    TaxRate: "",
    TaxAmount: record.price,
    TotalAmount: record.price,
    NetAmount: record.price,
  }));
};

const generateExcel = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  const headerStyle = {
    font: { bold: true },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFA500" }, // Orange color
    },
  };

  worksheet.columns = [
    { header: "PurchaseDateTime", key: "PurchaseDateTime", width: 20 },
    { header: "PackageCode", key: "PackageCode", width: 20 },
    { header: "PackageName", key: "PackageName", width: 20 },
    { header: "PackageType", key: "PackageType", width: 20 },
    { header: "PaymentType", key: "PaymentType", width: 20 },
    { header: "PurchaseQty", key: "PurchaseQty", width: 20 },
    { header: "BranchCode", key: "BranchCode", width: 20 },
    { header: "BranchName", key: "BranchName", width: 20 },
    { header: "MemberPhone", key: "MemberPhone", width: 20 },
    { header: "MemberName", key: "MemberName", width: 20 },
    { header: "Price", key: "Price", width: 20 },
    { header: "OriginalPrice", key: "OriginalPrice", width: 20 },
    { header: "TaxCode", key: "TaxCode", width: 20 },
    { header: "TaxRate", key: "TaxRate", width: 20 },
    { header: "TaxAmount", key: "TaxAmount", width: 20 },
    { header: "TotalAmount", key: "TotalAmount", width: 20 },
    { header: "NetAmount", key: "NetAmount", width: 20 },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = headerStyle.fill;
    cell.font = headerStyle.font;
  });

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=packageReport.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};

router.post("/generate-Usagereport", auth, async (req, res) => {
  const { fromDate, toDate, branches } = req.body;
  try {
    const todt = new Date(
      moment(toDate).add(1, "days").endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    const data = await fetchDataUsage(fromDate, todt, branches);
    const transformedData = transformDataUsage(data);

    if (req.query.action === "view") {
      res.json(transformedData); // Send data as JSON for viewing
    } else if (req.query.action === "download") {
      const fileType = req.query.fileType; // 'excel' or 'pdf'
      // console.log(req.query.fileType);
      if (fileType === "pdf") {
        await generatePdfUsage(transformedData, res);
      } else {
        await generateExcelUsage(transformedData, res); // Default to Excel
      }
    }
  } catch (error) {
    // console.error("Error generating usage report:", error);
    res.status(500).send("Internal Server Error");
  }
});

const generateExcelUsage = async (data, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Usage Report");

  const headerStyle = {
    font: { bold: true },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFA500" }, // Orange color
    },
  };

  // Add header row
  worksheet.columns = [
    { header: "CheckInDateTime", key: "checkInDateTime", width: 20 },
    { header: "CheckOutDateTime", key: "checkOutDateTime", width: 20 },
    { header: "PackageCode", key: "packageCode", width: 15 },
    { header: "PackageName", key: "packageName", width: 25 },
    { header: "HomeBranchCode", key: "homeBranchCode", width: 15 },
    { header: "HomeBranchName", key: "homeBranchName", width: 25 },
    { header: "CheckInBranchCode", key: "checkInBranchCode", width: 15 },
    { header: "CheckInBranchName", key: "checkInBranchName", width: 25 },
    { header: "MemberPhone", key: "memberPhone", width: 15 },
    { header: "MemberName", key: "memberName", width: 25 },
    { header: "CreditUsed", key: "creditUsed", width: 10 },
    { header: "PercentageOwnBranch", key: "percentageOwnBranch", width: 20 },
    { header: "PriceOwnBranch", key: "priceOwnBranch", width: 15 },
    { header: "PriceCheckInBranch", key: "priceCheckInBranch", width: 20 },
    { header: "PurchaseDateTime", key: "purchaseDateTime", width: 20 },
    { header: "UsageMode", key: "usageMode", width: 15 },
    { header: "CheckInMode", key: "checkInMode", width: 15 },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = headerStyle.fill;
    cell.font = headerStyle.font;
  });

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Generate Excel file
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=usage_report.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};

const fetchDataUsage = async (fromDate, toDate, branch) => {
  try {
    let filterQuery = [];
    // Check if branch filter is applied
    if (branch && branch.length > 0) {
      const branchList = await Branch.find({
        branch_name: { $in: branch.map((b) => new RegExp(b.branch_name, "i")) },
      }).select("_id");
      const branchIds = branchList.map((b) => b._id);
      filterQuery.push({ branch: { $in: branchIds } });
    }

    // Add date range and booking status filters
    filterQuery.push({
      booking_date: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
      bookingstatus: "Completed",
    });

    // Build the final query object
    const query = filterQuery.length > 0 ? { $and: filterQuery } : {};

    // Fetch bookings with the constructed query
    const bookings = await Booking.find(query)
      .populate("member")
      .populate("room")
      .populate("package")
      .populate("branch");

    return bookings;
  } catch (error) {
    // console.error("Error fetching data:", error);
    throw error;
  }
};

const formatDateWithoutTime = (date) => {
  return moment(date).format("DD-MM-YYYY hh:mm");
};

const transformDataUsage = (data) => {
  return data.map((booking) => ({
    checkInDateTime: formatDateWithoutTime(booking.start),
    checkOutDateTime: formatDateWithoutTime(booking.end),
    packageCode: "",
    packageName: booking.package_name,
    homeBranchCode: "",
    homeBranchName: "",
    checkInBranchCode: "",
    checkInBranchName: booking.branch ? booking.branch.branch_name : "",
    memberPhone: booking.member ? booking.member.mobileNumber : "",
    memberName: booking.member ? booking.member.member_name : "",
    creditUsed: "1",
    percentageOwnBranch: "", // Adjust as needed
    priceOwnBranch: "", // Adjust as needed
    priceCheckInBranch: "", // Adjust as needed
    purchaseDateTime: booking.package
      ? formatDate(booking.package.package_date)
      : "",
    usageMode: "Booking",
    checkInMode: "", // Adjust as needed
  }));
};

const wrapText = (text, font, fontSize, maxWidth) => {
  if (typeof text !== "string") {
    text = String(text); // Convert non-string types to string
  }

  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine + word + " ";
    const { width } = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());

  return lines;
};

const generatePdfUsage = async (data, res) => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    // Pipe the PDF document to a file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=usage_report.pdf"
    );
    doc.pipe(res);

    // Add a title
    doc.fontSize(24).text("Usage Report", { align: "center" });
    doc.moveDown();

    // Define table headers
    const headers = [
      "CheckIn Time",
      "CheckOut Time",
      "Package Code",
      "Package Name",
      "Branch Name",
      "CheckIn BranchCode",
      "CheckIn BranchName",
      "Phone",
      "Name",
      "PurchaseDate",
      "UsageMode",
      "CheckIn Mode",
    ];

    // Prepare table data
    const rows = data.map((item) => [
      item.checkInDateTime || "",
      item.checkOutDateTime || "",
      item.packageCode || "",
      item.packageName || "",
      item.homeBranchName || "",
      item.checkInBranchCode || "",
      item.checkInBranchName || "",
      item.memberPhone || "",
      item.memberName || "",
      item.purchaseDateTime || "",
      item.usageMode || "",
      item.checkInMode || "",
    ]);

    // Add table to the PDF document
    doc.table(
      {
        headers,
        rows,
      },
      {
        columnsSize: [50, 50, 60, 50, 50, 70, 50, 60, 50, 50, 50, 50], // Adjust column sizes as needed
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
      }
    );

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    // console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

const generatePdfPackage = async (data, res) => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    // Pipe the PDF document to a file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=usage_report.pdf"
    );
    doc.pipe(res);

    // Add a title
    doc.fontSize(24).text("Package Report", { align: "center" });
    doc.moveDown();

    // Define table headers
    const headers = [
      "PurchaseDateTime",
      "PackageCode",
      "PackageName",
      "PurchaseQty",
      "BranchCode",
      "BranchName",
      "MemberPhone",
      "MemberName",
      "Price",
      "OriginalPrice",
      "TotalAmount",
      "NetAmount",
    ];

    // Prepare table data
    const rows = data.map((item) => [
      item.PurchaseDateTime || "",
      item.PackageName || "",
      item.PackageName || "",
      item.PurchaseQty || "",
      item.BranchCode || "",
      item.BranchName || "",
      item.MemberPhone || "",
      item.MemberName || "",
      item.Price || "",
      item.OriginalPrice || "",
      item.TaxRate || "",
      item.NetAmount || "",
    ]);

    // Add table to the PDF document
    doc.table(
      {
        headers,
        rows,
      },
      {
        columnsSize: [50, 50, 60, 50, 50, 70, 50, 60, 50, 50, 50, 50], // Adjust column sizes as needed
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
      }
    );

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    // console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = router;
