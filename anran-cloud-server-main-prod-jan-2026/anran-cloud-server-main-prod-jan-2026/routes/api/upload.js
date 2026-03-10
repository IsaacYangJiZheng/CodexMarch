const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
module.exports = uploads;

//Updated Upload Function
const images_upload = asyncHandler(async (req, res) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: "dbvko8htd",
      api_key: "885224681677386",
      api_secret: "GsSiBCqOrCSYDA97WVZaaVuyFnc",
    });
    const file = req.file;
    const name = `${Date.now()}-${file.originalname}`.replace(/\.[^/.]+$/, "");

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

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

    res.status(201).json(profile_image);
  } catch (error) {
    // console.error(error);
    res.status(500).send("Failed to upload image.");
  }
});

router.post("/upload", uploads.single("file"), images_upload);
module.exports = router;

// const express = require("express");
// const router = express.Router();
// var multer = require("multer");
// // const auth = require('./jwtfilter');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "D:/labs/spa-app/Visualogic/backend/anran-node-express/uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const uploadStorage = multer({ storage: storage });
// router.post("/upload", uploadStorage.single("file"), async (req, res) => {
//   try {
//     if (req.file === undefined) return res.send("you must select a file.");
//     const imgUrl = `localhost:3001/Images/${req.file.filename}`;
//     return res.send(imgUrl);
//   } catch (error) {
//     return res.send("Could not upload file!!!");
//   }
// });
// module.exports = router;
