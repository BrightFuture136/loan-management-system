const express = require("express");
const router = express.Router();
const casherController = require("../controllers/casherController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/verify-document", authMiddleware(["CASHER"]), casherController.verifyDocument);
router.post("/verify-payment", authMiddleware(["CASHER"]), casherController.verifyPayment);

module.exports = router;