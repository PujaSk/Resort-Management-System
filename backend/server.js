// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");
const createAdmin = require("./config/createAdmin");
const staffRoutes = require("./routes/staff");
const roomTypeRoutes = require("./routes/roomTypeRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const facilityRoutes = require("./routes/facilityRoutes");



const app = express();

// // Just for checking the Routes areworking or not..
// console.log("customerRoutes:", typeof customerRoutes);
// console.log("authRoutes:", typeof authRoutes);
// console.log("staffRoutes:", typeof staffRoutes);
// console.log("roomTypeRoutes:", typeof roomTypeRoutes);
// console.log("roomRoutes:", typeof roomRoutes);
// console.log("bookingRoutes:", typeof bookingRoutes);

app.use(cors());
app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/facilities", facilityRoutes);


app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// Start Server ONLY after DB connects
const startServer = async () => {
  try {
    await connectDB();        // connect MongoDB
    await createAdmin();      // create default admin

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });

  } catch (error) {
    console.log("Server Start Failed ❌", error);
  }
};

startServer();