const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Loan = sequelize.define(
  "LoanProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    interestRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    requiredCollateral: {
      type: DataTypes.ENUM(
        "LAND_TITLE_CERTIFICATE",
        "CAR_OWNERSHIP_DOCUMENT",
        "INCOME_PROOF"
      ),
      allowNull: false,
    },
    dueDateDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "LoanProducts",
  }
);

module.exports = LoanProduct;
