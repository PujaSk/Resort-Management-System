// backend/routes/facilityRoutes.js

const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const facilityController = require("../controllers/facilityController");


/* PUBLIC ROUTES */

router.get("/", facilityController.getAllFacilities);

router.get("/:id", facilityController.getFacilityById);


/* CREATE FACILITY */

router.post(
  "/",
  upload.array("images", 5),
  facilityController.createFacility
);


/* UPDATE FACILITY */

router.put(
  "/:id",
  upload.array("images", 5),
  facilityController.updateFacility
);


/* DELETE FACILITY */

router.delete(
  "/:id",
  facilityController.deleteFacility
);


module.exports = router;