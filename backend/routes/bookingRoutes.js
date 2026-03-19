// backend/routes/bookingRoutes.js

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/bookingController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/* ── Public ────────────────────────────────────────────────────────────────── */
router.get("/booked-dates/:roomTypeId",     ctrl.getBookedDates);
router.get("/testimonials/public",          ctrl.getPublicTestimonials);

/* ── Customer only ─────────────────────────────────────────────────────────── */
router.get( "/mine",          protect, authorizeRoles("customer"),                   ctrl.getMyBookings);
router.post("/:id/feedback",  protect, authorizeRoles("customer"),                   ctrl.submitFeedback);

/* ── Create booking: all roles ─────────────────────────────────────────────── */
router.post("/",              protect, authorizeRoles("admin", "staff", "customer"), ctrl.createBooking);

/* ── Cancel: all roles ─────────────────────────────────────────────────────── */
router.put("/cancel/:id",     protect, authorizeRoles("admin", "staff", "customer"), ctrl.cancelBooking);

/* ── Admin + Staff only ────────────────────────────────────────────────────── */
router.get( "/",              protect, authorizeRoles("admin", "staff"),             ctrl.getAllBookings);
router.put( "/checkin/:id",   protect, authorizeRoles("admin", "staff"),             ctrl.checkIn);
router.put( "/checkout/:id",  protect, authorizeRoles("admin", "staff"),             ctrl.checkOut);

/* ── Room switch ────────────────────────────────────────────────────────────── */
router.get( "/:id/available-rooms-for-switch",
            protect, authorizeRoles("admin", "staff"),
            ctrl.getAvailableRoomsForSwitch);
router.put( "/:id/switch-room",
            protect, authorizeRoles("admin", "staff"),
            ctrl.switchRoom);

/* ── No-show (admin trigger or cron job) ────────────────────────────────────── */
router.post("/admin/mark-no-shows",
            protect, authorizeRoles("admin", "staff"),
            ctrl.markNoShows);

module.exports = router;