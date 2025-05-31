  module.exports = (sequelize, Sequelize) => {
    const LoanApplication = sequelize.define(
      "LoanApplication",
      {
        
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        loan_amount: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        loan_purpose: {
          type: Sequelize.STRING(4000),
          allowNull: false,
        },
        repayment_period_days: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        loan_application_status: {
          type: Sequelize.ENUM("APPROVED", "PENDING", "REJECTED"),
          defaultValue: "PENDING",
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        timestamps: false,
        tableName: "LoanApplication",
      }
    );

    return LoanApplication;
  };
