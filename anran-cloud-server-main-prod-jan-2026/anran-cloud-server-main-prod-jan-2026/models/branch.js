const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  branchCode: { type: String, required: true },
  branchName: { type: String, required: true },
  companyName: { type: String, required: false },
  biz_reg_no: { type: String, required: false },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
    required: true,
  },
  branchAddress: { type: String, required: true },
  branchCity: {
    type: String,
  },
  branchPostcode: {
    type: Number,
  },
  branchState: {
    type: String,
  },
  branchContactNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerCode: {
    type: String,
    unique: true,
    required: true,
  },
  accountCode: {
    type: String,
    unique: true,
    required: true,
  },
  googleLink: { type: String, required: false },
  wazeLink: { type: String, required: false },
  operatingStart: { type: String, required: true },
  operatingEnd: { type: String, required: true },
  // whatsappNo: { type: String, required: true },
  // staffName: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
  // paymentKey: { type: String },
  // apiKey: { type: String },
  // taxStatus: { type: Boolean, required: true },
  // taxPercent: { type: Number },
  // branchPercent: { type: Number },
  imageUrl: { type: String },
  imageData: { type: String },
  hqStatus: { type: Boolean, required: true },
  isFranchise: {
    type: Boolean,
    default: false,
  },
  branchOrder: { type: Number, default: 1 },
  branchStatus: { type: Boolean, required: true },
  branchMobilePrefix: { type: String, unique: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

branchSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Soft delete method
branchSchema.methods.softDelete = function () {
  this.deletedAt = Date.now();
  return this.save();
};

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const branchSchema = new Schema({
//   company_name: {
//     type: String,
//     required: true,
//   },
//   branch_name: {
//     type: String,
//     required: true,
//   },
//   branch_code: {
//     type: String,
//     required: true,
//   },
//   whatsappno: {
//     type: String,
//     required: true,
//   },
//   operating_from_hours: {
//     type: Date,
//     required: true,
//     timestamps: true,
//   },
//   operating_to_hours: {
//     type: Date,
//     required: true,
//     timestamps: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },
//   google_link: {
//     type: String,
//     required: false,
//   },
//   waze_link: {
//     type: String,
//     required: false,
//   },
//   staff: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "staff",
//   },
//   image_url: {
//     type: String,
//   },
//   image_data: {
//     type: String,
//   },
//   paymentkey: {
//     type: String,
//   },
//   apikey: {
//     type: String,
//   },
//   hqbanch: {
//     type: Boolean,
//     required: true,
//   },
//   sst: {
//     type: Boolean,
//     required: true,
//   },
//   sst_percent: {
//     type: Number,
//   },
//   ownbranch_percent: {
//     type: Number,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   sortorder: {
//     type: Number,
//     default: 1,
//   },
//   status_active: {
//     type: Boolean,
//     required: true,
//   },
//   francise: {
//     type: Boolean,
//     required: false,
//   },
// });
// module.exports = mongoose.model("branch", branchSchema);
