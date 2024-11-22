const db = require("../models");
const Admin = db.admins;
const { Op } = require("sequelize"); // Import Op from sequelize
const OTP = db.otp;

const RESPONSE = require("../constants/response");
const { MESSAGE } = require("../constants/message");
const { StatusCode } = require("../constants/HttpStatusCode");

// Function to create default admins from only controller
// exports.createDefaultAdmins = async () => {
//   try {
//     // Define default admins
//     const defaultAdmins = [
//       {
//         name: "Default Admin",
//         email: "admin@gorex.in",
//         phone: "1234567890",
//         password: "1234", // Default password
//       },
//       {
//         name: "Backup Admin",
//         email: "backupadmin@gorex.in",
//         phone: "0987654321",
//         password: "1234", // Another default password
//       },
//     ];

//     for (const adminData of defaultAdmins) {
//       // Check if email already exists
//       const emailExists = await Admin.findOne({
//         where: { email: adminData.email, delete_status: 0 },
//       });
//       if (emailExists) {
//         console.log(`Admin with email ${adminData.email} already exists.`);
//         continue; // Skip to the next admin
//       }

//       // Check if phone number already exists
//       const phoneExists = await Admin.findOne({
//         where: { phone: adminData.phone, delete_status: 0 },
//       });
//       if (phoneExists) {
//         console.log(`Admin with phone number ${adminData.phone} already exists.`);
//         continue; // Skip to the next admin
//       }

//       // Create the admin if no email or phone conflict
//       await Admin.create(adminData);
//       console.log(`Default admin created: ${adminData.email}`);
//     }
//   } catch (error) {
//     console.error("Error creating default admins:", error);
//   }
// };

// Function to create default admins from controller and .env

exports.createDefaultAdmins = async () => {
  try {
    // Step 1: Define multiple hardcoded admins
    const hardcodedAdmins = [
      {
        name: "Backup Admin",
        email: "backupadmin@gorex.in",
        phone: "4567890123",
        password: "1234",
      },
      // {
      //   name: "Primary Admin",
      //   email: "primaryadmin@gorex.in",
      //   phone: "1234567890",
      //   password: "1234", // Default password
      // },
      // {
      //   name: "Secondary Admin",
      //   email: "secondaryadmin@gorex.in",
      //   phone: "2345678901",
      //   password: "1234", // Default password
      // },
    ];

    // Step 2: Iterate through each hardcoded admin and create if not exists
    for (const adminData of hardcodedAdmins) {
      const emailExists = await Admin.findOne({
        where: { email: adminData.email, delete_status: 0 },
      });

      if (!emailExists) {
        // Create admin if no conflict
        await Admin.create(adminData);
        // console.log(`Hardcoded admin created: ${adminData.email}`);
      } else {
        // console.log(`Admin with email ${adminData.email} already exists.`);
      }
    }

    // Step 3: Parse admins from the .env file if provided
    const defaultAdmins = JSON.parse(process.env.ADMINS || "[]"); // Ensure default is empty if undefined

    // Step 4: Iterate over admins from the .env file and create them
    for (const adminData of defaultAdmins) {
      // Check if email already exists
      const emailExists = await Admin.findOne({
        where: { email: adminData.email, delete_status: 0 },
      });
      if (emailExists) {
        // console.log(`Admin with email ${adminData.email} already exists.`);
        continue; // Skip to the next admin
      }

      // Check if phone number already exists
      const phoneExists = await Admin.findOne({
        where: { phone: adminData.phone, delete_status: 0 },
      });
      if (phoneExists) {
        // console.log(
        //   `Admin with phone number ${adminData.phone} already exists.`
        // );
        continue; // Skip to the next admin
      }

      // Create the admin if no email or phone conflict
      await Admin.create(adminData);
      // console.log(`Admin created from .env: ${adminData.email}`);
    }
  } catch (error) {
    // console.error("Error creating default admins:", error);
  }
};

