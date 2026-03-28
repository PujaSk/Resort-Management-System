// backend/controllers/bookingController.js

const Booking  = require("../models/Booking");
const Room     = require("../models/Room");
const RoomType = require("../models/RoomType");
const Customer = require("../models/Customer");

const sendBookingConfirmation  = require("../utils/sendBookingConfirmation");
const sendBookingCancellation  = require("../utils/sendBookingCancellation");
const sendCheckInEmail         = require("../utils/sendCheckInEmail");
const sendCheckOutEmail        = require("../utils/sendCheckOutEmail");
const sendNoShowEmail          = require("../utils/sendNoShowEmail");
const sendRoomSwitchEmail      = require("../utils/sendRoomSwitchEmail");

/* ─── helpers ─── */
const maskCard = (raw) => {
  if (!raw) return undefined;
  const digits = raw.replace(/\s/g, "");
  return digits.slice(-4);
};

const getUserId = (req) => req.user._id ?? req.user.id;

/* ══════════════════════════════════════════════
   DATE / TIME HELPERS
══════════════════════════════════════════════ */
/** Return YYYY-MM-DD string in LOCAL time (avoids UTC shift) */
const toYMD = (d) => {
  const dt = new Date(d);
  const y  = dt.getFullYear();
  const m  = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Midnight of a date (local) */
const midnightOf = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Today midnight */
const todayMidnight = () => midnightOf(new Date());

/* ══════════════════════════════════════════════
   AUTO NO-SHOW SWEEP

   FIX 1: Changed checkOutDateTime: { $lt: now }
   to     checkOutDateTime: { $lt: todayMidnight() }

   Previously, a booking made today with checkOutDateTime
   set to today (e.g. 2026-03-18T00:00:00) would be swept
   immediately as a No-Show because now > midnight.
   Using todayMidnight() means only bookings whose
   entire checkout date has FULLY passed (i.e. yesterday
   or earlier) get marked — today's bookings are safe.
══════════════════════════════════════════════ */
const autoMarkNoShows = async () => {
  try {
    // ✅ FIX 1: use todayMidnight() not new Date()
    // This prevents same-day bookings being swept as No-Show
    const cutoff = todayMidnight();

    const expired = await Booking.find({
      bookingStatus:    "Booked",
      checkOutDateTime: { $lt: cutoff },   // ← was: { $lt: now }
    }).populate("room").populate("customer").populate("roomType");

    if (!expired.length) return;

    for (const booking of expired) {
      booking.bookingStatus  = "No-Show";
      booking.amountDue      = 0;
      booking.noShowMarkedAt = new Date();
      await booking.save();

      if (booking.room) {
        await Room.findByIdAndUpdate(
          booking.room._id || booking.room,
          { status: "Available" }
        );
      }

      sendNoShowEmail({ booking, customer: booking.customer }).catch(() => {});
    }
  } catch (err) {
    console.error("[autoMarkNoShows] error:", err.message);
  }
};

/* ══════════════════════════════════════════════
   CANCELLATION FEE CALCULATORS
══════════════════════════════════════════════ */
const roomCancellationFee    = (totalAmount) => Math.round(totalAmount * 0.15);
const roomCancellationRefund = (amountPaid, totalAmount) =>
  Math.max(0, amountPaid - roomCancellationFee(totalAmount));

const hallCancellationFee    = (pricePerDay) => Math.round(pricePerDay * 0.25);
const hallCancellationRefund = (amountPaid, pricePerDay) =>
  Math.max(0, amountPaid - hallCancellationFee(pricePerDay));

/* ══════════════════════════════════════════════
   MANUAL NO-SHOW TRIGGER  (admin route)
══════════════════════════════════════════════ */
exports.markNoShows = async (req, res) => {
  try {
    const before = await Booking.countDocuments({ bookingStatus: "No-Show" });
    await autoMarkNoShows();
    const after  = await Booking.countDocuments({ bookingStatus: "No-Show" });
    const count  = Math.max(0, after - before);
    res.json({ message: `${count} new booking(s) marked as No-Show`, count });
  } catch (err) {
    console.error("markNoShows error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   CREATE BOOKING
══════════════════════════════════════════════ */
exports.createBooking = async (req, res) => {
  try {
    const {
      customer,
      roomType: roomTypeId,
      adults,
      children,
      guests,
      checkInDateTime,
      checkOutDateTime,
      amountPaid: rawAmountPaid,
      paymentDetails,
    } = req.body;

    const roomTypeDoc = await RoomType.findById(roomTypeId);
    if (!roomTypeDoc) return res.status(404).json({ message: "Room type not found" });

    const pricePerUnit = roomTypeDoc.price_per_night;

    /* ── HALL BOOKING ── */
    if (paymentDetails?.isNonContiguous && paymentDetails?.hallDates?.length) {
      const hallDates  = [...paymentDetails.hallDates].sort();
      const daysBooked = hallDates.length;
      const totalAmount = daysBooked * pricePerUnit;

      const hallSplitChoice  = paymentDetails?.splitChoice || "full";
      const perDayPaidNow    = hallSplitChoice === "half"
        ? Math.ceil(pricePerUnit / 2)
        : pricePerUnit;
      const perDayDue        = pricePerUnit - perDayPaidNow;
      const hallPayStatus    = perDayDue === 0 ? "Paid" : "Partially Paid";

      const createdBookings = [];

      for (const ymd of hallDates) {
        const [y, mo, d] = ymd.split("-").map(Number);
        const ciDate = new Date(y, mo - 1, d);
        const coDate = new Date(y, mo - 1, d + 1);

        const booking = new Booking({
          customer,
          roomType: roomTypeId,
          adults:   0,
          children: 0,
          guests:   [],
          checkInDateTime:  ciDate,
          checkOutDateTime: coDate,
          totalAmount:  pricePerUnit,
          amountPaid:   perDayPaidNow,
          amountDue:    perDayDue,
          paymentSplit: hallSplitChoice,
          paymentStatus: hallPayStatus,
          paymentDetails: {
            method:          paymentDetails.method,
            splitChoice:     hallSplitChoice,
            cardNumber:      maskCard(paymentDetails.cardNumber),
            cardName:        paymentDetails.cardName,
            expiry:          paymentDetails.expiry,
            upiId:           paymentDetails.upiId,
            hallDates,
            daysBooked,
            isNonContiguous: true,
          },
        });

        await booking.save();
        createdBookings.push(booking);
      }

      try {
        const customerDoc = await Customer.findById(customer);
        await sendBookingConfirmation({
          booking:   createdBookings[0],
          customer:  customerDoc,
          roomType:  roomTypeDoc,
          room:      null,
          isHall:    true,
          hallDates,
        });
      } catch (err) { console.error("EMAIL FAILED:", err.message); }

      return res.status(201).json({
        message:  `${daysBooked} hall booking(s) created successfully`,
        bookings: createdBookings,
      });
    }

    /* ── ROOM BOOKING ── */
    const ci = new Date(checkInDateTime);
    const co = new Date(checkOutDateTime);
    const nights = Math.round((co - ci) / 86400000);
    if (nights <= 0) return res.status(400).json({ message: "Invalid dates" });

    const totalAmount = nights * pricePerUnit;

    const splitChoice   = paymentDetails?.splitChoice || "full";
    const amountPaidNow = Math.round(rawAmountPaid);
    const amountDue     = totalAmount - amountPaidNow;

    const expectedHalf = Math.ceil(totalAmount / 2);
    if (splitChoice === "half" && Math.abs(amountPaidNow - expectedHalf) > 1) {
      return res.status(400).json({ message: "Amount does not match selected payment split" });
    }

    const paymentStatus = amountDue === 0 ? "Paid" : "Partially Paid";

    const allRoomsOfType = await Room.find({ roomType: roomTypeId, isActive: true });
    const overlappingBookings = await Booking.find({
      roomType:      roomTypeId,
      bookingStatus: { $in: ["Booked", "Checked-In"] },
      checkInDateTime:  { $lt: co },
      checkOutDateTime: { $gt: ci },
    }).select("room");
    const occupiedRoomIds = new Set(
      overlappingBookings.map(b => b.room?.toString()).filter(Boolean)
    );
    const availableRoom = allRoomsOfType.find(r => !occupiedRoomIds.has(r._id.toString()));
    if (!availableRoom) {
      return res.status(400).json({ message: "No available rooms of this type at the moment" });
    }

    const booking = new Booking({
      customer,
      room:    availableRoom._id,
      roomType: roomTypeId,
      adults:   adults  || 0,
      children: children || 0,
      guests:   guests  || [],
      checkInDateTime:  ci,
      checkOutDateTime: co,
      totalAmount,
      amountPaid:   amountPaidNow,
      amountDue,
      paymentSplit: splitChoice,
      paymentStatus,
      paymentDetails: {
        method:      paymentDetails.method,
        splitChoice,
        cardNumber:  maskCard(paymentDetails.cardNumber),
        cardName:    paymentDetails.cardName,
        expiry:      paymentDetails.expiry,
        upiId:       paymentDetails.upiId,
      },
    });

    await booking.save();

    try {
      const customerDoc = await Customer.findById(customer);
      await sendBookingConfirmation({
        booking,
        customer:  customerDoc,
        roomType:  roomTypeDoc,
        room:      availableRoom,
        isHall:    false,
      });
    } catch (err) { console.error("EMAIL FAILED:", err.message); }

    res.status(201).json({ message: "Booking created successfully", booking });

  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET ALL BOOKINGS  (admin)
══════════════════════════════════════════════ */
exports.getAllBookings = async (req, res) => {
  try {
    await autoMarkNoShows();

    const bookings = await Booking.find()
      .populate("customer")
      .populate("roomType")
      .populate("room")
      .populate("roomSwitch.fromRoom")
      .populate("roomSwitch.toRoom")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET MY BOOKINGS  (customer)

   FIX 2: Hall date matching now uses toYMD() string
   comparison instead of .toDateString() which was
   timezone-sensitive and caused date mismatches,
   leading to hall bookings not appearing.

   FIX 3: bookingStatus on the hall group now correctly
   reflects mixed states (some cancelled, some active,
   some checked-in) instead of just "Booked" or "Cancelled".
══════════════════════════════════════════════ */
exports.getMyBookings = async (req, res) => {
  try {
    await autoMarkNoShows();

    const userId = getUserId(req);

    const bookings = await Booking.find({ customer: userId })
      .populate("roomType")
      .populate("room")
      .sort({ createdAt: -1 });

    /* Group hall bookings by shared hallDates */
    const hallGroups = {};
    const roomItems  = [];

    for (const b of bookings) {
      if (b.paymentDetails?.isNonContiguous && b.paymentDetails?.hallDates?.length) {
        const key = [...b.paymentDetails.hallDates].sort().join(",");
        if (!hallGroups[key]) hallGroups[key] = [];
        hallGroups[key].push(b);
      } else {
        roomItems.push(b);
      }
    }

    const hallItems = Object.values(hallGroups).map(group => {
      const first    = group[0];
      const allDates = [...first.paymentDetails.hallDates].sort();

      // ✅ FIX 2: use toYMD() for reliable date matching (no timezone issues)
      const hallDatesInfo = allDates.map(ymd => {
        const match = group.find(b => toYMD(b.checkInDateTime) === ymd);  // ← was: .toDateString() comparison
        return {
          ymd,
          bookingId:          match?._id,
          bookingStatus:      match?.bookingStatus      || "Booked",
          cancellationFee:    match?.cancellationFee    || 0,
          cancellationRefund: match?.cancellationRefund || 0,
        };
      });

      // ✅ FIX 3: reflect the real overall status of the event group
      // All cancelled → "Cancelled"
      // Any checked-in → "Checked-In"
      // Any checked-out (and none active) → "Checked-Out"
      // Otherwise → "Booked"
      const statuses = group.map(b => b.bookingStatus);
      let overallStatus = "Booked";
      if (statuses.every(s => s === "Cancelled")) {
        overallStatus = "Cancelled";
      } else if (statuses.some(s => s === "Checked-In")) {
        overallStatus = "Checked-In";
      } else if (statuses.every(s => s === "Checked-Out" || s === "Cancelled")) {
        overallStatus = "Checked-Out";
      }

      return {
        ...first.toObject(),
        _isHallEvent:     true,
        _hallEventDates:  allDates,
        _hallDatesInfo:   hallDatesInfo,
        bookingStatus:    overallStatus,   // ← was: just "Cancelled" or "Booked"
      };
    });

    res.json([...hallItems, ...roomItems]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   CANCEL BOOKING
══════════════════════════════════════════════ */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("roomType")
      .populate("room")
      .populate("customer");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    if (booking.bookingStatus === "Checked-In") {
      return res.status(400).json({ message: "Cannot cancel an active check-in. Please check out instead." });
    }
    if (booking.bookingStatus === "Checked-Out") {
      return res.status(400).json({ message: "Cannot cancel a completed booking." });
    }

    if (req.user.role === "customer") {
      const userId = getUserId(req);
      if (booking.customer._id?.toString() !== userId?.toString() &&
          booking.customer?.toString()      !== userId?.toString()) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }
    }

    const isHall = !!booking.paymentDetails?.isNonContiguous;

    let cancFee    = 0;
    let cancRefund = 0;

    if (isHall) {
      const pricePerDay = booking.roomType?.price_per_night || 0;
      cancFee    = hallCancellationFee(pricePerDay);
      cancRefund = Math.max(0, booking.amountPaid - cancFee);
    } else {
      cancFee    = roomCancellationFee(booking.totalAmount);
      cancRefund = roomCancellationRefund(booking.amountPaid, booking.totalAmount);
    }

    booking.bookingStatus      = "Cancelled";
    booking.cancellationFee    = cancFee;
    booking.cancellationRefund = cancRefund;
    booking.amountDue          = 0;
    booking.cancelledAt        = new Date();
    await booking.save();

    // ADD THIS LINE RIGHT HERE:
console.log("🔍 About to send email to:", booking.customer?.email, "| customer type:", typeof booking.customer);


    if (!isHall && booking.room) {
      await Room.findByIdAndUpdate(booking.room._id || booking.room, { status: "Available" });
    }

    try {
      const customer = booking.customer;
      const roomType = booking.roomType;

      if (isHall) {
        const cancelledYMD = toYMD(booking.checkInDateTime);
        const userId = getUserId(req);
        const siblingBookings = await Booking.find({
          customer:  userId,
          roomType:  roomType._id,
          "paymentDetails.isNonContiguous": true,
          bookingStatus: { $ne: "Cancelled" },
          _id: { $ne: booking._id },
        });
        const remainingDates = siblingBookings.map(b => toYMD(b.checkInDateTime)).sort();

        await sendBookingCancellation({
          booking, customer, roomType, isHall: true,
          cancelledDate: cancelledYMD, remainingDates,
          cancellationFee: cancFee, cancellationRefund: cancRefund,
        });
      } else {
        await sendBookingCancellation({
          booking, customer, roomType, isHall: false,
          cancellationFee: cancFee, cancellationRefund: cancRefund,
        });
      }
      console.log("📧 Cancellation email sent!"); // ADD THIS
    } catch (err) { console.error("EMAIL FAILED:", err.message); }

    res.json({
      message:            "Booking cancelled successfully",
      cancellationFee:    cancFee,
      cancellationRefund: cancRefund,
    });

  } catch (err) {
    console.error("cancelBooking error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   CHECK IN
══════════════════════════════════════════════ */
exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("roomType");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "Booked") {
      return res.status(400).json({
        message: `Cannot check in — booking is ${booking.bookingStatus}`,
      });
    }

    const today   = todayMidnight();
    const ciDate  = midnightOf(booking.checkInDateTime);
    const coDate  = midnightOf(booking.checkOutDateTime);

    const isHallBooking = !!booking.paymentDetails?.isNonContiguous;

    if (isHallBooking) {
      if (today.getTime() !== ciDate.getTime()) {
        const msg = today < ciDate
          ? `Hall check-in only allowed on the event day: ${ciDate.toDateString()}.`
          : `Event date (${ciDate.toDateString()}) has already passed.`;
        return res.status(400).json({ message: msg });
      }
    } else {
      if (today < ciDate) {
        return res.status(400).json({
          message: `Check-in not allowed yet. Check-in date is ${ciDate.toDateString()}.`,
        });
      }
      if (today >= coDate) {
        return res.status(400).json({
          message: "Check-in date has already passed the checkout date.",
        });
      }
    }

    booking.bookingStatus     = "Checked-In";
    booking.actualCheckInTime = new Date();

    // ✅ FIX: hall bookings have no room — guard before updating room status
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room._id || booking.room, { status: "Occupied" });
    }

    const { collectNow, paymentMethod, upiId, cardNumber, cardName, expiry } = req.body || {};

    if (booking.amountDue > 0) {
      if (collectNow) {
        if (!paymentMethod) {
          return res.status(400).json({ message: "Payment method required to collect due amount" });
        }
        const collected = booking.amountDue;
        booking.amountPaid   += collected;
        booking.amountDue     = 0;
        booking.paymentStatus = "Paid";

        booking.checkInPayment = {
          method:      paymentMethod,
          cardNumber:  maskCard(cardNumber),
          cardName,
          expiry,
          upiId,
          amount:      collected,
          collectedAt: new Date(),
        };
      }
    }

    await booking.save();

    try {
      const customerDoc = await Customer.findById(booking.customer);
      const roomTypeDoc = booking.roomType?._id
        ? booking.roomType
        : await RoomType.findById(booking.roomType);

      const collectedNow = !!(req.body?.collectNow && booking.checkInPayment?.amount > 0);
      const amtCollected = collectedNow ? (booking.checkInPayment?.amount || 0) : 0;
      const amtDeferred  = booking.amountDue || 0;

      await sendCheckInEmail({
        booking, customer: customerDoc, roomType: roomTypeDoc,
        isHallBk: isHallBooking,
        collectedNow, amountCollected: amtCollected,
        paymentMethod: collectedNow ? req.body.paymentMethod : null,
        upiId:         collectedNow ? req.body.upiId         : null,
        cardNumber:    collectedNow ? maskCard(req.body.cardNumber) : null,
        amountDeferredToCheckout: amtDeferred,
      });
    } catch (err) { console.error("EMAIL FAILED:", err.message); }

    res.json({ message: "Checked in successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   CHECK OUT
══════════════════════════════════════════════ */
exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("roomType");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "Checked-In") {
      return res.status(400).json({
        message: `Cannot check out — booking is ${booking.bookingStatus}`,
      });
    }

    const { paymentMethod, upiId, cardNumber, cardName, expiry, isEarlyCheckout } = req.body || {};

    const today  = todayMidnight();
    const ciDate = midnightOf(booking.checkInDateTime);
    const coDate = midnightOf(booking.checkOutDateTime);

    const isHallCheckout = !!booking.paymentDetails?.isNonContiguous;
    const originalNights = isHallCheckout
      ? 1
      : Math.max(1, Math.round((coDate - ciDate) / 86400000));
    const stayedNights = isHallCheckout
      ? 1
      : Math.max(1, Math.round((today - ciDate) / 86400000));

    const pricePerNight = booking.roomType?.price_per_night
      || Math.round(booking.totalAmount / originalNights);

    const isExtended = !isHallCheckout && stayedNights > originalNights;
    const isEarly    = !isHallCheckout && isEarlyCheckout && stayedNights < originalNights;

    let finalAmountDue = booking.amountDue;

    if (isExtended) {
      const extraNights  = stayedNights - originalNights;
      const extraCharge  = extraNights * pricePerNight;
      const newTotal     = booking.totalAmount + extraCharge;

      booking.totalAmount = newTotal;
      booking.extendedStay = {
        isExtended:     true,
        originalNights,
        totalNights:    stayedNights,
        extraNights,
        pricePerNight,
        extraCharge,
      };

      finalAmountDue = booking.amountDue + extraCharge;
      booking.amountDue = finalAmountDue;

    } else if (isEarly) {
      const unusedNights      = originalNights - stayedNights;
      const deductionPerNight = Math.round(pricePerNight * 0.10);
      const totalDeduction    = deductionPerNight * unusedNights;
      const newTotal          = stayedNights * pricePerNight + totalDeduction;
      const newTotalWithFee   = newTotal;

      finalAmountDue = Math.max(0, newTotalWithFee - booking.amountPaid);

      booking.totalAmount = newTotalWithFee;
      booking.amountDue   = finalAmountDue;

      booking.earlyCheckout = {
        isEarly:           true,
        originalNights,
        stayedNights,
        unusedNights,
        pricePerNight,
        deductionPerNight,
        totalDeduction,
        refundAmount: Math.max(0, booking.amountPaid - newTotalWithFee),
      };
    }

    if (finalAmountDue > 0) {
      if (!paymentMethod) {
        return res.status(400).json({ message: "Due payment method required before checkout" });
      }
      booking.amountPaid   += finalAmountDue;
      booking.amountDue     = 0;
      booking.paymentStatus = "Paid";

      booking.checkOutPayment = {
        method:      paymentMethod,
        cardNumber:  maskCard(cardNumber),
        cardName,
        expiry,
        upiId,
        amount:      finalAmountDue,
        collectedAt: new Date(),
      };
    } else {
      booking.amountDue     = 0;
      booking.paymentStatus = "Paid";
    }

    booking.bookingStatus      = "Checked-Out";
    booking.actualCheckOutDate = new Date();
    await booking.save();

    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room._id || booking.room, { status: "Cleaning" });
    }

    try {
      const customerDoc  = await Customer.findById(booking.customer);
      const roomTypeDoc  = booking.roomType?._id
        ? booking.roomType
        : await RoomType.findById(booking.roomType);

      const amtCollected = booking.checkOutPayment?.amount || 0;

      await sendCheckOutEmail({
        booking,
        customer:      customerDoc,
        roomType:      roomTypeDoc,
        isHallBk:      isHallCheckout,
        amountCollected:      amtCollected,
        paymentMethod:        amtCollected > 0 ? paymentMethod : null,
        upiId:                amtCollected > 0 ? upiId         : null,
        cardNumber:           amtCollected > 0 ? maskCard(cardNumber) : null,
        isEarlyCheckout:      !!isEarly,
        earlyCheckoutDetails: isEarly ? booking.earlyCheckout : null,
        isExtendedStay:       !!isExtended,
        extendedStayDetails:  isExtended ? booking.extendedStay : null,
      });
    } catch (err) { console.error("EMAIL FAILED:", err.message); }

    res.json({ message: "Checked out successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   SWITCH ROOM
══════════════════════════════════════════════ */
exports.switchRoom = async (req, res) => {
  try {
    const { newRoomId, reason } = req.body;
    if (!newRoomId) return res.status(400).json({ message: "newRoomId is required" });

    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("roomType")
      .populate("customer");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["Booked", "Checked-In"].includes(booking.bookingStatus)) {
      return res.status(400).json({
        message: "Room can only be switched for Booked or Checked-In reservations",
      });
    }

    const newRoom = await Room.findById(newRoomId);
    if (!newRoom) return res.status(404).json({ message: "Target room not found" });
    if (!newRoom.isActive) return res.status(400).json({ message: "Target room is not active" });

    if (newRoom.roomType.toString() !== booking.roomType._id.toString()) {
      return res.status(400).json({ message: "Target room must be of the same room type" });
    }

    const conflict = await Booking.findOne({
      room:          newRoomId,
      bookingStatus: { $in: ["Booked", "Checked-In"] },
      checkInDateTime:  { $lt: booking.checkOutDateTime },
      checkOutDateTime: { $gt: booking.checkInDateTime },
      _id: { $ne: booking._id },
    });
    if (conflict) {
      return res.status(400).json({ message: "Target room is not available for these dates" });
    }

    const oldRoom   = booking.room;
    const oldRoomId = oldRoom?._id || oldRoom;

    if (booking.bookingStatus === "Booked") {
      const currentlyOccupied = await Booking.findOne({
        room:          oldRoomId,
        bookingStatus: "Checked-In",
        _id:           { $ne: booking._id },
      });

      if (!currentlyOccupied) {
        await Room.findByIdAndUpdate(oldRoomId, { status: "Available" });
      }

      await Room.findByIdAndUpdate(newRoomId, { status: "Booked" });

    } else if (booking.bookingStatus === "Checked-In") {
      await Room.findByIdAndUpdate(oldRoomId, { status: "Cleaning" });
      await Room.findByIdAndUpdate(newRoomId, { status: "Occupied" });
    }

    booking.roomSwitch = {
      switchedAt: new Date(),
      fromRoom:   oldRoomId,
      toRoom:     newRoomId,
      reason:     reason || "Requested by management",
      emailSent:  false,
    };
    booking.room = newRoomId;
    await booking.save();

    let emailSent = false;
    try {
      await sendRoomSwitchEmail({
        booking,
        customer:  booking.customer,
        roomType:  booking.roomType,
        oldRoom,
        newRoom,
        reason:    reason || "Requested by management",
      });
      booking.roomSwitch.emailSent = true;
      await booking.save();
      emailSent = true;
    } catch (err) { console.error("EMAIL FAILED:", err.message); }

    const updated = await Booking.findById(booking._id)
      .populate("room")
      .populate("roomType")
      .populate("customer")
      .populate("roomSwitch.fromRoom")
      .populate("roomSwitch.toRoom");

    res.json({
      message:   `Room switched to #${newRoom.room_number} successfully`,
      emailSent,
      booking:   updated,
    });

  } catch (err) {
    console.error("switchRoom error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET AVAILABLE ROOMS FOR SWITCH
══════════════════════════════════════════════ */
exports.getAvailableRoomsForSwitch = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomType");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const ci = booking.checkInDateTime;
    const co = booking.checkOutDateTime;

    const allRooms = await Room.find({
      roomType: booking.roomType._id,
      isActive: true,
      status:   "Available",
      _id: { $ne: booking.room },
    });

    const conflicting = await Booking.find({
      bookingStatus: { $in: ["Booked", "Checked-In"] },
      checkInDateTime:  { $lt: co },
      checkOutDateTime: { $gt: ci },
      _id: { $ne: booking._id },
    }).select("room");

    const conflictSet = new Set(
      conflicting.map(b => b.room?.toString()).filter(Boolean)
    );

    const available = allRooms.filter(r => !conflictSet.has(r._id.toString()));

    res.json({
      availableRooms: available,
      currentRoom:    booking.room,
      roomType:       booking.roomType,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GET BOOKED DATES  (for availability calendar)
══════════════════════════════════════════════ */
exports.getBookedDates = async (req, res) => {
  try {
    const { roomTypeId } = req.params;

    const bookings = await Booking.find({
      roomType:      roomTypeId,
      bookingStatus: { $in: ["Booked", "Checked-In"] },
    });

    const totalRooms = await Room.countDocuments({
      roomType: roomTypeId,
      isActive: true,
    });

    const ranges = bookings.map(b => {
      const hallDates = b.paymentDetails?.hallDates;
      if (hallDates?.length) {
        return { hallDates };
      }
      return {
        checkIn:  toYMD(b.checkInDateTime),
        checkOut: toYMD(b.checkOutDateTime),
      };
    });

    res.json({ ranges, totalRooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   SUBMIT FEEDBACK
══════════════════════════════════════════════ */
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "Checked-Out") {
      return res.status(400).json({ message: "Feedback only allowed after check-out" });
    }
    if (booking.feedback?.rating) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    const userId = getUserId(req);
    if (booking.customer?.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Not authorized to submit feedback for this booking" });
    }

    booking.feedback = { rating, comment, submittedAt: new Date() };
    await booking.save();

    res.json({ message: "Feedback submitted", feedback: booking.feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════
   PUBLIC TESTIMONIALS
══════════════════════════════════════════════ */
exports.getPublicTestimonials = async (req, res) => {
  try {
    const bookings = await Booking.find({
      "feedback.rating": { $exists: true, $gte: 4 },
      bookingStatus: "Checked-Out",
    })
      .populate("customer", "name")
      .select("feedback roomType")
      .populate("roomType", "type_name")
      .sort({ "feedback.submittedAt": -1 })
      .limit(6);

    const testimonials = bookings
      .map(b => ({
        name:   b.customer?.name || "Guest",
        title:  b.roomType?.type_name || "Resort Guest",
        text:   b.feedback.comment,
        rating: b.feedback.rating,
      }))
      .filter(t => t.text?.trim());

    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};