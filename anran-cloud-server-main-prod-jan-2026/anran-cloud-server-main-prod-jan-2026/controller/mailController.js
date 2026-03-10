const hbs = require("nodemailer-express-handlebars");
const fs = require("fs");
const nodemailer = require("nodemailer"),
  //   puppeteer = require("puppeteer"),
  { htmlTemplate } = require("../template/HtmlTemplate");
// import hbs from "nodemailer-express-handlebars";

let emailConfig = {
  host: "mail.anranwellness.com", // SMTP provider
  port: 465, // the port that your SMTP provider ask for
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
};

let email = "vinoth@visualogic.com.my"; //email destination
let sender = process.env.EMAIL_ID; // email where the mail's gonna be sent

class MailController {
  static async sendInvoicePDFMail(file, context) {
    let tempFile = __dirname + "/Temp/" + file.filename;
    let message = {
      from: process.env.EMAIL_ID,
      to: context.email,
      bcc: process.env.EMAIL_BCC_ID,
      subject: "[Anran] Purchase Confirmation : " + context.invoiceNo,
      // template: "invoice",
      template: "simpleInvoice",
      attachments: [
        {
          path: __dirname + "/Temp/" + file.filename,
          filename: file.filename,
          contentType: "contentType",
        },
      ],
      envelope: {
        from: `Anran <${process.env.EMAIL_ID}>`,
        to: `${context.email}, <${context.email}>`,
        bcc: process.env.EMAIL_BCC_ID,
      },
      context,
    };
    return await this.templateMailSender(message, tempFile)
      .then((result) => {
        // fs.unlink(tempFile, (err) => {
        //   if (err)
        //     console.log(`File ${tempFile} deletion Failed.${err.message}`);
        //   console.log(`File ${tempFile} has been deleted.`);
        // });
        return result;
      })
      .catch((err) => {
        // fs.unlink(tempFile, (err) => {
        //   if (err)
        //     console.log(`File ${tempFile} deletion Failed.${err.message}`);
        //   console.log(`File ${tempFile} has been deleted.`);
        // });
        throw err;
      });
    // const rr = await this.templateMailSender(
    //   message,
    //   tempFile,
    //   async function (value, result, filePath) {
    //     if (value) {
    //       fs.unlink(filePath, (err) => {
    //         if (err) throw err;
    //         console.log(`File ${filePath} has been deleted.`);
    //       });
    //     } else {
    //       console.log("Error: ", result);
    //       fs.unlink(filePath, (err) => {
    //         if (err) throw err;
    //         console.log(`File ${filePath} has been deleted.`);
    //         throw err;
    //       });
    //     }
    //   }
    // );
    // return rr;
  }

  static async sendDepositInvoicePDFMail(file, context) {
    let tempFile = __dirname + "/Temp/" + file.filename;
    let message = {
      from: process.env.EMAIL_ID,
      to: context.email,
      bcc: process.env.EMAIL_BCC_ID,
      subject: "[Anran] Deposit Confirmation : " + context.invoiceNo,
      // template: "invoice",
      template: "simpleInvoice",
      attachments: [
        {
          path: __dirname + "/Temp/" + file.filename,
          filename: file.filename,
          contentType: "contentType",
        },
      ],
      envelope: {
        from: `Anran <${process.env.EMAIL_ID}>`,
        to: `${context.email}, <${context.email}>`,
        bcc: process.env.EMAIL_BCC_ID,
      },
      context,
    };
    return await this.templateMailSender(message, tempFile)
      .then((result) => {
        // fs.unlink(tempFile, (err) => {
        //   if (err)
        //   console.log(`File ${tempFile} deletion Failed.${err.message}`);
        //   console.log(`File ${tempFile} has been deleted.`);
        // });
        return result;
      })
      .catch((err) => {
        // fs.unlink(tempFile, (err) => {
        //   if (err)
        //     console.log(`File ${tempFile} deletion Failed.${err.message}`);
        //   console.log(`File ${tempFile} has been deleted.`);
        // });
        throw err;
      });
  }

  static async deleteFile(filePath) {
    try {
      fs.unlink(filePath);
      // console.log(`File ${filePath} has been deleted.`);
    } catch (err) {
      console.error(err);
    }
  }

