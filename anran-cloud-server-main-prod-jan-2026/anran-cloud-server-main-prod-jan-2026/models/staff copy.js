const mongoose = require("mongoose");
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staff_code: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  profileImageUrl: { type: String },
  profileImageData: { type: String },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  roles: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true },
  joingdate: { type: Date, required: true },
  username: { type: String, required: true, unique: true },
  loginkey: { type: String, required: true },
  status_active: { type: Boolean, required: true },
  emailaddress: { type: String },
  position_department: { type: String },
  fullname: { type: String },
  nirc: { type: String },
  religion: { type: String },
  mobilenumber: { type: String },
  martialstatus: { type: String },
  currentaddress: { type: String },
  bankname: { type: String },
  bankaccountnumber: { type: String },
  bankepfno: { type: String },
  banksocsono: { type: String },
  bankincometaxno: { type: String },
  emergency_contactname: { type: String },
  emergency_relation: { type: String },
  emergency_contact: { type: String },
  withdrawDate: { type: Date },
  otherReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
