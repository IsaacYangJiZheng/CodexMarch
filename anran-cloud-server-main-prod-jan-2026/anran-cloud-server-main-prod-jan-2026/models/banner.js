const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  image_url: {
    type: String,
    required: true,
  },
  image_data_url: {
    type: String,
    required: true,
  },
  startdate: {
    type: Date,
  },
  enddate: {
    type: Date,
  },
  publish: {
    type: Boolean,
    required: true,
  },
  always: {
    type: Boolean,
    required: true,
  },
  sortorder: {
    type: Number,
    default: 1,
  },
  sortorder2: {
    type: Number,
    default: 1,
  },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("banner", bannerSchema);
