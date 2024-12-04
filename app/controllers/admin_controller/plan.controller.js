const db = require("../../models");
const Plan = db.plans;
const BenefitSchedule = db.benefit_schedules; // Reference for validation
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

// Add a New Plan
exports.addPlan = async (req, res) => {
  try {
    const { amount_in_usd, gold_stake_grams, lock_in_years, total_benefit_percentage, benefit_schedule_id } = req.body;

    if (!amount_in_usd || !gold_stake_grams || !lock_in_years || !total_benefit_percentage || !benefit_schedule_id) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "All fields are required: amount_in_usd, gold_stake_grams, lock_in_years, total_benefit_percentage, benefit_schedule_id.",
      });
    }

    // Validate if the benefit_schedule_id exists
    const schedule = await BenefitSchedule.findOne({ where: { schedule_id: benefit_schedule_id, delete_status: 0 } });
    if (!schedule) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "Invalid benefit_schedule_id. The specified benefit schedule does not exist.",
      });
    }

    const newPlan = await Plan.create({
      amount_in_usd,
      gold_stake_grams,
      lock_in_years,
      total_benefit_percentage,
      benefit_schedule_id,
    });

    RESPONSE.Success.Message = "Plan added successfully.";
    RESPONSE.Success.data = newPlan;
    return res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error adding plan:", error);
    RESPONSE.Failure.Message = error.message || "Failed to add plan.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get All Plans
// exports.getAllPlans = async (req, res) => {
//   try {
//     const plans = await Plan.findAll({
//       where: { delete_status: 0 }, // Only fetch active plans
//       include: [
//         {
//           model: BenefitSchedule,
//           as: "benefitSchedule",
//           attributes: ["schedule_id", "schedule_name", "intervals_per_lock_year"], // Include benefit schedule details
//         },
//       ],
//     });

//     RESPONSE.Success.Message = "Plans retrieved successfully.";
//     RESPONSE.Success.data = plans;
//     return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("Error fetching plans:", error);
//     RESPONSE.Failure.Message = error.message || "Failed to fetch plans.";
//     return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

// Get All Plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { delete_status: 0 }, // Only fetch active plans
      include: [
        {
          model: BenefitSchedule,
          as: "benefitSchedule", // Use the alias defined in the model association
          attributes: ["schedule_id", "schedule_name", "intervals_per_lock_year"], // Include benefit schedule details
        },
      ],
    });

    // Calculate estimated_reap_benefit dynamically
    const plansWithReapBenefit = plans.map((plan) => {
      const { total_benefit_percentage } = plan;
      const intervalsPerYear = plan.benefitSchedule?.intervals_per_lock_year || 1;

      // Calculate estimated reap benefit
      const estimated_reap_benefit = total_benefit_percentage / intervalsPerYear;

      // Return the enriched plan object
      return {
        ...plan.toJSON(),
        estimated_reap_benefit,
      };
    });

    RESPONSE.Success.Message = "Plans retrieved successfully.";
    RESPONSE.Success.data = plansWithReapBenefit;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching plans:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch plans.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};



// Get Plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const { plan_id } = req.params;

    const plan = await Plan.findOne({
      where: { plan_id, delete_status: 0 }, // Only fetch if active
      include: [
        {
          model: BenefitSchedule,
          as: "benefitSchedule",
          attributes: ["schedule_id", "schedule_name", "intervals_per_lock_year"], // Include benefit schedule details
        },
      ],
    });

    if (!plan) {
      RESPONSE.Failure.Message = "Plan not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Plan retrieved successfully.";
    RESPONSE.Success.data = plan;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch plan.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};


// Soft Delete Plan
exports.deletePlan = async (req, res) => {
  try {
    const { plan_id } = req.params;

    const plan = await Plan.findOne({
      where: { plan_id },
    });

    if (!plan) {
      RESPONSE.Failure.Message = "Plan not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    if (plan.delete_status === 1) {
      RESPONSE.Failure.Message = "Plan is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    await Plan.update(
      {
        delete_status: 1,
        deletedAt: new Date(),
      },
      { where: { plan_id } }
    );

    RESPONSE.Success.Message = "Plan soft deleted successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error deleting plan:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete plan.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Update Plan
exports.updatePlan = async (req, res) => {
  try {
    const { plan_id } = req.params;
    const { amount_in_usd, gold_stake_grams, lock_in_years, total_benefit_percentage, benefit_schedule_id } = req.body;

    const plan = await Plan.findOne({
      where: { plan_id, delete_status: 0 },
    });

    if (!plan) {
      RESPONSE.Failure.Message = "Plan not found or is deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Validate benefit_schedule_id
    if (benefit_schedule_id) {
      const schedule = await BenefitSchedule.findOne({ where: { schedule_id: benefit_schedule_id, delete_status: 0 } });
      if (!schedule) {
        return res.status(StatusCode.BAD_REQUEST.code).send({
          ...RESPONSE.Failure,
          Message: "Invalid benefit_schedule_id. The specified benefit schedule does not exist.",
        });
      }
    }

    await Plan.update(
      { amount_in_usd, gold_stake_grams, lock_in_years, total_benefit_percentage, benefit_schedule_id },
      { where: { plan_id } }
    );

    RESPONSE.Success.Message = "Plan updated successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating plan:", error);
    RESPONSE.Failure.Message = error.message || "Failed to update plan.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};