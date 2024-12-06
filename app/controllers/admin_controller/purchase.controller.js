const db = require("../../models");
const Purchase = db.purchases;
const Plan = db.plans;
const BenefitSchedule = db.benefit_schedules; // Reference for validation
const Customer = db.customers;
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

// Add a New Purchase

exports.addPurchase = async (req, res) => {
  try {
    const { customer_id, plan_id, purchase_contract_accepted } = req.body;

    if (!customer_id || !plan_id || purchase_contract_accepted === undefined) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message:
          "All fields are required: customer_id, plan_id, purchase_contract_accepted.",
      });
    }

    // Validate Customer
    const customer = await Customer.findOne({ where: { customer_id } });
    if (!customer) {
      return res.status(StatusCode.NOT_FOUND.code).send({
        ...RESPONSE.Failure,
        Message: "Customer not found.",
      });
    }

    // Validate Plan
    const plan = await Plan.findOne({
      where: { plan_id, delete_status: 0 },
      include: {
        model: BenefitSchedule,
        as: "benefitSchedule", // Use the alias for the BenefitSchedule association
      },
    });

    if (!plan) {
      return res.status(StatusCode.NOT_FOUND.code).send({
        ...RESPONSE.Failure,
        Message: "Plan not found or deleted.",
      });
    }

    // Get data from the plan
    const {
      gold_stake_grams,
      amount_in_usd,
      lock_in_years,
      total_benefit_percentage,
    } = plan;

    const { schedule_name, intervals_per_lock_year } = plan.benefitSchedule;
    // Calculate estimated reap benefit
    const estimatedReapBenefit =
      total_benefit_percentage / intervals_per_lock_year;

    // Create Purchase
    const newPurchase = await Purchase.create({
      customer_id,
      plan_id,
      purchase_date: new Date(),
      gold_stake_grams,
      amount_in_usd,
      lock_in_years,
      total_benefit_percentage,
      estimated_reap_benefit: estimatedReapBenefit,
      purchase_contract_accepted,
      schedule_name,
      intervals_per_lock_year,
    });

    RESPONSE.Success.Message = "Purchase added successfully.";
    RESPONSE.Success.data = newPurchase;
    return res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error adding purchase:", error);
    RESPONSE.Failure.Message = error.message || "Failed to add purchase.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get All Purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { delete_status: 0 }, // Fetch only active purchases
      include: [
        {
          model: Customer,
          as: "customer", // Alias must match the relationship definition
          attributes: ["customer_id", "name", "email"], // Specify the fields you want to retrieve
        },
        {
          model: Plan,
          as: "plan", // Alias must match the relationship definition
          attributes: [
            "plan_id",
            "amount_in_usd",
            "gold_stake_grams",
            "lock_in_years",
            "total_benefit_percentage",
          ],
        },
      ],
      // attributes: [
      //   "purchase_id",
      //   "customer_id",
      //   "plan_id",
      //   "purchase_date",
      //   "gold_stake_grams",
      //   "amount_in_usd",
      //   "lock_in_years",
      //   "total_benefit_percentage",
      //   "estimated_reap_benefit",
      //   "purchase_contract_accepted",
      // ],
      // order: [["purchase_date", "DESC"]], // Optional: Sort by purchase_date
    });

    if (purchases.length === 0) {
      RESPONSE.Failure.Message = "No purchases found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Purchases retrieved successfully.";
    RESPONSE.Success.data = purchases;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch purchases.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get Purchases by Customer ID
exports.getPurchasesByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Validate Customer
    const customer = await Customer.findOne({ where: { customer_id } });
    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Fetch Purchases
    const purchases = await Purchase.findAll({
      where: { customer_id, delete_status: 0 }, // Ensure only active purchases
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["customer_id", "name", "email"], // Include relevant customer fields
        },
        {
          model: Plan,
          as: "plan",
          attributes: [
            "plan_id",
            "amount_in_usd",
            "gold_stake_grams",
            "lock_in_years",
            "total_benefit_percentage",
          ], // Include relevant plan fields
        },
      ],
    });

    // Check if Purchases Exist
    if (!purchases.length) {
      RESPONSE.Failure.Message = "No purchases found for this customer.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Purchases retrieved successfully.";
    RESPONSE.Success.data = purchases;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching purchases by customer ID:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch purchases.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get Purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const { purchase_id } = req.params;

    // Fetch Purchase by ID
    const purchase = await Purchase.findOne({
      where: { purchase_id, delete_status: 0 }, // Ensure the purchase is active
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["customer_id", "name", "email"], // Relevant customer fields
        },
        {
          model: Plan,
          as: "plan",
          attributes: [
            "plan_id",
            "amount_in_usd",
            "gold_stake_grams",
            "lock_in_years",
            "total_benefit_percentage",
          ], // Relevant plan fields
        },
      ],
    });

    if (!purchase) {
      RESPONSE.Failure.Message = "Purchase not found or is deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    RESPONSE.Success.Message = "Purchase retrieved successfully.";
    RESPONSE.Success.data = purchase;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error fetching purchase by ID:", error);
    RESPONSE.Failure.Message = error.message || "Failed to fetch purchase.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Update Purchase
exports.updatePurchase = async (req, res) => {
  try {
    const { purchase_id } = req.params;
    const { purchase_contract_accepted, customer_id, plan_id } = req.body;

    // Validate Purchase
    const purchase = await Purchase.findOne({
      where: { purchase_id, delete_status: 0 },
    });

    if (!purchase) {
      RESPONSE.Failure.Message = "Purchase not found or is deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Validate Customer
    const customer = await Customer.findOne({ where: { customer_id } });
    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Validate Plan
    const plan = await Plan.findOne({ where: { plan_id, delete_status: 0 } });
    if (!plan) {
      RESPONSE.Failure.Message = "Plan not found or deleted.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Update Purchase
    await Purchase.update(
      { purchase_contract_accepted, customer_id, plan_id },
      { where: { purchase_id } }
    );

    RESPONSE.Success.Message = "Purchase updated successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating purchase:", error);
    RESPONSE.Failure.Message = error.message || "Failed to update purchase.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Delete Purchase
exports.deletePurchase = async (req, res) => {
  try {
    const { purchase_id } = req.params;

    // Validate Purchase
    const purchase = await Purchase.findOne({
      where: { purchase_id },
    });

    if (!purchase) {
      RESPONSE.Failure.Message = "Purchase not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    if (purchase.delete_status === 1) {
      RESPONSE.Failure.Message = "Purchase is already deleted.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Soft Delete Purchase
    await Purchase.update(
      { delete_status: 1, deletedAt: new Date() },
      { where: { purchase_id } }
    );

    RESPONSE.Success.Message = "Purchase deleted successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error deleting purchase:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete purchase.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};
