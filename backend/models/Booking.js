// backend/models/Booking.js

const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  age:    { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
}, { _id: false });

/* ─── reusable payment record sub-schema ─── */
const paymentRecordSchema = new mongoose.Schema({
  method:     { type: String }, // "cash" | "credit_card" | "debit_card" | "upi"
  cardNumber: { type: String }, // last 4 digits only
  cardName:   { type: String },
  expiry:     { type: String },
  upiId:      { type: String },
  amount:     { type: Number },
  collectedAt:{ type: Date   },
}, { _id: false });

const bookingSchema = new mongoose.Schema({

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },

  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: true,
  },

  adults:   { type: Number, default: 0 },
  children: { type: Number, default: 0 },
  guests:   { type: [guestSchema], default: [] },

  checkInDateTime:  { type: Date, required: true },
  checkOutDateTime: { type: Date, required: true },

  /* Actual check-in & check-out timestamps — set when guest physically checks in/out */
  actualCheckInTime:  { type: Date },
  actualCheckOutDate: { type: Date },

  bookingStatus: {
    type: String,
    enum: ["Booked", "Checked-In", "Checked-Out", "Cancelled", "No-Show"],
    default: "Booked",
  },

  /* ─────────────────────────────────────────
     TOTAL AMOUNT  — full price of the booking
     (nights × price_per_night  OR  days × hall_price)
  ───────────────────────────────────────── */
  totalAmount: { type: Number, default: 0 },

  /* ─────────────────────────────────────────
     AMOUNT PAID NOW  — what was charged at booking time
     50% split  → Math.ceil(totalAmount / 2)
     Full pay   → totalAmount
     Hall       → always totalAmount
  ───────────────────────────────────────── */
  amountPaid: { type: Number, default: 0 },

  /* ─────────────────────────────────────────
     AMOUNT DUE AT CHECK-IN or CHECK-OUT
     = totalAmount − amountPaid
     0 when fully paid
  ───────────────────────────────────────── */
  amountDue: { type: Number, default: 0 },

  /* ─────────────────────────────────────────
     PAYMENT SPLIT CHOICE  (rooms only)
     "half" → paid 50% now, rest at check-in
     "full" → paid 100% now
  ───────────────────────────────────────── */
  paymentSplit: {
    type: String,
    enum: ["half", "full"],
    default: "full",
  },

  /* ─────────────────────────────────────────
     PAYMENT STATUS
  ───────────────────────────────────────── */
  paymentStatus: {
    type: String,
    enum: ["Paid", "Partially Paid", "Pending"],
    default: "Pending",
  },

  /* ─────────────────────────────────────────
     INITIAL PAYMENT DETAILS  (at booking creation)
  ───────────────────────────────────────── */
  paymentDetails: {
    method:      { type: String },
    splitChoice: { type: String },
    cardNumber:  { type: String }, // last 4 digits only
    cardName:    { type: String },
    expiry:      { type: String },
    upiId:       { type: String },

    /* Hall-specific */
    hallDates:       [String],
    daysBooked:      { type: Number },
    isNonContiguous: { type: Boolean, default: false },
  },

  /* ─────────────────────────────────────────
     CHECK-IN PAYMENT  (if due was collected at check-in)
  ───────────────────────────────────────── */
  checkInPayment: { type: paymentRecordSchema, default: null },

  /* ─────────────────────────────────────────
     CHECK-OUT PAYMENT  (remaining due OR extended stay charge)
  ───────────────────────────────────────── */
  checkOutPayment: { type: paymentRecordSchema, default: null },

  /* ─────────────────────────────────────────
     EXTENDED STAY  (checked out AFTER original checkout date)
     Extra nights × pricePerNight added to bill
  ───────────────────────────────────────── */
  extendedStay: {
    isExtended:       { type: Boolean, default: false },
    originalNights:   { type: Number },
    totalNights:      { type: Number },
    extraNights:      { type: Number },
    pricePerNight:    { type: Number },
    extraCharge:      { type: Number }, // extraNights × pricePerNight
  },

  /* ─────────────────────────────────────────
     EARLY CHECKOUT
  ───────────────────────────────────────── */
  earlyCheckout: {
    isEarly:          { type: Boolean, default: false },
    originalNights:   { type: Number },
    stayedNights:     { type: Number },
    unusedNights:     { type: Number },
    pricePerNight:    { type: Number },
    deductionPerNight:{ type: Number }, // price_per_night × 10%
    totalDeduction:   { type: Number }, // deductionPerNight × unusedNights
    refundAmount:     { type: Number }, // what guest gets back (if overpaid)
  },

  /* ─────────────────────────────────────────
     CANCELLATION
  ───────────────────────────────────────── */
  cancellationFee:    { type: Number, default: 0 },
  cancellationRefund: { type: Number, default: 0 },
  cancelledAt:        { type: Date },

  /* ─────────────────────────────────────────
     NO-SHOW  (checkout date passed, never checked in)
     Amount paid becomes forfeit revenue
  ───────────────────────────────────────── */
  noShowMarkedAt: { type: Date },

  /* ─────────────────────────────────────────
     ROOM SWITCH (if room was swapped before/during stay)
  ───────────────────────────────────────── */
  roomSwitch: {
    switchedAt:   { type: Date },
    fromRoom:     { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    toRoom:       { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    reason:       { type: String },
    emailSent:    { type: Boolean, default: false },
  },

  /* ─────────────────────────────────────────
     FEEDBACK  (room bookings after check-out)
  ───────────────────────────────────────── */
  feedback: {
    rating:      { type: Number, min: 1, max: 5 },
    comment:     { type: String },
    submittedAt: { type: Date },
  },

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);