//npm install express body-parser
//npm install cors

const net = require("net");
const express = require("express");
const router = express.Router();
// Get current date and time
const currentDate = new Date();
const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

const line = "=".repeat(45) + "\n";
const dash = "-".repeat(45) + "\n";

router.post("/thermal/print", (req, res) => {
  try{
    const { ipAddress, printerPort, content, invoiceData } = req.body;

  // Convert content to ESC/POS commands
  const commands = new Uint8Array([
    0x1b,
    0x40, // Initialize printer
    0x1b,
    0x45,
    0x01, // Bold on
    0x1b,
    0x61,
    0x01, // Center alignment
    ...new TextEncoder().encode(invoiceData?.branch?.branchName + "\n"), // Print company name
    0x1b,
    0x45,
    0x00, // Bold off
    ...new TextEncoder().encode(invoiceData?.branch?.branchAddress + "\n"), // Print company address
    ...new TextEncoder().encode(line), // Print line of dashes
    0x1b,
    0x45,
    0x01, // Bold on
    0x1d,
    0x21,
    0x11, // Double height and width
    ...new TextEncoder().encode(
      "INVOICE\n"
    ),
    0x1d,
    0x21,
    0x00, // Reset to normal size
    0x1b,
    0x45,
    0x00, // Bold off
    ...new TextEncoder().encode(
      "Invoice #:" + invoiceData?.orderNumber + "\n"
    ),
    0x1b,
    0x61,
    0x00, // Left alignment for the rest of the content
    ...new TextEncoder().encode("\tDate: " + formattedDate + "\n"),
    ...new TextEncoder().encode(
      "\tTransaction By: " + invoiceData?.salesConsultant + "\n\n"
    ),
    0x1b,
    0x61,
    0x01, // Center alignment
    ...new TextEncoder().encode(line), // Print line of dashes
    0x1b,
    0x61,
    0x00, // Left alignment for the rest of the content
    ...new TextEncoder().encode("\tQty    Description\tAmt (RM)\n"),
    0x1b,
    0x61,
    0x01, // Center alignment
    ...new TextEncoder().encode(dash), // Print line of dashes
    0x1b,
    0x61,
    0x00, // Left alignment for the rest of the content
    ...new TextEncoder().encode(content + "\n"), // Invoice content
    0x1b,
    0x61,
    0x01, // Center alignment
    ...new TextEncoder().encode(line), // Print line of dashes
    ...new TextEncoder().encode("Thank you and see you again!\n"),
    ...new TextEncoder().encode("FB: anran.malaysia\n"),
    ...new TextEncoder().encode(line), // Print line of dashes
    0x0a,
    0x0a,
    0x0a,
    0x0a,
    0x0a, // Additional line feeds (adjust as necessary)
    0x1d,
    0x56,
    0x00, // Full cut
    0x1b,
    0x42,
    0x03,
    0x01, // Beep 3 times with 1/10 second duration
  ]);

  // Connect to the printer via TCP/IP
  const client = new net.Socket();
  client.connect(printerPort, ipAddress, () => {
    client.write(Buffer.from(commands));
    client.end();
  });

  client.on("error", (error) => {
    // console.error("Printing error:", error);
    res.status(500).send(error);
  });

  client.on("close", () => {
    res.send("Printed successfully");
  });
  }
  catch (error) {
    // console.error("Error generating printer:", error);
    res.status(500).json({ error: error.message });
  }
  
});

module.exports = router;
