// backend/controllers/roomController.js

const Room    = require("../models/Room");
const Booking = require("../models/Booking");

// =======================
// BULK GENERATE ROOMS
// =======================
exports.generateRooms = async (req, res) => {
  try {
    const { roomTypeId, floor, startNumber, endNumber } = req.body;

    if (!roomTypeId || !floor || !startNumber || !endNumber) {
      return res.status(400).json({
        message: "Room type, floor, start number and end number required",
      });
    }

    if (endNumber < startNumber) {
      return res.status(400).json({
        message: "End room number must be greater than start room number",
      });
    }

    const roomsToCreate = [];
    for (let num = startNumber; num <= endNumber; num++) {
      roomsToCreate.push({ room_number: num.toString(), floor, roomType: roomTypeId });
    }

    const existingRooms = await Room.find({
      room_number: { $in: roomsToCreate.map(r => r.room_number) },
    });
    if (existingRooms.length > 0) {
      return res.status(400).json({ message: "Some room numbers already exist" });
    }

    await Room.insertMany(roomsToCreate);
    res.status(201).json({ message: `${roomsToCreate.length} rooms generated successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// GET ALL ROOMS  (with live status computed from active bookings)
// The Room.status field can lag — e.g. shows "Available" even when a
// future Booked reservation exists. This corrects it on every read.
//
// Status priority:
//   Occupied    — someone is Checked-In right now
//   Booked      — a future "Booked" reservation exists (checkout in future)
//   Cleaning    — kept as-is (housekeeping owns it)
//   Maintenance — kept as-is
//   Available   — no active booking at all
// =======================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true })
      .populate("roomType")
      .collation({ locale: "en", numericOrdering: true })
      .sort({ room_number: 1 })
      .lean();

    if (!rooms.length) return res.json([]);

    const now     = new Date();
    const roomIds = rooms.map(r => r._id);

    // Single batched query for all active bookings on these rooms
    const activeBookings = await Booking.find({
      room:          { $in: roomIds },
      bookingStatus: { $in: ["Booked", "Checked-In"] },
    }).select("room bookingStatus checkOutDateTime").lean();

    // Build a lookup: roomId -> { hasCheckedIn, hasFutureBooked }
    const lookup = {};
    for (const bk of activeBookings) {
      const id = bk.room?.toString();
      if (!id) continue;
      if (!lookup[id]) lookup[id] = { hasCheckedIn: false, hasFutureBooked: false };

      if (bk.bookingStatus === "Checked-In") {
        lookup[id].hasCheckedIn = true;
      }
      if (bk.bookingStatus === "Booked" && new Date(bk.checkOutDateTime) > now) {
        lookup[id].hasFutureBooked = true;
      }
    }

    // Overlay computed live status on each room
    const result = rooms.map(room => {
      const id   = room._id?.toString();
      const info = lookup[id] || {};
      let liveStatus = room.status;

      if (info.hasCheckedIn) {
        liveStatus = "Occupied";
      } else if (info.hasFutureBooked) {
        liveStatus = "Booked";
      } else if (room.status !== "Cleaning" && room.status !== "Maintenance") {
        liveStatus = "Available";
      }
      // Cleaning / Maintenance stay as-is — staff must clear them manually

      return { ...room, status: liveStatus };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// UPDATE ROOM STATUS
// =======================
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room status updated successfully", room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// UPDATE ROOM
// =======================
exports.updateRoom = async (req, res) => {
  try {
    const { roomTypeId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (roomTypeId) room.roomType = roomTypeId;
    await room.save();
    res.json({ message: "Room updated successfully", room });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =======================
// PERMANENT DELETE
// =======================
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting room" });
  }
};

// =======================
// GET AVAILABLE
// =======================
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: "Available", isActive: true }).populate("roomType");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// GET NEXT ROOM NUMBER
// =======================
exports.getNextRoomNumber = async (req, res) => {
  try {
    const { floor } = req.params;
    const lastRoom = await Room.findOne({ floor, isActive: true }).sort({ room_number: -1 });
    const nextNumber = lastRoom
      ? parseInt(lastRoom.room_number) + 1
      : floor * 1000 + 1;
    res.json({ nextNumber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};