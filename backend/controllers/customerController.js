// backend/controllers/customerController.js

const Customer     = require("../models/Customer");
const Otp          = require("../models/Otp");
const bcrypt       = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendEmailOtp           = require("../utils/sendEmailOtp");
const sendWalkInWelcomeEmail = require("../utils/sendWalkInWelcomeEmail");

/* ─────────────────────────────────────
   SEND EMAIL OTP  (Public — Registration)
   Blocks if email already registered.
───────────────────────────────────── */
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ message: "Customer already registered. Please login." });

    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const diff = Date.now() - existingOtp.createdAt.getTime();
      if (diff < 60000)
        return res.status(400).json({ message: "Wait 60 seconds before requesting new OTP" });
      await Otp.deleteMany({ email });
    }

    const otp = otpGenerator.generate(6, {
      digits: true, upperCaseAlphabets: false,
      lowerCaseAlphabets: false, specialChars: false,
    });

    await Otp.create({ email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendEmailOtp(email, otp);

    res.status(200).json({ message: "OTP Sent Successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ─────────────────────────────────────
   VERIFY OTP + REGISTER  (Public)
───────────────────────────────────── */
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, phoneno, address, city, otp } = req.body;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ message: "Customer already registered. Please login." });

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired (10 min limit)" });
    }

    if (otpRecord.otp.toString() !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Customer.create({
      name, email, password: hashedPassword,
      phoneno, address, city,
      role: "customer", isEmailVerified: true,
    });

    await Otp.deleteMany({ email });

    res.status(201).json({ message: "Registration Successful" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ─────────────────────────────────────
   UPDATE PROFILE  (Protected — Customer)
   PUT /api/customer/profile
   Allowed fields: name, phoneno, address, city
   Email is read-only.
───────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phoneno, address, city } = req.body;

    if (!name?.trim())    return res.status(400).json({ message: "Name is required" });
    if (!phoneno?.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!city?.trim())    return res.status(400).json({ message: "City is required" });
    if (!address?.trim()) return res.status(400).json({ message: "Address is required" });

    const updated = await Customer.findByIdAndUpdate(
      userId,
      { name: name.trim(), phoneno: phoneno.trim(), address: address.trim(), city: city.trim() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated)
      return res.status(404).json({ message: "Customer not found" });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ─────────────────────────────────────
   ADMIN: SEND OTP  (Admin only)
   POST /api/customer/admin-send-otp
   Unlike public sendOtp, works even if
   the email is already registered —
   returns existingCustomerId if found.
───────────────────────────────────── */
exports.adminSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();

    // Check if customer already exists
    const existing = await Customer.findOne({ email: normalizedEmail });

    // Enforce 60-second cooldown
    const existingOtp = await Otp.findOne({ email: normalizedEmail });
    if (existingOtp) {
      const diff = Date.now() - existingOtp.createdAt.getTime();
      if (diff < 60000)
        return res.status(400).json({ message: "Please wait 60 seconds before requesting a new OTP" });
      await Otp.deleteMany({ email: normalizedEmail });
    }

    const otp = otpGenerator.generate(6, {
      digits: true, upperCaseAlphabets: false,
      lowerCaseAlphabets: false, specialChars: false,
    });

    await Otp.create({
      email:     normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmailOtp(normalizedEmail, otp);

    return res.status(200).json({
      message: existing
        ? "OTP sent — this email already has an account, booking will be linked"
        : "OTP sent successfully",
      existingCustomerId: existing ? existing._id : null,
    });
  } catch (error) {
    console.error("ADMIN SEND OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ─────────────────────────────────────
   ADMIN: VERIFY OTP  (Admin only)
   POST /api/customer/admin-verify-otp
   Only validates the OTP — does not
   register. register-walkin is called
   separately after this succeeds.
───────────────────────────────────── */
exports.adminVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const normalizedEmail = email.toLowerCase().trim();

    const record = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!record)
      return res.status(400).json({ message: "OTP not found. Please request a new one." });

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp.toString() !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });

    // OTP record left intact — register-walkin will clean it up
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("ADMIN VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ─────────────────────────────────────
   ADMIN: REGISTER WALK-IN  (Admin only)
   POST /api/customer/register-walkin
   Called after adminVerifyOtp succeeds.
   If email already exists, returns their
   ID (idempotent — safe for re-runs).
   Validates 10-digit Indian phone and
   enforces phone number uniqueness.
───────────────────────────────────── */
exports.registerWalkin = async (req, res) => {
  try {
    const { name, email, phoneno, city, address } = req.body;

    if (!name?.trim())    return res.status(400).json({ message: "Name is required" });
    if (!email?.trim())   return res.status(400).json({ message: "Email is required" });
    if (!phoneno?.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!city?.trim())    return res.status(400).json({ message: "City is required" });
    if (!address?.trim()) return res.status(400).json({ message: "Address is required" });

    const cleanPhone      = phoneno.replace(/\s/g, "");
    const normalizedEmail = email.toLowerCase().trim();

    // Validate 10-digit Indian mobile number
    if (!/^[6-9]\d{9}$/.test(cleanPhone))
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number" });

    // If customer already exists by email, just link to them
    const byEmail = await Customer.findOne({ email: normalizedEmail });
    if (byEmail) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(200).json({
        message:    "Existing customer linked to booking",
        customerId: byEmail._id,
      });
    }

    // Enforce phone number uniqueness
    const byPhone = await Customer.findOne({ phoneno: cleanPhone });
    if (byPhone)
      return res.status(400).json({ message: "A customer with this mobile number already exists" });

    // Generate a secure temporary password
    const tempPassword   = Math.random().toString(36).slice(-6) + "Rp1!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newCustomer = await Customer.create({
      name:    name.trim(),
      email:   normalizedEmail,
      phoneno: cleanPhone,
      city:    city.trim(),
      address: address.trim(),
      password: hashedPassword,
      role:    "customer",
      isEmailVerified: true, // verified via admin OTP flow
    });

    await Otp.deleteMany({ email: normalizedEmail });

    /* ── Send welcome email with temp password ── */
    try {
      await sendWalkInWelcomeEmail({
        customer: newCustomer,
        tempPassword,
      });
    } catch (_) {}

    return res.status(201).json({
      message:    "Walk-in guest registered successfully",
      customerId: newCustomer._id,
    });

  } catch (error) {
    if (error.code === 11000) {
      // Race condition on duplicate email — return existing safely
      const existing = await Customer.findOne({ email: req.body.email?.toLowerCase().trim() });
      if (existing) return res.status(200).json({ customerId: existing._id });
    }
    console.error("REGISTER WALKIN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ─────────────────────────────────────
   GET ALL CUSTOMERS  (Admin + Staff)
   GET /api/customer
───────────────────────────────────── */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("GET ALL CUSTOMERS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};