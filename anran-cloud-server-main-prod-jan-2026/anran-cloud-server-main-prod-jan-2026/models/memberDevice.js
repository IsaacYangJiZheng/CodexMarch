const mongoose = require("mongoose");

const memberDeviceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  os: { type: String, required: true },
  active: { type: Boolean, default: false },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  appName: { type: String, required: true },
  packageName: { type: String, required: true },
  version: { type: String, required: true },
  buildNumber: { type: String },
  buildSignature: { type: String },
  installerStore: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

memberDeviceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MemberDevice = mongoose.model("MemberDevice", memberDeviceSchema);

module.exports = MemberDevice;
