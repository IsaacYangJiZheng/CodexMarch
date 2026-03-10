const express = require("express");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const MemberPackage = require("../../models/memberPackage");
const auth = require("./jwtfilter");
const router = express.Router();
const path = require("path");

router.get("/generate-receipt/:id", auth, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send("Receipt ID is required");
  }
  const receiptData = await MemberPackage.findById(id)
    .populate({
      path: "member",
    })
    .populate({
      path: "packageid",
    });

  try {
    const pdfBytes = await generatePDF(receiptData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=receipt.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    // console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

const generatePDF = async (receiptData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  const titleFontSize = 18;
  const headingFontSize = 14;
  const textFontSize = 12;

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Embed logo image
  const logoPath = path.resolve(__dirname, "logo.png"); // Update this path to your logo file
  const logoImageBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoImageBytes);
  const logoDims = logoImage.scale(0.2); // Adjust scale as needed

  // Draw logo
  page.drawImage(logoImage, {
    x: width - logoDims.width - 50,
    y: height - logoDims.height - 20,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Draw border
  page.drawRectangle({
    x: 40,
    y: 20,
    width: width - 80,
    height: height - 40,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // Draw Package Purchase Date at the top
  page.drawText(
    `Package Purchase Date: ${new Date(
      receiptData.package_date
    ).toLocaleDateString()}`,
    {
      x: 50,
      y: height - 70,
      size: headingFontSize,
      font: boldFont,
      color: rgb(0, 0, 1),
    }
  );

  // Draw header
  page.drawText("Receipt", {
    x: 50,
    y: height - 100,
    size: titleFontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Member Information Section
  page.drawText("Member Information:", {
    x: 50,
    y: height - 130,
    size: headingFontSize,
    font: boldFont,
    color: rgb(0, 0, 1),
  });
  page.drawText(`Name: ${receiptData.member.member_name}`, {
    x: 50,
    y: height - 155,
    size: textFontSize,
    font,
  });
  page.drawText(`Mobile Number: ${receiptData.member.mobileNumber}`, {
    x: 50,
    y: height - 170,
    size: textFontSize,
    font,
  });

  // Package Information Section
  page.drawText("Package Information:", {
    x: 50,
    y: height - 200,
    size: headingFontSize,
    font: boldFont,
    color: rgb(0, 0, 1),
  });
  page.drawText(`Package ID: ${receiptData.packageid._id}`, {
    x: 50,
    y: height - 225,
    size: textFontSize,
    font,
  });

  const getSafeValue = (value) => value || "";

  page.drawText(`Invoice No: ${getSafeValue(receiptData?.invoicenumber)}`, {
    x: 50,
    y: height - 240,
    size: textFontSize,
    font,
  });

  page.drawText(`payment method: ${getSafeValue(receiptData?.paymenttype)}`, {
    x: 50,
    y: height - 255,
    size: textFontSize,
    font,
  });

  page.drawText(`Package Name: ${receiptData.package}`, {
    x: 50,
    y: height - 270,
    size: textFontSize,
    font,
  });
  page.drawText(`Quantity: ${receiptData.quantity}`, {
    x: 50,
    y: height - 285,
    size: textFontSize,
    font,
  });
  page.drawText(`Price per Package: RM ${receiptData.price.toFixed(2)}`, {
    x: 50,
    y: height - 300,
    size: textFontSize,
    font,
  });
  page.drawText(
    `Total Price: RM ${(receiptData.price * receiptData.quantity).toFixed(2)}`,
    {
      x: 50,
      y: height - 315,
      size: textFontSize,
      font,
    }
  );

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  //fs.writeFileSync('/home/arun/Desktop/example.pdf', pdfBytes);

  return pdfBytes;
};

module.exports = router;
