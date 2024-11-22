const db = require("../models");
const Customer = db.customers;
const { Op } = require("sequelize"); // Import Op from sequelize
const OTP = db.otp;
const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");
const bcrypt = require("bcrypt"); // Import bcrypt

exports.checkCustomerExistForRegister = async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Customer.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Customer.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }
    RESPONSE.Success.Message = "Success";
    RESPONSE.Success.data = [];
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("checkCustomerExistForRegister:", error);
    RESPONSE.Failure.Message =
      error.message || "Error checkCustomerExistForRegister manager";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, profileImage,kycPdf } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone ||!kycPdf) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message:
          "Missing required fields. Please provide email, name, phone, and password.",
      });
    }

    const emailExists = await Customer.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Customer.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    const saltRounds = 10; // Adjust salt rounds based on your security needs
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const customer = await Customer.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profileImage,
      kycPdf
    });
    RESPONSE.Success.Message = "Customer registered successfully";
    RESPONSE.Success.data = customer;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(201)
    //   .json({ message: "Customer registered successfully", customer });
  } catch (error) {
    console.error("registerCustomer:", error);
    RESPONSE.Failure.Message = error.message || "Error registering customer";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering customer", error: error.message });
  }
};

// Registration with otp

// exports.registerCustomer = async (req, res) => {
//   try {
//     const { name, email, phone, password, profileImage, otp } = req.body;

//         // Validate required fields
//         if (!email || !password || !name || !phone) {
//           return res.status(StatusCode.BAD_REQUEST.code).send({
//             ...RESPONSE.Failure,
//             Message:
//               "Missing required fields. Please provide email, name, phone, and password.",
//           });
//         }

//     // Check if the email already exists
//     const emailExists = await Customer.findOne({ where: { email, delete_status: 0 } });
//     if (emailExists) {
//       RESPONSE.Success.Message = "Email already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the phone number already exists
//     const phoneExists = await Customer.findOne({ where: { phone, delete_status: 0 } });
//     if (phoneExists) {
//       RESPONSE.Success.Message = "Phone number already exists.";
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Verify OTP
//     const otpData = await OTP.findOne({ where: { email, otp } });

//     if (!otpData) {
//       RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     // Check if the OTP is expired
//     if (otpData.expiresAt < Date.now()) {
//       await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
//       RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
//       RESPONSE.Success.data = {};
//       return res.status(StatusCode.OK.code).send(RESPONSE.Success);
//     }

//     const saltRounds = 10; // Adjust salt rounds based on your security needs
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     // Create the customer if OTP is valid
//     const customer = await Customer.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       profileImage,
//     });

//     // Delete OTP after successful verification
//     await OTP.destroy({ where: { email, otp } });

//     RESPONSE.Success.Message = "Customer registered successfully";
//     RESPONSE.Success.data = customer;
//     res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
//   } catch (error) {
//     console.error("registerCustomer:", error);
//     RESPONSE.Failure.Message = error.message || "Error registering customer";
//     res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
//   }
// };

// Login

exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({
      where: { email, delete_status: 0 },
    });
    if (!customer) {
      RESPONSE.Success.Message = "Customer not found!";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      RESPONSE.Success.Message = "Invalid password.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // return res.status(401).json({ message: "Invalid password." });
    }

    // Remove sensitive data from the response
    const { password: _, ...customerData } = customer.toJSON();

    RESPONSE.Success.Message = "Customer logged in successfully";
    RESPONSE.Success.data = customerData;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res
    //   .status(200)
    //   .json({ message: "Customer logged in successfully", customer });
  } catch (error) {
    console.error("loginCustomer:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in customer.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error logging in customer", error: error.message });
  }
};

