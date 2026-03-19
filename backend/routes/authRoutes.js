// backend/routes/authRoutes.js
// DROP-IN REPLACEMENT — add new profile/change-password routes

const express = require("express");
const router  = express.Router();
const {
  loginUser, getMe,
  forgotPassword, verifyResetOtp, resetPassword,
  updateProfile, changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login",           loginUser);
router.get ("/me",              protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp",verifyResetOtp);
router.post("/reset-password",  resetPassword);

// ── NEW ──
router.put ("/profile",         protect, updateProfile);
router.put ("/change-password", protect, changePassword);

module.exports = router;