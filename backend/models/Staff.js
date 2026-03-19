// backend/models/Staff.js

const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  staff_name: { type: String, required: true },

  birth_date: { type: Date, required: true },

  joining_date: { type: Date, required: true },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: { type: String, required: true },

  phoneno: { type: String },

  designation: {
    type: String,
    enum: ["Manager", "Receptionist", "Housekeeping", "Chef", "Security"],
    required: true
  },

  // ✅ FIX salary (you wrote wrong format)
  salary: { 
    type: Number, 
    required: true 
  },

  // ✅ NEW shift field
  shift: {
    type: String,
    enum: ["Day Shift", "Night Shift", "Rotational Shift"],
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "staff", "customer"],
    default: "staff"
  }

}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);