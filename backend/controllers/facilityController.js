// backend/controllers/facilityController.js

const Facility = require("../models/Facility");


/* ================= CREATE FACILITY ================= */

exports.createFacility = async (req, res) => {
  try {

    const imagePaths = req.files
      ? req.files.map(file => file.path)
      : [];

    const facility = new Facility({
      name: req.body.name,
      description: req.body.description,
      images: imagePaths
    });

    await facility.save();

    res.status(201).json(facility);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ================= GET ALL FACILITIES ================= */

exports.getAllFacilities = async (req, res) => {
  try {

    const facilities = await Facility.find();

    res.json(facilities);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= GET FACILITY BY ID ================= */

exports.getFacilityById = async (req, res) => {
  try {

    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.json(facility);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= UPDATE FACILITY ================= */

exports.updateFacility = async (req, res) => {
  try {

    const imagePaths = req.files
      ? req.files.map(file => file.path)
      : [];

    const updateData = {
      name: req.body.name,
      description: req.body.description
    };

    // Only update images if new uploaded
    if (imagePaths.length > 0) {
      updateData.images = imagePaths;
    }

    const updated = await Facility.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/* ================= DELETE FACILITY ================= */

exports.deleteFacility = async (req, res) => {
  try {

    const deleted = await Facility.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.json({ message: "Facility deleted successfully" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};