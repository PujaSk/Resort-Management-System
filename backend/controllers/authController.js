// backend/controllers/authController.js

const Admin    = require("../models/Admin");
const Customer = require("../models/Customer");
const Staff    = require("../models/Staff");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const Otp          = require("../models/Otp");
const sendEmailOtp             = require("../utils/sendEmailOtp");
const sendPasswordChangedEmail = require("../utils/sendPasswordChangedEmail");


/* ==========================================
   🔐 Generate JWT Token
========================================== */
const generateToken = (payload) => {
  return jwt.sign(
    { id: payload._id, role: payload.role, email: payload.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};


/* ==========================================
   🔐 LOGIN (Admin + Staff + Customer)
========================================== */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    /* ── 1. Admin ── */
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

      // admin.role comes from DB — safe to use directly
      const token = generateToken({ _id: admin._id, role: admin.role || "admin", email: admin.email });
      return res.status(200).json({
        message: "Login Successful", token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role || "admin" },
      });
    }

    /* ── 2. Staff ── */
    const staff = await Staff.findOne({ email });
    if (staff) {
      const isMatch = await bcrypt.compare(password, staff.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

      // ALWAYS hardcode role: "staff" so old DB docs without role field still work
      const token = generateToken({ _id: staff._id, role: "staff", email: staff.email });
      return res.status(200).json({
        message: "Login Successful", token,
        user: {
          id:          staff._id,
          name:        staff.staff_name,
          staff_name:  staff.staff_name,
          email:       staff.email,
          role:        "staff",           // ← always hardcoded, never from DB
          designation: staff.designation,
          shift:       staff.shift,
        },
      });
    }

    /* ── 3. Customer ── */
    const customer = await Customer.findOne({ email });
    if (customer) {
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

      const token = generateToken({ _id: customer._id, role: customer.role || "customer", email: customer.email });
      return res.status(200).json({
        message: "Login Successful", token,
        user: { id: customer._id, name: customer.name, email: customer.email, role: customer.role || "customer" },
      });
    }

    return res.status(400).json({ message: "User Not Found" });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ==========================================
   🔐 GET CURRENT USER (Admin + Staff + Customer)
========================================== */
exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    /* ── Admin ── */
    if (role === "admin") {
      const user = await Admin.findById(id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(user);
    }

    /* ── Staff ── */
    if (role === "staff") {
      const user = await Staff.findById(id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json({
        _id:         user._id,
        id:          user._id,
        name:        user.staff_name,
        staff_name:  user.staff_name,
        email:       user.email,
        role:        "staff",             // ← always hardcoded
        designation: user.designation,
        shift:       user.shift,
        phoneno:     user.phoneno,
      });
    }

    /* ── Customer ── */
    const user = await Customer.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);

  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ==========================================
   🔐 FORGOT PASSWORD - SEND OTP
========================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user =
      await Admin.findOne({ email })    ||
      await Staff.findOne({ email })    ||
      await Customer.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Email not registered" });

    await Otp.deleteMany({ email });

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });
    await sendEmailOtp(email, otp);

    res.status(200).json({ message: "Reset OTP sent to email" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ==========================================
   🔐 VERIFY RESET OTP
========================================== */
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    if (otpRecord.otp.toString() !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    res.status(200).json({ message: "OTP verified" });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ==========================================
   🔐 RESET PASSWORD
========================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user =
      await Admin.findOne({ email })    ||
      await Staff.findOne({ email })    ||
      await Customer.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ email });

    // Send security notification email (non-blocking)
    const displayName = user.name || user.staff_name || "User";
    sendPasswordChangedEmail(email, displayName, "reset").catch(err =>
      console.error("Password-reset email failed:", err)
    );

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ==========================================
   ✏️ UPDATE PROFILE (name/phone)
   PUT /api/auth/profile
========================================== */
exports.updateProfile = async (req, res) => {
  try {
    const { name, staff_name, phoneno } = req.body;
    const { id, role } = req.user;

    let user;
    if (role === "admin") {
      user = await Admin.findById(id);
      if (name?.trim()) user.name = name.trim();
    } else if (role === "staff") {
      user = await Staff.findById(id);
      if (staff_name?.trim()) user.staff_name = staff_name.trim();
    } else {
      return res.status(403).json({ message: "Profile update not supported for this role" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    if (phoneno?.trim()) user.phoneno = phoneno.trim();

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   🔒 CHANGE PASSWORD (with current password)
   PUT /api/auth/change-password
========================================== */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id, role } = req.user;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    let user;
    if      (role === "admin")    user = await Admin.findById(id);
    else if (role === "staff")    user = await Staff.findById(id);
    else if (role === "customer") user = await Customer.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Send security notification email (non-blocking)
    const displayName = user.name || user.staff_name || "User";
    sendPasswordChangedEmail(user.email, displayName, "changed").catch(err =>
      console.error("Password-changed email failed:", err)
    );

    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};