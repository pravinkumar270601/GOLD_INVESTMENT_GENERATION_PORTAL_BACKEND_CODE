module.exports = (sequelize, Sequelize) => {
    const Country = sequelize.define(
      "countries",
      {
        country_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        country_name: {
          type: Sequelize.STRING,
          allowNull: false,
          // unique: true, // Ensure country names are unique
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
  
    return Country;
  };
  