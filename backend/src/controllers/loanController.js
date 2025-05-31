const db = require("../models");
const Joi = require("joi");
const logger = require("winston"); // Replace with your logging library or use console

// Standardized response helper
const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  });
};

const createLoan = async (req, res) => {
  const schema = Joi.object({
    loan_application_id: Joi.number().integer().required(),
    principal: Joi.number().positive().required(),
    interest: Joi.number().min(0).required(),
    payment_schedule_days: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn(`Validation error in createLoan: ${error.details[0].message}`);
    return sendResponse(res, 400, error.details[0].message);
  }

  const { loan_application_id, principal, interest, payment_schedule_days } =
    req.body;
  const transaction = await db.sequelize.transaction();
  try {
    const loanApplication = await db.LoanApplication.findByPk(
      loan_application_id,
      { transaction }
    );
    if (!loanApplication) {
      await transaction.rollback();
      logger.warn(`Loan application not found: ${loan_application_id}`);
      return sendResponse(res, 404, "Loan application not found");
    }

    const loan = await db.Loan.create(
      {
        user_id: loanApplication.user_id,
        loan_application_id,
        principal,
        interest,
        payment_schedule_days,
        status: "ACTIVE",
      },
      { transaction }
    );

    await db.LoanApplication.update(
      { loan_application_status: "APPROVED" },
      { where: { id: loan_application_id }, transaction }
    );

    await transaction.commit();
    logger.info(`Loan created for user ${loanApplication.user_id}`, { loan });
    sendResponse(res, 201, "Loan created", { loan });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error creating loan: ${error.message}`, { error });
    sendResponse(res, 500, "Internal server error");
  }
};

/**
 * Retrieves loans based on user role (ADMIN/MANAGER see all, others see own loans).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with list of loans
 */
const getLoans = async (req, res) => {
  if (!req.user) {
    logger.warn("Unauthorized access attempt in getLoans");
    return sendResponse(res, 401, "Unauthorized");
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let loans;
    if (["ADMIN", "MANAGER","CASHER"].includes(req.user.role)) {
      loans = await db.Loan.findAll({
        include: [
          { model: db.LoanApplication, include: [db.BorrowerPersonalInfo] },
          { model: db.PaymentReceiptDocument },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } else {
      loans = await db.Loan.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: db.LoanApplication, include: [db.BorrowerPersonalInfo] },
          { model: db.PaymentReceiptDocument },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    }
    logger.info(`Loans retrieved for user ${req.user.id}`, {
      count: loans.length,
    });
    sendResponse(res, 200, "Loans retrieved successfully", { loans });
  } catch (error) {
    logger.error(`Error retrieving loans: ${error.message}`, { error });
    sendResponse(res, 500, "Internal server error");
  }
};

/**
 * Transfers a loan request to a cashier for document verification.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming transfer
 */
const transferLoanRequest = async (req, res) => {
  if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
    logger.warn("Unauthorized access attempt in transferLoanRequest");
    return sendResponse(res, 403, "Unauthorized");
  }

  const schema = Joi.object({
    loan_application_id: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn(
      `Validation error in transferLoanRequest: ${error.details[0].message}`
    );
    return sendResponse(res, 400, error.details[0].message);
  }

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
      logger.warn(`Loan application not found: ${loan_application_id}`);
      return sendResponse(res, 404, "Loan application not found");
    }

    await db.Notification.create({
      user_id: req.user.id,
      title: "Loan Request Transferred",
      message: `Loan application ${loan_application_id} transferred to cashier for document verification.`,
    });

    logger.info(
      `Loan request ${loan_application_id} transferred by user ${req.user.id}`
    );
    sendResponse(res, 200, "Loan request transferred to cashier");
  } catch (error) {
    logger.error(`Error transferring loan request: ${error.message}`, {
      error,
    });
    sendResponse(res, 500, "Internal server error");
  }
};

/**
 * Approves or rejects a loan application and creates a loan if approved.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming approval/rejection
 */
const approveOrRejectLoan = async (req, res) => {
  if (!req.user || !["ADMIN", "MANAGER"].includes(req.user.role)) {
    logger.warn("Unauthorized access attempt in approveOrRejectLoan");
    return sendResponse(res, 403, "Unauthorized");
  }

  const schema = Joi.object({
    loan_application_id: Joi.number().integer().required(),
    status: Joi.string().valid("APPROVED", "REJECTED").required(),
    loan_product_id: Joi.number().integer().when("status", {
      is: "APPROVED",
      then: Joi.required(),
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn(
      `Validation error in approveOrRejectLoan: ${error.details[0].message}`
    );
    return sendResponse(res, 400, error.details[0].message);
  }

  const { loan_application_id, status, loan_product_id } = req.body;
  const transaction = await db.sequelize.transaction();
  try {
    const loanApplication = await db.LoanApplication.findByPk(
      loan_application_id,
      { transaction }
    );
    if (!loanApplication) {
      await transaction.rollback();
      logger.warn(`Loan application not found: ${loan_application_id}`);
      return sendResponse(res, 404, "Loan application not found");
    }

    await db.LoanApplication.update(
      { loan_application_status: status },
      { where: { id: loan_application_id }, transaction }
    );

    if (status === "APPROVED") {
      const loanProduct = await db.LoanProduct.findByPk(loan_product_id, {
        transaction,
      });
      if (!loanProduct) {
        await transaction.rollback();
        logger.warn(`Loan product not found: ${loan_product_id}`);
        return sendResponse(res, 404, "Loan product not found");
      }

      await db.Loan.create(
        {
          user_id: loanApplication.user_id,
          loan_application_id,
          principal: loanApplication.loan_amount,
          interest: loanProduct.interestRate,
          payment_schedule_days: loanProduct.dueDateDays,
          status: "ACTIVE",
        },
        { transaction }
      );
    }

    await db.Notification.create(
      {
        user_id: loanApplication.user_id,
        title: `Loan Application ${status}`,
        message: `Your loan application has been ${status.toLowerCase()}.`,
      },
      { transaction }
    );

    await transaction.commit();
    logger.info(
      `Loan application ${loan_application_id} ${status.toLowerCase()} by user ${
        req.user.id
      }`
    );
    sendResponse(res, 200, `Loan application ${status.toLowerCase()}`);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error in approveOrRejectLoan: ${error.message}`, { error });
    sendResponse(res, 500, "Internal server error");
  }
};

