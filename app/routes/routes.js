const imageController = require("../controllers/upload_image.controller.js");
const videoController = require("../controllers/upload_video.controller.js");
const audioController = require("../controllers/upload_audio.controller.js");
const pdfController = require("../controllers/upload_pdf.controller.js");
const adminController = require("../controllers/admin.controller.js");
const managerController = require("../controllers/manager.controller.js");
const customerController = require("../controllers/customer.controller.js");
const router = require("express").Router();
const isAuthenticated = require("../middleware/auth_middleware.js");
const otpController = require("../controllers/otp.controller.js");

// uploads

router.post("/uploadImage", imageController.uploadImage);
router.post("/uploadPdf", pdfController.uploadPdf);
// router.get("/downloadPdf/:filename", pdfController.downloadPdf);


// router.post("/uploadVideo", videoController.uploadVideo);
// router.post("/uploadAudio", audioController.uploadAudio);

// admin Routes

router.post("/register/admin", adminController.registerAdmin);
router.post("/login/admin", adminController.loginAdmin);
router.get("/getAdminById/:admin_id", adminController.getAdminById);
router.delete("/deleteAdmin/:admin_id", adminController.deleteAdmin);
router.put("/editAdminInfo/:admin_id", adminController.editAdminInfo);
router.post("/resetPasswordForAdmin", adminController.resetPasswordForAdmin);
router.post(
  "/checkEmailPhoneAvailabilityForAdmin/:admin_id",
  adminController.checkEmailPhoneAvailabilityForAdmin
);
router.post(
  "/register/checkAdminExistForRegister",
  adminController.checkAdminExistForRegister
);



// manager Routes
router.post("/register/manager", managerController.registerManager);
router.post("/login/manager", managerController.loginManager);
router.get("/getManagerById/:manager_id", managerController.getManagerById);
router.delete("/deleteManager/:manager_id", managerController.deleteManager);
router.put("/editManagerInfo/:manager_id", managerController.editManagerInfo);
router.post(
  "/resetPasswordForManager",
  managerController.resetPasswordForManager
);
router.post(
  "/checkEmailPhoneAvailabilityForManager/:manager_id",
  managerController.checkEmailPhoneAvailabilityForManager
);

// customer Routes
router.post("/register/customer", customerController.registerCustomer);
router.post(
  "/register/checkCustomerExistForRegister",
  customerController.checkCustomerExistForRegister
);
router.post("/login/customer", customerController.loginCustomer);

router.get("/getCustomerById/:customer_id", customerController.getCustomerById);
router.delete(
  "/deleteCustomer/:customer_id",
  customerController.deleteCustomer
);
router.post(
  "/resetPasswordForCustomer",
  customerController.resetPasswordForCustomer
);
router.get("/getAllCustomers", customerController.getAllCustomers);
router.put(
  "/editCustomerInfo/:customer_id",
  customerController.editCustomerInfo
);
router.post(
  "/checkEmailPhoneAvailabilityForCustomer/:customer_id",
  customerController.checkEmailPhoneAvailabilityForCustomer
);


// Routes for OTP
router.post("/sendOTP", otpController.sendOTP);
router.post("/verifyOTP", otpController.verifyOTP);



module.exports = router;
