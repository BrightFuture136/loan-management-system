const db = require("../models");

const createLoanProduct = async (req, res) => {
  const { amount, interestRate, requiredCollateral, dueDateDays } = req.body;
  try {
    const loanProduct = await db.LoanProduct.create({
      amount,
      interestRate,
      requiredCollateral,
      dueDateDays,
    });
    res.status(201).json({ message: "Loan product created", loanProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoanProducts = async (req, res) => {
  try {
    const loanProducts = await db.LoanProduct.findAll();
    res.json(loanProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLoanProduct = async (req, res) => {
  const { id } = req.params;
  const { amount, interestRate, requiredCollateral, dueDateDays } = req.body;
  try {
    const loanProduct = await db.LoanProduct.findByPk(id);
    if (!loanProduct) {
      return res.status(404).json({ message: "Loan product not found" });
    }
    await loanProduct.update({
      amount,
      interestRate,
      requiredCollateral,
      dueDateDays,
    });
    res.json({ message: "Loan product updated", loanProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLoanProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const loanProduct = await db.LoanProduct.findByPk(id);
    if (!loanProduct) {
      return res.status(404).json({ message: "Loan product not found" });
    }
    await loanProduct.destroy();
    res.json({ message: "Loan product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLoanProduct,
  getLoanProducts,
  updateLoanProduct,
  deleteLoanProduct,
};