/**
 * Retrieves payment receipts for a user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment receipts
 */
const getPaymentReceipts = async (req, res) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().required(),
  });

  const { error } = schema.validate(req.query);
  if (error) {
    logger.warn(
      `Validation error in getPaymentReceipts: ${error.details[0].message}`
    );
    return sendResponse(res, 400, error.details[0].message);
  }

  const { user_id } = req.query;
  try {
    const payments = await db.Payment.findAll({
      where: { "$Loan.user_id$": user_id },
      include: [
        { model: db.Loan, include: [{ model: db.User }] },
        { model: db.PaymentReceiptDocument },
      ],
    });

    logger.info(`Payment receipts retrieved for user ${user_id}`, {
      count: payments.length,
    });
    sendResponse(res, 200, "Payment receipts retrieved successfully", {
      payments,
    });
  } catch (error) {
    logger.error(`Error retrieving payment receipts: ${error.message}`, {
      error,
    });
    sendResponse(res, 500, "Internal server error");
  }
};

/**
 * Creates a new payment (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const createPayment = async (req, res) => {
  logger.warn("createPayment endpoint called but not implemented");
  sendResponse(res, 501, "Payment creation not implemented");
};

/**
 * Creates a new collateral (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const createCollateral = async (req, res) => {
  logger.warn("createCollateral endpoint called but not implemented");
  sendResponse(res, 501, "Collateral creation not implemented");
};

/**
 * Creates a new income proof (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const createIncomeProof = async (req, res) => {
  logger.warn("createIncomeProof endpoint called but not implemented");
  sendResponse(res, 501, "Income proof creation not implemented");
};

/**
 * Creates a new personal identification (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const createPersonalIdentification = async (req, res) => {
  logger.warn(
    "createPersonalIdentification endpoint called but not implemented"
  );
  sendResponse(res, 501, "Personal identification creation not implemented");
};

/**
 * Retrieves transactions (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const getTransactions = async (req, res) => {
  logger.warn("getTransactions endpoint called but not implemented");
  sendResponse(res, 501, "Transaction retrieval not implemented");
};

/**
 * Retrieves reports (not implemented).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating not implemented
 */
const getReports = async (req, res) => {
  logger.warn("getReports endpoint called but not implemented");
  sendResponse(res, 501, "Report retrieval not implemented");
};

module.exports = {
  createLoan,
  getLoans,
  transferLoanRequest,
  approveOrRejectLoan,
  getPaymentReceipts,
  createPayment,
  createCollateral,
  createIncomeProof,
  createPersonalIdentification,
  getTransactions,
  getReports,
};
