module.exports = (sequelize, Sequelize) => {
    const KYC = sequelize.define(
      "kycs",
      {
        kyc_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        kyc_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        country_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "countries",
            key: "country_id", // Foreign key to countries table
          },
          onDelete: "CASCADE", // Delete all KYC details if country is deleted
        },
        delete_status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0, // Soft delete field (0 = active, 1 = deleted)
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
      }
    );
  
    return KYC;
  };
  