const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./user")(sequelize, Sequelize);
db.UserCredential = require("./userCredential")(sequelize, Sequelize);
db.LoanApplication = require("./loanApplication")(sequelize, Sequelize);
db.BorrowerPersonalInfo = require("./borrowerPersonalInfo")(
  sequelize,
  Sequelize
);
db.VerificationKey = require("./verificationKey")(sequelize, Sequelize);

// Define associations
db.User.hasOne(db.UserCredential, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.UserCredential.belongsTo(db.User, { foreignKey: "user_id" });

db.User.hasMany(db.LoanApplication, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.LoanApplication.belongsTo(db.User, { foreignKey: "user_id" });

db.LoanApplication.hasOne(db.BorrowerPersonalInfo, {
  foreignKey: "loan_application_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.BorrowerPersonalInfo.belongsTo(db.LoanApplication, {
  foreignKey: "loan_application_id",
});

db.User.hasMany(db.VerificationKey, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
db.VerificationKey.belongsTo(db.User, { foreignKey: "user_id" });

module.exports = db;
