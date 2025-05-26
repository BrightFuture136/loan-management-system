const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/change-role",
  authMiddleware(["ADMIN"]),
  adminController.changeUserRole
);

module.exports = router;
