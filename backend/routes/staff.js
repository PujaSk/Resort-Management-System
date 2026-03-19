// backend/routes/staff.js

const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ── Admin + Manager (staff): Add / Edit / Delete staff
router.post("/",       protect, authorizeRoles("admin", "staff"), staffController.addStaff);
router.put("/:id",     protect, authorizeRoles("admin", "staff"), staffController.updateStaff);
router.delete("/:id",  protect, authorizeRoles("admin", "staff"), staffController.deleteStaff);

// ── Admin + Manager: View staff list (Manager needs this for Manage Staff page)
router.get("/",              protect, authorizeRoles("admin", "staff"), staffController.getAllStaff);
router.get("/shift/:shift",  protect, authorizeRoles("admin", "staff"), staffController.getStaffByShift);
router.get("/:id",           protect, authorizeRoles("admin", "staff"), staffController.getStaffById);

module.exports = router;