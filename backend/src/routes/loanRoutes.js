const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/loans", authMiddleware(["ADMIN", "MANAGER"]), loanController.createLoan);
router.get("/loans", authMiddleware(["ADMIN", "MANAGER", "BORROWER"]), loanController.getLoans);
router.post("/payments", authMiddleware(["CASHER", "BORROWER", "ADMIN", "MANAGER"]), loanController.createPayment);
router.post("/collateral", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createCollateral);
router.post("/income-proof", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createIncomeProof);
router.post("/identification", authMiddleware(["BORROWER", "ADMIN", "MANAGER"]), loanController.createPersonalIdentification);
router.get("/transactions", authMiddleware(["ADMIN", "MANAGER", "BORROWER", "CASHER"]), loanController.getTransactions);
router.get("/reports", authMiddleware(["ADMIN"]), loanController.getReports);

module.exports = router;