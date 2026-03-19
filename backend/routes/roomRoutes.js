//  backened/routes/roomRoutes.js


// const express = require("express");
// const router = express.Router();
// const roomController = require("../controllers/roomController");

// router.post("/generate", roomController.generateRooms);
// router.post("/", roomController.createRoom);
// router.put("/:id", roomController.updateRoom);

// router.get("/", roomController.getAllRooms);
// router.get("/available", roomController.getAvailableRooms);
// router.put("/status/:id", roomController.updateRoomStatus);
// router.delete("/:id", roomController.deleteRoom);

// module.exports = router;


const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/generate", protect, authorizeRoles("admin"), roomController.generateRooms);
router.put("/:id", protect, authorizeRoles("admin"), roomController.updateRoom);
router.put("/status/:id", protect, authorizeRoles("admin", "staff"), roomController.updateRoomStatus);
router.delete("/:id", protect, authorizeRoles("admin"), roomController.deleteRoom);

router.get("/", protect, authorizeRoles("admin", "staff"), roomController.getAllRooms);
router.get("/available", protect, authorizeRoles("admin", "staff", "customer"), roomController.getAvailableRooms);
router.get("/next-room/:floor", protect, authorizeRoles("admin"), roomController.getNextRoomNumber);

module.exports = router;