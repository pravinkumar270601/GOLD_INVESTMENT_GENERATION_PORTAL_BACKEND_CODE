const { format } = require("date-fns"); // Importing date-fns for formatting

// models/customer.model.js
module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customers", {
      customer_id: {
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
      kycPdf: {
        type: Sequelize.JSON,// Store options as a JSON array
        allowNull: false, // Optional field
      },
      approval_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending", // Default to "pending"
      },
      delete_status: {
        // Soft delete field (0 = active, 1 = deleted)
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
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
    },{
      timestamps: true, // Automatically manage createdAt and updatedAt
      // tableName: "customers", // Explicit table name to avoid inconsistencies
    });
  
    return Customer;
  };
  