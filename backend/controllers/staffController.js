// backend/controllers/staffController.js

const Staff  = require("../models/Staff");
const bcrypt = require("bcryptjs");
const sendStaffWelcomeEmail = require("../utils/sendStaffWelcomeEmail");

/* ── helpers ── */
const genPassword = () => {
  // e.g. "Rp8$kx2M" — 8 chars, always has upper + lower + digit + symbol
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const symbols = "@#$!";
  const all     = upper + lower + digits + symbols;
  let pass = [
    upper  [Math.floor(Math.random() * upper.length)],
    lower  [Math.floor(Math.random() * lower.length)],
    digits [Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = 0; i < 4; i++)
    pass.push(all[Math.floor(Math.random() * all.length)]);
  // shuffle
  return pass.sort(() => Math.random() - 0.5).join("");
};


// ➕ ADD STAFF (Admin + Manager)
exports.addStaff = async (req, res) => {
  try {
    const {
      staff_name, birth_date, joining_date,
      email, phoneno, designation, salary, shift,
    } = req.body;

    // ── Validation ──
    if (!staff_name?.trim())
      return res.status(400).json({ message: "Full name is required" });
    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: "Enter a valid email address" });
    if (!phoneno?.trim())
      return res.status(400).json({ message: "Phone number is required" });
    if (!/^[6-9]\d{9}$/.test(phoneno.replace(/\s/g, "")))
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number (starts with 6–9)" });
    if (!designation)
      return res.status(400).json({ message: "Designation is required" });
    if (!shift)
      return res.status(400).json({ message: "Shift is required" });
    if (!salary || isNaN(Number(salary)) || Number(salary) < 0)
      return res.status(400).json({ message: "Enter a valid salary amount" });
    if (!birth_date)
      return res.status(400).json({ message: "Birth date is required" });
    if (!joining_date)
      return res.status(400).json({ message: "Joining date is required" });
    if (new Date(joining_date) < new Date(birth_date))
      return res.status(400).json({ message: "Joining date cannot be before birth date" });

    // ── Duplicate check ──
    const existing = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: "A staff member with this email already exists" });

    const existingPhone = await Staff.findOne({ phoneno: phoneno.replace(/\s/g, "") });
    if (existingPhone)
      return res.status(400).json({ message: "A staff member with this phone number already exists" });

    // ── Generate random password ──
    const tempPassword   = genPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newStaff = new Staff({
      staff_name: staff_name.trim(),
      birth_date:   new Date(birth_date),
      joining_date: new Date(joining_date),
      email:        email.toLowerCase().trim(),
      password:     hashedPassword,
      phoneno:      phoneno.replace(/\s/g, ""),
      designation,
      salary:  Number(salary),
      shift,
      role: "staff",
    });

    await newStaff.save();

    // ── Send welcome email with temp password ──
    try {
      await sendStaffWelcomeEmail({ staff: newStaff, tempPassword });
    } catch (emailErr) {
      console.error("Staff welcome email failed:", emailErr.message);
      // Don't block the response — staff is saved, just email failed
    }

    res.status(201).json({
      message: "Staff added successfully — login credentials sent to their email",
      data:    newStaff,
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ message: `${field === "email" ? "Email" : "Phone number"} already exists` });
    }
    res.status(500).json({ message: error.message });
  }
};


// ✏️ UPDATE STAFF (Admin + Manager)
exports.updateStaff = async (req, res) => {
  try {
    const {
      staff_name, birth_date, joining_date,
      email, password, phoneno, designation, salary, shift,
    } = req.body;

    // ── Validation ──
    if (staff_name !== undefined && !staff_name?.trim())
      return res.status(400).json({ message: "Full name cannot be empty" });
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: "Enter a valid email address" });
    if (phoneno !== undefined && !/^[6-9]\d{9}$/.test(phoneno.replace(/\s/g, "")))
      return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number" });
    if (salary !== undefined && (isNaN(Number(salary)) || Number(salary) < 0))
      return res.status(400).json({ message: "Enter a valid salary amount" });
    if (birth_date && joining_date && new Date(joining_date) < new Date(birth_date))
      return res.status(400).json({ message: "Joining date cannot be before birth date" });

    const updateData = {
      ...(staff_name   && { staff_name:    staff_name.trim() }),
      ...(birth_date   && { birth_date:    new Date(birth_date) }),
      ...(joining_date && { joining_date:  new Date(joining_date) }),
      ...(email        && { email:         email.toLowerCase().trim() }),
      ...(phoneno      && { phoneno:       phoneno.replace(/\s/g, "") }),
      ...(designation  && { designation }),
      ...(salary       && { salary:        Number(salary) }),
      ...(shift        && { shift }),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedStaff)
      return res.status(404).json({ message: "Staff not found" });

    res.status(200).json({
      message: "Staff updated successfully",
      data:    updatedStaff,
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ message: `${field === "email" ? "Email" : "Phone number"} already in use` });
    }
    res.status(500).json({ message: error.message });
  }
};


// 👀 GET ALL STAFF
exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔎 GET STAFF BY ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select("-password");
    if (!staff)
      return res.status(404).json({ message: "Staff not found" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Staff not found" });
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET STAFF BY SHIFT
exports.getStaffByShift = async (req, res) => {
  try {
    const staff = await Staff.find({ shift: req.params.shift }).select("-password");
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};