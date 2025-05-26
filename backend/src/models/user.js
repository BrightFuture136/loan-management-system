module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      google_user_id: {
        type: Sequelize.STRING(256),
      },
      gender: {
        type: Sequelize.STRING(255),
        defaultValue: "Unknown",
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
        defaultValue: "INACTIVE",
      },
      role: {
        type: Sequelize.ENUM("ADMIN", "BORROWER", "MANAGER", "CASHER"),
        defaultValue: "BORROWER",
      },
      date_of_birth: {
        type: Sequelize.DATE,
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
      tableName: "User",
    }
  );

  return User;
};
