const db = require("../../models");
const Purchase = db.purchases;
const Withdrawal = db.withdrawals;
const { Op } = require("sequelize");
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");


// not applying interval withdrawal logic api

// exports.withdrawGold = async (req, res) => {
//   try {
//     const { purchase_id, withdrawal_date } = req.body;

//     // Validate input
//     if (!purchase_id || !withdrawal_date) {
//       return res.status(StatusCode.BAD_REQUEST.code).send({
//         ...RESPONSE.Failure,
//         Message: "Both purchase_id and withdrawal_date are required.",
//       });
//     }

//     // Validate Purchase
//     const purchase = await Purchase.findOne({
//       where: { purchase_id, status: "active" },
//     });
//     if (!purchase) {
//       return res.status(StatusCode.NOT_FOUND.code).send({
//         ...RESPONSE.Failure,
//         Message: "Active purchase not found.",
//       });
//     }

//     const {
//       purchase_date,
//       intervals_per_lock_year,
//       lock_in_years,
//       total_benefit_percentage,
//       gold_stake_grams,
//       amount_in_usd,
//     } = purchase;

//     // Current gold price (fetch this from an external source or use a fixed value)
//     const currentGoldPrice = 83; // Example: 1 gram of gold = 60 USD, this should be dynamic

//     // Calculate intervals
//     const intervalDurationMonths = Math.floor(
//       (lock_in_years * 12) / intervals_per_lock_year
//     );
//     // console.log(lock_in_years);
//     // console.log(intervals_per_lock_year);
//     // console.log(intervalDurationMonths);

//     // Duration of each interval in months

//     const intervals = [];
//     const purchaseStartDate = new Date(purchase_date);
//     // console.log(purchaseStartDate);

//     for (let i = 1; i <= intervals_per_lock_year; i++) {
//       const intervalDate = new Date(purchaseStartDate);
//       intervalDate.setMonth(
//         purchaseStartDate.getMonth() + intervalDurationMonths * i
//       );
//       intervals.push(intervalDate.toISOString().split("T")[0]); // Format: YYYY-MM-DD
//     }

//     // Debugging: Log generated intervals and withdrawal date
//     console.log("Generated Intervals:", intervals);
//     // console.log("Withdrawal Date Provided:", withdrawal_date);

//     // Validate withdrawal_date against intervals
//     const withdrawalIndex = intervals.findIndex(
//       (date) => date === withdrawal_date
//     );

//     if (withdrawalIndex === -1) {
//       return res.status(StatusCode.BAD_REQUEST.code).send({
//         ...RESPONSE.Failure,
//         Message: "Invalid withdrawal date. Must match an interval date.",
//       });
//     }

//     console.log(withdrawalIndex);

//     // Calculate benefits and gold withdrawn
//     const benefitPercentage =
//       ((withdrawalIndex + 1) * total_benefit_percentage) /
//       intervals_per_lock_year;

//     // Calculate the benefit in USD
//     const benefitInUSD = (benefitPercentage / 100) * amount_in_usd;

//     // Convert benefit in USD to gold
//     const goldWithdrawn = benefitInUSD / currentGoldPrice; // Convert USD to gold using current price

//     // Create a withdrawal entry
//     const withdrawal = await Withdrawal.create({
//       purchase_id,
//       withdrawal_date,
//       benefit_percentage: benefitPercentage,
//       gold_withdrawn_grams: goldWithdrawn,
//     });

//     // Mark purchase as closed
//     await Purchase.update({ status: "closed" }, { where: { purchase_id } });

//     // Response
//     RESPONSE.Success.Message = "Gold withdrawn successfully. Purchase closed.";
//     RESPONSE.Success.data = {
//       withdrawal,
//       intervals,
//       benefitInUSD,  // Include the benefit amount in USD for transparency
//       goldWithdrawn,
//     };
//     return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("Error withdrawing gold:", error);
//     RESPONSE.Failure.Message = error.message || "Failed to withdraw gold.";
//     return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };


// Applying interval withdrawal logic api

function getIntervalIndex(intervals, givenDate) {
  // Convert given date to a Date object
  const givenDateObj = new Date(givenDate);
  
  // Loop through the intervals and find the correct index
  for (let i = 0; i < intervals.length; i++) {
    const intervalStartDate = new Date(intervals[i]);

    // Check if the given date is in the range of the current interval
    // For example, if interval is '2025-06-06', and given date is '2025-06-06', it should match
    if (i === 0 && givenDateObj < intervalStartDate) {
      // Given date is before the first interval, return -1 for no withdrawal
      return -1;
    }

    if (i === intervals.length - 1) {
      // If it's the last interval, return the index regardless of date (after the last interval)
      return i;
    }

    // Check if the given date is between current interval and the next interval
    const nextIntervalStartDate = new Date(intervals[i + 1]);
    if (givenDateObj >= intervalStartDate && givenDateObj < nextIntervalStartDate) {
      return i;
    }
  }

  return -1; // In case something goes wrong
}

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
    const withdrawalIndex = getIntervalIndex(intervals,withdrawal_date)

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



// Get All Withdrawals
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findAll({
      where: { delete_status: 0 }, // Add condition for non-deleted records
    });

    RESPONSE.Success.Message = "Withdrawals retrieved successfully.";
    RESPONSE.Success.data = withdrawals;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching Withdrawals:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch Withdrawals.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


// Get Withdrawal by ID
// Get Withdrawal by ID
exports.getWithdrawalById = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      where: { withdrawal_id, delete_status: 0 },
    });

    if (!withdrawal) {
      RESPONSE.Failure.Message = "Withdrawal not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Withdrawal retrieved successfully.";
    RESPONSE.Success.data = withdrawal;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching Withdrawal by ID:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to fetch Withdrawal.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


// Soft Delete Withdrawal
exports.deleteWithdrawal = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      where: { withdrawal_id },
    });

    if (!withdrawal) {
      RESPONSE.Failure.Message = "Withdrawal not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    if (withdrawal.delete_status === 1) {
      RESPONSE.Failure.Message = "Withdrawal is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    await Withdrawal.update(
      { delete_status: 1, deletedAt: new Date() },
      { where: { withdrawal_id } }
    );

    RESPONSE.Success.Message = "Withdrawal soft deleted successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error deleting Withdrawal:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to delete Withdrawal.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


// Update Withdrawal
exports.updateWithdrawal = async (req, res) => {
  try {
    const { withdrawal_id } = req.params;
    const { withdrawal_date, benefit_percentage, gold_withdrawn_grams } =
      req.body;

    const withdrawal = await Withdrawal.findOne({
      where: { withdrawal_id, delete_status: 0 },
    });

    if (!withdrawal) {
      RESPONSE.Failure.Message = "Withdrawal not found or is deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    await Withdrawal.update(
      { withdrawal_date, benefit_percentage, gold_withdrawn_grams },
      { where: { withdrawal_id } }
    );

    RESPONSE.Success.Message = "Withdrawal updated successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating Withdrawal:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update Withdrawal.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
