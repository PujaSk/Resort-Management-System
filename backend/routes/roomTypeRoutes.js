//  backened/routes/roomTypeRoutes.js


const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const roomTypeController = require("../controllers/roomTypeController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", roomTypeController.getAllRoomTypes);
router.get("/:id", roomTypeController.getRoomTypeById);

// ADMIN ONLY
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.array("images", 5),
  roomTypeController.createRoomType
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.array("images", 5),
  roomTypeController.updateRoomType
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  roomTypeController.deleteRoomType
);

module.exports = router;