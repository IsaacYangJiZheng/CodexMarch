const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const membersSchema = new Schema({
  memberDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "New Member",
  },
  profileImageUrl: {
    type: String,
  },
  memberFullName: {
    type: String,
    required: true,
  },
  legalFullName: {
    type: String,
    required: false,
  },
  preferredName: {
    type: String,
    required: false,
  },
  chineseName: {
    type: String,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  isForeign: {
    type: Boolean,
    required: true,
    default: false,
  },
  foreignMobileNumber: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
  },
  dob: {
    type: Date,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  passport: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  postcode: {
    type: Number,
  },
  states: {
    type: String,
  },
  fullRegister: {
    type: Boolean,
    default: false,
  },
  preferredBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  aboutUs: {
    type: String,
  },
  othersAboutUs: {
    type: String,
  },
  medicalHistory: {
    type: String,
  },
  suffered: {
    type: String,
  },
  healthRelatedIssue: {
    type: String,
  },
  otherHealthRelatedIssue: {
    type: String,
  },
  emergencyName: {
    type: String,
  },
  emergencyMobile: {
    type: String,
  },
  emergencyRelationship: {
    type: String,
  },
  agree: {
    type: Boolean,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  lastPurchaseDate: {
    type: Date,
  },
  lastCheckinDate: {
    type: Date,
  },
  referralCode: {
    type: String,
  },
  packageBalance: {
    type: Number,
  },
  migratedDate: {
    type: Date,
  },
  isMigrated: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("members", membersSchema);
