module.exports = (sequelize, Sequelize) => {
  const BorrowerPersonalInfo = sequelize.define(
    "BorrowerPersonalInfo",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      loan_application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      zone: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      woreda: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      citizenship: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "BorrowerPersonalInfo",
    }
  );

  return BorrowerPersonalInfo;
};
