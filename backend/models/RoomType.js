//  backend/models/RoomType.js


const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
}, { _id: false });

const roomTypeSchema = new mongoose.Schema({
  type_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: String,
    required: true
  },
  price_per_night: {
    type: Number,
    required: true
  },

  // ✅ NEW FIELD
  beds: {
    type: [bedSchema],
    default: []
  },

  amenities: {
    type: [String],
    default: []
  },

  images: [String],

  description: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("RoomType", roomTypeSchema);