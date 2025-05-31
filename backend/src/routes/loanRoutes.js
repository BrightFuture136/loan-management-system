const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authMiddleware = require("../middleware/authMiddleware");

// router.post("/", authMiddleware(["ADMIN", "MANAGER","CASHER"]), loanController.createLoan);
router.get("/", authMiddleware(["ADMIN", "MANAGER", "BORROWER","CASHER"]), loanController.getLoans);
router.post("/payments", authMiddleware(["CASHER", "BORROWER", "ADMIN", "MANAGER"]), loanController.createPayment);
router.post("/collateral", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createCollateral);
router.post("/income-proof", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createIncomeProof);
router.post("/identification", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createPersonalIdentification);
router.get("/transactions", authMiddleware(["ADMIN", "MANAGER", "CASHER"]), loanController.getTransactions);
router.get("/reports", authMiddleware(["ADMIN"]), loanController.getReports);

module.exports = router;