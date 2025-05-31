const db = require("../models");

const createLoanApplication = async (req, res) => {
  const {
    loan_amount,
    loan_purpose,
    repayment_period_days,
    phone_number,
    region,
    zone,
    woreda,
    citizenship,
  } = req.body;
  const userId = req.user.id;

  try {
    const loanApplication = await db.LoanApplication.create({
      user_id: userId,
      loan_amount,
      loan_purpose,
      repayment_period_days,
      loan_application_status: "PENDING",
    });

    await db.BorrowerPersonalInfo.create({
      loan_application_id: loanApplication.id,
      phone_number,
      region,
      zone,
      woreda,
      citizenship,
    });

    res
      .status(201)
      .json({ message: "Loan application submitted", loanApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoanApplications = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let applications;
    if (
      userRole === "ADMIN" ||
      userRole === "MANAGER" ||
      userRole === "BORROWER"
    ) {
      applications = await db.LoanApplication.findAll({
        include: [{ model: db.BorrowerPersonalInfo }],
      });
    } else {
      applications = await db.LoanApplication.findAll({
        where: { user_id: userId },
        include: [{ model: db.BorrowerPersonalInfo }],
      });
    }

    res.json(applications);
    console.log("Loan applications retrieved successfully" + applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error retrieving loan applications: " + error.message);
  }
};

module.exports = { createLoanApplication, getLoanApplications };
