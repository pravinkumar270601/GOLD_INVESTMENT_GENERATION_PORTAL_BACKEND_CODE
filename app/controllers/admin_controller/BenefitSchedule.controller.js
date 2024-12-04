const db = require("../../models");
const BenefitSchedule = db.benefit_schedules;
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

// Add a New Benefit Schedule
exports.addBenefitSchedule = async (req, res) => {
  try {
    const { schedule_name, intervals_per_lock_year } = req.body;

    if (!schedule_name || !intervals_per_lock_year) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "Both schedule_name and intervals_per_lock_year are required.",
      });
    }

    const newBenefitSchedule = await BenefitSchedule.create({
      schedule_name,
      intervals_per_lock_year,
    });

    RESPONSE.Success.Message = "Benefit Schedule added successfully.";
    RESPONSE.Success.data = newBenefitSchedule;
    return res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error adding Benefit Schedule:", error);
    RESPONSE.Failure.Message = error.message || "Failed to add Benefit Schedule.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get All Benefit Schedules
exports.getAllBenefitSchedules = async (req, res) => {
  try {
    const benefitSchedules = await BenefitSchedule.findAll({
      where: { delete_status: 0 },
    });

    RESPONSE.Success.Message = "Benefit Schedules retrieved successfully.";
    RESPONSE.Success.data = benefitSchedules;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching Benefit Schedules:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch Benefit Schedules.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get Benefit Schedule by ID
exports.getBenefitScheduleById = async (req, res) => {
  try {
    const { schedule_id } = req.params;

    const benefitSchedule = await BenefitSchedule.findOne({
      where: { schedule_id, delete_status: 0 },
    });

    if (!benefitSchedule) {
      RESPONSE.Failure.Message = "Benefit Schedule not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Benefit Schedule retrieved successfully.";
    RESPONSE.Success.data = benefitSchedule;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching Benefit Schedule by ID:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch Benefit Schedule.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Soft Delete Benefit Schedule
exports.deleteBenefitSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.params;

    const benefitSchedule = await BenefitSchedule.findOne({
      where: { schedule_id },
    });

    if (!benefitSchedule) {
      RESPONSE.Failure.Message = "Benefit Schedule not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    if (benefitSchedule.delete_status === 1) {
      RESPONSE.Failure.Message = "Benefit Schedule is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    await BenefitSchedule.update(
      { delete_status: 1, deletedAt: new Date() },
      { where: { schedule_id } }
    );

    RESPONSE.Success.Message = "Benefit Schedule soft deleted successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error deleting Benefit Schedule:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete Benefit Schedule.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Update Benefit Schedule
exports.updateBenefitSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.params;
    const { schedule_name, intervals_per_lock_year } = req.body;

    const benefitSchedule = await BenefitSchedule.findOne({
      where: { schedule_id, delete_status: 0 },
    });

    if (!benefitSchedule) {
      RESPONSE.Failure.Message = "Benefit Schedule not found or is deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    await BenefitSchedule.update(
      { schedule_name, intervals_per_lock_year },
      { where: { schedule_id } }
    );

    RESPONSE.Success.Message = "Benefit Schedule updated successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating Benefit Schedule:", error);
    RESPONSE.Failure.Message = error.message || "Failed to update Benefit Schedule.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
