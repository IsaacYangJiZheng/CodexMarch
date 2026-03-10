const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  packageName: { type: String, required: true },
  version: { type: String, required: true },
  os: { type: String, required: true },
  status: { type: Boolean, default: true },
  forceUpdate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AppVersion = mongoose.model("AppVersion", appVersionSchema);

module.exports = AppVersion;