exports.checkAdminExistForRegister = async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if the email already exists
    const emailExists = await Admin.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Admin.findOne({
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
    console.error("checkAdminExistForRegister:", error);
    RESPONSE.Failure.Message =
      error.message || "Error checkAdminExistForRegister";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Registration
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, profileImage } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message:
          "Missing required fields. Please provide email, name, phone, and password.",
      });
    }

    const emailExists = await Admin.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Admin.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    const saltRounds = 10; // Adjust salt rounds based on your security needs
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const admin = await Admin.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profileImage,
    });
    RESPONSE.Success.Message = "Admin registered successfully";
    RESPONSE.Success.data = admin;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);

    // res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    console.error("registerAdmin:", error);
    RESPONSE.Failure.Message = error.message || "Error registering admin";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res
    //   .status(500)
    //   .json({ message: "Error registering admin", error: error.message });
  }
};

// Registration with otp

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, profileImage, otp } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return res.status(StatusCode.BAD_REQUEST.code).send({
        ...RESPONSE.Failure,
        Message:
          "Missing required fields. Please provide email, name, phone, and password.",
      });
    }

    // Check if the email already exists
    const emailExists = await Admin.findOne({
      where: { email, delete_status: 0 },
    });
    if (emailExists) {
      RESPONSE.Success.Message = "Email already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
    }

    // Check if the phone number already exists
    const phoneExists = await Admin.findOne({
      where: { phone, delete_status: 0 },
    });
    if (phoneExists) {
      RESPONSE.Success.Message = "Phone number already exists.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
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

    const saltRounds = 10; // Adjust salt rounds based on your security needs
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Create the customer if OTP is valid
    const Admin = await Admin.create({
      name,
      email,
      phone,
      password: hashedPassword,
      profileImage,
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Admin registered successfully";
    RESPONSE.Success.data = Admin;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("registerAdmin:", error);
    RESPONSE.Failure.Message = error.message || "Error registering Admin";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email, delete_status: 0 } });
    if (!admin) {
      RESPONSE.Success.Message = "Admin not found!";
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
    const { password: _, ...adminData } = customer.toJSON();

    RESPONSE.Success.Message = "Admin logged in successfully";
    RESPONSE.Success.data = adminData;
    res.status(StatusCode.CREATED.code).send(RESPONSE.Success);
    // res.status(200).json({ message: "Admin logged in successfully", admin });
  } catch (error) {
    console.error("loginAdmin:", error);
    RESPONSE.Failure.Message = error.message || "Error logging in admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    //   res
    //     .status(500)
    //     .json({ message: "Error logging in admin", error: error.message });
  }
};

// Get admin details by admin_id
exports.getAdminById = async (req, res) => {
  const adminId = req.params.admin_id; // Get admin_id from request parameters

  try {
    const admin = await Admin.findOne({
      where: { admin_id: adminId, delete_status: 0 },
      // attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
      // return res.status(404).json({ message: "Admin not found." });
    }

    RESPONSE.Success.Message = "getAdminById successfully.";
    RESPONSE.Success.data = admin;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    RESPONSE.Failure.Message = error.message || "Error fetching admin.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // console.error("Error fetching admin by ID:", error);
    // res.status(500).json({ message: "Error fetching admin." });
  }
};

exports.resetPasswordForAdmin = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if the admin with the specified email and delete_status of 0 exists
    const admin = await Admin.findOne({
      where: {
        email,
        delete_status: 0, // Ensure the admin is active
      },
    });

    if (!admin) {
      RESPONSE.Success.Message = "Admin not found! Please sign up.";
      RESPONSE.Success.data = {};
      return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      // RESPONSE.Failure.Message = "Admin not found! Please sign up.";
      // return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    // Update the password
    await Admin.update({ password: hashedPassword }, { where: { email } });

    RESPONSE.Success.Message = "Password has been reset successfully.";
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error resetting admin password:", error);
    RESPONSE.Failure.Message = error.message || "Failed to reset password.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Soft delete admin by setting delete_status to 1 and updating deletedAt
exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.admin_id; // Get admin_id from request parameters

    // Find the admin by ID
    const admin = await Admin.findOne({ where: { admin_id: adminId } });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    // Check if the admin is already soft deleted
    if (admin.delete_status === 1) {
      RESPONSE.Failure.Message = "Admin is already deleted.";
      return res.status(StatusCode.OK.code).send(RESPONSE.Failure);
    }

    // Perform soft delete by updating the delete_status and deletedAt fields
    await Admin.update(
      {
        delete_status: 1,
        deletedAt: new Date(), // Set current timestamp as the deleted time
      },
      { where: { admin_id: adminId } }
    );

    RESPONSE.Success.Message = "Admin soft deleted successfully.";
    RESPONSE.Success.data = {};
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error in deleting admin:", error);
    RESPONSE.Failure.Message = error.message || "Failed to delete admin.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

// Get all customer details
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      where: { delete_status: 0 },
      attributes: { exclude: ["password"] }, // Exclude the password field from the response
    });

    RESPONSE.Success.Message = "getAllAdmins successfully.";
    RESPONSE.Success.data = admins;
    res.status(StatusCode.OK.code).send(RESPONSE.Success);
    // res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching all admins:", error);

    RESPONSE.Failure.Message = error.message || "Error fetching all admins.";
    res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
    // res.status(500).json({ message: "Error fetching all customers." });
  }
};

