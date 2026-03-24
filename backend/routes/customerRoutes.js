// backend/routes/customerRoutes.js

const express = require("express");
const router  = express.Router();

const {
  sendOtp,
  verifyOtpAndRegister,
  updateProfile,
  adminSendOtp,
  adminVerifyOtp,
  registerWalkin,
  getAllCustomers,          // ADD THIS
} = require("../controllers/customerController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ── Public: Customer self-registration
router.post("/send-otp",   sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

// ── Protected: Customer updates own profile
router.put("/profile", protect, updateProfile);

// ── Admin + Staff: Walk-in guest OTP + registration
router.post("/admin-send-otp",   protect, authorizeRoles("admin", "staff"), adminSendOtp);
router.post("/admin-verify-otp", protect, authorizeRoles("admin", "staff"), adminVerifyOtp);
router.post("/register-walkin",  protect, authorizeRoles("admin", "staff"), registerWalkin);

// Admin + Staff — list all customers         ← ADD THIS ROUTE
router.get("/", protect, authorizeRoles("admin", "staff"), getAllCustomers)

module.exports = router;