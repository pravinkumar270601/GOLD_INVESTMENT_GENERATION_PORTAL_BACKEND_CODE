module.exports = (sequelize, Sequelize) => {
    const BenefitSchedule = sequelize.define(
      "benefit_schedules",
      {
        schedule_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        schedule_name: {
          type: Sequelize.STRING, // Descriptive name (e.g., "Quarterly of Lock Year")
          allowNull: false,
        },
        intervals_per_lock_year: {
          type: Sequelize.INTEGER, // Number of intervals in one lock year
          allowNull: false,
        },
        delete_status: {
          type: Sequelize.TINYINT,
          defaultValue: 0, // Soft delete: 0 = active, 1 = deleted
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
  
    return BenefitSchedule;
  };
  