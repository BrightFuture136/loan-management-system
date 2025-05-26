const db = require("../models");

const createLoan = async (req, res) => {
  const { loan_application_id, principal, interest, payment_schedule_days } =
    req.body;
  try {
    const loanApplication = await db.LoanApplication.findByPk(
      loan_application_id
    );
    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    const loan = await db.Loan.create({
      user_id: loanApplication.user_id,
      loan_application_id,
      principal,
      interest,
      payment_schedule_days,
      status: "ACTIVE",
    });
    await db.LoanApplication.update(
      { loan_application_status: "APPROVED" },
      { where: { id: loan_application_id } }
    );
    res.status(201).json({ message: "Loan created", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoans = async (req, res) => {
  try {
    let loans;
    if (["ADMIN", "MANAGER"].includes(req.user.role)) {
      loans = await db.Loan.findAll({
        include: [
          { model: db.LoanApplication, include: [db.BorrowerPersonalInfo] },
          { model: db.Payment },
        ],
      });
    } else {
      loans = await db.Loan.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: db.LoanApplication, include: [db.BorrowerPersonalInfo] },
          { model: db.Payment },
        ],
      });
    }
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const transferLoanRequest = async (req, res) => {
  const { loan_application_id } = req.body;
  try {
    const loanApplication = await db.LoanApplication.findByPk(
      loan_application_id,
      {
        include: [
          {
            model: db.BorrowerPersonalInfo,
            include: [db.IncomeProof, db.PersonalIdentificationDocument],
          },
          { model: db.Collateral, include: [db.CollateralDocument] },
        ],
      }
    );
    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    await db.Notification.create({
      user_id: req.user.id, // Manager's ID
      title: "Loan Request Transferred",
      message: `Loan application ${loan_application_id} transferred to casher for document verification.`,
    });
    res.json({ message: "Loan request transferred to casher" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveOrRejectLoan = async (req, res) => {
  const { loan_application_id, status } = req.body;
  try {
    const loanApplication = await db.LoanApplication.findByPk(
      loan_application_id
    );
    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }
    await db.LoanApplication.update(
      { loan_application_status: status },
      { where: { id: loan_application_id } }
    );
    if (status === "APPROVED") {
      const loanProduct = await db.LoanProduct.findOne(); // Simplified: use first product
      await db.Loan.create({
        user_id: loanApplication.user_id,
        loan_application_id,
        principal: loanApplication.loan_amount,
        interest: loanProduct.interestRate,
        payment_schedule_days: loanProduct.dueDateDays,
        status: "ACTIVE",
      });
    }
    await db.Notification.create({
      user_id: loanApplication.user_id,
      title: `Loan Application ${status}`,
      message: `Your loan application has been ${status.toLowerCase()}.`,
    });
    res.json({ message: `Loan application ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentReceipts = async (req, res) => {
  const { user_id } = req.query;
  try {
    const payments = await db.Payment.findAll({
      where: { "$Loan.user_id$": user_id },
      include: [
        { model: db.Loan, include: [{ model: db.User }] },
        { model: db.PaymentReceiptDocument },
      ],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLoan,
  getLoans,
  transferLoanRequest,
  approveOrRejectLoan,
  getPaymentReceipts,
};