// Get customer details by customer_id
exports.getCustomerById = async (req, res) => {
  const customerId = req.params.customer_id; // Get customer_id from request parameters

  try {
    const customer = await Customer.findOne({
      where: { customer_id: customerId,delete_status: 0 },
      // attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Customer not found." });
    }

    RESPONSE.Success.Message = "getCustomerById successfully.";
    RESPONSE.Success.data = customer;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching customer.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching customer." });
  }
};

// Reset Password API Handler (without OTP)
exports.resetPasswordForCustomer = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if the customer with the specified email and delete_status of 0 exists
    const customer = await Customer.findOne({
      where: {
        email,
        delete_status: 0, // Ensure the customer is active
      },
    });

    if (!customer) {
      RESPONSE.Success.Message = "Customer not found! Please sign up.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // RESPONSE.Failure.Message = "Customer not found! Please sign up.";
      // return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds


    // Update the password
    await Customer.update({ password: hashedPassword }, { where: { email } });

    RESPONSE.Success.Message = "Password has been reset successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error resetting Customer password:", error);
    RESPONSE.Failure.Message = error.message || "Failed to reset password.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Soft delete customer by setting delete_status to 1 and updating deletedAt
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.customer_id; // Get customer_id from request parameters

    // Find the customer by ID
    const customer = await Customer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Check if the customer is already soft deleted
    if (customer.delete_status === 1) {
      RESPONSE.Failure.Message = "Customer is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    // Perform soft delete by updating the delete_status and deletedAt fields
    await Customer.update(
      {
        delete_status: 1,
        deletedAt: new Date(), // Set current timestamp as the deleted time
      },
      { where: { customer_id: customerId } }
    );

    RESPONSE.Success.Message = "Customer soft deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in deleting customer:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete customer.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get all customer details
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { delete_status: 0 },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    RESPONSE.Success.Message = "getAllCustomers successfully.";
    RESPONSE.Success.data = customers;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);

    RESPONSE.Failure.Message = error.message || "Error fetching all customers.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching all customers." });
  }
};

// Edit customer information after verifying OTP
exports.editCustomerInfo = async (req, res) => {
  try {
    const customerId = req.params.customer_id; // Get customer_id from request parameters
    const { email, otp, newName, newPhone, newPassword, newProfileImage } =
      req.body;

    // First, check if the new email already exists
    if (newEmail && newEmail !== email) {
      const emailExists = await Customer.findOne({
        where: {
          email: newEmail,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The new email is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // RESPONSE.Failure.Message = "The new email is already in use by another customer.";
        // return res.status(StatusCode.CONFLICT.code).send(RESPONSE.Failure);
      }
    }

    // Next, check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Customer.findOne({
        where: {
          phone: newPhone,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The new phone number is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // RESPONSE.Failure.Message = "The new phone number is already in use by another customer.";
        // return res.status(StatusCode.CONFLICT?.code || 409).send(RESPONSE.Failure);
      }
    }

    // Verify OTP
    const otpData = await OTP.findOne({ where: { email, otp } });

    if (!otpData) {
      RESPONSE.Success.Message = MESSAGE.INVALID_OTP;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the OTP is expired
    if (otpData.expiresAt < Date.now()) {
      await OTP.destroy({ where: { email, otp } }); // Remove expired OTP
      RESPONSE.Success.Message = MESSAGE.OTP_EXPIRED;
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Update customer info
    const customer = await Customer.findOne({
      where: { customer_id: customerId },
    });

    if (!customer) {
      RESPONSE.Failure.Message = "Customer not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    const saltRounds = 10; // Adjust salt rounds based on your security needs
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Prepare the fields to update
    const updatedFields = {
      name: newName || customer.name,
      phone: newPhone || customer.phone,
      email: newEmail || customer.email,
      password: hashedPassword || customer.password,
      profileImage: newProfileImage || customer.profileImage,
    };

    // Update customer using Customer.update()
    await Customer.update(updatedFields, {
      where: { customer_id: customerId },
    });

    // Fetch the updated customer details
    const updatedCustomer = await Customer.findOne({
      where: { customer_id: customerId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Customer information updated successfully.";
    RESPONSE.Success.data = updatedCustomer;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating customer information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update customer information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.checkEmailPhoneAvailabilityForCustomer = async (req, res) => {
  try {
    const customerId = req.params.customer_id; // Get customer_id from request parameters
    const { email, phone } = req.body;

    // Validation: Check if either email or phone is provided
    if (!email && !phone) {
      RESPONSE.Failure.Message = "email or phone number is required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);

      // return res.status(400).json({
      //   success: false,
      //   message: "Either email or phone number is required.",
      // });
    }

    // Check if the new email already exists for another customer
    if (email) {
      const emailExists = await Customer.findOne({
        where: {
          email,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The email is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
        // return res.status(200).json({
        //   success: false,
        //   message: "The email is already in use by another customer.",
        // });
      }
    }

    // Check if the new phone number already exists for another customer
    if (phone) {
      const phoneExists = await Customer.findOne({
        where: {
          phone,
          delete_status: 0,
          customer_id: { [Op.ne]: customerId }, // Exclude current customer by ID
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The phone number is already in use by another customer.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);

      }
    }

    // If no conflicts are found, return success response

    RESPONSE.Success.Message = "Email and phone are available.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);

  } catch (error) {
    console.error("Error checking email and phone availability:", error);

    RESPONSE.Failure.Message =
      error.message || "Failed to check email and phone availability.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);

  }
};


