require("dotenv").config();
const express = require("express");
const cors = require("cors");

const path = require("path");
const app = express();
// Define the CORS options
const corsOptions = {
  credentials: true,
  origin: true, // Whitelist the domains you want to allow
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS",
};
app.use(cors(corsOptions)); // Use the cors middleware with your options
// app.use(cors());
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected successfully");
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/images", express.static(process.env.FILE_STORAGE_URL));
app.use(require("./routes"));
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});
module.exports = app;
