module.exports = (sequelize, Sequelize) => {
  const UserCredential = sequelize.define(
    "UserCredential",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pass_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: false,
      tableName: "UserCredential",
    }
  );

  return UserCredential;
};
