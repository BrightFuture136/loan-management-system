const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Payment = require("./Payment");

const PaymentReceiptDocument = sequelize.define(
  "PaymentReceiptDocument",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Payment,
        key: "id",
      },
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentType: {
      type: DataTypes.ENUM("MOBILE_PAYMENT_RECEIPT", "BANK_PAYMENT_RECEIPT"),
      allowNull: false,
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "PaymentReceiptDocuments",
  }
);

PaymentReceiptDocument.belongsTo(Payment, { foreignKey: "paymentId" });
Payment.hasMany(PaymentReceiptDocument, { foreignKey: "paymentId" });

module.exports = PaymentReceiptDocument;