// Edit admin information after verifying OTP
exports.editAdminInfo = async (req, res) => {
  try {
    const adminId = req.params.admin_id; // Get admin_id from request parameters
    const {
      email,
      otp,
      newName,
      newPhone,
      newEmail,
      newPassword,
      newProfileImage,
    } = req.body;

    // First, check if the new email already exists
    if (newEmail && newEmail !== email) {
      const emailExists = await Admin.findOne({
        where: {
          email: newEmail,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
          delete_status: 0,
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The new email is already in use by another admin.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Next, check if the new phone number already exists
    if (newPhone) {
      const phoneExists = await Admin.findOne({
        where: {
          phone: newPhone,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
          delete_status: 0,
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The new phone number is already in use by another admin.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
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

    // Find the admin by ID
    const admin = await Admin.findOne({
      where: { admin_id: adminId },
    });

    if (!admin) {
      RESPONSE.Failure.Message = "Admin not found.";
      return res.status(StatusCode.NOT_FOUND.code).send(RESPONSE.Failure);
    }

    
    const saltRounds = 10; // Adjust salt rounds based on your security needs
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Prepare the fields to update
    const updatedFields = {
      name: newName || admin.name,
      phone: newPhone || admin.phone,
      email: newEmail || admin.email,
      password: hashedPassword || admin.password,
      profileImage: newProfileImage || admin.profileImage,
    };

    // Update admin using Admin.update()
    await Admin.update(updatedFields, {
      where: { admin_id: adminId },
    });

    // Fetch the updated admin details
    const updatedAdmin = await Admin.findOne({
      where: { admin_id: adminId },
      attributes: { exclude: ["password"] },
    });

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email, otp } });

    RESPONSE.Success.Message = "Admin information updated successfully.";
    RESPONSE.Success.data = updatedAdmin;
    return res.status(StatusCode.OK.code).send(RESPONSE.Success);
  } catch (error) {
    console.error("Error updating admin information:", error);
    RESPONSE.Failure.Message =
      error.message || "Failed to update admin information.";
    return res.status(StatusCode.SERVER_ERROR.code).send(RESPONSE.Failure);
  }
};

exports.checkEmailPhoneAvailabilityForAdmin = async (req, res) => {
  try {
    const adminId = req.params.admin_id; // Get admin_id from request parameters
    const { email, phone } = req.body; // Get email and phone from the request body

    // Validation: Check if either email or phone is provided
    if (!email && !phone) {
      RESPONSE.Failure.Message = "Email or phone number is required.";
      return res.status(StatusCode.BAD_REQUEST.code).send(RESPONSE.Failure);
    }

    // Check if the new email already exists for another admin
    if (email) {
      const emailExists = await Admin.findOne({
        where: {
          email,
          delete_status: 0,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
        },
      });

      if (emailExists) {
        RESPONSE.Success.Message =
          "The email is already in use by another admin.";
        RESPONSE.Success.data = {};
        return res.status(StatusCode.OK.code).send(RESPONSE.Success);
      }
    }

    // Check if the new phone number already exists for another admin
    if (phone) {
      const phoneExists = await Admin.findOne({
        where: {
          phone,
          delete_status: 0,
          admin_id: { [Op.ne]: adminId }, // Exclude current admin by ID
        },
      });

      if (phoneExists) {
        RESPONSE.Success.Message =
          "The phone number is already in use by another admin.";
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

