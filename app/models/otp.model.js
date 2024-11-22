module.exports = (sequelize, Sequelize) => {
  const OTP = sequelize.define(
    "otp",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [4, 6], // Optional: Restrict OTP length to 4-6 characters
        },
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
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
    },
    {
      timestamps: true, // Automatically manage createdAt and updatedAt
      indexes: [
        {
          unique: false,
          fields: ["email"], // Index for faster queries on the email field
        },
      ],
    }
  );
  return OTP;
};