  static async sampleMail() {
    let message = {
      from: sender,
      to: email,
      subject: "Sending Mail from node.",
      text: "Body of the mail.",
      envelope: {
        from: `Vinoth <${sender}>`,
        to: `${email}, <${email}>`,
      },
    };
    this.mailSender(message);
  }

  static async samplePDFMail(file) {
    let dd = __dirname + "/Temp/" + file.filename;
    let message = {
      from: sender,
      to: email,
      subject: "Sending Mail with attached file from node.",
      html: htmlTemplate(),
      attachments: [
        {
          path: __dirname + "/Temp/" + file.filename,
          filename: file.filename,
          contentType: "contentType",
        },
      ],
      envelope: {
        from: `Vinoth <${sender}>`,
        to: `${email}, <${email}>`,
      },
    };
    this.mailSender(message);
  }

  static async htmlMail() {
    let message = {
      from: sender,
      to: email,
      subject: "Sending HTML Mail from node.",
      html: htmlTemplate(),
      envelope: {
        from: `Vinoth <${sender}>`,
        to: `${email}, <${email}>`,
      },
    };
    this.mailSender(message);
  }

  static async attachedFileMail() {
    let message = {
      from: sender,
      to: email,
      subject: "Sending Mail with attached file from node.",
      attachments: [
        {
          path: __dirname + "/../temp/file.pdf",
          filename: "file.pdf",
          contentType: "contentType",
        },
      ],
      envelope: {
        from: `Vinoth <${sender}>`,
        to: `${email}, <${email}>`,
      },
    };
    this.mailSender(message);
  }

  //   static async htmlToPdfMail() {
  //     try {
  //       const browser = await puppeteer.launch({
  //         headless: true,
  //       });
  //       const page = await browser.newPage();
  //       const template = htmlTemplate();
  //       await page.setContent(template, { waitUntil: "domcontentloaded" });
  //       await page.pdf({
  //         path: __dirname + "/../temp/file2.pdf",
  //         printBackground: true,
  //         format: "A4",
  //       });
  //       await browser.close();
  //       let message = {
  //         from: sender,
  //         to: email,
  //         subject: "Converting HTML code to PDF file.",
  //         attachments: [
  //           {
  //             path: __dirname + "/../temp/file2.pdf",
  //             filename: "file2.pdf",
  //             contentType: "contentType",
  //           },
  //         ],
  //         envelope: {
  //           from: `Vinoth <${sender}>`,
  //           to: `${email}, <${email}>`,
  //         },
  //       };
  //       this.mailSender(message);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  static async mailSender(data) {
    let transporter = nodemailer.createTransport(emailConfig);
    transporter.verify((error) => (error ? error : ""));
    transporter.sendMail(data);
  }

  static async templateMailSender(data, tempFile) {
    let transporter = nodemailer.createTransport(emailConfig);
    transporter.verify((error) => (error ? error : ""));
    // Configure Handlebars plugin in Nodemailer
    const hbsOptions = {
      viewEngine: {
        partialsDir: "template",
        layoutsDir: "template",
        defaultLayout: "baseMessage",
      },
      viewPath: "template",
    };
    transporter.use("compile", hbs(hbsOptions));
    // transporter.sendMail(data);
    // Send email options using the transporter
    return await transporter
      .sendMail(data)
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw err;
      });
  }

  // static async templateMailSender(data, tempFile, callback) {
  //   let transporter = nodemailer.createTransport(emailConfig);
  //   transporter.verify((error) => (error ? error : ""));
  //   // Configure Handlebars plugin in Nodemailer
  //   const hbsOptions = {
  //     viewEngine: {
  //       partialsDir: "template",
  //       layoutsDir: "template",
  //       defaultLayout: "baseMessage",
  //     },
  //     viewPath: "template",
  //   };
  //   transporter.use("compile", hbs(hbsOptions));
  //   // transporter.sendMail(data);
  //   // Send email options using the transporter
  //   transporter.sendMail(data, function (err, info) {
  //     if (err) {
  //       console.log("Error: ", err);
  //       callback(false, err, tempFile);
  //     } else {
  //       console.log("Message sent successfully!");
  //       callback(true, null, tempFile);
  //     }
  //   });
  // }
}

module.exports = MailController;
