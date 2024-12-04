const db = require("../../models");
const Purchase = db.purchases;
const Plan = db.plans;
const Customer = db.customers;
const RESPONSE = require("../../constants/response");
const { StatusCode } = require("../../constants/HttpStatusCode");

// Add a New Purchase
exports.addPurchase = async (req, res) => {
  try {
    const { customer_id, plan_id, purchase_amount } = req.body;

    if (!customer_id || !plan_id || !purchase_amount) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message: "All fields are required: customer_id, plan_id, purchase_amount.",
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
    const plan = await Plan.findOne({ where: { plan_id, delete_status: 0 } });
    if (!plan) {
      return res.status(StatusCode.NOT_FOUND.code).send({
        ...RESPONSE.Failure,
        Message: "Plan not found or deleted.",
      });
    }

    // Create Purchase
    const newPurchase = await Purchase.create({
      customer_id,
      plan_id,
      purchase_amount,
      purchase_date: new Date(),
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
      include: [
        { model: Customer, as: "customer" },
        { model: Plan, as: "plan" },
      ],
    });

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

    const purchases = await Purchase.findAll({
      where: { customer_id },
      include: [
        { model: Customer, as: "customer" },
        { model: Plan, as: "plan" },
      ],
    });

    if (purchases.length === 0) {
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

// Get Purchase by Purchase ID
exports.getPurchaseById = async (req, res) => {
  try {
    const { purchase_id } = req.params;

    const purchase = await Purchase.findOne({
      where: { purchase_id },
      include: [
        { model: Customer, as: "customer" },
        { model: Plan, as: "plan" },
      ],
    });

    if (!purchase) {
      RESPONSE.Failure.Message = "Purchase not found.";
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
