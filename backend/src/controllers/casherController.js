const db = require("../models");

const verifyDocument = async (req, res) => {
  const { document_id, document_type, status } = req.body;
  try {
    let document;
    if (document_type === "COLLATERAL") {
      document = await db.Collateral.findByPk(document_id);
      if (!document)
        return res.status(404).json({ message: "Collateral not found" });
      await document.update({ status });
    } else if (document_type === "INCOME_PROOF") {
      document = await db.IncomeProof.findByPk(document_id);
      if (!document)
        return res.status(404).json({ message: "Income proof not found" });
      await document.update({ status });
    }
    const loanApplication = await db.LoanApplication.findOne({
      where: {
        id: document.loan_application_id || document.borrower_personal_info_id,
      },
    });
    await db.Notification.create({
      user_id: loanApplication.user_id, // Notify manager (simplified)
      title: `${document_type} Verification`,
      message: `${document_type} document ${status.toLowerCase()} for borrower ${
        loanApplication.user_id
      }.`,
    });
    res.json({ message: `${document_type} document ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const { borrower_id, loan_id, amount } = req.body;
  try {
    const loan = await db.Loan.findOne({
      where: { id: loan_id, user_id: borrower_id },
    });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    const payment = await db.Payment.create({
      loan_id,
      amount,
      status: "VERIFIED",
    });
    const receipt = await db.PaymentReceiptDocument.create({
      paymentId: payment.id,
      documentUrl: "placeholder_bank_statement_url",
      documentType: "BANK_PAYMENT_RECEIPT",
      isLocked: true,
    });
    await db.Notification.create({
      user_id: borrower_id,
      title: "Payment Verified",
      message: `Payment of ETB ${amount} for loan ${loan_id} verified.`,
    });
    res.json({ message: "Payment verified", payment, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyDocument,
  verifyPayment,
};
