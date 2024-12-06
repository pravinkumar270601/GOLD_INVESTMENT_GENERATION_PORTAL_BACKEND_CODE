const imageController = require("../controllers/upload_files_controller/upload_image.controller.js");
const videoController = require("../controllers/upload_files_controller/upload_video.controller.js");
const audioController = require("../controllers/upload_files_controller/upload_audio.controller.js");
const pdfController = require("../controllers/upload_files_controller/upload_pdf.controller.js");
const adminController = require("../controllers/admin_controller/admin.controller.js");
const kycController = require("../controllers/admin_controller/kycs.controller.js");
const benefitSchedulesController = require("../controllers/admin_controller/BenefitSchedule.controller.js");
const plansController = require("../controllers/admin_controller/plan.controller.js");
const purchaseController = require("../controllers/admin_controller/purchase.controller.js")
const withdrawalController = require("../controllers/admin_controller/withdrawal.controller.js");
// const managerController = require("../controllers/manager.controller.js");
const customerController = require("../controllers/customer_controller/customer.controller.js");
const router = require("express").Router();
const isAuthenticated = require("../middlewares/auth_middleware.js");
const otpController = require("../controllers/other_controllers/otp.controller.js");

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

// Routes for kyc
router.post("/addCountryWithKYC", kycController.addCountryWithKYC);
router.get("/getKYCByCountry/:country_name", kycController.getKYCByCountry);
router.post("/addKYCToExistingCountry", kycController.addKYCToExistingCountry);

// Routes for BenefitSchedule

router.post("/addBenefitSchedule", benefitSchedulesController.addBenefitSchedule); // Add a new benefit schedule
router.get("/getAllBenefitSchedules", benefitSchedulesController.getAllBenefitSchedules); // Get all benefit schedules
router.get("/getBenefitScheduleById/:schedule_id", benefitSchedulesController.getBenefitScheduleById); // Get a benefit schedule by ID
router.put("/updateBenefitSchedule/:schedule_id", benefitSchedulesController.updateBenefitSchedule); // Update a benefit schedule
router.delete("/deleteBenefitSchedule/:schedule_id", benefitSchedulesController.deleteBenefitSchedule); // Soft delete a benefit schedule




// Routes for plans
router.post("/addPlan", plansController.addPlan);
router.get("/getAllPlans", plansController.getAllPlans);
router.get("/getPlanById/:plan_id", plansController.getPlanById);
router.put("/updatePlan/:plan_id", plansController.updatePlan);
router.delete("/deletePlan/:plan_id", plansController.deletePlan);

// Routes for purchase
router.post("/addPurchase", purchaseController.addPurchase);
router.get("/getAllPurchases", purchaseController.getAllPurchases);
router.get("/getPurchasesByCustomerId/:customer_id", purchaseController.getPurchasesByCustomerId);
router.get("/getPurchaseById/:purchase_id", purchaseController.getPurchaseById);
router.put("/updatePurchase/:purchase_id", purchaseController.updatePurchase); // Update Purchase
router.delete("/deletePurchase/:purchase_id", purchaseController.deletePurchase); // Delete Purchase

// Route to handle gold withdrawal
router.post("/withdrawGold", withdrawalController.withdrawGold);


module.exports = router;
