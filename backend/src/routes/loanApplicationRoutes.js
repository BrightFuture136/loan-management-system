const express = require("express");
const router = express.Router();
const loanApplicationController = require("../controllers/loanApplicationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  loanApplicationController.createLoanApplication
);
router.get(
  "/",
  authMiddleware(["ADMIN", "MANAGER", "BORROWER"]),
  loanApplicationController.getLoanApplications
);

module.exports = router;
