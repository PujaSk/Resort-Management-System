//  backend/config/createAdmin.js

const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    const defaultEmail = "royalpalace.care1@gmail.com";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: defaultEmail });

    if (existingAdmin) {
      console.log("Admin Already Exists ✅");
      return;
    }

    // If not exists, create
    const hashedPassword = await bcrypt.hash("admin", 10);

    await Admin.create({
      name: "Admin",
      email: defaultEmail,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Default Admin Created ✅");

  } catch (error) {
    console.error("Admin creation failed ❌", error.message);
  }
};

module.exports = createAdmin;