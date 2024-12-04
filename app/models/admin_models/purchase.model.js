module.exports = (sequelize, Sequelize) => {
  const Purchase = sequelize.define(
    "purchases",
    {
      purchase_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      purchase_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      gold_stake_grams: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      amount_in_usd: {
        type: Sequelize.FLOAT,
        allowNull: false, // Derived from Plan
      },
      lock_in_years: {
        type: Sequelize.INTEGER,
        allowNull: false, // Derived from Plan
      },
      total_benefit_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false, // Derived from Plan
      },
      estimated_reap_benefit: {
        type: Sequelize.FLOAT,
        allowNull: false, // Calculated: total_benefit_percentage / intervals_per_lock_year
      },
      purchase_contract_accepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // True if customer has accepted the purchase contract
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

  return Purchase;
};
