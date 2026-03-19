// backend/models/Facility.js

const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  images: {
    type: [String],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model("Facility", facilitySchema);