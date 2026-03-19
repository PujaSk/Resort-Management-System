// backend/controllers/roomTypeController.js



const RoomType = require("../models/RoomType");

/* ================= HELPER: CLEAN AMENITIES ================= */

const parseAmenities = (input) => {
  if (!input) return [];

  // If already array
  if (Array.isArray(input)) {
    return input
      .flat()
      .filter(a => typeof a === "string" && a.trim() !== "");
  }

  // If single string
  if (typeof input === "string") {
    return [input];
  }

  // If object (rare FormData case)
  if (typeof input === "object") {
    return Object.values(input)
      .flat()
      .filter(a => typeof a === "string" && a.trim() !== "");
  }

  return [];
};

/* ================= HELPER: PARSE BEDS ================= */

const parseBeds = (input) => {
  if (!input) return [];

  try {
    const parsed = JSON.parse(input);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      bed =>
        bed.type &&
        typeof bed.type === "string" &&
        bed.type.trim() !== "" &&
        Number(bed.count) > 0
    ).map(bed => ({
      type: bed.type.trim(),
      count: Number(bed.count)
    }));

  } catch (error) {
    return [];
  }
};

/* ================= CREATE ROOM TYPE ================= */

exports.createRoomType = async (req, res) => {
  try {

    const beds = parseBeds(req.body.beds);

    const imagePaths = req.files
      ? req.files.map(file => file.path)
      : [];

    const amenities = parseAmenities(req.body.amenities);

    const roomType = new RoomType({
      type_name: req.body.type_name,
      capacity: Number(req.body.capacity),
      price_per_night: Number(req.body.price_per_night),
      description: req.body.description,
      amenities,
      beds, // ✅ NOW BEDS ARE SAVED
      images: imagePaths,
    });

    await roomType.save();

    res.status(201).json(roomType);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL ROOM TYPES ================= */

exports.getAllRoomTypes = async (req, res) => {
  try {
    const roomTypes = await RoomType.find();
    res.json(roomTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE ROOM TYPE ================= */

exports.getRoomTypeById = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    res.json(roomType);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ROOM TYPE ================= */

exports.updateRoomType = async (req, res) => {
  try {

    const beds = parseBeds(req.body.beds);

    const imagePaths = req.files
      ? req.files.map(file => file.path)
      : [];

    const amenities = parseAmenities(req.body.amenities);

    const updateData = {
      type_name: req.body.type_name,
      capacity: Number(req.body.capacity),
      price_per_night: Number(req.body.price_per_night),
      description: req.body.description,
      amenities,
      beds // ✅ UPDATE BEDS ALSO
    };

    // Only update images if new images uploaded
    if (imagePaths.length > 0) {
      updateData.images = imagePaths;
    }

    const updated = await RoomType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Room type not found" });
    }

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE ROOM TYPE ================= */

exports.deleteRoomType = async (req, res) => {
  try {

    const deleted = await RoomType.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Room type not found" });
    }

    res.json({ message: "Room type deleted successfully" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};