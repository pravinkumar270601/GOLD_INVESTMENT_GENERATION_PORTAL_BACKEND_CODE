// models/admin.model.js
module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define(
    "admins",
    {
      admin_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      delete_status: {
        // Soft delete field (0 = active, 1 = deleted)
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0, // Default is active (0)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true, // Optional field, initially null
        defaultValue: null,
      },
    },
    {
      timestamps: true, // Automatically manage createdAt and updatedAt
      // tableName: "admins", // Explicit table name to avoid inconsistencies
    }
  );

  return Admin;
};
