module.exports = (sequelize, Sequelize) => {
    const Withdrawal = sequelize.define(
      "withdrawals",
      {
        withdrawal_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        purchase_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "purchases", // Table name for the reference
            key: "purchase_id",
          },
        },
        withdrawal_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        benefit_percentage: {
          type: Sequelize.FLOAT,
          allowNull: false, // Benefit percentage at the withdrawal time
        },
        gold_withdrawn_grams: {
          type: Sequelize.FLOAT,
          allowNull: false, // Gold withdrawn in grams
        },
      },
      {
        timestamps: true, // Automatically manage createdAt and updatedAt
      }
    );
  
    return Withdrawal;
  };
  