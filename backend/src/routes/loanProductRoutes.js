const express = require("express");
const router = express.Router();
const loanProductController = require("../controllers/loanProductController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware(["MANAGER"]),
  loanProductController.createLoanProduct
);
router.get(
  "/",
  authMiddleware(["MANAGER"]),
  loanProductController.getLoanProducts
);
router.put(
  "/:id",
  authMiddleware(["MANAGER"]),
  loanProductController.updateLoanProduct
);
router.delete(
  "/:id",
  authMiddleware(["MANAGER"]),
  loanProductController.deleteLoanProduct
);

module.exports = router;
