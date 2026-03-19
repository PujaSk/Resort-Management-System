//  backend/models/Room.js


const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: true
  },
  status: {
    type: String,
    enum: ["Available", "Booked", "Occupied", "Cleaning", "Maintenance"],
    default: "Available"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);