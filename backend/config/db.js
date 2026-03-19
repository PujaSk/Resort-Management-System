//mongodb+srv://kinariwalapuja:mirangel@23@cluster0.rizkakj.mongodb.net/Resort

//  backend/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("MongoDB Connection Failed ❌", error);
    process.exit(1);
  }
};

module.exports = connectDB;