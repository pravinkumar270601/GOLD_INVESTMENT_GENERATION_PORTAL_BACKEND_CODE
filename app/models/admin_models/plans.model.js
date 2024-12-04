module.exports = (sequelize, Sequelize) => {
  const Plan = sequelize.define(
    "plans",
    {
      plan_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      amount_in_usd: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      gold_stake_grams: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      lock_in_years: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_benefit_percentage: {
        type: Sequelize.FLOAT, // Total benefit percentage over the lock-in period
        allowNull: false,
      },
      benefit_schedule_id: {
        type: Sequelize.INTEGER, // percentage
        allowNull: false,
        references: {
          model: "benefit_schedules", // Table name for the reference
          key: "schedule_id",
        },
        onUpdate: "CASCADE", // Update behavior
        onDelete: "CASCADE", // Delete behavior
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

  return Plan;
};
