const db = require("../../models");
const Purchase = db.purchases;
const Withdrawal = db.withdrawals;
const { Op } = require("sequelize");
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

exports.withdrawGold = async (req, res) => {
  try {
    const { purchase_id, withdrawal_date } = req.body;

    // Validate input
    if (!purchase_id || !withdrawal_date) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "Both purchase_id and withdrawal_date are required.",
      });
    }

    // Validate Purchase
    const purchase = await Purchase.findOne({
      where: { purchase_id, status: "active" },
    });
    if (!purchase) {
      return res.status(StatusCode.NOT_FOUND.code).send({
        ...RESPONSE.Failure,
        Message: "Active purchase not found.",
      });
    }

    const {
      purchase_date,
      intervals_per_lock_year,
      lock_in_years,
      total_benefit_percentage,
      gold_stake_grams,
      amount_in_usd,
    } = purchase;

    // Current gold price (fetch this from an external source or use a fixed value)
    const currentGoldPrice = 83; // Example: 1 gram of gold = 60 USD, this should be dynamic

    // Calculate intervals
    const intervalDurationMonths = Math.floor(
      (lock_in_years * 12) / intervals_per_lock_year
    );
    // console.log(lock_in_years);
    // console.log(intervals_per_lock_year);
    // console.log(intervalDurationMonths);

    // Duration of each interval in months

    const intervals = [];
    const purchaseStartDate = new Date(purchase_date);
    // console.log(purchaseStartDate);

    for (let i = 1; i <= intervals_per_lock_year; i++) {
      const intervalDate = new Date(purchaseStartDate);
      intervalDate.setMonth(
        purchaseStartDate.getMonth() + intervalDurationMonths * i
      );
      intervals.push(intervalDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }

    // Debugging: Log generated intervals and withdrawal date
    console.log("Generated Intervals:", intervals);
    // console.log("Withdrawal Date Provided:", withdrawal_date);

    // Validate withdrawal_date against intervals
    const withdrawalIndex = intervals.findIndex(
      (date) => date === withdrawal_date
    );

    if (withdrawalIndex === -1) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "Invalid withdrawal date. Must match an interval date.",
      });
    }

    console.log(withdrawalIndex);

    // Calculate benefits and gold withdrawn
    const benefitPercentage =
      ((withdrawalIndex + 1) * total_benefit_percentage) /
      intervals_per_lock_year;

    // Calculate the benefit in USD
    const benefitInUSD = (benefitPercentage / 100) * amount_in_usd;

    // Convert benefit in USD to gold
    const goldWithdrawn = benefitInUSD / currentGoldPrice; // Convert USD to gold using current price

    // Create a withdrawal entry
    const withdrawal = await Withdrawal.create({
      purchase_id,
      withdrawal_date,
      benefit_percentage: benefitPercentage,
      gold_withdrawn_grams: goldWithdrawn,
    });

    // Mark purchase as closed
    await Purchase.update({ status: "closed" }, { where: { purchase_id } });

    // Response
    RESPONSE.Success.Message = "Gold withdrawn successfully. Purchase closed.";
    RESPONSE.Success.data = {
      withdrawal,
      intervals,
      benefitInUSD,  // Include the benefit amount in USD for transparency
      goldWithdrawn,
    };
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error withdrawing gold:", error);
    RESPONSE.Failure.Message = error.message || "Failed to withdraw gold.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
