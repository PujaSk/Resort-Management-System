//  backend/models/Admin.js

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Admin"
  },
  email: {
    type: String,
    default: "royalpalace.care1@gmail.com",
    unique: true
  },
  password: {
    type: String,
    default: "admin"
  },
  role: {
    type: String,
    default: "admin"
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);