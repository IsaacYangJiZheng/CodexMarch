const mongoose = require("mongoose");

const memberFeedbackSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
  },
  satisfied_rate: { type: Number, required: true },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  consultant_speed_of_response: { type: Number, required: true },
  consultant_knowledge_of_anran_steaming: { type: Number, required: true },
  consultant_ability_to_advice: { type: Number, required: true },
  consultant_ability_to_consult: { type: Number, required: true },
  consultant_communication: { type: Number, required: true },
  consultant_friendliness: { type: Number, required: true },
  consultant_professionalism: { type: Number, required: true },
  staff_speed_of_response: { type: Number, required: true },
  staff_knowledge_of_anran_steaming: { type: Number, required: true },
  staff_communication: { type: Number, required: true },
  staff_friendliness: { type: Number, required: true },
  staff_professionalism: { type: Number, required: true },
  recommend_rate: { type: Number, required: true },
  comments: { type: String },
  contact_request: { type: Boolean, required: true },
  internal_status: { type: Boolean },
  internal_remarks: { type: String },
  internal_summary: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

memberFeedbackSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MemberFeedback = mongoose.model("MemberFeedback", memberFeedbackSchema);

module.exports = MemberFeedback;
